---
date: 2026-07-08T15:17:00+08:00
tags: ["DP", "medium"]
title: "21. Longest Increasing Subsequence"
weight: 21
---

Pattern: **DP**

## Problem

Given an integer array, return the length of the longest strictly increasing subsequence.

**Example:**
```
Input:  [10, 9, 2, 5, 3, 7, 101, 18]
Output: 4  // [2, 3, 7, 101]
```

## Solution

```go
func longestIncreasingSubsequence(arr []int) int {
    dp := make([]int, len(arr))
    maxVal := 0

    for i := 0; i < len(arr); i++ {
        dp[i] = 1
        for j := 0; j < i; j++ {
            if arr[j] < arr[i] {
                dp[i] = max(dp[j]+1, dp[i])
            }
        }
        maxVal = max(maxVal, dp[i])
    }

    return maxVal
}
```

`dp[i]` = length of LIS ending at index i. O(n²) time.
