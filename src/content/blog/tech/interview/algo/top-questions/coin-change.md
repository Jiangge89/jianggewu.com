---
date: 2026-07-08T15:17:00+08:00
tags: ["DP", "medium"]
title: "18. Coin Change"
weight: 18
---

Pattern: **DP (Optimization)**

## Problem

Given coin denominations and an amount, return the fewest coins needed. Return -1 if impossible.

**Example:**
```
Input:  coins = [1, 5, 11], amount = 15
Output: 3  // 5 + 5 + 5
```

## Solution

```go
func coinChange(coins []int, amount int) int {
    dp := make([]int, amount+1)
    for i := 1; i <= amount; i++ {
        dp[i] = amount + 1  // impossible placeholder
    }
    dp[0] = 0

    for i := 1; i <= amount; i++ {
        for _, coin := range coins {
            if coin <= i && dp[i-coin]+1 < dp[i] {
                dp[i] = dp[i-coin] + 1
            }
        }
    }

    if dp[amount] > amount {
        return -1
    }
    return dp[amount]
}
```

`dp[i]` = fewest coins for amount i. Transition: `dp[i] = min(dp[i-coin] + 1)` for each coin.
