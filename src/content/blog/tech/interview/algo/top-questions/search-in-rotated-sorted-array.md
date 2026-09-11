---
date: 2026-07-08T15:17:00+08:00
tags: ["binary-search", "medium"]
title: "9. Search in Rotated Sorted Array"
weight: 9
---

Pattern: **Binary Search**

## Problem

A sorted array has been rotated at some pivot. Given the rotated array and a target, return its index in O(log n).

**Example:**
```
Input:  nums = [4, 5, 6, 7, 0, 1, 2], target = 0
Output: 4
```

## Solution

```go
func searchInRotatedSortedArray(nums []int, target int) int {
    left, right := 0, len(nums)-1

    for left <= right {
        mid := left + (right-left)/2

        if nums[mid] == target {
            return mid
        }

        if nums[left] <= nums[mid] {  // left half sorted
            if target >= nums[left] && target < nums[mid] {
                right = mid - 1
            } else {
                left = mid + 1
            }
        } else {  // right half sorted
            if target > nums[mid] && target <= nums[right] {
                left = mid + 1
            } else {
                right = mid - 1
            }
        }
    }

    return -1
}
```

Key: "which half is sorted?" is the outer question, "is target in that sorted range?" is the inner question.
