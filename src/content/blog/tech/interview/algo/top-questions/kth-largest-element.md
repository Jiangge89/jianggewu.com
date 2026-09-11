---
date: 2026-07-08T15:17:00+08:00
tags: ["heap", "medium"]
title: "10. Kth Largest Element"
weight: 10
---

Pattern: **Heap**

## Problem

Given an integer array and k, return the kth largest element.

**Example:**
```
Input:  nums = [3, 2, 1, 5, 6, 4], k = 2
Output: 5
```

## Solution

```go
type MinHeap []int

func (h MinHeap) Len() int           { return len(h) }
func (h MinHeap) Less(i, j int) bool { return h[i] < h[j] }
func (h MinHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }
func (h *MinHeap) Push(x any)        { *h = append(*h, x.(int)) }
func (h *MinHeap) Pop() any {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[0 : n-1]
    return x
}

func kthLargestElement(arr []int, k int) int {
    h := MinHeap{}
    heap.Init(&h)

    for i := 0; i < len(arr); i++ {
        heap.Push(&h, arr[i])
        if h.Len() > k {
            heap.Pop(&h)
        }
    }

    return h[0]
}
```

Min heap of size k: after processing all elements, the root is the kth largest. O(n log k) time.
