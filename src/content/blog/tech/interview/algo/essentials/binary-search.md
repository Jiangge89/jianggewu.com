---
title: "Binary Search"
---

## 核心本质

Binary Search 的核心不是"找某个值"，而是**在一个单调布尔序列里找边界**。

也就是找第一个让 `condition() → bool` 成立的位置。

lower bound / upper bound / exact search 都只是这个框架的具体化。

## 统一框架

```
first >= x   = lower_bound(x)
first > x    = upper_bound(x)
last < x     = lower_bound(x) - 1
last <= x    = upper_bound(x) - 1
exact x      = lower_bound(x) 然后检查 == x
```

Exact search 也可以转换成 lower bound。

## 核心代码

**lower bound：** `condition(mid): return nums[mid] >= target`

**upper bound：** `condition(mid): return nums[mid] > target`

```python
left, right = 0, n

while left < right:
    mid = left + (right - left) // 2

    if condition(mid):
        right = mid
    else:
        left = mid + 1

return left
```

只需要替换 `condition(mid)` 就能处理所有变体。
