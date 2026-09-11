---
date: 2026-07-08T15:17:00+08:00
tags: ["sorting", "sweep", "medium"]
title: "28. Merge Intervals"
weight: 28
---

Pattern: **Sort + Sweep**

## Problem

Given a collection of intervals, merge all overlapping intervals.

## Solution

```go
func merge(intervals [][]int) [][]int {
    slices.SortFunc(intervals, func(a, b []int) int {
        return a[0] - b[0]
    })

    result := [][]int{}
    currentLeft, currentRight := intervals[0][0], intervals[0][1]

    for i := 1; i < len(intervals); i++ {
        if intervals[i][0] <= currentRight {
            currentRight = max(currentRight, intervals[i][1])
        } else {
            result = append(result, []int{currentLeft, currentRight})
            currentLeft = intervals[i][0]
            currentRight = intervals[i][1]
        }
    }
    result = append(result, []int{currentLeft, currentRight})

    return result
}
```

Sort by start, then sweep. If next interval overlaps, extend; otherwise flush.
