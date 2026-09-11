---
date: 2026-07-08T15:17:00+08:00
tags: ["prefix-sum", "medium"]
title: "24. Product of Array Except Self"
weight: 24
---

Pattern: **Prefix/Suffix**

## Problem

Given an array, return an array where each element is the product of all other elements. No division allowed.

## Solution

```go
func productExceptSelf(nums []int) []int {
    result := make([]int, len(nums))

    // Left pass: result[i] = product of everything left of i
    result[0] = 1
    for i := 1; i < len(nums); i++ {
        result[i] = result[i-1] * nums[i-1]
    }

    // Right pass: multiply in the right product
    right := 1
    for i := len(nums) - 2; i >= 0; i-- {
        right *= nums[i+1]
        result[i] *= right
    }

    return result
}
```

Two passes: left products then right products. O(n) time, O(1) extra space (output array doesn't count).
