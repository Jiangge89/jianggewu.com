---
date: 2026-08-11T00:00:00+08:00
tags: ["api", "tier3"]
title: "SSE Toolbox"
weight: 18
---

## SSE (Server Sent Event)

### Trigger

```
Notification / Dashboard / Stock Price / One-way Push
```

### What

Server → Client only. Client cannot push back.

### When is SSE a better fit than WebSocket?

```
Price Dashboard / Notification / AI Streaming
```

When only one-way push is needed, SSE is simpler than WebSocket.
