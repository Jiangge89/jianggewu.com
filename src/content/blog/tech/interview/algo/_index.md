---
title: "Algo"
weight: 1
---

## 20-Second Decision Tree

```
Lookup / Count / Pair       → HashMap
Contiguous + condition      → Sliding Window
Contiguous + sum/count      → Prefix Sum
Two ends / sorted pair      → Two Pointers
Sorted / monotonic          → Binary Search
Top K / next min/max        → Heap
Next greater/smaller        → Monotonic Stack
Tree / components           → DFS
Shortest unweighted path    → BFS
Dependency ordering         → Topological Sort
Dynamic connectivity        → Union Find
Cycle / middle linked list  → Fast-Slow Pointers
Overlap / meetings          → Intervals (Sort + Scan)
All possibilities           → Backtracking
Repeated optimal subproblem → DP
LRU / custom data structure → HashMap + Doubly Linked List
```

---

## Pattern 1: HashMap ⭐⭐⭐⭐⭐

**When:** O(1) lookup, counting, grouping, finding pairs

```go
seen := map[keyType]valueType{}
for _, item := range items {
    if val, ok := seen[complement]; ok {
        // found match
    }
    seen[item] = value
}
```

**Sub-patterns:**

1. **Complement/Pair Lookup** — Store one, look up the other
2. **Frequency Counting** — Count occurrences, use counts for decisions
3. **Existence Set** — `map[int]bool{}` for O(1) "is it there?" checks

**Problems:** [Two Sum](/blog/tech/interview/algo/top-questions/two-sum/), [Group Anagrams](/blog/tech/interview/algo/top-questions/group-anagrams/), [Top K Frequent Elements](/blog/tech/interview/algo/top-questions/top-k-frequent-elements/), [Longest Consecutive Sequence](/blog/tech/interview/algo/top-questions/longest-consecutive-sequence/), [Clone Graph](/blog/tech/interview/algo/top-questions/clone-graph/)

---

## Pattern 2: Sliding Window ⭐⭐⭐⭐⭐

**When:** Find min/max/count of a subarray/substring satisfying a condition

```go
left := 0
for right := 0; right < len(s); right++ {
    // expand: add s[right] to window state

    for windowCondition() {
        // shrink: remove s[left] from window state
        left++
    }

    // update answer
}
```

**Two flavors:**

```go
// Flavor A: shrink when VALID → find minimum window
for formed == required {
    record minimum
    shrink left
}

// Flavor B: shrink when INVALID → find longest window
for windowIsInvalid() {
    shrink left
}
record maximum
```

**Problems:** [Longest Substring Without Repeating Characters](/blog/tech/interview/algo/top-questions/longest-substring-without-repeating/), [Minimum Window Substring](/blog/tech/interview/algo/top-questions/minimum-window-substring/)

---

## Pattern 3: Prefix Sum ⭐⭐⭐⭐⭐

**When:** Range sum queries, cumulative calculations, "product except self"

```go
// Build
prefix := make([]int, n+1)
for i := 0; i < n; i++ {
    prefix[i+1] = prefix[i] + nums[i]
}

// Query [left, right] in O(1)
sum := prefix[right+1] - prefix[left]
```

**Prefix/Suffix variant:**

```go
// Left pass
left[0] = base
for i := 1; i < n; i++ {
    left[i] = combine(left[i-1], nums[i-1])
}

// Right pass
right[n-1] = base
for i := n-2; i >= 0; i-- {
    right[i] = combine(right[i+1], nums[i+1])
}

// Combine
for i := 0; i < n; i++ {
    result[i] = merge(left[i], right[i])
}
```

**Problems:** [Range Sum Query](/blog/tech/interview/algo/top-questions/prefix-sums/), [Product of Array Except Self](/blog/tech/interview/algo/top-questions/product-of-array-except-self/), [Trapping Rain Water](/blog/tech/interview/algo/top-questions/trapping-rain-water/), [Count Divisors](/blog/tech/interview/algo/top-questions/count-divisors/)

---

## Pattern 4: Two Pointers ⭐⭐⭐⭐⭐

**When:** Sorted array pair sum, opposite ends, remove duplicates, palindrome

**Template — Opposite direction:**

