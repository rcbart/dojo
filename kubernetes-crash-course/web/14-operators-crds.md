# 14 — Operators & CRDs

*How Kubernetes is extended: adding your own object types and automation. Concepts + a lab. ~25 min.
Needs your kind cluster. On the current CKA.*

---

Everything you've done uses **built-in** object kinds (Pod, Deployment, Service…). Kubernetes' real
superpower is that it's **extensible**: you can teach the API server *new* kinds of objects
(**CRDs**) and write controllers (**Operators**) that reconcile them, using the exact same
declarative model. This is how tools like cert-manager, Prometheus, and databases integrate so
cleanly.

## CRDs — your own object kinds

A **CustomResourceDefinition** registers a brand-new resource type with the API server. Once
installed, `kubectl get`, RBAC, labels, and `apply` all work on it like any built-in.

```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: backups.example.com          # <plural>.<group>
spec:
  group: example.com
  names:
    kind: Backup
    plural: backups
    singular: backup
    shortNames: ["bk"]
  scope: Namespaced
  versions:
  - name: v1
    served: true
    storage: true
    schema:
      openAPIV3Schema:
        type: object
        properties:
          spec:
            type: object
            properties:
              schedule: { type: string }
              database: { type: string }
```

Now you can create `Backup` objects:

```yaml
apiVersion: example.com/v1
kind: Backup
metadata: { name: nightly }
spec:
  schedule: "0 2 * * *"
  database: orders
```

But a CRD by itself is just **data storage**: creating a `Backup` object does nothing until
something *acts* on it. That something is an Operator.

## Operators — controllers for custom resources

An **Operator** is a controller that watches your custom resources and does the work, encoding the
operational knowledge a human expert would apply. It runs the same **reconciliation loop** as
built-in controllers: observe the custom object's `spec`, compare to reality, act to close the gap.

```
   You create/edit a Backup object   ─watch─►   Operator (a controller pod)
                                                   │ reconciles:
                                                   ▼
                                    creates CronJobs, runs dumps, updates status…
```

Examples you'll meet in the wild:

- **cert-manager**: CRDs `Certificate`, `Issuer`; the operator obtains/renews TLS certs (Module 12).
- **Prometheus Operator**: CRDs `Prometheus`, `ServiceMonitor`; manages monitoring.
- **Database operators** (Postgres, etc.): a `PostgresCluster` object → the operator provisions,
  backs up, fails over a real HA database.

The **Operator pattern** = **CRD (the new noun) + controller (the automation)**. It turns "run this
complex system" into "declare a simple object and let the operator handle the details."

## Lab: create a CRD and use it

```bash
# 1. install the CRD above
cat <<'EOF' | kubectl apply -f -
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata: { name: backups.example.com }
spec:
  group: example.com
  names: { kind: Backup, plural: backups, singular: backup, shortNames: ["bk"] }
  scope: Namespaced
  versions:
  - name: v1
    served: true
    storage: true
    schema:
      openAPIV3Schema:
        type: object
        properties:
          spec:
            type: object
            properties:
              schedule: { type: string }
              database: { type: string }
EOF

# 2. the new kind is now first-class in the API
kubectl api-resources | grep backups
kubectl get crds | grep example.com

# 3. create and query custom objects like anything else
cat <<'EOF' | kubectl apply -f -
apiVersion: example.com/v1
kind: Backup
metadata: { name: nightly }
spec: { schedule: "0 2 * * *", database: orders }
EOF
kubectl get backups            # or: kubectl get bk
kubectl describe backup nightly

# note: nothing "happens" — there's no operator watching. That's the point.
kubectl delete backup nightly
kubectl delete crd backups.example.com
```

You extended the Kubernetes API with your own type. Add an operator (a controller pod) and those
`Backup` objects would trigger real work. That's how the ecosystem builds on Kubernetes.

## How operators are built (awareness)

You usually **install** operators (via Helm or a manifest), not write them. If you do build one,
common tools are the **Operator SDK** and **Kubebuilder** (Go), which scaffold the CRD + controller.
The key insight to carry: **the whole ecosystem extends Kubernetes with the same CRD + controller
pattern you just saw**: nothing magic, just more of the reconciliation model.

## Check yourself

1. What does a CRD do? *(Registers a new custom resource type with the API server, usable like any
   built-in kind.)*
2. Does creating a custom object do anything by itself? *(No; a CRD is just data storage until a
   controller/operator acts on it.)*
3. What is an Operator? *(A controller that watches custom resources and reconciles them, automating
   operational tasks.)*
4. State the Operator pattern. *(CRD (new noun) + controller (automation) = Operator.)*
5. Name a real operator and what it manages. *(e.g. cert-manager → TLS certificates; Prometheus
   Operator → monitoring.)*

---

**Next:** [15 — Capstone: deploy a multi-service app →](./15-capstone.md)
