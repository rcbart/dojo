# 8 — Observability & troubleshooting

*The highest-weighted CKA topic (30%) and the skill that defines a practitioner: diagnosing a broken
cluster fast. Concepts + a lab. ~30 min. Needs your kind cluster.*

---

Things break. The practitioner difference is a **method**: read the signals in order, form a
hypothesis, confirm it. This module gives you the toolkit and a repeatable process.

## The four signals

| Signal | Command | Tells you |
|--------|---------|-----------|
| **State** | `kubectl get <res> -o wide` | What's running/pending/failing, on which node |
| **Details + Events** | `kubectl describe <res> <name>` | *Why* — Events explain scheduling, pulls, probe failures |
| **Logs** | `kubectl logs <pod> [-c c] [--previous]` | What the app said (and `--previous` = the crashed instance) |
| **Cluster events** | `kubectl get events --sort-by=.lastTimestamp` | A timeline of what happened recently |

**`kubectl describe` (read the Events section) and `kubectl logs` resolve the large majority of
issues.** Learn to read Events — they're written in plain English and usually name the problem.

## Decode the common pod statuses

| Status | Meaning | First move |
|--------|---------|-----------|
| `Pending` | Not scheduled | `describe` — insufficient CPU/memory? node selector/taint? PVC unbound? |
| `ContainerCreating` (stuck) | Setup not finishing | `describe` — image pull, volume mount, or Secret/ConfigMap missing |
| `ImagePullBackOff` / `ErrImagePull` | Can't pull image | Check image name/tag; registry auth (imagePullSecrets) |
| `CrashLoopBackOff` | Container keeps crashing | `logs --previous` — the app is erroring on start |
| `OOMKilled` (in describe) | Hit memory limit | Raise the limit or fix the leak |
| `Running` but `0/1` READY | Readiness probe failing | `describe` probe events; `logs`; is the app actually up? |
| `Terminating` (stuck) | Finalizer / graceful shutdown hanging | Check finalizers, PodDisruptionBudgets |

Memorize this table — it maps a symptom directly to a cause. It's also exam gold.

## The debugging method (apply every time)

1. **`kubectl get pods -o wide`** — what's wrong and where?
2. **`kubectl describe pod <name>`** — read the **Events** (bottom). Usually the answer.
3. **`kubectl logs <name>` (add `--previous` if it restarted)** — the app's own words.
4. **Narrow the layer:** pod? → Service/Endpoints? → Ingress? Check each in turn.
5. **Reproduce/inspect live:** `kubectl exec -it <pod> -- sh` to test from inside; `kubectl run
   tmp --rm -it --image=busybox -- sh` to test networking/DNS from a scratch pod.

## Troubleshooting networking

When "service A can't reach service B":

```bash
kubectl get svc,endpointslices              # does the Service have endpoints? (empty = selector/labels wrong)
kubectl run net --rm -it --image=busybox --restart=Never -- sh
#   inside:  nslookup <service>        (DNS resolving?)
#            wget -qO- <service>:<port> (reachable?)
```

Empty endpoints is the #1 Service bug — the Service's `selector` doesn't match the pods' labels.

## Metrics (resource usage)

Install the **metrics-server** and you get live CPU/memory:

```bash
kubectl top nodes                # per-node usage (needs metrics-server)
kubectl top pods -A              # per-pod usage
```

(`kubectl top` powers autoscaling too — Module 13. On kind, install metrics-server to enable it.)

## Lab: diagnose three broken things

```bash
# A) a Pending pod (impossible resource request)
kubectl run toobig --image=nginx --overrides='{"spec":{"containers":[{"name":"toobig","image":"nginx","resources":{"requests":{"memory":"900Gi"}}}]}}'
kubectl get pod toobig                     # Pending
kubectl describe pod toobig | sed -n '/Events/,$p'   # "Insufficient memory" — the cause
kubectl delete pod toobig --force 2>/dev/null

# B) a CrashLoopBackOff
kubectl run crash --image=busybox --restart=Always -- sh -c "echo boom; exit 1"
sleep 8; kubectl get pod crash              # CrashLoopBackOff
kubectl logs crash --previous               # → boom
kubectl delete pod crash

# C) a Service with no endpoints (label mismatch)
kubectl create deployment app --image=nginx        # pods labelled app=app
kubectl expose deployment app --port=80 --selector=app=WRONG   # selector doesn't match!
kubectl get endpointslices -l kubernetes.io/service-name=app    # no endpoints
kubectl describe svc app                             # Selector: app=WRONG — the bug
kubectl delete deploy app; kubectl delete svc app
```

Each follows the same method: get → describe/Events → logs → confirm cause.

## Practitioner rules

- **Events first.** `describe` before guessing. The cluster usually tells you what's wrong.
- **`--previous` for crash loops** — the current container may be too young to have logs.
- **Empty endpoints = label/selector mismatch.** Check it whenever a Service "doesn't work."
- **Test from a scratch pod** to isolate DNS/network issues from app issues.

## Check yourself

1. Your two primary debugging commands? *(`kubectl describe` (read Events) and `kubectl logs`.)*
2. `CrashLoopBackOff` — which log flag do you need and why? *(`--previous` — to see the crashed
   instance's logs, since the current one may have just restarted.)*
3. A Service has no endpoints. Most likely cause? *(Its selector doesn't match the pods' labels.)*
4. A pod is `Pending`. Where do you look and for what? *(`describe` Events — insufficient resources,
   taints/affinity, or an unbound PVC.)*
5. What does `kubectl top pods` need to work? *(The metrics-server installed in the cluster.)*

---

**Next:** [9 — Packaging with Helm →](./09-helm.md)
