---
date: 2026-07-08T15:17:00+08:00
tags: ["HashMap", "heap", "medium"]
title: "11. Top K Frequent Elements"
weight: 11
---

Pattern: **HashMap + Heap**

## Problem

Given an integer array and k, return the k most frequent elements.

**Example:**
```
Input:  nums = [1,1,1,2,2,3], k = 2
Output: [1,2]
```

## Solution

```go
type Node struct {
    num  int
    freq int
}

type PriorityQueue []Node

func (pq PriorityQueue) Len() int            { return len(pq) }
func (pq PriorityQueue) Less(i, j int) bool  { return pq[i].freq < pq[j].freq }
func (pq PriorityQueue) Swap(i, j int)       { pq[i], pq[j] = pq[j], pq[i] }
func (pq *PriorityQueue) Push(x interface{}) { *pq = append(*pq, x.(Node)) }
func (pq *PriorityQueue) Pop() interface{} {
    old := *pq
    n := len(old)
    item := old[n-1]
    *pq = old[0 : n-1]
    return item
}

func kFrequent(nums []int, k int) []int {
    numToFreq := make(map[int]int)
    for _, n := range nums {
        numToFreq[n]++
    }

    pq := make(PriorityQueue, 0)
    heap.Init(&pq)

    for num, freq := range numToFreq {
        heap.Push(&pq, Node{num, freq})
        if pq.Len() > k {
            heap.Pop(&pq)
        }
    }

    result := make([]int, 0, k)
    for pq.Len() > 0 {
        item := heap.Pop(&pq).(Node)
        result = append(result, item.num)
    }
    return result
}
```

Min heap of size k by frequency. `heap.Pop` removes the least frequent, keeping the top k.
