---
date: 2026-07-08T15:17:00+08:00
tags: ["two-pointers", "medium"]
title: "7. Container With Most Water"
weight: 7
---

Pattern: **Two Pointers**

## Problem

Given an array `height`, find two lines that form a container holding the most water.

**Example:**
```
Input:  height = [1, 8, 6, 2, 5, 4, 8, 3, 7]
Output: 49
```

## Solution

```go
func mostWater(nums []int) int {
    left, right := 0, len(nums)-1
    maxVal := 0

    for left < right {
        height := min(nums[left], nums[right])
        result := height * (right - left)
        maxVal = max(result, maxVal)

        if nums[right] > nums[left] {
            left++
        } else {
            right--
        }
    }

    return maxVal
}
```

Move the **shorter** pointer inward — keeping it can only decrease area since width shrinks and height stays capped. O(n) time, O(1) space.
