---
date: 2026-07-08T15:17:00+08:00
tags: ["DFS", "tree", "medium"]
title: "15. Lowest Common Ancestor"
weight: 15
---

Pattern: **DFS (Tree)**

## Problem

Given a binary tree and two nodes p and q, find their lowest common ancestor.

## Solution

```go
func lowestCommonAncestor(root, p, q *TreeNode) *TreeNode {
    if root == nil || root == p || root == q {
        return root
    }

    left := lowestCommonAncestor(root.Left, p, q)
    right := lowestCommonAncestor(root.Right, p, q)

    if left != nil && right != nil {
        return root  // p and q are in different subtrees
    }
    if left != nil {
        return left
    }
    return right
}
```

If both subtrees return non-nil, current node is the LCA. Otherwise propagate whichever side found something.
