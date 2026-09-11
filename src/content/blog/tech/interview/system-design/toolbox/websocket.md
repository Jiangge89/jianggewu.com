---
date: 2026-08-11T00:00:00+08:00
tags: ["api", "tier1"]
title: "WebSocket Toolbox"
weight: 17
---

## Trigger

```
Chat / Trading / Live Price / Game / Notification
```

## What

Persistent TCP connection. Bidirectional communication.

```
Client ←→ WebSocket ←→ Server Push
```

## Advantages

- Very low latency
- Server Push
- Full duplex

## Tradeoff

- Stateful
- Harder to scale
- Connection management
