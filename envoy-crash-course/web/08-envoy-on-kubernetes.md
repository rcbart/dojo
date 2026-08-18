# 08: Envoy on Kubernetes

*Where Envoy actually lives in modern infra. Concepts + a real kind + Envoy Gateway lab. ~30 min.
Requires Docker, `kind`, `kubectl`, and `helm`.*

Lab files: [`labs/08-k8s/`](../labs/08-k8s/).

---

You rarely deploy raw Envoy on Kubernetes by hand. Instead a **control plane** watches the
Kubernetes API and configures Envoy for you via xDS (Module 07). Envoy shows up on Kubernetes in
three shapes:

1. **Ingress / API gateway**: one pool of Envoys at the cluster edge, routing outside traffic to
   Services. Implemented by **Envoy Gateway**, **Contour**, **Gloo**, or Istio's ingress gateway.
2. **Service-mesh sidecar**: an Envoy injected next to *every* pod, handling that pod's traffic
   (Module 09).
3. **Standalone Deployment**: you run Envoy as a normal Deployment with a hand-written config in a
   ConfigMap. Rare, but shows the plumbing.

## The Gateway API (the modern way)

Kubernetes' original `Ingress` resource was too limited (annotations everywhere, no good multi-team
story). The **Gateway API** replaced it and is now GA. It splits responsibilities into a few typed
resources:

| Resource | Owned by | Means |
|----------|----------|-------|
| **GatewayClass** | infra/platform team | "Which controller implements gateways" (e.g. Envoy Gateway) |
| **Gateway** | platform team | An actual entry point: listeners, ports, protocols, TLS |
| **HTTPRoute** | app teams | Routing rules: match paths/headers → backend Services |
| **TLSRoute / GRPCRoute / TCPRoute** | app teams | Same idea for other protocols |

The clean separation (infra owns the Gateway, app teams own their Routes) is the main reason it
won. **Envoy Gateway** is the CNCF project that implements the Gateway API on top of Envoy: you
write Gateway/HTTPRoute YAML, it generates Envoy xDS.

## Lab: Envoy Gateway on a local kind cluster

We'll spin up a throwaway Kubernetes cluster, install Envoy Gateway, deploy an app, and route to it
with the Gateway API.

### 1. Create the cluster

```bash
cd labs/08-k8s
kind create cluster --name envoy-lab --config kind-cluster.yaml
kubectl cluster-info --context kind-envoy-lab
```

### 2. Install Envoy Gateway (v1.4.x)

```bash
helm install eg oci://docker.io/envoyproxy/gateway-helm --version v1.4.4 \
  -n envoy-gateway-system --create-namespace
kubectl wait --timeout=5m -n envoy-gateway-system deployment/envoy-gateway --for=condition=Available
```

*(Check <https://gateway.envoyproxy.io> for the newest patch version; v1.4.x is current as of this
writing.)*

### 3. Deploy the app + Gateway API resources

[`app-and-route.yaml`](../labs/08-k8s/app-and-route.yaml) contains the echo Deployment/Service plus
the **GatewayClass**, **Gateway**, and **HTTPRoute**:

```bash
kubectl apply -f app-and-route.yaml
kubectl get gateway eg          # wait for PROGRAMMED=True
kubectl get httproute echo      # should show the parent Gateway accepted
```

### 4. Reach it from your laptop

Envoy Gateway created an Envoy Deployment + Service for your Gateway. The simplest way to hit it
locally is port-forward:

```bash
# Find the generated gateway service (name starts with envoy-):
kubectl -n envoy-gateway-system get svc
kubectl -n envoy-gateway-system port-forward svc/<that-envoy-service> 8888:80
```

Then, in another terminal:

```bash
curl -s localhost:8888
# hello from kubernetes   ← through Envoy, load-balanced across the 2 echo pods
```

### 5. See that it's really Envoy + xDS underneath

```bash
# The gateway pod IS an Envoy:
kubectl -n envoy-gateway-system get pods
# Envoy Gateway (the control plane) programs it via xDS — scale the app and watch endpoints update:
kubectl scale deployment/echo --replicas=4
kubectl get endpoints echo         # 4 endpoints; Envoy Gateway pushes them to Envoy via EDS
```

This is Module 07 made real: you didn't edit an Envoy config; you changed a Kubernetes object, the
control plane noticed, and it streamed new endpoints to the data-plane Envoy.

### Clean up

```bash
kind delete cluster --name envoy-lab
```

### Experiments

1. **Header routing in Kubernetes.** Add a second HTTPRoute rule matching header `x-canary: yes` to
   a different Service, apply, and curl with the header. Same routing power as Module 04, expressed
   as Gateway API YAML.
2. **Two teams, one gateway.** Add a second HTTPRoute (different path prefix, different Service) to
   the same Gateway, demonstrating the platform-owns-Gateway / apps-own-Routes split.
3. **Watch the generated Envoy config.** `kubectl -n envoy-gateway-system port-forward` the Envoy
   admin port and `curl .../config_dump` to see the LDS/RDS/CDS your YAML produced.

## Check yourself

1. What are the three shapes Envoy takes on Kubernetes? *(Edge gateway/ingress, mesh sidecar,
   standalone Deployment.)*
2. Why did the Gateway API replace `Ingress`? *(Typed resources + a clean split between
   infra-owned Gateways and app-owned Routes; no annotation soup.)*
3. Which Gateway API resource do app teams write? *(HTTPRoute: the routing rules.)*
4. What does Envoy Gateway actually do with your Gateway/HTTPRoute YAML? *(Translates it into Envoy
   xDS config and programs the data-plane Envoys.)*
5. When you scale a Deployment, how does Envoy learn the new pods? *(The control plane pushes
   updated endpoints via EDS, no config edit.)*

---

**Next:** [09: Service mesh & sidecars →](./09-service-mesh-sidecars.md)
