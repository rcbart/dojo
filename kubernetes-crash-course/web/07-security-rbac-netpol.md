# 7 — Security: RBAC, ServiceAccounts & NetworkPolicy

*Locking down who can do what, and which pods may talk. Concepts + a lab. ~30 min. Needs your kind
cluster. Heavily tested on CKA/CKAD.*

---

Kubernetes security has layers. This module covers the three you'll use constantly: **RBAC** (who
can run which commands), **ServiceAccounts + SecurityContext** (pod identity and privilege), and
**NetworkPolicy** (which pods may reach which). The theme is **least privilege** — grant the minimum
needed.

## RBAC — who can do what

**Role-Based Access Control** decides whether a user or app may perform an action (get pods, create
deployments, read secrets…). Four object types, in two pairs:

| Object | Scope | Says |
|--------|-------|------|
| **Role** | one namespace | "these verbs on these resources" (e.g. get/list pods) |
| **ClusterRole** | whole cluster | same, but cluster-wide (or for cluster-scoped resources) |
| **RoleBinding** | one namespace | "grant this Role to these subjects" |
| **ClusterRoleBinding** | whole cluster | "grant this ClusterRole cluster-wide" |

A **Role/ClusterRole** defines *permissions*; a **Binding** attaches them to a *subject* (a user,
group, or ServiceAccount). Permissions are **purely additive** — there are no "deny" rules; you grant
only what's needed.

```yaml
# a Role: read-only access to pods in the "dev" namespace
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata: { namespace: dev, name: pod-reader }
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata: { namespace: dev, name: read-pods }
subjects:
- kind: ServiceAccount
  name: myapp
  namespace: dev
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

**Test permissions** with the invaluable `kubectl auth can-i`:

```bash
kubectl auth can-i list pods --namespace dev
kubectl auth can-i create deployments --as=system:serviceaccount:dev:myapp -n dev
```

## ServiceAccounts — identity for pods

A **ServiceAccount** is the identity a *pod* uses to talk to the Kubernetes API. Every pod gets one
(`default` if unspecified). You bind RBAC to ServiceAccounts to control what an app may do. Best
practice: give each app its **own** ServiceAccount with the **minimum** permissions — never rely on
the `default` account with broad access.

```yaml
spec:
  serviceAccountName: myapp        # the pod runs as this identity
```

## SecurityContext — how privileged the container runs

Constrain what the container itself can do on the node:

```yaml
    securityContext:
      runAsNonRoot: true           # refuse to run as root
      runAsUser: 1000
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true # container can't write its own filesystem
      capabilities:
        drop: ["ALL"]              # drop Linux capabilities
```

These mirror the Docker security lessons (non-root, least privilege) — now enforced by the platform.
Production clusters often require them via **Pod Security Standards** (the `restricted` profile).

## NetworkPolicy — which pods may talk

By default, **every pod can reach every other pod** — flat and open. A **NetworkPolicy** restricts
that, per label selector. The critical gotcha: policies are **allow-lists that only take effect once
one selects a pod** — and the moment a pod is selected by *any* policy, everything not explicitly
allowed is **denied**.

```yaml
# default-deny all ingress in the namespace, then allow only from app=frontend
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: deny-all-ingress, namespace: dev }
spec:
  podSelector: {}                  # selects ALL pods in the namespace
  policyTypes: ["Ingress"]         # with no ingress rules = deny all inbound
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: allow-frontend, namespace: dev }
spec:
  podSelector: { matchLabels: { app: backend } }
  policyTypes: ["Ingress"]
  ingress:
  - from:
    - podSelector: { matchLabels: { app: frontend } }
    ports:
    - { protocol: TCP, port: 8080 }
```

> **kind caveat:** NetworkPolicies require a CNI that enforces them. kind's default CNI does **not**,
> so policies won't actually block traffic on a vanilla kind cluster (install Calico to test for
> real). The *concepts and YAML* below are exactly what you'll use and what the exam tests.

## Lab: RBAC you can verify locally

```bash
kubectl create namespace dev
kubectl create serviceaccount myapp -n dev

# without permission:
kubectl auth can-i list pods --as=system:serviceaccount:dev:myapp -n dev     # → no

# grant read-only pods via a Role + RoleBinding
kubectl create role pod-reader --verb=get,list,watch --resource=pods -n dev
kubectl create rolebinding read-pods --role=pod-reader --serviceaccount=dev:myapp -n dev

# now:
kubectl auth can-i list pods   --as=system:serviceaccount:dev:myapp -n dev    # → yes
kubectl auth can-i delete pods --as=system:serviceaccount:dev:myapp -n dev    # → no (not granted)
kubectl delete namespace dev
```

`kubectl auth can-i` is your fastest RBAC debugging and exam tool.

## Practitioner rules

- **Least privilege everywhere** — narrow Roles, per-app ServiceAccounts, drop capabilities, non-root.
- **RBAC is additive** — grant, never rely on "deny." Audit with `kubectl auth can-i --list`.
- **Default-deny NetworkPolicies** then allow specific flows — the secure baseline.
- **Never mount the default ServiceAccount token** into pods that don't need API access
  (`automountServiceAccountToken: false`).

## Check yourself

1. Role vs RoleBinding? *(A Role defines permissions; a RoleBinding grants them to a subject like a
   ServiceAccount.)*
2. Are there "deny" rules in RBAC? *(No — RBAC is purely additive; you grant only what's needed.)*
3. What is a ServiceAccount for? *(It's the identity a pod uses to talk to the Kubernetes API; bind
   RBAC to it.)*
4. What's the default pod-to-pod network posture, and how do you restrict it? *(All pods can reach
   all pods; a NetworkPolicy selecting a pod switches it to deny-by-default + explicit allows.)*
5. One command to test whether an identity can perform an action? *(`kubectl auth can-i <verb>
   <resource> --as=… -n …`.)*

---

**Next:** [8 — Observability & troubleshooting →](./08-observability-troubleshooting.md)
