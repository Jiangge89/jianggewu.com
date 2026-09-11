---
date: 2026-07-08T15:17:00+08:00
tags: ["prefix-sum", "two-pointers", "hard"]
title: "25. Trapping Rain Water"
weight: 25
---

Pattern: **Prefix/Suffix** or **Two Pointers**

## Problem

Given elevation map, compute trapped water.

**Example:**
```
Input:  [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]
Output: 6
```

## Solution 1: Prefix/Suffix — O(n) time, O(n) space

```go
func trap(height []int) int {
    n := len(height)
    maxLeft := make([]int, n)
    maxRight := make([]int, n)

    maxLeft[0] = height[0]
    for i := 1; i < n; i++ {
        maxLeft[i] = max(maxLeft[i-1], height[i])
    }

    maxRight[n-1] = height[n-1]
    for i := n - 2; i >= 0; i-- {
        maxRight[i] = max(maxRight[i+1], height[i])
    }

    water := 0
    for i := 0; i < n; i++ {
        water += min(maxLeft[i], maxRight[i]) - height[i]
    }
    return water
}
```

## Solution 2: Two Pointers — O(n) time, O(1) space

```go
func trap(height []int) int {
    left, right := 0, len(height)-1
    maxLeft, maxRight := 0, 0
    water := 0

    for left < right {
        if height[left] < height[right] {
            if height[left] > maxLeft {
                maxLeft = height[left]
            } else {
                water += maxLeft - height[left]
            }
            left++
        } else {
            if height[right] > maxRight {
                maxRight = height[right]
            } else {
                water += maxRight - height[right]
            }
            right--
        }
    }
    return water
}
```

Water at position i = `min(maxLeft, maxRight) - height[i]`.
