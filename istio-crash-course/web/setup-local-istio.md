# Setup — run Istio locally

*Do this once. In ~15 minutes you'll have a real Kubernetes cluster on your laptop with Istio
installed, a demo app running inside the mesh, and a dashboard showing traffic. Every step spelled
out. Requires a machine with ~8 GB RAM free.*

> **This course is hands-on, on your own machine.** The site you're reading gives you the lessons
> and quizzes, but the real work happens in your own terminal — installing tools, running
> containers, and breaking things you can then fix. This setup page gets your machine ready; do it
> before the first lab.

Istio runs on **Kubernetes**, so first we make a tiny throwaway Kubernetes cluster on your machine
with **kind** (Kubernetes-IN-Docker), then install Istio into it. You'll install four command-line
tools; everything else is pulled automatically.

---

## Step 1 — Install the prerequisites

You need **Docker**, **kind**, and **kubectl**.

**Docker**
: Install Docker Desktop from <https://www.docker.com/products/docker-desktop/> (macOS/Windows) or
Docker Engine on Linux (<https://docs.docker.com/engine/install/>). Launch it and wait for the
running indicator. Verify: `docker run --rm hello-world`.

**kubectl** (the Kubernetes command-line tool)
: Follow <https://kubernetes.io/docs/tasks/tools/>. On macOS: `brew install kubectl`. Verify:
`kubectl version --client`.

**kind** (runs Kubernetes inside Docker)
: Follow <https://kind.sigs.k8s.io/docs/user/quick-start/>. On macOS: `brew install kind`. Verify:
`kind version`.

## Step 2 — Create a local Kubernetes cluster

```bash
kind create cluster --name istio-lab
kubectl cluster-info --context kind-istio-lab   # should print cluster URLs
kubectl get nodes                               # one node, status Ready
```

You now have a one-node Kubernetes cluster running in Docker. `kubectl` is how you talk to it.

## Step 3 — Download Istio and get `istioctl`

`istioctl` is Istio's own command-line installer/manager.

```bash
# macOS / Linux — downloads the latest Istio and its samples into ./istio-*/
curl -L https://istio.io/downloadIstio | sh -
cd istio-*                       # e.g. cd istio-1.30.1
export PATH=$PWD/bin:$PATH        # put istioctl on your PATH for this terminal
istioctl version                 # confirms istioctl works (control plane not installed yet)
```

*(Windows: download the release zip from <https://github.com/istio/istio/releases>, unzip, and add
the `bin` folder to your PATH.)*

> **Version note.** Istio 1.30.x is current as of this writing. The `downloadIstio` script always
> fetches the latest stable. If a newer version exists when you read this, the commands are
> unchanged. Check <https://istio.io> for the newest release.

## Step 4 — Install Istio (demo profile)

The **demo profile** installs everything with relaxed resource needs — perfect for learning.

```bash
istioctl install --set profile=demo -y
```

This deploys **istiod** (the control-plane brain) plus ingress/egress gateways into the
`istio-system` namespace. Confirm:

```bash
kubectl get pods -n istio-system     # istiod + gateways, all Running
```

## Step 5 — Turn on automatic sidecar injection

Tell Istio to inject an Envoy sidecar into every pod created in the `default` namespace:

```bash
kubectl label namespace default istio-injection=enabled
kubectl get namespace -L istio-injection    # 'default' now shows enabled
```

From now on, any pod you deploy into `default` automatically gets a proxy beside it.

## Step 6 — Deploy the sample app (Bookinfo)

Istio ships a demo microservices app called **Bookinfo** (a bookstore page: `productpage` calls
`details`, `reviews`, and `ratings`; `reviews` has three versions). It's the standard way to see
the mesh in action. From inside the `istio-*` folder:

```bash
kubectl apply -f samples/bookinfo/platform/kube/bookinfo.yaml
kubectl get pods      # each app pod shows 2/2 — your container + the injected Envoy sidecar
```

That **2/2** is the whole point: two containers per pod — your app *and* its sidecar proxy.

## Step 7 — Send traffic and confirm it works

```bash
# run a throwaway curl pod inside the cluster to hit the productpage service
kubectl exec "$(kubectl get pod -l app=ratings -o jsonpath='{.items[0].metadata.name}')" \
  -c ratings -- curl -sS productpage:9080/productpage | grep -o "<title>.*</title>"
# → <title>Simple Bookstore App</title>
```

If you see the title, traffic flowed through the mesh (app → sidecar → sidecar → app).

## Step 8 — Open the dashboards (Kiali)

Install the observability add-ons (Kiali, Prometheus, Grafana, Jaeger) and open the service graph:

```bash
kubectl apply -f samples/addons        # Kiali, Prometheus, Grafana, Jaeger
kubectl rollout status deployment/kiali -n istio-system
istioctl dashboard kiali               # opens Kiali in your browser
```

Kiali draws a live map of which service calls which. (Generate some traffic first so there's
something to see — re-run the curl from Step 7 a few times.)

## Step 9 — Clean up when done

```bash
kind delete cluster --name istio-lab   # deletes everything — cluster, Istio, apps
```

That one command removes the whole environment. To start again, repeat from Step 2.

---

## Troubleshooting

**Pods stuck in `Pending` or the node looks unhealthy**
: kind needs enough memory. Give Docker Desktop ≥ 8 GB (Settings → Resources) and recreate the
cluster.

**`istioctl: command not found`**
: Your PATH doesn't include Istio's `bin`. Re-run `export PATH=$PWD/bin:$PATH` from inside the
`istio-*` folder (each new terminal needs it, or copy `istioctl` somewhere on your PATH).

**App pods show `1/2` and never reach `2/2`**
: The sidecar wasn't injected. Make sure you labelled the namespace (Step 5) *before* deploying the
app; if not, `kubectl rollout restart deployment` in `default` re-injects.

**`istioctl dashboard kiali` won't open**
: Make sure the addons applied and Kiali is Running (`kubectl get pods -n istio-system`). The
command holds the terminal open (it's port-forwarding) — leave it running and use the browser tab.

**Everything is slow the first time**
: Normal — Kubernetes and Istio images download once, then cache.

## Check yourself

1. What does Istio run on top of, and what tool makes a local cluster? *(Kubernetes; kind makes a
   throwaway local cluster.)*
2. What does `istioctl install --set profile=demo` install? *(The control plane, istiod, plus
   gateways — the demo profile for learning.)*
3. What does labelling a namespace `istio-injection=enabled` do? *(New pods there automatically get
   an Envoy sidecar injected.)*
4. Why do the app pods show `2/2` containers? *(Your app container plus the injected sidecar
   proxy.)*
5. What does Kiali show you? *(A live graph of which services call which, with health/traffic.)*

---

**Next:** [Primer — What is Istio? →](./primer-what-is-istio.md)
