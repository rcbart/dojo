# Primer — Core concepts & glossary

*Read this if any word feels assumed. It defines the background terms (node, cluster, instance,
control plane, API, and friends) in plain English, so nothing later leaves you lost. ~10 min. Skim
now; come back whenever a term trips you up.*

---

Kubernetes tutorials throw around a lot of vocabulary. This page assumes **nothing** and defines it
all simply. (If you did the Docker course, some of this is recap, but Kubernetes adds important new
terms like *node* and *cluster*.)

## Machines and groups of machines

- **Machine / computer / server**: a computer that runs software. In the cloud, usually a rented
  virtual computer.
- **Virtual machine (VM)**: a software-simulated computer with its own operating system, running on
  real hardware. Most cloud servers are VMs.
- **Node**: **one machine in a Kubernetes cluster.** This is the word Kubernetes uses for "a
  server that runs your containers." A node can be a physical machine or (usually) a VM. Your local
  `kind` cluster fakes nodes as Docker containers.
- **Cluster**: **a group of nodes working together as one system**, managed by Kubernetes. You
  deploy to "the cluster," and Kubernetes decides which node runs what. A cluster = the control
  plane (brain) + worker nodes (muscle).
- **Instance**: one running copy of something. Three copies of your app = three instances. In
  Kubernetes these copies are usually **Pods** (see below), and the word for "how many copies" is
  **replicas**.

## The two halves of a cluster

- **Control plane**: the **brain** of the cluster: the components that make decisions (what runs
  where) and store the cluster's state. You submit your wishes here.
- **Worker node**: a **muscle** machine that actually runs your application containers, taking
  orders from the control plane.
- **API server**: the control plane's **front door**. *Everything* talks to it. When you run a
  command or a component needs something, it goes through the API server.
- **etcd**: the cluster's **database**, storing all of its state (what you asked for, and what's
  actually running).

## Containers, images, and Pods

- **Container**: a lightweight, isolated package running one app, sharing the host's OS kernel.
  (The Docker course covers these in depth.)
- **Image**: the read-only blueprint a container is started from, stored in a **registry**.
  Kubernetes runs images; it doesn't build them.
- **Pod**: **the smallest thing Kubernetes runs: a wrapper around one (or a few) containers.** You
  don't run containers directly in Kubernetes; you run Pods. Think "a Pod ≈ one running instance of
  your app."
- **Registry**: an online store of images (Docker Hub, etc.) that Kubernetes pulls from.

## How you tell Kubernetes what you want

- **kubectl**: the **command-line tool** you use to talk to a cluster (it sends requests to the API
  server). Pronounced "cube-cuttle" / "cube-control." Nearly every command is `kubectl <verb>
  <thing>`.
- **YAML**: a human-readable text format for configuration. Kubernetes objects are written in YAML.
  Indentation matters; it's just structured key/value data.
- **Manifest**: a YAML file describing a Kubernetes object (a Pod, a Deployment…). You "apply" a
  manifest to create or update that object.
- **Object / resource**: a thing Kubernetes stores and manages (Pod, Service, Deployment,
  ConfigMap…). Everything you create is an object.
- **API / API group**: the set of object types the cluster understands. "The Kubernetes API" is
  just all the kinds of objects you can create.

## The core mindset words

- **Declarative**: you describe the **desired end state** ("I want 5 healthy copies") and
  Kubernetes continuously makes reality match. The opposite is **imperative** (step-by-step
  commands). Kubernetes is declarative; this is its defining idea.
- **Desired state vs actual state**: what you *asked for* (the `spec`) versus what's *really
  running* (the `status`). Kubernetes works to close the gap.
- **Reconciliation**: the never-ending loop where Kubernetes compares desired vs actual and fixes
  any difference. This is why it "self-heals."
- **Controller**: a control-plane program that runs a reconciliation loop for one kind of object
  (e.g. keeps the right number of Pods alive).
- **Namespace**: a virtual folder that partitions a cluster to organize objects (by team, app, or
  environment). `default` is where your work goes unless you say otherwise.

## Networking words

- **IP address**: a machine's or Pod's numeric network address. Pods get their own, but they change
  as Pods come and go.
- **Port**: a numbered "door" for a specific service on a machine (web = 80, Postgres = 5432).
- **Service**: a stable name/address in Kubernetes that load-balances across a changing set of
  Pods, so you never chase Pod IPs. (Module 3.)
- **DNS**: turns names into IP addresses; inside a cluster, Services get names you can call.
- **Label / selector**: labels are key/value tags on objects; selectors are queries over them. This
  is how Kubernetes objects find each other (e.g. a Service selects the Pods it routes to).

## Reliability & scaling words

- **Replica**: one copy of a Pod. "3 replicas" = 3 identical Pods.
- **Self-healing**: Kubernetes automatically replaces failed Pods/reschedules off dead nodes to
  keep your desired state true.
- **Scaling**: changing how many replicas run (manually or automatically) as load changes.
- **Stateless vs stateful**: stateless apps keep no important local data (easy to scale/replace);
  stateful apps (databases) need preserved storage and stable identity.

## How to use this page

Don't memorize it; skim once so the words feel familiar, and return whenever a term in a later
module is fuzzy. Every concept here appears, in context, in the modules that follow.

## Check yourself

1. What is a "node" in Kubernetes? *(One machine in the cluster that runs your containers.)*
2. What is a "cluster"? *(A group of nodes managed together by Kubernetes: control plane plus worker
   nodes.)*
3. What is a Pod? *(The smallest thing Kubernetes runs: a wrapper around one or a few containers;
   roughly one running instance of your app.)*
4. What does "declarative" mean here? *(You describe the desired end state and Kubernetes keeps
   reality matching it, rather than giving step-by-step commands.)*
5. What is kubectl? *(The command-line tool you use to talk to the cluster's API server.)*

---

**Next:** [0 — What Kubernetes is →](./00-what-is-kubernetes.md)
