---
date: 2026-07-08T15:17:00+08:00
tags: ["DP", "2D-DP", "medium"]
title: "20. Unique Paths"
weight: 20
---

Pattern: **2D DP**

## Problem

Robot on m×n grid, starts top-left, can only move right or down. How many unique paths to bottom-right?

## Solution

```go
func uniquePaths(m int, n int) int {
    dp := make([][]int, m)
    for i := 0; i < m; i++ {
        dp[i] = make([]int, n)
        dp[i][0] = 1
    }
    for j := 0; j < n; j++ {
        dp[0][j] = 1
    }

    for i := 1; i < m; i++ {
        for j := 1; j < n; j++ {
            dp[i][j] = dp[i-1][j] + dp[i][j-1]
        }
    }

    return dp[m-1][n-1]
}
```

`dp[i][j] = dp[i-1][j] + dp[i][j-1]`. First row and column are all 1s (only one way to reach them).
