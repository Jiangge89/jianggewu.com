---
date: 2026-07-08T15:17:00+08:00
tags: ["BFS", "tree", "medium"]
title: "16. Binary Tree Level Order Traversal"
weight: 16
---

Pattern: **BFS**

## Problem

Given the root of a binary tree, return values grouped by level.

**Example:**
```
        3
       / \
      9   20
         / \
        15   7

Output: [[3], [9, 20], [15, 7]]
```

## Solution

```go
func levelOrderTraversal(root *TreeNode) [][]int {
    if root == nil {
        return nil
    }
    result := [][]int{}
    queue := []*TreeNode{root}

    for len(queue) > 0 {
        levelSize := len(queue)
        level := []int{}
        for i := 0; i < levelSize; i++ {
            node := queue[0]
            queue = queue[1:]
            level = append(level, node.Val)
            if node.Left != nil {
                queue = append(queue, node.Left)
            }
            if node.Right != nil {
                queue = append(queue, node.Right)
            }
        }
        result = append(result, level)
    }
    return result
}
```

Snapshot `levelSize` before processing — this separates levels cleanly.
