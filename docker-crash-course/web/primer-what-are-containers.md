# Primer: What are containers? (in plain English)

*The idea everything else rests on. No jargon assumed. ~10 min.*

---

## The problem containers solve

You build an app on your laptop. It works. You send it to a teammate, and it breaks. You deploy it to
a server, and it breaks differently. Why? Because each machine has a slightly different operating
system, different versions of libraries, different settings. The infamous line is **"but it works
on my machine."**

A **container** fixes this by packaging your app *together with everything it needs to run* (the
code, the runtime, the libraries, the settings) into one sealed bundle that runs **the same
everywhere**. Your laptop, a teammate's laptop, a cloud server: identical behavior, because they're
all running the exact same bundle.

## The lunchbox analogy

Think of a container as a **lunchbox**. Instead of hoping the destination has the right food,
utensils, and napkins, you pack everything into one box. Wherever you take it, the meal is complete
and identical. A software container packs your app plus its entire environment the same way, so
"where it runs" no longer changes "how it runs."

## Container vs virtual machine (the key distinction)

Before containers, the way to get a consistent environment was a **virtual machine (VM)**: a full
fake computer, with its own complete operating system, running on top of your real one. VMs work,
but each one is **heavy**: gigabytes in size, slow to start (like booting a PC), and resource-hungry
because every VM runs a whole OS.

Containers are lighter because they **share the host's operating system kernel** instead of each
shipping their own. Picture the difference:

```
   VIRTUAL MACHINES                         CONTAINERS
   ───────────────                          ──────────
   [ App A ] [ App B ]                       [ App A ] [ App B ] [ App C ]
   [ Guest OS ][ Guest OS ]   ← whole OS      [   shared container runtime  ]
   [     Hypervisor      ]      per app       [       host operating system  ]
   [   Host operating system ]                [          hardware            ]
```

- A **VM** virtualizes the *hardware*: heavy, minutes to boot, GBs each.
- A **container** virtualizes the *operating system*: light, starts in **milliseconds**, MBs each.

So you can run many more containers than VMs on the same machine, and start them almost instantly.
That efficiency is why containers took over modern software delivery.

## Images vs containers (don't mix these up)

Two words you'll use constantly, and they're different:

- An **image** is the **blueprint**: a read-only, packaged snapshot of your app and its
  environment. You build it once; it doesn't run.
- A **container** is a **running instance** of an image: the blueprint brought to life. You can
  start many containers from one image, like baking many cookies from one cutter.

> Image = the recipe (or class). Container = the meal being cooked (or object). One image, many
> containers.

## What Docker is (one line)

**Docker** is the most popular tool for building images and running containers. It gives you simple
commands (`docker build`, `docker run`) and a format for images that the whole industry adopted.
When people say "containerize my app," they usually mean "package it as a Docker image."

## Why this matters for your career

Containers are the foundation of modern infrastructure. **Kubernetes** (the second half of your
learning path) exists to run *thousands* of containers across many machines. You can't understand
Kubernetes without understanding containers first, which is exactly why this course comes before
it. Master the lunchbox, then learn to manage a whole warehouse of them.

## Check yourself

1. What problem do containers solve? *(They package an app with everything it needs so it runs the
   same everywhere: no more "works on my machine.")*
2. The key difference between a container and a VM? *(A VM ships a whole OS (heavy); a container
   shares the host's OS kernel (light, fast).)*
3. Image vs container? *(An image is the read-only blueprint; a container is a running instance of
   it.)*
4. Can you run many containers from one image? *(Yes: one image, many containers.)*
5. What is Docker, in one line? *(The most popular tool for building images and running
   containers.)*

---

**Next:** [Primer: Core concepts & glossary (keep it open as you go) →](./primer-core-concepts.md)
