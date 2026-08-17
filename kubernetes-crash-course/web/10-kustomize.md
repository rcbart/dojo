# 10 — Kustomize

*Template-free customization built into kubectl: per-environment configs without duplication.
Concepts + a lab. ~25 min. Needs your kind cluster.*

---

**Kustomize** is the other way to manage per-environment manifests. Where Helm uses *templates with
placeholders*, Kustomize uses **overlays**: you keep plain, valid YAML as a **base**, then layer
small **patches** on top for each environment. No templating language: it's built right into
`kubectl` (`kubectl apply -k`).

## The idea: base + overlays

```
   base/                       ← plain, complete manifests (valid on their own)
     deployment.yaml
     service.yaml
     kustomization.yaml
   overlays/
     dev/     kustomization.yaml  (patch: replicas=1, dev image tag)
     prod/    kustomization.yaml  (patch: replicas=6, prod tag, extra labels)
```

Each environment references the base and applies only its *differences*. No copy-paste, no template
syntax, just YAML patching YAML.

## The base

```yaml
# base/kustomization.yaml
resources:
  - deployment.yaml
  - service.yaml
```

```yaml
# base/deployment.yaml — ordinary, valid manifest
apiVersion: apps/v1
kind: Deployment
metadata: { name: web }
spec:
  replicas: 1
  selector: { matchLabels: { app: web } }
  template:
    metadata: { labels: { app: web } }
    spec:
      containers:
      - name: web
        image: nginx:1.27
```

## An overlay

```yaml
# overlays/prod/kustomization.yaml
resources:
  - ../../base
namePrefix: prod-              # names become prod-web
commonLabels:
  env: prod
images:
  - name: nginx               # swap the image tag cluster-wide
    newTag: "1.28"
replicas:
  - name: web
    count: 6                  # prod runs 6
patches:
  - target: { kind: Deployment, name: web }
    patch: |-                 # a strategic-merge/JSON6902 patch for anything else
      - op: add
        path: /spec/template/spec/containers/0/env
        value: [{ name: ENV, value: prod }]
```

Kustomize has purpose-built fields (`namePrefix`, `commonLabels`, `images`, `replicas`,
`configMapGenerator`, `secretGenerator`) plus free-form `patches` for anything else.

## Using it

```bash
kubectl kustomize overlays/prod        # render the final YAML (like helm template)
kubectl apply -k overlays/prod         # build AND apply in one step
kubectl apply -k overlays/dev          # the dev variant
```

`configMapGenerator`/`secretGenerator` even hash config content into the name, so changing config
triggers a rollout automatically, a neat built-in.

## Lab: two environments from one base

```bash
mkdir -p base overlays/dev overlays/prod

cat > base/deployment.yaml <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata: { name: web }
spec:
  replicas: 1
  selector: { matchLabels: { app: web } }
  template:
    metadata: { labels: { app: web } }
    spec:
      containers: [{ name: web, image: nginx:1.27 }]
EOF
cat > base/kustomization.yaml <<'EOF'
resources: [deployment.yaml]
EOF

cat > overlays/dev/kustomization.yaml <<'EOF'
resources: [../../base]
namePrefix: dev-
replicas: [{ name: web, count: 1 }]
EOF
cat > overlays/prod/kustomization.yaml <<'EOF'
resources: [../../base]
namePrefix: prod-
replicas: [{ name: web, count: 4 }]
images: [{ name: nginx, newTag: "1.28" }]
EOF

# render each — see the differences without applying
kubectl kustomize overlays/dev  | grep -E "name:|replicas:|image:"
kubectl kustomize overlays/prod | grep -E "name:|replicas:|image:"

# apply prod, confirm, clean up
kubectl apply -k overlays/prod
kubectl get deploy prod-web
kubectl delete -k overlays/prod
```

One base, two environments, zero duplication or templating.

## Helm vs Kustomize (how to choose)

| | Helm | Kustomize |
|--|------|-----------|
| Mechanism | Templates with `{{ }}` placeholders + logic | Overlays/patches on plain YAML |
| Packaging/sharing | Strong — versioned charts, repos | Weaker — it's a customization tool, not a package registry |
| Logic (conditionals/loops) | Yes | No (patches only) |
| Learning curve | Templating language | Just YAML |
| Built into kubectl | No (separate tool) | **Yes** (`-k`) |

**Rule of thumb:** Helm to *package and distribute* apps (especially third-party); Kustomize to
*customize* your own manifests per environment simply. Many teams use **both**, e.g. render a Helm
chart, then Kustomize-patch it. Both are on the CKA.

## Check yourself

1. How does Kustomize differ from Helm mechanically? *(Overlays/patches on plain valid YAML vs
   templates with placeholders and logic.)*
2. What is a base vs an overlay? *(The base is the complete common manifests; an overlay layers
   environment-specific patches on top.)*
3. How do you apply a Kustomize overlay? *(`kubectl apply -k <overlay-dir>`; it's built into
   kubectl.)*
4. Name two purpose-built Kustomize fields. *(Any of: namePrefix, commonLabels, images, replicas,
   configMapGenerator, secretGenerator.)*
5. When would you prefer Helm over Kustomize? *(For packaging/distributing apps and when you need
   templating logic like conditionals/loops.)*

---

**Next:** [11 — CI/CD & GitOps →](./11-cicd-gitops.md)