```go
left, right := 0, len(nums)-1
for left < right {
    sum := nums[left] + nums[right]
    if sum == target {
        // found
        left++
        right--
    } else if sum < target {
        left++
    } else {
        right--
    }
}
```

**Template — 3Sum (sort + two pointers):**

```go
sort.Ints(nums)
for i := 0; i < len(nums)-2; i++ {
    if i > 0 && nums[i] == nums[i-1] { continue } // skip duplicates
    left, right := i+1, len(nums)-1
    for left < right {
        sum := nums[i] + nums[left] + nums[right]
        if sum == 0 {
            result = append(result, []int{nums[i], nums[left], nums[right]})
            for left < right && nums[left] == nums[left+1] { left++ }
            for left < right && nums[right] == nums[right-1] { right-- }
            left++
            right--
        } else if sum < 0 {
            left++
        } else {
            right--
        }
    }
}
```

**Template — Same direction (remove duplicates):**

```go
slow := 0
for fast := 1; fast < len(nums); fast++ {
    if nums[fast] != nums[slow] {
        slow++
        nums[slow] = nums[fast]
    }
}
return slow + 1
```

**Problems:** [Container With Most Water](/blog/tech/interview/algo/top-questions/container-with-most-water/), [Trapping Rain Water](/blog/tech/interview/algo/top-questions/trapping-rain-water/), 3Sum, Remove Duplicates from Sorted Array

---

## Pattern 5: Binary Search ⭐⭐⭐⭐⭐

**When:** Sorted data, O(log n) needed, "find boundary" problems

```go
left, right := 0, len(nums)-1
for left <= right {
    mid := left + (right-left)/2
    if nums[mid] == target {
        return mid
    } else if nums[mid] < target {
        left = mid + 1
    } else {
        right = mid - 1
    }
}
```

**Rotated array variant — determine which half is sorted first:**

```go
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
```

**Search boundary / answer variant:**

```go
left, right := lo, hi
for left < right {
    mid := left + (right-left)/2
    if canAchieve(mid) {
        right = mid     // feasible → try smaller
    } else {
        left = mid + 1  // not feasible → go bigger
    }
}
return left
```

**Problems:** [Binary Search](/blog/tech/interview/algo/top-questions/binary-search/), [Search in Rotated Sorted Array](/blog/tech/interview/algo/top-questions/search-in-rotated-sorted-array/)

---

## Pattern 6: Heap ⭐⭐⭐⭐⭐

**When:** Kth largest/smallest, repeatedly extract min/max, priority-based processing

**Template (min heap of size k):**

```go
h := &MinHeap{}
heap.Init(h)
for _, item := range items {
    heap.Push(h, item)
    if h.Len() > k {
        heap.Pop(h)  // evict smallest, keep k largest
    }
}
// root = kth largest
```

**Go heap interface (memorize this):**

```go
type MinHeap []int
func (h MinHeap) Len() int            { return len(h) }
func (h MinHeap) Less(i, j int) bool  { return h[i] < h[j] }
func (h MinHeap) Swap(i, j int)       { h[i], h[j] = h[j], h[i] }
func (h *MinHeap) Push(x interface{}) { *h = append(*h, x.(int)) }
func (h *MinHeap) Pop() interface{} {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[0 : n-1]
    return x
}
```

**Key rules:**

- Your `Push` appends, your `Pop` removes last — the `heap` package handles ordering
- Always call `heap.Push` / `heap.Pop`, never `h.Push` / `h.Pop` directly
- Min heap: `h[i] < h[j]`, Max heap: `h[i] > h[j]`

**Problems:** [Kth Largest Element](/blog/tech/interview/algo/top-questions/kth-largest-element/), [Top K Frequent Elements](/blog/tech/interview/algo/top-questions/top-k-frequent-elements/), [Meeting Rooms II](/blog/tech/interview/algo/top-questions/meeting-rooms-ii/)

---

## Pattern 7: Monotonic Stack ⭐⭐⭐⭐

**When:** Next greater/smaller element, histogram areas, temperature problems

```go
stack := []int{} // stores indices
for i := 0; i < len(nums); i++ {
    for len(stack) > 0 && nums[stack[len(stack)-1]] < nums[i] {
        idx := stack[len(stack)-1]
        stack = stack[:len(stack)-1]
        result[idx] = nums[i] // next greater element for idx
    }
    stack = append(stack, i)
}
```

