---
date: 2026-07-08T15:17:00+08:00
tags: ["prefix-sum", "easy"]
title: "23. Prefix Sums / Range Sum Query"
weight: 23
---

Pattern: **Prefix Sum**

## Problem

Given an integer array, efficiently answer multiple range sum queries `SumRange(left, right)`.

## Solution

```go
type NumArray struct {
    prefixSum []int
}

func NewNumArray(nums []int) *NumArray {
    arr := make([]int, len(nums))
    arr[0] = nums[0]
    for i := 1; i < len(nums); i++ {
        arr[i] = arr[i-1] + nums[i]
    }
    return &NumArray{prefixSum: arr}
}

func (n *NumArray) SumRange(i int, j int) int {
    if i == 0 {
        return n.prefixSum[j]
    }
    return n.prefixSum[j] - n.prefixSum[i-1]
}
```

O(n) build, O(1) per query.
