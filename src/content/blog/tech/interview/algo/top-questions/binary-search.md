---
date: 2026-07-08T15:17:00+08:00
tags: ["binary-search", "easy"]
title: "8. Binary Search"
weight: 8
---

Pattern: **Binary Search**

## Problem

Given a sorted array and a target, return the index of target. If not found, return -1.

## Solution

```go
func binarySearch(nums []int, target int) int {
    left := 0
    right := len(nums) - 1

    for left <= right {
        mid := (right + left) / 2

        if target == nums[mid] {
            return mid
        } else if target < nums[mid] {
            right = mid - 1
        } else {
            left = mid + 1
        }
    }

    return -1
}
```

O(log n) time, O(1) space.
