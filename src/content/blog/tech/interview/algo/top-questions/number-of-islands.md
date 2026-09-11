---
date: 2026-07-08T15:17:00+08:00
tags: ["DFS", "BFS", "grid", "medium"]
title: "13. Number of Islands"
weight: 13
---

Pattern: **DFS (Grid)**

## Problem

Given an m×n grid of `'1'`s (land) and `'0'`s (water), return the number of islands.

**Example:**
```
Input: grid = [
  ['1','1','0','0','0'],
  ['1','1','0','0','0'],
  ['0','0','1','0','0'],
  ['0','0','0','1','1']
]
Output: 3
```

## Solution

```go
func numIslands(grid [][]byte) int {
    count := 0
    for i := 0; i < len(grid); i++ {
        for j := 0; j < len(grid[i]); j++ {
            if grid[i][j] == '1' {
                count++
                dfs(grid, i, j)
            }
        }
    }
    return count
}

func dfs(grid [][]byte, i, j int) {
    grid[i][j] = '0'

    if i > 0 && grid[i-1][j] == '1' { dfs(grid, i-1, j) }
    if j > 0 && grid[i][j-1] == '1' { dfs(grid, i, j-1) }
    if i < len(grid)-1 && grid[i+1][j] == '1' { dfs(grid, i+1, j) }
    if j < len(grid[i])-1 && grid[i][j+1] == '1' { dfs(grid, i, j+1) }
}
```

Sink the island by marking visited cells as `'0'`. O(m×n) time.
