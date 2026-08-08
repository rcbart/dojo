# 16 — CKA / CKAD exam prep

*Turn this course into a certification. What the exams test, how they map to what you've learned, and
the speed techniques that decide pass/fail. ~25 min read.*

---

The **CKA** (Certified Kubernetes Administrator) and **CKAD** (Certified Kubernetes Application
Developer) are the industry-standard, **hands-on** certifications. They're not multiple-choice — you
get a live cluster and a terminal and must **perform tasks** under time pressure. Everything in this
course maps to them.

## The two exams

| | CKA | CKAD |
|--|-----|------|
| Audience | Cluster **operators/admins** | App **developers** deploying to K8s |
| Style | Performance-based, live cluster | Performance-based, live cluster |
| Emphasis | Cluster ops, networking, storage, **troubleshooting** | Building/deploying/configuring apps |
| Duration | 2 hours | 2 hours |

Both are open-book against the **official docs only** (kubernetes.io) — so speed navigating docs and
`kubectl` matters more than memorization.

## CKA domains (v1.x, current) and where you learned them

| Domain | Weight | Course modules |
|--------|--------|----------------|
| Cluster Architecture, Installation & Configuration (RBAC, Helm, Kustomize, CRDs) | **25%** | 1(primer), 7, 9, 10, 14 |
| Workloads & Scheduling (Deployments, ConfigMaps/Secrets, HPA) | **15%** | 2, 4, 6, 13 |
| Services & Networking (Services, Ingress, NetworkPolicy, Gateway API, DNS) | **20%** | 3, 12, 7 |
| Storage (StorageClasses, PV/PVC) | **10%** | 5 |
| **Troubleshooting** | **30%** | 8 (and everywhere) |

Note troubleshooting is the **biggest** slice — Module 8 is your highest-value review.

## CKAD domains (current) and where you learned them

| Domain | Weight | Course modules |
|--------|--------|----------------|
| Application Design & Build (images, Jobs, multi-container pods) | **20%** | Docker course, 1, 2 |
| Application Deployment (Deployments, rolling updates, Helm/Kustomize) | **20%** | 2, 9, 10, 11 |
| Application Observability & Maintenance (probes, logging, debugging) | **15%** | 6, 8 |
| Application Environment, Config & Security (ConfigMaps, Secrets, SecurityContext, ServiceAccounts) | **25%** | 4, 7 |
| Services & Networking (Services, NetworkPolicy) | **20%** | 3, 7, 12 |

## The #1 exam skill: generate YAML fast with `--dry-run`

You do **not** hand-write YAML from scratch in the exam — you generate it and edit. Master this:

```bash
# generate a Deployment manifest without creating it
kubectl create deployment web --image=nginx --replicas=3 \
  --dry-run=client -o yaml > web.yaml
# then edit web.yaml and: kubectl apply -f web.yaml

# a pod
kubectl run nginx --image=nginx --dry-run=client -o yaml > pod.yaml

# a service for a deployment
kubectl expose deployment web --port=80 --dry-run=client -o yaml > svc.yaml

# a configmap / secret
kubectl create configmap cfg --from-literal=k=v --dry-run=client -o yaml
kubectl create secret generic s --from-literal=k=v --dry-run=client -o yaml
```

`--dry-run=client -o yaml` is the single most important exam habit. It turns a 5-minute typing task
into 30 seconds.

## Speed setup (do this first in the exam)

```bash
alias k=kubectl                        # (often pre-aliased)
export do="--dry-run=client -o yaml"   # so: k create deploy web --image=nginx $do
export now="--force --grace-period=0"  # fast pod deletes
kubectl config set-context --current --namespace=<the-task-namespace>   # per question!
```

Enable `kubectl` completion, and **always set the namespace the question specifies** — a right answer
in the wrong namespace scores zero.

## Time-savers to memorize

- **Explain fields fast:** `kubectl explain deployment.spec.strategy` (offline, no docs needed).
- **Edit live objects:** `kubectl edit deploy web` for quick changes.
- **Scale/rollout imperatively:** `kubectl scale`, `kubectl set image`, `kubectl rollout undo`.
- **Label/annotate imperatively:** `kubectl label pod x env=prod`.
- **Find docs by search** on kubernetes.io — bookmark the tasks pages for NetworkPolicy, probes,
  volumes (you copy-paste and adapt these).
- **Don't polish** — get it working, verify, move on. Flag hard questions and return.

## A practice regimen

1. **Redo every lab in this course from memory**, generating YAML with `--dry-run`.
2. **Time yourself** — aim for a few minutes per task.
3. **Drill troubleshooting** (Module 8): have a friend break something, you fix it. It's 30% of CKA.
4. **Take a timed mock exam** (killer.sh comes with the exam registration) before the real thing.
5. **Practice the capstone (Module 15)** end-to-end until it's fluent.

## What to review the night before

- Generating manifests with `--dry-run=client -o yaml`.
- Probes (liveness vs readiness), requests/limits (Module 6).
- RBAC (`kubectl auth can-i`), ServiceAccounts (Module 7).
- Services & DNS, Ingress, NetworkPolicy (Modules 3, 12, 7).
- PV/PVC/StorageClass (Module 5).
- **Troubleshooting method** (Module 8) — describe → logs → fix.

## Check yourself

1. What kind of exams are the CKA/CKAD? *(Hands-on, performance-based — you perform tasks on a live
   cluster, open-book against kubernetes.io.)*
2. Which CKA domain is largest, and which course module targets it? *(Troubleshooting, 30% — Module
   8.)*
3. The single most important exam-speed command pattern? *(`kubectl ... --dry-run=client -o yaml` to
   generate manifests, then edit/apply.)*
4. Why set the namespace for each question? *(A correct object in the wrong namespace scores zero.)*
5. Which command explains a resource's fields offline? *(`kubectl explain <resource>.<field>`.)*

---

**Next:** [17 — Debugging, gotchas & next steps →](./17-debugging-next-steps.md)
