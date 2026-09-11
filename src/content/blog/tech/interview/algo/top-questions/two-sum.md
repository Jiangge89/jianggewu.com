---
date: 2026-07-08T15:17:00+08:00
tags: ["HashMap", "easy"]
title: "1. Two Sum"
weight: 1
---

Pattern: **HashMap**

## Problem

Given an array of integers `nums` and an integer `target`, return indices of the two numbers that add up to target.

## Solution

```go
func twoSum(nums []int, target int) []int {
    tmpTargetToIdx := make(map[int]int)

    for idx1, num := range nums {
        tmpTarget := target - num
        if idx2, ok := tmpTargetToIdx[tmpTarget]; ok {
            return []int{idx1, idx2}
        }
        tmpTargetToIdx[tmpTarget] = idx1
    }

    return []int{}
}
```

O(n) time, O(n) space.
