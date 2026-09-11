---
date: 2026-07-08T15:17:00+08:00
tags: ["sliding-window", "HashMap", "hard"]
title: "6. Minimum Window Substring"
weight: 6
---

Pattern: **Sliding Window + HashMap**

## Problem

Given strings `s` and `t`, return the minimum window substring of `s` that contains all characters of `t`.

**Example:**
```
Input:  s = "ADOBECODEBANC", t = "ABC"
Output: "BANC"
```

## Solution

```go
func minWindow(s string, t string) string {
    if len(s) < len(t) {
        return ""
    }

    need := map[byte]int{}
    for i := 0; i < len(t); i++ {
        need[t[i]]++
    }

    have := map[byte]int{}
    formed := 0
    required := len(need)

    left := 0
    minLen := len(s) + 1
    minLeft := 0

    for right := 0; right < len(s); right++ {
        c := s[right]
        have[c]++
        if need[c] > 0 && have[c] == need[c] {
            formed++
        }

        for formed == required {
            if right-left+1 < minLen {
                minLen = right - left + 1
                minLeft = left
            }
            lc := s[left]
            have[lc]--
            if need[lc] > 0 && have[lc] < need[lc] {
                formed--
            }
            left++
        }
    }

    if minLen > len(s) {
        return ""
    }
    return s[minLeft : minLeft+minLen]
}
```

Flavor A: shrink when VALID → find minimum window.
