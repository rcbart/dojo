# 12 — From Docker to Kubernetes

*The bridge module. What you've mastered, what Docker alone can't do, and exactly how each concept
maps into Kubernetes. Concept-only. ~12 min.*

---

## What you can now do

You can package any app into a small, secure image; run and manage containers; persist data with
volumes; connect containers over networks; orchestrate a multi-container app with Compose; push
images to a registry; and debug containers in production. That's a genuine, employable Docker skill
set. Congratulations.

## What Docker alone can't do

Docker (and Compose) runs containers on **one machine**. Real systems need more:

- **Many machines.** Spread containers across a fleet of servers for capacity and resilience.
- **Self-healing.** If a container or a whole server dies, something must restart/reschedule the work
  automatically.
- **Scaling.** Automatically add/remove copies of a service as load changes.
- **Zero-downtime updates.** Roll out a new version gradually, roll back instantly if it's bad.
- **Service discovery & load balancing at scale.** Stable names and traffic spreading across many
  replicas on many hosts.
- **Declarative desired state.** Say "I want 5 healthy replicas of this image" and have the system
  continuously make reality match, forever.

That job, **orchestrating containers across a cluster**, is exactly what **Kubernetes** does.

## How your Docker knowledge maps to Kubernetes

Everything you learned has a direct Kubernetes counterpart. This table is your head start on the
next course:

| Docker concept | Kubernetes counterpart |
|----------------|------------------------|
| A running container | A **Pod** (one or more containers, the smallest unit) |
| `docker run` | A **Deployment** (declares desired replicas, self-heals) |
| `-p` publish port | A **Service** (stable name + load balancing across pods) |
| Compose service-to-service DNS | Kubernetes **Service DNS** (same "talk by name") |
| `-e` env vars / config files | **ConfigMaps** and **Secrets** |
| Named volumes | **PersistentVolumes / PersistentVolumeClaims** |
| `HEALTHCHECK` | **liveness / readiness probes** |
| `--memory` / `--cpus` | resource **requests and limits** |
| `compose.yaml` (declarative stack) | Kubernetes **manifests** (declarative objects) |
| Registry push/pull | Kubernetes pulls the same images (+ **imagePullSecrets**) |
| `docker logs` / `exec` / `inspect` | `kubectl logs` / `exec` / `describe` |

Notice the pattern: Kubernetes takes each single-machine Docker idea and makes it **declarative,
scalable, and self-healing across a cluster.** You're not starting over; you're leveling up the same
concepts.

## The mindset shift ahead

- **Imperative → declarative.** Less "run this container," more "here is the desired state; keep it
  true." (Compose already nudged you this way.)
- **Pets → cattle.** Individual containers become interchangeable, disposable replicas managed as a
  group.
- **One host → a cluster.** Networking, storage, and scheduling become cluster-wide concerns.

## Where to go next

Start the **Kubernetes course**. It opens exactly where this one ends (with the images you now know
how to build) and teaches you to run them at scale: Pods, Deployments, Services, config, storage,
then production practices (probes, resources, RBAC, network policy), packaging (Helm, Kustomize,
CI/CD), advanced platform features (ingress, autoscaling, operators), a capstone app, and CKA/CKAD
exam alignment.

Keep Docker handy: you'll build images throughout the Kubernetes course. The two tools are partners:
**Docker builds; Kubernetes operates.**

## Course recap — the one-paragraph mental model

**Docker** packages an app and its environment into a layered, read-only **image** (built from a
`Dockerfile`, stored in a **registry**) and runs it as a lightweight **container** that shares the
host OS kernel. You persist data in **volumes**, connect containers over **networks** (talking by
name), compose multi-container apps declaratively, and harden images with multi-stage builds,
non-root users, and no baked-in secrets. Everything that follows in Kubernetes is these same ideas,
made declarative, scalable, and self-healing across a whole cluster.

## Check yourself

1. What's the fundamental limit of Docker/Compose that Kubernetes removes? *(They run on one machine;
   Kubernetes orchestrates containers across a cluster of machines.)*
2. What Kubernetes object corresponds to a running container? *(A Pod.)*
3. What replaces `docker run` for declaring desired, self-healing replicas? *(A Deployment.)*
4. What does a Kubernetes Service provide that `-p` did locally? *(A stable name plus load balancing
   across many pods.)*
5. Name the core mindset shift. *(Imperative → declarative: describe desired state and let the system
   maintain it.)*

---

**You've finished the Docker course.** Open the **Kubernetes course** next; it assumes exactly what
you now know. Use the sidebar to revisit any module, and the search box to find a concept fast.
