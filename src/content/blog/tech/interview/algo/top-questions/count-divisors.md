---
date: 2026-07-08T15:17:00+08:00
tags: ["math", "easy"]
title: "26. Count Divisors"
weight: 26
---

Pattern: **Math (O(1))**

## Problem

Given A, B, K, return count of integers in [A, B] divisible by K.

**Example:**
```
Input:  A = 6, B = 11, K = 2
Output: 3  // 6, 8, 10
```

## Solution

```go
func countDivisors(a, b, k int) int {
    res := b/k - a/k
    if a%k == 0 {
        res++
    }
    return res
}
```

O(1) — no loops needed.
