---
date: 2026-07-08T15:17:00+08:00
tags: ["HashMap", "set", "medium"]
title: "3. Longest Consecutive Sequence"
weight: 3
---

Pattern: **HashMap (Set)**

## Problem

Given an unsorted array, return the length of the longest consecutive elements sequence. Must run in O(n).

**Example:**
```
Input:  [100, 4, 200, 1, 3, 2]
Output: 4  // [1, 2, 3, 4]
```

## Solution

```go
func longestConsecutive(nums []int) int {
    set := map[int]bool{}
    for _, num := range nums {
        set[num] = true
    }

    longest := 0

    for num := range set {
        if !set[num-1] {  // only start from sequence beginning
            length := 1
            for set[num+length] {
                length++
            }
            if length > longest {
                longest = length
            }
        }
    }

    return longest
}
```

O(n) time. The `!set[num-1]` check ensures we only start counting from the beginning of each sequence.
