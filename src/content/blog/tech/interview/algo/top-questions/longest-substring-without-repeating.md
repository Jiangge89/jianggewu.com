---
date: 2026-07-08T15:17:00+08:00
tags: ["sliding-window", "HashMap", "medium"]
title: "5. Longest Substring Without Repeating Characters"
weight: 5
---

Pattern: **Sliding Window + HashMap**

## Problem

Given a string, find the length of the longest substring without repeating characters.

## Solution

```go
func longestSubstring(s string) int {
    left := 0
    charToIdx := make(map[byte]int)
    longestLen := 0

    for right := 0; right < len(s); right++ {
        if lastIdx, ok := charToIdx[s[right]]; ok && lastIdx >= left {
            left = lastIdx + 1
        }
        charToIdx[s[right]] = right
        if longestLen < right-left+1 {
            longestLen = right - left + 1
        }
    }

    return longestLen
}
```

O(n) time, O(min(n, alphabet)) space.
