# 17: Debugging, gotchas & next steps

*The field guide you'll come back to. Concept-only. ~15 min.*

---

You've gone from "what is a container" to deploying a self-healing, autoscaled, ingress-fronted,
multi-service app, and mapped it all to the CKA/CKAD. This closing module consolidates the
gotchas and points the way forward.

## The universal debugging method (one more time)

For *any* Kubernetes problem:

1. **`kubectl get <res> -o wide`**: what's the state, and where?
2. **`kubectl describe <res> <name>`**: read the **Events**. Usually the answer.
3. **`kubectl logs <pod> [--previous]`**: the app's own words.
4. **Narrow the layer:** pod → Service/endpoints → Ingress → external. Test each hop.
5. **Probe live:** `kubectl exec`/a scratch `kubectl run` pod to test DNS and connectivity.

`describe` (Events) + `logs` resolve the large majority of issues. Internalize this loop.

## The gotchas that bite everyone

- **Service has no endpoints.** The Service `selector` doesn't match the pods' `labels`. The #1
  networking bug; check `kubectl get endpointslices`.
- **Pod Pending forever.** Insufficient CPU/memory (requests too high), an unschedulable node
  selector/taint, or an unbound PVC. `describe` says which.
- **CrashLoopBackOff.** The app errors on start: `kubectl logs --previous`.
- **ImagePullBackOff.** Wrong image name/tag, or a private registry with no `imagePullSecret`.
- **Config change didn't apply.** ConfigMap/Secret consumed as **env vars** doesn't update running
  pods: `kubectl rollout restart deployment/<x>`.
- **HPA shows `<unknown>` / doesn't scale.** No metrics-server, or the Deployment has no CPU
  **requests**.
- **NetworkPolicy "doesn't work."** Your CNI doesn't enforce policies (vanilla kind), or you forgot a
  default-deny so everything is still allowed. Also: policies are deny-by-default *only for pods they
  select*.
- **`latest` tag surprises.** A pod may keep an old cached image; use specific tags and
  `imagePullPolicy: Always` when needed.
- **Wrong namespace.** `kubectl get pods` shows nothing because your object is in another namespace;
  add `-n <ns>` or `-A`.
- **Readiness vs liveness confusion.** Liveness restarts (use for "wedged"); readiness gates traffic
  (use for "not ready yet"). A too-aggressive liveness probe causes restart loops.
- **PVC stuck Pending.** No default StorageClass or no matching PV: `describe pvc`.

Memorize this list: it's most of your on-call and exam pain, pre-solved.

## Production readiness checklist

Before calling a workload production-ready:

- **Health:** readiness + liveness probes on every container.
- **Resources:** requests + memory limits set; not BestEffort.
- **Config:** externalized to ConfigMaps/Secrets; secrets encrypted at rest + tight RBAC.
- **Security:** non-root, dropped capabilities, per-app ServiceAccount with least privilege,
  default-deny NetworkPolicies.
- **Availability:** multiple replicas, a PodDisruptionBudget, anti-affinity across nodes.
- **Scaling:** HPA with sane min/max where load varies.
- **Rollouts:** readiness-gated rolling updates; a tested rollback path.
- **Observability:** logs to stdout, metrics scraped, alerts on the golden signals; ideally traces.
- **Delivery:** manifests in git (Helm/Kustomize), deployed via CI/CD or GitOps.

## What you didn't cover (know these exist)

The ecosystem is huge; you now have the foundation to learn any of it:

- **Service mesh** (Istio/Linkerd): mTLS, traffic management, observability across services. *(See
  the Istio and Envoy courses; they build directly on this.)*
- **Advanced scheduling**: affinity/anti-affinity, taints/tolerations, topology spread.
- **Multi-tenancy & policy**: ResourceQuotas, LimitRanges, Pod Security Standards, OPA/Kyverno.
- **Stateful ecosystems**: operators for databases, Kafka, etc. (Module 14's pattern).
- **Backup/DR** (Velero), **secrets managers** (External Secrets, Vault), **progressive delivery**
  (Argo Rollouts, Flagger).

## Where to go next

- **Official docs & tasks**: <https://kubernetes.io/docs/> (the *Tasks* section is the exam's
  open-book source; get fast at navigating it).
- **Get certified**: Module 16 maps this course to the CKA/CKAD; drill the labs and take a mock.
- **The service-mesh courses**: Envoy (the data plane) and Istio (the control plane) extend what you
  learned here into advanced networking.
- **Run something real**: deploy a personal project to a managed cluster (GKE/EKS/AKS free tiers);
  the concepts transfer directly from kind.

## Course recap: the one-paragraph mental model

**Kubernetes** runs your **container images** across a cluster of nodes by **declarative desired
state**: you submit objects (Pods via **Deployments**/**StatefulSets**, exposed by **Services** and
**Ingress**, configured by **ConfigMaps**/**Secrets**, backed by **PV/PVCs**) to the control plane,
and controllers **continuously reconcile** reality to match: self-healing, scaling (**HPA**), and
rolling out updates with zero downtime via **probes**. You secure it with **RBAC** and
**NetworkPolicies**, package it with **Helm**/**Kustomize**, ship it with **CI/CD or GitOps**, and
extend it with **CRDs and operators**: the same reconciliation idea, all the way down.

## Check yourself

1. First two commands for almost any problem? *(`kubectl describe` (Events) and `kubectl logs`.)*
2. A Service isn't working and has no endpoints: the cause? *(Its selector doesn't match the pods'
   labels.)*
3. Your HPA shows `<unknown>`: two likely reasons? *(No metrics-server, or the Deployment has no CPU
   requests.)*
4. You changed a ConfigMap used as env vars but nothing changed. Why? *(Env vars are fixed at pod
   start; `rollout restart` to pick up the change.)*
5. Name three items on the production-readiness checklist. *(Any of: probes, requests/limits,
   externalized config/secrets, least-privilege security, multiple replicas, HPA, git-based delivery,
   observability.)*

---

**You've finished the Kubernetes course**, and, with the Docker course, you're a genuine
practitioner. Revisit any module from the sidebar, use the search box to find a concept fast, and go
build something real.
