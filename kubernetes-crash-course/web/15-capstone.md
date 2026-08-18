# 15: Capstone: deploy a multi-service app

*Put it all together. You'll deploy a real multi-tier app (frontend, API, database) with config,
secrets, storage, health, autoscaling, and ingress. ~45 min. Needs your kind cluster (with
ingress-nginx + metrics-server from Modules 12–13).*

---

This is the module that turns knowledge into skill. You'll assemble almost every concept from the
course into one working system, the way a practitioner actually builds it. Read each piece, apply
it, verify it.

## What we're building

```
   internet ──► Ingress ──► frontend (Deployment + Service, HPA)
                            └─► api (Deployment + Service, HPA)
                                  └─► db (StatefulSet + PVC)
                                        ▲
             config (ConfigMap) + secrets (Secret) feed api & db
```

A classic three-tier app: a web frontend, an API, and a database, each with the production
trimmings you learned.

## Step 1: namespace and config

```bash
kubectl create namespace shop
kubectl config set-context --current --namespace=shop     # work in 'shop' by default

# non-secret config for the api
kubectl create configmap api-config --from-literal=LOG_LEVEL=info --from-literal=GREETING="Shop API"
# secret DB credentials
kubectl create secret generic db-secret \
  --from-literal=POSTGRES_PASSWORD=s3cret --from-literal=POSTGRES_DB=shop
```

## Step 2: the database (StatefulSet + storage)

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: apps/v1
kind: StatefulSet
metadata: { name: db }
spec:
  serviceName: db
  replicas: 1
  selector: { matchLabels: { app: db } }
  template:
    metadata: { labels: { app: db } }
    spec:
      containers:
      - name: postgres
        image: postgres:16
        envFrom: [{ secretRef: { name: db-secret } }]
        ports: [{ containerPort: 5432 }]
        readinessProbe: { exec: { command: ["pg_isready","-U","postgres"] }, periodSeconds: 5 }
        resources: { requests: { cpu: 100m, memory: 128Mi }, limits: { memory: 256Mi } }
        volumeMounts: [{ name: data, mountPath: /var/lib/postgresql/data }]
  volumeClaimTemplates:
  - metadata: { name: data }
    spec: { accessModes: ["ReadWriteOnce"], resources: { requests: { storage: 1Gi } } }
---
apiVersion: v1
kind: Service
metadata: { name: db }
spec:
  clusterIP: None                 # headless, for the StatefulSet's stable DNS
  selector: { app: db }
  ports: [{ port: 5432 }]
EOF
kubectl rollout status statefulset/db
```

*(Concepts used: StatefulSet, PVC via volumeClaimTemplates, Secret via envFrom, readiness probe,
resources, headless Service.)*

## Step 3: the API (Deployment + Service + probes + HPA)

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata: { name: api }
spec:
  replicas: 2
  selector: { matchLabels: { app: api } }
  template:
    metadata: { labels: { app: api } }
    spec:
      containers:
      - name: api
        image: hashicorp/http-echo
        args: ["-text=hello from the shop api", "-listen=:80"]
        ports: [{ containerPort: 80 }]
        envFrom: [{ configMapRef: { name: api-config } }]
        env:
        - { name: DB_PASSWORD, valueFrom: { secretKeyRef: { name: db-secret, key: POSTGRES_PASSWORD } } }
        readinessProbe: { httpGet: { path: /, port: 80 }, initialDelaySeconds: 3 }
        livenessProbe:  { httpGet: { path: /, port: 80 }, periodSeconds: 10 }
        resources: { requests: { cpu: 100m, memory: 64Mi }, limits: { memory: 128Mi } }
---
apiVersion: v1
kind: Service
metadata: { name: api }
spec: { selector: { app: api }, ports: [{ port: 80 }] }
EOF
kubectl autoscale deployment api --cpu-percent=60 --min=2 --max=8
kubectl rollout status deployment/api
```

## Step 4: the frontend (Deployment + Service)

```bash
kubectl create deployment frontend --image=nginxdemos/hello --replicas=2
kubectl set resources deployment frontend --requests=cpu=50m,memory=32Mi
kubectl expose deployment frontend --port=80
```

## Step 5: the Ingress (one front door, path routing)

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: shop
  annotations: { nginx.ingress.kubernetes.io/rewrite-target: / }
spec:
  ingressClassName: nginx
  rules:
  - http:
      paths:
      - { path: /api, pathType: Prefix, backend: { service: { name: api, port: { number: 80 } } } }
      - { path: /,    pathType: Prefix, backend: { service: { name: frontend, port: { number: 80 } } } }
EOF
```

## Step 6: verify the whole system

```bash
kubectl get all                                  # everything: pods, deploys, statefulset, services, hpa
curl -s localhost/api                            # → hello from the shop api  (through Ingress → api)
curl -s localhost/ | grep -o "Server.*" | head -1  # → frontend

# self-healing: kill an api pod, watch it return, service uninterrupted
kubectl delete pod -l app=api --grace-period=1 | head -1
kubectl get pods -l app=api                      # replacement scheduled

# the db kept its identity + storage
kubectl get statefulset db; kubectl get pvc
```

If all three tiers respond and the killed pod self-heals, **you've deployed a production-shaped app**
with config/secrets externalized, data persisted, health-checked, autoscaled, and fronted by a single
ingress.

## Step 7: challenge tasks (do these yourself)

To cement mastery, extend it without step-by-step help:

1. **Roll out a new API version** and watch zero-downtime; then break it and roll back.
2. **Add a NetworkPolicy** so only the api may reach the db (default-deny others).
3. **Package it as a Helm chart or Kustomize base+overlays** for dev vs prod (different replicas/tags).
4. **Add a second frontend host** and route by `Host:` header in the Ingress.
5. **Generate load** on the api and watch the HPA scale it.
6. **Build and deploy your own image (full loop).** Using `docker buildx` (Docker course, module 8),
   build a **multi-arch** image of a tiny app of your own, push it to a registry, then point the api
   Deployment at it with `kubectl set image` and watch the readiness-gated rollout: the complete
   build → push → deploy loop spanning both courses.

## Clean up

```bash
kubectl config set-context --current --namespace=default
kubectl delete namespace shop          # removes everything in one shot
```

## Check yourself

1. Which object type did the database use, and why? *(StatefulSet: stable identity + its own
   persistent storage.)*
2. How did the API get its config and its DB password? *(ConfigMap via envFrom; the password from a
   Secret via secretKeyRef.)*
3. How is the whole app exposed with one entry point? *(An Ingress routing by path to the frontend and
   api ClusterIP Services.)*
4. What proved self-healing? *(Deleting an api pod; the Deployment created a replacement
   automatically.)*
5. Which piece would make a bad rollout safe? *(Readiness probes: new pods only get traffic once
   ready, so a broken version can't cause an outage.)*

---

**Next:** [16: CKA / CKAD exam prep →](./16-cka-ckad-prep.md)
