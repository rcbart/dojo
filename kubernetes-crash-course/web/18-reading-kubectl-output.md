# 18 — Reading kubectl output (healthy vs broken)

*A practitioner reference. For each command you'll actually run, here's what **healthy** output
looks like, what a common **broken** output looks like, and exactly how to read it. Bookmark this —
it's the fastest way to turn "I ran a command" into "I know what it's telling me." ~25 min.*

---

Kubernetes rarely says "error." Instead it shows you *state*, and you have to read it. Below, each
command shows a **good** result, a **bad** result, and the column-by-column interpretation. `#`
comments point at what to notice.

---

## `kubectl get pods`

**Healthy:**
```
NAME                   READY   STATUS    RESTARTS   AGE
web-6d4c...-abcde      1/1     Running   0          2m      # READY 1/1 = all containers up; 0 restarts = stable
web-6d4c...-fghij      1/1     Running   0          2m
```

Read the columns: **READY** is `ready/total` containers (want them equal, e.g. `1/1`, `2/2`).
**STATUS** should be `Running` (or `Completed` for Jobs). **RESTARTS** climbing means the container
keeps dying. **AGE** is how long it's existed.

**Broken — crash loop:**
```
NAME              READY   STATUS             RESTARTS      AGE
api-77...-x2k9     0/1     CrashLoopBackOff   5 (20s ago)   3m   # 0/1 not ready; 5 restarts; app keeps crashing
```
`CrashLoopBackOff` + rising `RESTARTS` = the app starts then exits. **Next step:** `kubectl logs
api-77...-x2k9 --previous` to see why the last run died.

**Broken — bad image:**
```
NAME              READY   STATUS             RESTARTS   AGE
api-77...-x2k9     0/1     ImagePullBackOff   0          90s   # can't fetch the image at all
```
`ImagePullBackOff` / `ErrImagePull` = wrong image name/tag or missing registry credentials. **Next
step:** `kubectl describe pod` and read Events for the exact pull error.

**Broken — can't schedule:**
```
NAME              READY   STATUS    RESTARTS   AGE
api-77...-x2k9     0/1     Pending   0          4m    # never placed on a node
```
`Pending` = the scheduler hasn't placed it. **Next step:** `kubectl describe pod` — usually
"Insufficient cpu/memory," a taint/affinity mismatch, or an unbound PVC.

> **Rule:** the STATUS word tells you *which* problem; `describe` (Events) and `logs` tell you *why*.

---

## `kubectl describe pod <name>`

The gold is the **Events** section at the bottom (most recent last):

**Healthy:**
```
Events:
  Type    Reason     Age   Message
  Normal  Scheduled  30s   Successfully assigned default/web to worker-1
  Normal  Pulled     29s   Container image "nginx:1.27" already present on machine
  Normal  Created    29s   Created container web
  Normal  Started    29s   Started container web       # a clean Scheduled→Pulled→Created→Started
```
All `Normal`, ending in `Started` = healthy startup.

**Broken:**
```
Events:
  Type     Reason     Age                Message
  Normal   Scheduled  2m                 Successfully assigned default/api to worker-1
  Warning  Failed     70s (x4 over 2m)   Failed to pull image "myapp:nope": not found   # the real cause
  Warning  Failed     70s (x4 over 2m)   Error: ErrImagePull
```
Read the **`Warning`** lines — they name the problem in plain English ("image not found"). The
`(x4 over 2m)` means it's repeating. Fix the image tag and it clears.

---

## `kubectl logs <pod>`

**Healthy:** your app's normal startup output —
```
Listening on :8080
Connected to database
```

**Broken:**
```
Error: connect ECONNREFUSED db:5432        # app can't reach its database
```
The app's *own* error. For a crash loop, add **`--previous`** (the current container may be too
new): `kubectl logs api-77...-x2k9 --previous`. If you see nothing, the container may not have
started — check `describe` instead.

---

## `kubectl get deployment`

**Healthy:**
```
NAME   READY   UP-TO-DATE   AVAILABLE   AGE
web    3/3     3            3           5m     # READY 3/3, all up-to-date and available
```
**READY** = ready/desired replicas (want them equal). **UP-TO-DATE** = replicas on the newest
version. **AVAILABLE** = replicas actually serving.

**Broken — stuck rollout:**
```
NAME   READY   UP-TO-DATE   AVAILABLE   AGE
web    2/3     1            2           5m     # only 2 of 3 ready; 1 up-to-date = new version not coming up
```
`READY 2/3` with `UP-TO-DATE 1` means the new version's pod isn't becoming ready — a bad image or a
failing readiness probe. The 2 old pods still serve (no outage). **Next:** `kubectl rollout status
deployment/web` and `kubectl get pods` to find the unhealthy new pod.

---

## `kubectl rollout status deployment/<name>`

**Healthy:**
```
deployment "web" successfully rolled out      # done — exit code 0
```
**Broken (stuck):**
```
Waiting for deployment "web" rollout to finish: 1 out of 3 new replicas have been updated...
# ...and it hangs here. It never completes because new pods aren't ready.
```
In a script/CI, this command **blocks and eventually fails** (non-zero exit) on a bad rollout —
which is exactly what makes automated deploys safe (Module 11). Ctrl-C, then investigate the new
pod.

---

## `kubectl get service` and `kubectl get endpoints`

