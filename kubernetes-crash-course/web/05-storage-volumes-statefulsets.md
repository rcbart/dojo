# 5: Storage: volumes, PV/PVC & StatefulSets

*Where persistent data lives in a world of disposable pods. Concepts + a lab. ~30 min. Needs your
kind cluster.*

---

Pods are ephemeral: delete one and its container filesystem is gone (same lesson as Docker). For
databases and any data that must **survive** pod restarts and rescheduling, Kubernetes has a storage
system: **PersistentVolumes**, **PersistentVolumeClaims**, and **StorageClasses**, plus
**StatefulSets** for stateful apps.

## The core idea: claims, not disks

Kubernetes separates "**I need storage**" from "**here is the actual disk**," so app authors don't
worry about infrastructure:

- **PersistentVolume (PV)**: a piece of *actual* storage in the cluster (a cloud disk, an NFS share,
  a local path). Usually provisioned automatically.
- **PersistentVolumeClaim (PVC)**: a *request* for storage ("I need 5Gi, read-write"). A pod mounts
  the **claim**, not a specific disk.
- **StorageClass**: a *template* describing **how** to provision storage on demand (which disk type,
  parameters). This enables **dynamic provisioning**: create a PVC and a matching PV is created for
  you automatically.

```
   Pod  ──mounts──►  PVC (a request)  ──bound to──►  PV (real storage)
                         ▲                                ▲
                         └── StorageClass dynamically provisions the PV on demand
```

You mostly write **PVCs**; the StorageClass and PV are handled for you (kind ships a default
StorageClass).

## A PVC and a pod that uses it

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: data
spec:
  accessModes: ["ReadWriteOnce"]      # one node mounts it read-write
  resources:
    requests:
      storage: 1Gi
---
apiVersion: v1
kind: Pod
metadata:
  name: writer
spec:
  containers:
  - name: app
    image: busybox
    command: ["sh","-c","echo persisted > /data/note.txt && sleep 3600"]
    volumeMounts:
    - name: vol
      mountPath: /data
  volumes:
  - name: vol
    persistentVolumeClaim:
      claimName: data
```

**Access modes** to know: `ReadWriteOnce` (one node RW; most block storage), `ReadOnlyMany`,
`ReadWriteMany` (many nodes RW; needs shared storage like NFS).

## Lab: prove persistence across pod deletion

```bash
kubectl apply -f pvc-and-writer.yaml       # the manifests above
kubectl get pvc                            # 'data' Bound to an auto-provisioned PV
kubectl exec writer -- cat /data/note.txt  # → persisted

# delete the pod, recreate it, data is still there
kubectl delete pod writer
kubectl apply -f pvc-and-writer.yaml       # recreate just the pod (PVC stays)
kubectl exec writer -- cat /data/note.txt  # → persisted   (survived!)
kubectl delete pod writer; kubectl delete pvc data
```

The data lived in the PV (via the PVC), not the pod, so it outlived the pod.

## StatefulSets: for stateful apps

A Deployment's pods are interchangeable and share nothing. But a database cluster needs each replica
to have a **stable identity** and its **own persistent storage**. That's a **StatefulSet**:

- **Stable network identity**: pods are named predictably: `db-0`, `db-1`, `db-2` (not random).
- **Stable per-pod storage**: each replica gets its **own** PVC (`data-db-0`, `data-db-1`…) that
  sticks with that identity across restarts.
- **Ordered, graceful** rollout/scaling: pods start/stop in order (0,1,2…), which databases often
  require.

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata: { name: db }
spec:
  serviceName: db                 # a headless Service for stable DNS per pod
  replicas: 3
  selector: { matchLabels: { app: db } }
  template:
    metadata: { labels: { app: db } }
    spec:
      containers:
      - name: db
        image: postgres:16
        env: [{ name: POSTGRES_PASSWORD, value: secret }]
        volumeMounts: [{ name: data, mountPath: /var/lib/postgresql/data }]
  volumeClaimTemplates:           # each pod gets its OWN PVC from this template
  - metadata: { name: data }
    spec:
      accessModes: ["ReadWriteOnce"]
      resources: { requests: { storage: 1Gi } }
```

`volumeClaimTemplates` is the magic: the StatefulSet creates a dedicated PVC per pod automatically.

## Lab: watch stable identities

```bash
kubectl apply -f statefulset.yaml
kubectl get pods -l app=db -w         # db-0, then db-1, then db-2 — in order (Ctrl-C to stop)
kubectl get pvc                        # data-db-0, data-db-1, data-db-2 — one each
kubectl delete pod db-1                # it comes back as db-1 with the SAME PVC
kubectl get pvc                        # data-db-1 still there, re-attached
kubectl delete statefulset db          # note: PVCs are retained by default (data is precious)
kubectl get pvc                        # still there — delete manually if you truly want them gone
```

Notice deleting the StatefulSet **keeps the PVCs**: Kubernetes protects data by default.

## When to use what

- **Deployment**: stateless apps (web servers, APIs). Pods are cattle.
- **StatefulSet**: databases, queues, anything needing stable identity + own storage.
- **emptyDir volume** (not shown): scratch space that lives only as long as the pod (caches, temp).

## Check yourself

1. What's the difference between a PV and a PVC? *(A PV is the actual storage; a PVC is a request for
   storage that a pod mounts. The PVC binds to a PV.)*
2. What does a StorageClass enable? *(Dynamic provisioning: creating a matching PV automatically when
   a PVC is made.)*
3. Why use a StatefulSet instead of a Deployment for a database? *(Stable pod identities, each with
   its own persistent storage, and ordered rollout.)*
4. What creates a separate PVC per StatefulSet pod? *(`volumeClaimTemplates`.)*
5. What happens to PVCs when you delete a StatefulSet? *(They're retained by default: data is
   protected; delete them manually if intended.)*

---

**Next:** [6: Health checks & resource management →](./06-health-resources.md)