**Variant — Largest Rectangle in Histogram:**

```go
stack := []int{}
maxArea := 0
for i := 0; i <= len(heights); i++ {
    h := 0
    if i < len(heights) { h = heights[i] }
    for len(stack) > 0 && heights[stack[len(stack)-1]] > h {
        height := heights[stack[len(stack)-1]]
        stack = stack[:len(stack)-1]
        width := i
        if len(stack) > 0 { width = i - stack[len(stack)-1] - 1 }
        maxArea = max(maxArea, height*width)
    }
    stack = append(stack, i)
}
```

**Problems:** Daily Temperatures, Next Greater Element, Largest Rectangle in Histogram

---

## Pattern 8: DFS (Depth-First Search) ⭐⭐⭐⭐⭐

**When:** Explore all paths, connected components, trees, cycle detection

**Template — Grid:**

```go
func dfs(grid [][]byte, i, j int) {
    if i < 0 || i >= len(grid) || j < 0 || j >= len(grid[0]) {
        return
    }
    if grid[i][j] == '0' {
        return
    }
    grid[i][j] = '0'
    dfs(grid, i+1, j)
    dfs(grid, i-1, j)
    dfs(grid, i, j+1)
    dfs(grid, i, j-1)
}
```

**Template — Graph (cycle detection, 3 states):**

```go
// 0=unvisited, 1=visiting, 2=visited
func hasCycle(graph [][]int, state []int, node int) bool {
    state[node] = 1
    for _, neighbor := range graph[node] {
        if state[neighbor] == 1 { return true }
        if state[neighbor] == 0 {
            if hasCycle(graph, state, neighbor) { return true }
        }
    }
    state[node] = 2
    return false
}
```

**Template — Tree:**

```go
func dfs(root *TreeNode) *TreeNode {
    if root == nil { return nil }
    left := dfs(root.Left)
    right := dfs(root.Right)
    // combine left and right results
    return result
}
```

**Problems:** [Number of Islands](/blog/tech/interview/algo/top-questions/number-of-islands/) (grid), [Course Schedule](/blog/tech/interview/algo/top-questions/course-schedule/) (cycle detection), [Lowest Common Ancestor](/blog/tech/interview/algo/top-questions/lowest-common-ancestor/) (tree), [Clone Graph](/blog/tech/interview/algo/top-questions/clone-graph/)

---

## Pattern 9: BFS (Breadth-First Search) ⭐⭐⭐⭐⭐

**When:** Shortest path in unweighted graph, level-by-level traversal

```go
queue := []T{start}
visited := map[T]bool{start: true}

for len(queue) > 0 {
    levelSize := len(queue)
    for i := 0; i < levelSize; i++ {
        node := queue[0]
        queue = queue[1:]

        // process node

        for _, neighbor := range getNeighbors(node) {
            if !visited[neighbor] {
                visited[neighbor] = true
                queue = append(queue, neighbor)
            }
        }
    }
}
```

**DFS vs BFS:**

| | DFS | BFS |
|---|-----|-----|
| Data structure | Stack (recursion) | Queue |
| Use when | Explore all paths, detect cycles | Shortest path, level order |
| Space | O(depth) | O(width) |

**Problems:** [Binary Tree Level Order Traversal](/blog/tech/interview/algo/top-questions/binary-tree-level-order-traversal/), [Number of Islands](/blog/tech/interview/algo/top-questions/number-of-islands/) (BFS variant), Word Ladder

---

## Pattern 10: Topological Sort ⭐⭐⭐⭐⭐

**When:** Dependency ordering, prerequisites, build order, course schedule

**Template — Kahn's Algorithm (BFS):**

```go
indegree := make([]int, n)
for u := 0; u < n; u++ {
    for _, v := range graph[u] {
        indegree[v]++
    }
}

queue := []int{}
for i := 0; i < n; i++ {
    if indegree[i] == 0 {
        queue = append(queue, i)
    }
}

order := []int{}
for len(queue) > 0 {
    node := queue[0]
    queue = queue[1:]
    order = append(order, node)
    for _, neighbor := range graph[node] {
        indegree[neighbor]--
        if indegree[neighbor] == 0 {
            queue = append(queue, neighbor)
        }
    }
}
// len(order) < n → cycle exists
```