A Service is only useful if it has **endpoints** (matching pod IPs). This is the #1 networking check.

**Healthy:**
```
$ kubectl get svc web
NAME   TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)   AGE
web    ClusterIP   10.96.12.34    <none>        80/TCP    3m

$ kubectl get endpoints web
NAME   ENDPOINTS                             AGE
web    10.244.1.5:80,10.244.2.6:80           3m     # has pod IPs = it will route traffic
```

**Broken — no endpoints:**
```
$ kubectl get endpoints web
NAME   ENDPOINTS   AGE
web    <none>      3m     # EMPTY = Service matches no pods; traffic goes nowhere
```
`<none>` endpoints = the Service's **selector doesn't match any pod labels** (or the pods aren't
ready). **Next:** compare `kubectl get svc web -o yaml` (its `selector`) with `kubectl get pods
--show-labels`. Mismatched labels is the classic cause.

For `LoadBalancer` on a local cluster you'll also see `EXTERNAL-IP: <pending>` forever — expected,
because kind has no cloud load balancer.

---

## `kubectl get nodes`

**Healthy:**
```
NAME                STATUS   ROLES           AGE   VERSION
k8s-lab-control...  Ready    control-plane   10m   v1.36.0
k8s-lab-worker      Ready    <none>          10m   v1.36.0    # Ready = usable
```
**Broken:**
```
NAME             STATUS     ROLES    AGE   VERSION
k8s-lab-worker   NotReady   <none>   10m   v1.36.0    # node down / kubelet or network issue
```
`NotReady` = the node can't run pods (kubelet stopped, no network, out of resources). Pods on it get
rescheduled. **Next:** `kubectl describe node <name>` — look at Conditions (e.g.
`MemoryPressure`, `DiskPressure`) and Events.

---

## `kubectl get pvc`

**Healthy:**
```
NAME   STATUS   VOLUME        CAPACITY   ACCESS MODES   STORAGECLASS   AGE
data   Bound    pvc-8f3...    1Gi        RWO            standard       2m   # Bound = storage attached
```
**Broken:**
```
NAME   STATUS    VOLUME   CAPACITY   ACCESS MODES   STORAGECLASS   AGE
data   Pending                                      standard       2m   # no PV to bind to
```
`Pending` = no matching PersistentVolume / no default StorageClass to provision one. Any pod using
it will also stay `Pending`. **Next:** `kubectl describe pvc data` for the reason.

---

## `kubectl top pods` / `kubectl top nodes`

**Healthy:**
```
NAME              CPU(cores)   MEMORY(bytes)
web-6d4c...       2m           18Mi
```
**Broken:**
```
error: Metrics API not available        # metrics-server isn't installed (or not ready)
```
`kubectl top` needs the **metrics-server**. This error (and an HPA showing `<unknown>`) both point
to it being missing. Install it, then retry.

---

## `kubectl auth can-i <verb> <resource>`

Returns a plain **`yes`** or **`no`**:
```
$ kubectl auth can-i create deployments -n dev
yes
$ kubectl auth can-i delete pods --as=system:serviceaccount:dev:myapp -n dev
no        # this identity lacks that permission — grant it via Role + RoleBinding
```
`--as=` impersonates a user/ServiceAccount so you can test *their* permissions. `no` means the RBAC
grant is missing (RBAC is additive — you must add it).

---

## `kubectl get events --sort-by=.lastTimestamp`

A recent timeline for the namespace. Scan for **`Warning`** lines:
```
LAST SEEN   TYPE      REASON              OBJECT             MESSAGE
2m          Normal    Scheduled           pod/web-...        Successfully assigned...
30s         Warning   BackOff             pod/api-...        Back-off restarting failed container   # trouble
15s         Warning   FailedScheduling    pod/api-...        0/3 nodes available: insufficient cpu  # why Pending
```
`Warning` + the `REASON` (BackOff, FailedScheduling, Unhealthy, FailedMount…) usually names the
problem directly.

---

## The universal way to read any of it

1. **STATUS word** → *which* category of problem (Pending, CrashLoopBackOff, ImagePullBackOff,
   NotReady, `<none>` endpoints…).
2. **`describe` Events / `logs`** → *why* (the plain-English cause).
3. **Fix, then re-read the same command** → confirm the column flipped back to healthy
   (`Running`, `1/1`, `Bound`, endpoints populated).

Once you can glance at a column and know "that's wrong," you debug in seconds instead of guessing.

## Check yourself

1. In `kubectl get pods`, what does `READY 0/1` with a rising `RESTARTS` count tell you? *(The
   container keeps crashing — a crash loop; check `logs --previous`.)*
2. A Service's `kubectl get endpoints` shows `<none>`. What does that mean? *(The Service matches no
   pods — usually a selector/label mismatch; traffic has nowhere to go.)*
3. Where in `kubectl describe pod` is the most useful information? *(The Events section at the bottom
   — Warning lines name the cause.)*
4. `kubectl top pods` returns "Metrics API not available." Why? *(The metrics-server isn't installed
   or ready.)*
5. A PVC shows `STATUS: Pending`. What's wrong? *(No PersistentVolume to bind to / no default
   StorageClass to provision one — and pods using it will also stay Pending.)*

---

**Next:** [9 — Packaging with Helm →](./09-helm.md)
