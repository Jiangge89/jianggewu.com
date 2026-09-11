---
date: 2026-07-08T15:17:00+08:00
tags: ["DP", "easy"]
title: "17. Climbing Stairs"
weight: 17
---

Pattern: **DP (Counting)**

## Problem

It takes n steps to reach the top. Each time you can climb 1 or 2 steps. How many distinct ways?

## Solution

```go
func climbStairs(n int) int {
    dp := make([]int, n+1)
    dp[1] = 1
    dp[2] = 2
    for i := 3; i <= n; i++ {
        dp[i] = dp[i-1] + dp[i-2]
    }
    return dp[n]
}
```

Essentially Fibonacci. O(n) time, O(n) space.
