# 2b — Workloads beyond Deployments: DaemonSets, Jobs & CronJobs

*A Deployment answers "keep N copies running forever." This module is for every workload where that's the wrong sentence. ~11 min read.*

---

Module 2 gave you the Deployment, and it's the right tool for services — things that should run
forever, in N interchangeable copies, behind a Service. But three common kinds of work don't fit
that sentence, and Kubernetes has a purpose-built object for each.

## DaemonSet: one per node

**Sentence:** "run exactly one copy on *every node* (or every matching node)."

That's not a replica count — if the cluster grows from 5 nodes to 8, you want 8 copies, no edit.
DaemonSets are how per-node infrastructure runs: log collectors reading every node's container
logs, monitoring agents exporting node metrics, CNI network plugins, storage drivers.

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata: { name: log-collector }
spec:
  selector: { matchLabels: { app: log-collector } }
  template:
    metadata: { labels: { app: log-collector } }
    spec:
      containers:
      - name: collector
        image: fluent-bit:3
        volumeMounts: [{ name: varlog, mountPath: /var/log, readOnly: true }]
      volumes: [{ name: varlog, hostPath: { path: /var/log } }]
```

Notice what's *missing*: no `replicas`. The node list is the replica count. A `nodeSelector` (or
tolerations — module 6b) narrows "every node" to "every GPU node", "every edge node". If you find
yourself writing a Deployment whose replica count you mentally tie to the node count, you wanted a
DaemonSet.

## Job: run to completion

**Sentence:** "run this until it *succeeds*, then stop."

A Deployment treats exit as failure and restarts the pod forever — the famous foot-gun of running
a migration script under a Deployment is that Kubernetes will happily re-run your migration in a
loop. A **Job** inverts the logic: success (exit 0) is the goal state.

```yaml
apiVersion: batch/v1
kind: Job
metadata: { name: db-migrate }
spec:
  backoffLimit: 3            # retry a FAILING pod at most 3 times
  activeDeadlineSeconds: 600 # kill the whole attempt after 10 minutes
  template:
    spec:
      restartPolicy: Never   # Jobs require Never or OnFailure
      containers:
      - name: migrate
        image: myapp:2.4
        command: ["python", "manage.py", "migrate"]
```

The two knobs to always set: `backoffLimit` (how hard to retry) and `activeDeadlineSeconds` (when
to give up entirely) — without them a broken migration retries with exponential backoff while
your deploy pipeline waits forever. For batch fan-out, `completions` and `parallelism` turn one
Job into "process these 500 items, 10 at a time" — and because the *pods* retry, the work must be
idempotent, the same rule queues taught in the fundamentals course.

## CronJob: Jobs on a schedule

**Sentence:** "create that Job every night at 02:00."

```yaml
apiVersion: batch/v1
kind: CronJob
metadata: { name: nightly-report }
spec:
  schedule: "0 2 * * *"            # standard cron syntax, in the cluster's timezone
  concurrencyPolicy: Forbid        # if last night's run is STILL going, skip tonight's
  startingDeadlineSeconds: 3600
  jobTemplate:
    spec:
      template: ...                # exactly a Job spec from here down
```

A CronJob is just a Job factory. The knob people learn the hard way is `concurrencyPolicy`: the
default `Allow` means a slow run and its successor execute *simultaneously* — twice the load,
possibly corrupting shared output. `Forbid` (skip) or `Replace` (kill and restart) are almost
always what you meant. And schedule *misses* (cluster down at 02:00) are only retried within
`startingDeadlineSeconds` — a nightly report that absolutely must run needs monitoring on the Job,
not faith in the schedule.

## Init containers: setup steps inside any pod

Not a separate object but the same family of need: work that runs *before* the main container.
`initContainers` run **in order, each to completion**, before the app starts — wait-for-database,
fetch config, fix volume permissions:

```yaml
spec:
  initContainers:
  - name: wait-for-db
    image: busybox
    command: ["sh", "-c", "until nc -z db 5432; do sleep 2; done"]
  containers:
  - name: app
    ...
```

A pod stuck in `Init:0/1` is telling you precisely where startup is blocked — check
`kubectl logs <pod> -c wait-for-db`. (Module 8b's reading list now has one more status decoded.)

## Choosing, in one table

| Work | Object |
|---|---|
| A service, N copies, forever | **Deployment** |
| One copy per node | **DaemonSet** |
| Run until it succeeds once | **Job** |
| That, on a schedule | **CronJob** |
| Setup before the app starts | **initContainers** |
| Stateful service with identity | **StatefulSet** (module 5) |

The interview-grade insight: these all reuse the same machinery — the pod template. Every one of
these objects is "a controller with an opinion about *when* and *where* pod templates become
pods." Learn the opinions, and the objects stop being a list to memorize.

---

**Next:** [3 — Services & networking →](./03-services-networking.md)
