# Primer — Why Kubernetes? (in plain English)

*Start here. Assumes you know what a container is (from the Docker course). ~10 min. If you finish
thinking "I need something to babysit thousands of containers across many machines" — that's
Kubernetes.*

---

## The problem, told as a story

You containerized your app (great — that's the Docker course). Now reality hits:

- One container isn't enough — you need **many copies** to handle traffic, on **many servers**.
- Servers **crash**. Containers **die**. Someone has to notice and **restart** the work — at 3am,
  automatically.
- Traffic **spikes** Friday night and **drops** Monday — you want to **scale up and down** without a
  human watching.
- You ship a new version and it's broken — you need to **roll back instantly** with no downtime.
- With hundreds of containers moving between servers, how does anything **find** anything? IPs change
  constantly.

Doing this by hand across a fleet is impossible. **Kubernetes is the system that does it for you** —
an automatic operator for containerized apps across many machines. It's often called a **container
orchestrator**.

## The orchestra analogy

An orchestra has many musicians (containers) who could play independently, but you get chaos without
a **conductor** coordinating who plays what, when, and how loud — and replacing anyone who falters.
Kubernetes is the conductor for your containers: it decides where each runs, keeps the right number
playing, adjusts to the moment, and covers for failures. You hand it the sheet music (your desired
state); it makes the performance happen and keeps it going.

## The one big idea: declarative desired state

This is the mental shift that makes Kubernetes click. You don't give step-by-step commands. You
**declare the desired end state** — "I want 5 healthy copies of this image, reachable at this name"
— and Kubernetes **continuously works to make reality match**, forever.

```
   You declare:  "5 replicas of myapp:1.2, always healthy"
                              │
                              ▼
   Kubernetes constantly checks:  are there 5 healthy? 
        4 running (one crashed)  → start 1 more
        6 running (you scaled down) → stop 1
        a node died → reschedule its pods elsewhere
```

This never-ending "make reality match the goal" loop is called **reconciliation**, and it's the
heartbeat of the whole system. Compare it to Docker's `docker run` (a one-time imperative command
that does nothing if the container later dies). Kubernetes is a **control loop**, not a command.

## What Kubernetes gives you

- **Scheduling** — decides which server each container runs on, packing them efficiently.
- **Self-healing** — restarts crashed containers, replaces dead ones, reschedules off failed nodes.
- **Scaling** — add/remove replicas by hand or automatically based on load.
- **Service discovery & load balancing** — stable names for services, traffic spread across replicas
  wherever they are.
- **Rollouts & rollbacks** — ship new versions gradually, revert instantly if bad.
- **Config & secrets** — inject configuration and credentials without rebuilding images.
- **Storage orchestration** — attach persistent storage to containers that need it.

All declared as YAML, all reconciled automatically.

## What Kubernetes is NOT

Clearing up common confusion:

- **It doesn't build images.** You still build with Docker (or similar) and push to a registry;
  Kubernetes pulls and runs them.
- **It's not a PaaS like Heroku.** It's lower-level and more flexible — a platform *for building*
  platforms.
- **It's not magic sizing.** You tell it how much CPU/memory apps need; it schedules accordingly.
- **It's not only for huge companies.** It's heavier than Docker alone, but managed Kubernetes and
  local tools make it accessible — and its concepts are now industry-standard.

## Is it overkill?

Sometimes. For one small app on one server, Kubernetes is more than you need — Docker or a simple
host is fine. Kubernetes earns its complexity when you have **multiple services, need high
availability, scale, and frequent deploys**. But because it's become the *lingua franca* of modern
infrastructure, learning it is high-value regardless — and that's what this course is for.

## How the course is built

You'll learn in layers, each building on the last:

- **Fundamentals** — the core objects: Pods, Deployments, Services, config, storage.
- **Production & security** — health probes, resource limits, RBAC, network policy, troubleshooting.
- **Packaging & delivery** — Helm, Kustomize, and CI/CD pipelines.
- **Advanced platform** — ingress, autoscaling, operators/CRDs.
- **Capstone + cert prep** — deploy a full multi-service app, and map everything to the CKA/CKAD
  exams.

By the end you'll be a genuine practitioner, not just someone who's heard the words.

## Check yourself

1. What problem does Kubernetes solve? *(Running and managing many containers across many machines —
   scheduling, healing, scaling, discovery — automatically.)*
2. What is the "declarative desired state" idea? *(You declare the end state you want; Kubernetes
   continuously makes reality match it.)*
3. What is reconciliation? *(The never-ending control loop that checks actual vs desired state and
   fixes the difference.)*
4. Does Kubernetes build your images? *(No — you build/push them; Kubernetes pulls and runs them.)*
5. When is Kubernetes worth its complexity? *(When you have multiple services needing availability,
   scale, and frequent deploys.)*

---

**Next:** [Primer — The cluster, at a glance →](./primer-cluster-architecture.md)
