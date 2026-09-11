---
date: 2026-07-08T15:17:00+08:00
tags: ["DFS", "topological-sort", "medium"]
title: "14. Course Schedule"
weight: 14
---

Pattern: **DFS + Topological Sort**

## Problem

Given `numCourses` and prerequisites `[a, b]` (must take b before a), return true if all courses can be finished (no cycle).

**Example:**
```
Input:  numCourses = 2, prerequisites = [[1,0],[0,1]]
Output: false  // cycle!
```

## Solution

```go
func canFinish(numCourses int, prerequisites [][]int) bool {
    graph := make([][]int, numCourses)
    for _, pre := range prerequisites {
        graph[pre[1]] = append(graph[pre[1]], pre[0])
    }

    // 0=unvisited, 1=visiting, 2=visited
    state := make([]int, numCourses)

    for i := 0; i < numCourses; i++ {
        if state[i] == 0 {
            if hasCycle(graph, state, i) {
                return false
            }
        }
    }
    return true
}

func hasCycle(graph [][]int, state []int, node int) bool {
    state[node] = 1  // visiting

    for _, neighbor := range graph[node] {
        if state[neighbor] == 1 { return true }   // cycle
        if state[neighbor] == 0 {
            if hasCycle(graph, state, neighbor) { return true }
        }
    }

    state[node] = 2  // visited
    return false
}
```

Three states: hitting state 1 (visiting) means we've looped back → cycle. O(V+E) time.
