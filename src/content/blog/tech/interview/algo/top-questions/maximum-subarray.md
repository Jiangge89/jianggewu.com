---
date: 2026-07-08T15:17:00+08:00
tags: ["DP", "Kadane", "medium"]
title: "22. Maximum Subarray"
weight: 22
---

Pattern: **DP (Kadane's Algorithm)**

## Problem

Find the contiguous subarray with the largest sum.

## Solution

```go
func maxSubArray(nums []int) int {
    currentMax := nums[0]
    globalMax := nums[0]

    for i := 1; i < len(nums); i++ {
        if nums[i] > currentMax+nums[i] {
            currentMax = nums[i]
        } else {
            currentMax = currentMax + nums[i]
        }
        if currentMax > globalMax {
            globalMax = currentMax
        }
    }

    return globalMax
}
```

At each position: either extend the current subarray or start fresh. O(n) time, O(1) space.