**Problems:** [Course Schedule](/blog/tech/interview/algo/top-questions/course-schedule/), Course Schedule II, Alien Dictionary

---

## Pattern 11: Union Find ⭐⭐⭐⭐

**When:** Dynamic connectivity, merge components, "are A and B connected?"

```go
parent := make([]int, n)
rank := make([]int, n)
for i := range parent {
    parent[i] = i
}

var find func(int) int
find = func(x int) int {
    if parent[x] != x {
        parent[x] = find(parent[x]) // path compression
    }
    return parent[x]
}

union := func(x, y int) {
    px, py := find(x), find(y)
    if px == py { return }
    if rank[px] < rank[py] { // union by rank
        px, py = py, px
    }
    parent[py] = px
    if rank[px] == rank[py] {
        rank[px]++
    }
}
```

**When Union Find vs DFS/BFS:**

| | Union Find | DFS/BFS |
|---|-----------|---------|
| Use when | Dynamic edges, online queries | Static graph, one-time traversal |
| Strength | Merge + query in near O(1) | Full path/component exploration |

**Problems:** [Number of Islands](/blog/tech/interview/algo/top-questions/number-of-islands/) (UF variant), Accounts Merge, Redundant Connection

---

## Pattern 12: Fast-Slow Pointers (Linked List) ⭐⭐⭐⭐⭐

**When:** Cycle detection, find middle, linked list manipulation

**Template — Find middle:**

```go
slow, fast := head, head
for fast != nil && fast.Next != nil {
    slow = slow.Next
    fast = fast.Next.Next
}
// slow is at middle
```

**Template — Detect cycle:**

```go
slow, fast := head, head
for fast != nil && fast.Next != nil {
    slow = slow.Next
    fast = fast.Next.Next
    if slow == fast {
        // cycle found — find entry point
        slow = head
        for slow != fast {
            slow = slow.Next
            fast = fast.Next
        }
        return slow // cycle start
    }
}
return nil // no cycle
```

**Template — Reverse linked list:**

```go
var prev *ListNode
curr := head
for curr != nil {
    next := curr.Next
    curr.Next = prev
    prev = curr
    curr = next
}
return prev
```

**Problems:** Linked List Cycle, Linked List Cycle II, Middle of Linked List, Reverse Linked List, Merge Two Sorted Lists

---

## Pattern 13: Intervals (Sort + Scan) ⭐⭐⭐⭐⭐

**When:** Overlap detection, merge intervals, meeting scheduling

**Template — Merge intervals:**

```go
sort.Slice(intervals, func(i, j int) bool {
    return intervals[i][0] < intervals[j][0]
})

merged := [][]int{intervals[0]}
for _, iv := range intervals[1:] {
    last := merged[len(merged)-1]
    if iv[0] <= last[1] {
        last[1] = max(last[1], iv[1]) // overlap → merge
    } else {
        merged = append(merged, iv)
    }
}
```

**Template — Meeting Rooms (count overlaps with heap):**

```go
sort.Slice(intervals, func(i, j int) bool {
    return intervals[i][0] < intervals[j][0]
})

h := &MinHeap{} // stores end times
heap.Init(h)
for _, iv := range intervals {
    if h.Len() > 0 && (*h)[0] <= iv[0] {
        heap.Pop(h) // reuse room
    }
    heap.Push(h, iv[1])
}
return h.Len() // min rooms needed
```

**Problems:** [Merge Intervals](/blog/tech/interview/algo/top-questions/merge-intervals/), [Meeting Rooms II](/blog/tech/interview/algo/top-questions/meeting-rooms-ii/), Insert Interval, Non-overlapping Intervals

---

## Pattern 14: Backtracking ⭐⭐⭐⭐

**When:** Generate all combinations, permutations, subsets, choices with constraints

