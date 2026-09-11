---
date: 2026-07-08T15:17:00+08:00
tags: ["DFS", "HashMap", "medium"]
title: "4. Clone Graph"
weight: 4
---

Pattern: **DFS + HashMap**

## Problem

Given a node in a connected undirected graph, return a deep copy of the entire graph. Nodes reference each other (cycles possible).

## Solution

```go
type Node struct {
    Val       int
    Neighbors []*Node
}

func cloneGraph(node *Node) *Node {
    if node == nil {
        return nil
    }
    return dfs(node, map[*Node]*Node{})
}

func dfs(node *Node, cloned map[*Node]*Node) *Node {
    if c, ok := cloned[node]; ok {
        return c
    }

    clone := &Node{Val: node.Val}
    cloned[node] = clone  // register before recursing (handles cycles)

    for _, neighbor := range node.Neighbors {
        clone.Neighbors = append(clone.Neighbors, dfs(neighbor, cloned))
    }

    return clone
}
```

Key: register the clone in the map **before** recursing into neighbors to handle cycles.
