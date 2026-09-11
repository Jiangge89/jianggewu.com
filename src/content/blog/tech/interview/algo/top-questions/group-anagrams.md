---
date: 2026-07-08T15:17:00+08:00
tags: ["HashMap", "sorting", "medium"]
title: "2. Group Anagrams"
weight: 2
---

Pattern: **HashMap**

## Problem

Given an array of strings, group the anagrams together.

**Example:**
```
Input:  ["eat", "tea", "tan", "ate", "nat", "bat"]
Output: [["eat","tea","ate"], ["tan","nat"], ["bat"]]
```

## Solution

```go
func groupAnagrams(strs []string) [][]string {
    groups := map[[26]int][]string{}

    for _, s := range strs {
        var key [26]int
        for _, c := range s {
            key[c-'a']++
        }
        groups[key] = append(groups[key], s)
    }

    result := make([][]string, 0, len(groups))
    for _, group := range groups {
        result = append(result, group)
    }
    return result
}
```

Key insight: `[26]int` (fixed-size array) can be used as map key in Go, but `[]int` (slice) cannot. Arrays are value types and compared element by element.
