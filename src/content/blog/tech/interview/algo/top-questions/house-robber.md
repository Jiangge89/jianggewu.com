---
date: 2026-07-08T15:17:00+08:00
tags: ["DP", "medium"]
title: "19. House Robber"
weight: 19
---

Pattern: **DP (Optimization)**

## Problem

Rob houses along a street. Can't rob two adjacent houses. Maximize total.

**Example:**
```
Input:  [2, 7, 9, 3, 1]
Output: 12  // 2 + 9 + 1
```

## Solution

```go
func houseRobber(nums []int) int {
    if len(nums) == 0 { return 0 }
    if len(nums) == 1 { return nums[0] }

    dp := make([]int, len(nums))
    dp[0] = nums[0]
    dp[1] = max(nums[1], nums[0])

    for i := 2; i < len(nums); i++ {
        dp[i] = max(dp[i-1], dp[i-2]+nums[i])
    }

    return dp[len(nums)-1]
}
```

`dp[i-1]` = skip house i. `dp[i-2] + nums[i]` = rob house i.