**Template — Subsets (choose / don't choose):**

```go
func subsets(nums []int) [][]int {
    result := [][]int{}
    var backtrack func(start int, path []int)
    backtrack = func(start int, path []int) {
        tmp := make([]int, len(path))
        copy(tmp, path)
        result = append(result, tmp)

        for i := start; i < len(nums); i++ {
            backtrack(i+1, append(path, nums[i]))
        }
    }
    backtrack(0, []int{})
    return result
}
```

**Template — Permutations:**

```go
func permute(nums []int) [][]int {
    result := [][]int{}
    used := make([]bool, len(nums))
    var backtrack func(path []int)
    backtrack = func(path []int) {
        if len(path) == len(nums) {
            tmp := make([]int, len(path))
            copy(tmp, path)
            result = append(result, tmp)
            return
        }
        for i := 0; i < len(nums); i++ {
            if used[i] { continue }
            used[i] = true
            backtrack(append(path, nums[i]))
            used[i] = false
        }
    }
    backtrack([]int{})
    return result
}
```

**Template — Combination Sum (reuse allowed):**

```go
var backtrack func(start, remain int, path []int)
backtrack = func(start, remain int, path []int) {
    if remain == 0 {
        tmp := make([]int, len(path))
        copy(tmp, path)
        result = append(result, tmp)
        return
    }
    for i := start; i < len(candidates); i++ {
        if candidates[i] > remain { break }
        backtrack(i, remain-candidates[i], append(path, candidates[i]))
    }
}
```

**Problems:** Subsets, Permutations, Combination Sum, N-Queens, Word Search

---

## Pattern 15: DP (Dynamic Programming) ⭐⭐⭐⭐⭐

**When:** Optimization (min/max) or counting with overlapping subproblems

```go
dp := make([]int, n)
dp[0] = baseCase

for i := 1; i < n; i++ {
    dp[i] = transition(dp[i-1], dp[i-2], ...)
}
return dp[n-1]
```

**Three types — know which formula to use:**

```go
// Counting (how many ways?) → ADD
dp[i] = dp[i-1] + dp[i-2]                     // Climbing Stairs

// Optimization (min cost?) → MIN/MAX
dp[i] = min(dp[i-coin] + 1, dp[i])            // Coin Change
dp[i] = max(dp[i-1], dp[i-2] + nums[i])       // House Robber

// Longest sequence → MAX with condition
dp[i] = max(dp[j]+1) for j < i where nums[j] < nums[i]  // LIS
```

**2D DP:**

```go
dp[i][j] = dp[i-1][j] + dp[i][j-1]           // Unique Paths

// Edit Distance
if word1[i-1] == word2[j-1] {
    dp[i][j] = dp[i-1][j-1]
} else {
    dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
}
```

**Key questions to ask:**

1. What does `dp[i]` represent?
2. What's the base case?
3. What's the transition? (Add for counting, min/max for optimization)

**Problems:** [Climbing Stairs](/blog/tech/interview/algo/top-questions/climbing-stairs/), [Coin Change](/blog/tech/interview/algo/top-questions/coin-change/), [House Robber](/blog/tech/interview/algo/top-questions/house-robber/), [Unique Paths](/blog/tech/interview/algo/top-questions/unique-paths/), [Longest Increasing Subsequence](/blog/tech/interview/algo/top-questions/longest-increasing-subsequence/), [Maximum Subarray](/blog/tech/interview/algo/top-questions/maximum-subarray/), Edit Distance

---

## Pattern 16: Data Structure Design ⭐⭐⭐⭐⭐

**When:** LRU cache, Min Stack, RandomizedSet — combine data structures for O(1) operations

**Template — LRU Cache (HashMap + Doubly Linked List):**

```go
type LRUCache struct {
    capacity   int
    cache      map[int]*Node
    head, tail *Node // dummy nodes
}

type Node struct {
    key, val   int
    prev, next *Node
}

func Constructor(capacity int) LRUCache {
    head := &Node{}
    tail := &Node{}
    head.Next = tail
    tail.Prev = head
    return LRUCache{capacity, map[int]*Node{}, head, tail}
}

func (c *LRUCache) Get(key int) int {
    if node, ok := c.cache[key]; ok {
        c.moveToHead(node)
        return node.val
    }
    return -1
}

func (c *LRUCache) Put(key, value int) {
    if node, ok := c.cache[key]; ok {
        node.val = value
        c.moveToHead(node)
        return
    }
    node := &Node{key: key, val: value}
    c.cache[key] = node
    c.addToHead(node)
    if len(c.cache) > c.capacity {
        removed := c.removeTail()
        delete(c.cache, removed.key)
    }
}

func (c *LRUCache) addToHead(node *Node) {
    node.Prev = c.head
    node.Next = c.head.Next
    c.head.Next.Prev = node
    c.head.Next = node
}

func (c *LRUCache) removeNode(node *Node) {
    node.Prev.Next = node.Next
    node.Next.Prev = node.Prev
}

func (c *LRUCache) moveToHead(node *Node) {
    c.removeNode(node)
    c.addToHead(node)
}

func (c *LRUCache) removeTail() *Node {
    node := c.tail.Prev
    c.removeNode(node)
    return node
}
```

**Key insight:** HashMap gives O(1) lookup, doubly linked list gives O(1) insert/remove/reorder.

**Problems:** LRU Cache, Min Stack, Insert Delete GetRandom O(1)

---

## Quick Reference: Problem → Pattern

| Problem | Pattern(s) |
|---------|-----------|
| [Two Sum](/blog/tech/interview/algo/top-questions/two-sum/) | HashMap |
| [Group Anagrams](/blog/tech/interview/algo/top-questions/group-anagrams/) | HashMap |
| [Longest Consecutive Sequence](/blog/tech/interview/algo/top-questions/longest-consecutive-sequence/) | HashMap (Set) |
| [Longest Substring Without Repeating](/blog/tech/interview/algo/top-questions/longest-substring-without-repeating/) | Sliding Window + HashMap |
| [Minimum Window Substring](/blog/tech/interview/algo/top-questions/minimum-window-substring/) | Sliding Window + HashMap |
| [Range Sum Query](/blog/tech/interview/algo/top-questions/prefix-sums/) | Prefix Sum |
| [Product of Array Except Self](/blog/tech/interview/algo/top-questions/product-of-array-except-self/) | Prefix/Suffix |
| [Container With Most Water](/blog/tech/interview/algo/top-questions/container-with-most-water/) | Two Pointers |
| [Trapping Rain Water](/blog/tech/interview/algo/top-questions/trapping-rain-water/) | Two Pointers / Prefix-Suffix |
| [Binary Search](/blog/tech/interview/algo/top-questions/binary-search/) | Binary Search |
| [Search in Rotated Sorted Array](/blog/tech/interview/algo/top-questions/search-in-rotated-sorted-array/) | Binary Search |
| [Kth Largest Element](/blog/tech/interview/algo/top-questions/kth-largest-element/) | Heap |
| [Top K Frequent Elements](/blog/tech/interview/algo/top-questions/top-k-frequent-elements/) | HashMap + Heap |
| [Meeting Rooms II](/blog/tech/interview/algo/top-questions/meeting-rooms-ii/) | Intervals + Heap |
| [Number of Islands](/blog/tech/interview/algo/top-questions/number-of-islands/) | DFS/BFS/Union Find |
| [Course Schedule](/blog/tech/interview/algo/top-questions/course-schedule/) | Topological Sort |
| [Lowest Common Ancestor](/blog/tech/interview/algo/top-questions/lowest-common-ancestor/) | DFS (Tree) |
| [Clone Graph](/blog/tech/interview/algo/top-questions/clone-graph/) | DFS + HashMap |
| [Binary Tree Level Order Traversal](/blog/tech/interview/algo/top-questions/binary-tree-level-order-traversal/) | BFS |
| [Merge Intervals](/blog/tech/interview/algo/top-questions/merge-intervals/) | Intervals (Sort + Scan) |
| [Maximum Subarray](/blog/tech/interview/algo/top-questions/maximum-subarray/) | DP (Kadane's) |
| [Climbing Stairs](/blog/tech/interview/algo/top-questions/climbing-stairs/) | DP |
| [Coin Change](/blog/tech/interview/algo/top-questions/coin-change/) | DP |
| [House Robber](/blog/tech/interview/algo/top-questions/house-robber/) | DP |
| [Unique Paths](/blog/tech/interview/algo/top-questions/unique-paths/) | 2D DP |
| [Longest Increasing Subsequence](/blog/tech/interview/algo/top-questions/longest-increasing-subsequence/) | DP |
| [Count Divisors](/blog/tech/interview/algo/top-questions/count-divisors/) | Math (O(1)) |
| [MaxCounters](/blog/tech/interview/algo/top-questions/max-counters/) | Lazy Propagation |
