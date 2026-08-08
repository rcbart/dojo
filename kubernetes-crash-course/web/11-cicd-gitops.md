# 11 — CI/CD & GitOps

*How real teams ship to Kubernetes: automated build → push → deploy, and Git as the source of truth.
Concepts + a lab-style walkthrough. ~25 min.*

---

You now know how to deploy by hand. In production, deploys are **automated**: a pipeline builds your
image, pushes it, and updates the cluster — triggered by a git push, with no human running `kubectl`.
This module covers the pipeline and the modern **GitOps** approach.

## The pipeline: build → push → deploy

Every code change flows through the same stages:

```
   git push
      │
      ▼
   CI: build image  →  test  →  push to registry (tagged with the git SHA)
      │
      ▼
   CD: update the Kubernetes manifests to the new image  →  apply to cluster  →  verify rollout
```

- **CI (Continuous Integration)** — build the Docker image, run tests, push to a registry. Tag with
  the **git commit SHA** so every image traces to exact source (the tagging discipline from the
  Docker course).
- **CD (Continuous Delivery/Deployment)** — update the Deployment to the new image tag and roll it
  out (Module 2's rolling update + readiness probes = zero downtime).

## A concrete CI pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yaml
name: build-and-deploy
on: { push: { branches: [main] } }
jobs:
  ship:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build & push image
        run: |
          IMAGE=ghcr.io/${{ github.repository }}:${{ github.sha }}
          echo "${{ secrets.GHCR_TOKEN }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin
          docker build -t "$IMAGE" .
          docker push "$IMAGE"
      - name: Deploy
        run: |
          kubectl set image deployment/web web=ghcr.io/${{ github.repository }}:${{ github.sha }}
          kubectl rollout status deployment/web --timeout=120s
```

The essence: build → push a SHA-tagged image → update the deployment → wait for the rollout to
succeed (and it auto-fails if the new pods never become ready).

## Two deployment models: push vs pull (GitOps)

- **Push-based CD** (above) — the pipeline has cluster credentials and runs `kubectl`/`helm` *to* the
  cluster. Simple, but the CI system holds powerful credentials and the cluster can drift from git.
- **Pull-based CD = GitOps** — a controller *inside* the cluster (**Argo CD** or **Flux**)
  continuously **pulls** the desired manifests from a git repo and reconciles the cluster to match.
  Git becomes the single source of truth.

### GitOps, the big idea

```
   Git repo (manifests / Helm / Kustomize)  ← the DESIRED state, reviewed via pull requests
        │  Argo CD / Flux watches it
        ▼
   Cluster continuously reconciled to match git
```

Benefits: **git is the source of truth** (every change is a reviewed, audited commit); **rollback = git
revert**; the cluster **self-corrects drift**; and no external system needs cluster credentials. It's
literally Kubernetes' reconciliation idea (Module 0) applied to *deployment* — declare desired state
in git, a controller makes reality match.

## Lab: simulate the deploy step locally

You can't run a full CI system in kind, but you can do the CD action a pipeline performs:

```bash
# stand up an app at v1
kubectl create deployment web --image=nginx:1.27
kubectl set resources deployment web --requests=cpu=50m,memory=64Mi
kubectl rollout status deployment/web

# the "deploy new version" step a pipeline runs on each push:
kubectl set image deployment/web nginx=nginx:1.28
kubectl rollout status deployment/web            # succeeds → pipeline goes green

# a bad image → the pipeline step FAILS (rollout never completes) and you'd auto-rollback
kubectl set image deployment/web nginx=nginx:nope
kubectl rollout status deployment/web --timeout=20s || kubectl rollout undo deployment/web
kubectl rollout status deployment/web
kubectl delete deployment web
```

That `rollout status` gate is what makes automated deploys safe: a broken image fails the pipeline
and triggers a rollback, all without a human.

## Practitioner rules

- **Tag images by git SHA** (never `latest`) so deploys are traceable and rollbacks precise.
- **Gate deploys on `rollout status`** — fail fast, auto-rollback on bad releases.
- **Keep manifests in git** (Helm/Kustomize) — reviewed, versioned, auditable.
- **Prefer GitOps (Argo CD/Flux)** for production — git as truth, drift auto-corrected, no CI holding
  cluster keys.
- **Store credentials as CI secrets**, never in the repo.

## Check yourself

1. What are the CI and CD halves? *(CI builds/tests/pushes the image; CD updates the cluster to the
   new image and rolls it out.)*
2. Why tag images with the git SHA? *(Traceability to exact source and precise rollbacks — never use
   `latest`.)*
3. Push-based vs pull-based (GitOps) CD? *(Push: the pipeline runs kubectl into the cluster. Pull: a
   controller in the cluster syncs it to git.)*
4. In GitOps, what is the source of truth and how do you roll back? *(Git; roll back with a git
   revert, which the controller reconciles.)*
5. What makes an automated deploy safe against a bad image? *(Gating on `kubectl rollout status` —
   readiness-gated rollout fails and triggers a rollback.)*

---

**Next:** [12 — Ingress & TLS →](./12-ingress-tls.md)
