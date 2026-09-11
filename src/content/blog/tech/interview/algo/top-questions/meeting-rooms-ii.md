---
date: 2026-07-08T15:17:00+08:00
tags: ["heap", "sorting", "medium"]
title: "12. Meeting Rooms II"
weight: 12
---

Pattern: **Sort + Heap**

## Problem

Given meeting intervals `[start, end]`, find the minimum number of conference rooms required.

**Example:**
```
Input:  [[0,30], [5,10], [15,20]]
Output: 2
```

## Solution

```go
func minMeetingRooms(intervals [][]int) int {
    if len(intervals) == 0 {
        return 0
    }

    sort.Slice(intervals, func(i, j int) bool {
        return intervals[i][0] < intervals[j][0]
    })

    endTimes := &MinHeap{}
    heap.Init(endTimes)

    for _, interval := range intervals {
        if endTimes.Len() > 0 && (*endTimes)[0] <= interval[0] {
            heap.Pop(endTimes)  // reuse room
        }
        heap.Push(endTimes, interval[1])
    }

    return endTimes.Len()
}
```

Sort by start time. Min heap tracks end times of ongoing meetings. Heap size = rooms in use.
