# 4 — ConfigMaps & Secrets

*Separate configuration from images, the right way. Concepts + a lab. ~25 min. Needs your kind
cluster.*

---

The same image should run in dev, staging, and prod; only the **configuration** differs (database
URLs, feature flags, credentials). Baking config into the image is wrong (you'd rebuild per
environment, and secrets would leak). Kubernetes injects config at run time via **ConfigMaps** (non
-secret) and **Secrets** (sensitive).

This is the direct successor to Docker's `-e` env vars and mounted config files, now as first-class,
reusable cluster objects.

## ConfigMap — non-secret configuration

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  LOG_LEVEL: "info"
  GREETING: "hello from config"
  app.properties: |            # can hold whole files too
    timeout=30
    retries=3
```

## Secret — sensitive data

Secrets look like ConfigMaps but are for credentials. Create one easily:

```bash
kubectl create secret generic db-secret \
  --from-literal=DB_USER=app \
  --from-literal=DB_PASSWORD=s3cret
```

> **Reality check on "Secret."** By default, Secret values are only **base64-encoded, not
> encrypted**: anyone with read access can decode them. Treat Secrets as "handled separately from
> ConfigMaps," and in real clusters add **encryption at rest** (etcd encryption) and tight **RBAC**
> (Module 7), or use an external secrets manager. Never commit real Secret YAML to git.

## Two ways to consume config: env vars vs files

**As environment variables:**

```yaml
spec:
  containers:
  - name: app
    image: myapp
    env:
    - name: LOG_LEVEL
      valueFrom:
        configMapKeyRef: { name: app-config, key: LOG_LEVEL }
    - name: DB_PASSWORD
      valueFrom:
        secretKeyRef: { name: db-secret, key: DB_PASSWORD }
    envFrom:                       # or pull ALL keys at once
    - configMapRef: { name: app-config }
```

**As mounted files (a volume):**

```yaml
    volumeMounts:
    - name: cfg
      mountPath: /etc/config       # each key becomes a file here
  volumes:
  - name: cfg
    configMap: { name: app-config }
```

- **Env vars**: simplest, great for individual settings. *Note: env vars are set at pod start;
  changing the ConfigMap does **not** update running env vars; you must restart the pod.*
- **Mounted files**: better for whole config files, and mounted ConfigMap/Secret values **do**
  update in the pod over time (with a short delay). Use files for config you want to hot-reload and
  for TLS certs.

## Lab: inject config both ways

```bash
# 1. create a ConfigMap and a Secret
kubectl create configmap app-config --from-literal=GREETING="Hi from ConfigMap" --from-literal=LOG_LEVEL=debug
kubectl create secret generic app-secret --from-literal=TOKEN=abc123

# 2. run a pod that reads them as env vars
kubectl run cfgtest --image=busybox --restart=Never --command -- sh -c "echo GREETING=\$GREETING TOKEN=\$TOKEN; sleep 3600" \
  --overrides='
{ "spec": { "containers": [ { "name":"cfgtest","image":"busybox",
    "command":["sh","-c","echo GREETING=$GREETING TOKEN=$TOKEN LOG=$LOG_LEVEL; sleep 3600"],
    "envFrom":[{"configMapRef":{"name":"app-config"}}],
    "env":[{"name":"TOKEN","valueFrom":{"secretKeyRef":{"name":"app-secret","key":"TOKEN"}}}] } ] } }'
kubectl logs cfgtest          # → GREETING=Hi from ConfigMap TOKEN=abc123 LOG=debug
kubectl delete pod cfgtest
```

Inspect and decode:

```bash
kubectl get configmap app-config -o yaml
kubectl get secret app-secret -o jsonpath='{.data.TOKEN}' | base64 -d ; echo   # decodes to abc123
```

That last command demonstrates the base64 point: Secrets are encoded, not encrypted.

### Experiment: mounted file that updates

Mount the ConfigMap as files, then edit the ConfigMap (`kubectl edit configmap app-config`) and watch
`/etc/config/GREETING` inside the pod change after a delay, something env vars won't do.

## Practitioner rules

- **Config out of images**: one image, many environments, config injected per environment.
- **Secrets ≠ ConfigMaps**: different object, tighter RBAC, encryption at rest, never in git.
- **Prefer files for things that rotate** (certs, config you hot-reload); env for simple flags.
- **Changed a ConfigMap used as env vars?** Restart the Deployment (`kubectl rollout restart`) to
  pick it up.

## Check yourself

1. Why not bake configuration into the image? *(The same image should run everywhere; only config
   differs, and secrets would leak. Inject config at run time.)*
2. ConfigMap vs Secret? *(Both inject config; Secrets are for sensitive data, handled separately with
   tighter access and encryption at rest.)*
3. Are Secret values encrypted by default? *(No: only base64-encoded; add etcd encryption + RBAC, or
   an external manager.)*
4. Two ways to consume config in a pod? *(As environment variables, or mounted as files via a
   volume.)*
5. Which consumption method reflects later changes without a restart? *(Mounted files update; env
   vars are fixed at pod start.)*

---

**Next:** [5 — Storage: volumes, PV/PVC & StatefulSets →](./05-storage-volumes-statefulsets.md)
