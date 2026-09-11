---
date: 2026-07-08T15:17:00+08:00
tags: ["lazy-propagation", "medium"]
title: "27. MaxCounters"
weight: 27
---

Pattern: **Lazy Propagation**

## Problem

N counters, all initially 0. Operations: `increase(X)` or `max counter` (set all to current max). Return final state.

**Example:**
```
N = 5, operations = [3, 4, 4, 6, 1, 4, 4]
Output: [3, 2, 2, 4, 2]
```

## Solution

```go
func maxCounters(n int, operations []int) []int {
    curMaxVal := 0
    maxVal := 0
    counters := make([]int, n)

    for i := 0; i < len(operations); i++ {
        if operations[i] == n+1 {
            maxVal = curMaxVal
        } else {
            if counters[operations[i]-1] < maxVal {
                counters[operations[i]-1] = maxVal + 1
            } else {
                counters[operations[i]-1]++
            }
            curMaxVal = max(curMaxVal, counters[operations[i]-1])
        }
    }

    for i := 0; i < n; i++ {
        if counters[i] < maxVal {
            counters[i] = maxVal
        }
    }

    return counters
}
```

Lazy update: track `maxVal` floor, only apply at increment time or final pass. O(N+M) instead of O(N*M).
