# 9 — Packaging with Helm

*Kubernetes' package manager — install complex apps in one command, template your own. Concepts + a
lab. ~30 min. Needs your kind cluster + Helm installed.*

---

Real apps are *many* manifests — Deployment, Service, ConfigMap, Ingress, and more — and you need
different values per environment. Copy-pasting YAML doesn't scale. **Helm** is the package manager
for Kubernetes: it bundles manifests into a reusable, parameterized **chart** you install, upgrade,
and roll back as a unit.

## The vocabulary

- **Chart** — a package: templated Kubernetes manifests + default values. Like an installable app.
- **Values** — the parameters that fill in the templates (image tag, replicas, hostnames…). Override
  per environment.
- **Release** — an installed instance of a chart in your cluster (with a name and revision history).
- **Repository** — a place charts are hosted (many are OCI registries now).

Think of it like `apt`/`brew` for Kubernetes: a chart is the package, values customize it, a release
is what's installed.

## Using an existing chart

```bash
# add a repo and install an app — one command for a whole stack
helm install mydb oci://registry-1.docker.io/bitnamicharts/postgresql \
  --set auth.password=secret

helm list                          # your releases
helm status mydb                   # what got deployed
helm upgrade mydb oci://registry-1.docker.io/bitnamicharts/postgresql --set auth.password=newpass
helm rollback mydb 1               # revert to revision 1
helm uninstall mydb                # remove the whole release
```

One command deploys/updates/rolls back a complete app — that's the Helm payoff.

## Anatomy of a chart

```
mychart/
├── Chart.yaml          # name, version, description
├── values.yaml         # default parameter values
├── templates/          # manifests with {{ }} placeholders
│   ├── deployment.yaml
│   ├── service.yaml
│   └── _helpers.tpl    # reusable template snippets
└── charts/             # dependency charts (subcharts)
```

Templates are ordinary manifests with **Go template** placeholders that pull from values:

```yaml
# templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-web
spec:
  replicas: {{ .Values.replicaCount }}
  template:
    spec:
      containers:
      - name: web
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
```

```yaml
# values.yaml (defaults, overridable at install time)
replicaCount: 3
image:
  repository: nginx
  tag: "1.27"
```

At install, Helm renders the templates with the values into real manifests and applies them.

## Lab: create and install your own chart

```bash
helm create demo               # scaffolds a working chart in ./demo
# it ships a runnable nginx-based app. inspect the rendered manifests WITHOUT installing:
helm template demo | head -40  # see the YAML Helm would apply

# install it, overriding a value
helm install web ./demo --set replicaCount=2
kubectl get deploy,svc -l app.kubernetes.io/instance=web
helm list

# change values and upgrade (creates revision 2)
helm upgrade web ./demo --set replicaCount=4
kubectl get deploy -l app.kubernetes.io/instance=web    # now 4
helm history web                                          # revisions 1 and 2

# roll back and clean up
helm rollback web 1
helm uninstall web
```

### Experiment: environment values files

Create `values-prod.yaml` with `replicaCount: 6`, then
`helm upgrade web ./demo -f values-prod.yaml`. Separate values files per environment (dev/staging/
prod) over one chart is the standard pattern.

## When to use Helm

- **Installing third-party apps** (databases, ingress controllers, monitoring) — the ecosystem ships
  Helm charts; it's the fastest path.
- **Packaging *your* app** for repeatable, parameterized deploys across environments and clusters.
- **When you need templating/logic** (conditionals, loops, computed values) — Helm's Go templates
  handle complex cases Kustomize can't.

Helm and Kustomize (next module) solve overlapping problems differently; many teams use both.

## Check yourself

1. What is a Helm chart? *(A reusable, templated package of Kubernetes manifests plus default
   values.)*
2. Chart vs values vs release? *(Chart = the package; values = parameters that fill templates;
   release = an installed instance with revision history.)*
3. What does `helm upgrade`/`rollback` give you? *(Versioned deploys — upgrade to new values/versions
   and instantly revert to a prior revision.)*
4. How do you deploy the same chart differently per environment? *(Separate values files (`-f
   values-prod.yaml`) or `--set` overrides.)*
5. What does `helm template` do? *(Renders the chart's templates into final manifests locally, without
   installing.)*

---

**Next:** [10 — Kustomize →](./10-kustomize.md)
