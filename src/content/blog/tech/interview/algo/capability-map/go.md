---
title: "Go"
weight: 1
---

# Algorithm Interview Capability Map & Assessment

> 基于本次完整算法摸底整理。目标不是记录"做过哪些题"，而是记录当前真实能力、暴露的问题、需要形成的模板，以及
> Live Coding 前的复习优先级。

## 1. 总体结论

  -------------------------------------------------------------------------------------
  Level                   当前能力                     Topics
  ----------------------- ---------------------------- --------------------------------
  **A**                   面试中基本可以直接做         HashMap、Heap / Priority
                                                       Queue、Binary Search、Linked
                                                       List

  **A-/B+**               会做，少量细节可能出错       LRU Cache、Two Pointers、Sliding
                                                       Window、Prefix Sum、Intervals

  **B**                   理解核心，需要形成稳定模板   Monotonic Stack、Basic DP、Tree
                                                       BFS/DFS、Graph BFS/DFS、Rate
                                                       Limiter

  **C**                   Pattern recognition /        Topological Sort、0/1
                          implementation 不稳定        Knapsack、Backtracking、Greedy

  **D**                   基本没系统学过               Union Find
  -------------------------------------------------------------------------------------

### 当前最高 ROI

Live Coding 前优先：

1.  **Graph**
2.  **Tree**
3.  **Backtracking**
4.  **0/1 Knapsack**
5.  **Rate Limiter / LRU implementation**

HashMap、Heap、Binary Search、Linked List 不需要再投入大量时间刷基础题。

## 2. HashMap --- A

明显强项。看到 frequency、lookup、duplicate、mapping、Two Sum、character
count，基本可以自然想到 HashMap。

复杂度：

``` text
lookup: expected O(1)
insert: expected O(1)
delete: expected O(1)
```

**结论：不需要重点复习。**

## 3. Heap / Priority Queue --- A

Pattern recognition 比较稳定。看到 Top K、K-th
largest/smallest、continuously get min/max、merge K sorted
lists，应优先想到 Heap。

### 关键词 → Heap

``` text
Top K / K-th largest / K-th smallest → Min Heap (size K)
Continuously get min/max             → Min/Max Heap
Merge K sorted lists/arrays          → Min Heap
Median of stream                     → Two Heaps (max + min)
Meeting Rooms / Intervals + overlap  → Min Heap (by end time)
```

### Go `container/heap` 完整实现

Go 的 heap 需要实现 `heap.Interface`（5 个方法）。**你写的 `Push`/`Pop` 操作 slice 尾部，`heap` 包内部负责 sift up/down。**

``` go
import "container/heap"

// --- Min Heap ---
type MinHeap []int

func (h MinHeap) Len() int            { return len(h) }
func (h MinHeap) Less(i, j int) bool  { return h[i] < h[j] }  // < 就是 Min Heap
func (h MinHeap) Swap(i, j int)       { h[i], h[j] = h[j], h[i] }
func (h *MinHeap) Push(x any)         { *h = append(*h, x.(int)) }
func (h *MinHeap) Pop() any {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[:n-1]
    return x
}

// --- Max Heap ---
// 只改 Less：> 就是 Max Heap
type MaxHeap []int

func (h MaxHeap) Len() int            { return len(h) }
func (h MaxHeap) Less(i, j int) bool  { return h[i] > h[j] }  // > 就是 Max Heap
func (h MaxHeap) Swap(i, j int)       { h[i], h[j] = h[j], h[i] }
func (h *MaxHeap) Push(x any)         { *h = append(*h, x.(int)) }
func (h *MaxHeap) Pop() any {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[:n-1]
    return x
}
```

**重点记忆：**

| | Min Heap | Max Heap |
|---|---|---|
| `Less(i,j)` | `h[i] < h[j]` | `h[i] > h[j]` |
| `heap.Pop()` 返回 | 最小值 | 最大值 |
| Top K largest | 维护 size K 的 **Min Heap** | ✗ |
| Top K smallest | ✗ | 维护 size K 的 **Max Heap** |

**为什么 Top K largest 用 Min Heap？** 因为 Pop 掉最小的，留下的 K 个就是最大的。

### 使用示例：Top K Frequent Elements

``` go
func topKFrequent(nums []int, k int) []int {
    freq := map[int]int{}
    for _, n := range nums {
        freq[n]++
    }

    h := &MinHeap{}
    heap.Init(h)
    for num, count := range freq {
        heap.Push(h, [2]int{count, num})
        if h.Len() > k {
            heap.Pop(h)
        }
    }

    result := make([]int, k)
    for i := k - 1; i >= 0; i-- {
        result[i] = heap.Pop(h).([2]int)[1]
    }
    return result
}
```

### 使用示例：Merge K Sorted Lists

``` go
type ListNodeHeap []*ListNode

func (h ListNodeHeap) Len() int            { return len(h) }
func (h ListNodeHeap) Less(i, j int) bool  { return h[i].Val < h[j].Val }
func (h ListNodeHeap) Swap(i, j int)       { h[i], h[j] = h[j], h[i] }
func (h *ListNodeHeap) Push(x any)         { *h = append(*h, x.(*ListNode)) }
func (h *ListNodeHeap) Pop() any {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[:n-1]
    return x
}

func mergeKLists(lists []*ListNode) *ListNode {
    h := &ListNodeHeap{}
    heap.Init(h)
    for _, l := range lists {
        if l != nil {
            heap.Push(h, l)
        }
    }
    dummy := &ListNode{}
    curr := dummy
    for h.Len() > 0 {
        node := heap.Pop(h).(*ListNode)
        curr.Next = node
        curr = curr.Next
        if node.Next != nil {
            heap.Push(h, node.Next)
        }
    }
    return dummy.Next
}
```

### 常见错误

``` text
✗ 直接调用 h.Push() / h.Pop()     → 必须调用 heap.Push(h, x) / heap.Pop(h)
✗ Pop 里删 index 0                 → 必须删最后一个元素（heap 包会先 swap 到尾部）
✗ 忘记 heap.Init(h)                → 如果初始就有元素，必须先 Init
```

### 复杂度

``` text
heap.Init:  O(n)
heap.Push:  O(log n)
heap.Pop:   O(log n)
Top K:      O(n log k)
```

## 4. Binary Search --- A

### 核心本质

Binary Search 的核心不是"找某个值"，而是**在一个单调布尔序列里找边界**——找第一个让 `condition(mid)` 为 true 的位置。

Lower bound / upper bound / exact search 都只是 `condition()` 的具体化。

### 统一模板（通用 condition helper）

``` go
func binarySearch(n int, condition func(mid int) bool) int {
    left, right := 0, n
    for left < right {
        mid := left + (right-left)/2
        if condition(mid) {
            right = mid
        } else {
            left = mid + 1
        }
    }
    return left
}
```

### Lower Bound：第一个 >= target

``` go
func lowerBound(nums []int, target int) int {
    left, right := 0, len(nums)
    for left < right {
        mid := left + (right-left)/2
        if nums[mid] >= target {  // condition: >= target
            right = mid
        } else {
            left = mid + 1
        }
    }
    return left
}
```

### Upper Bound：第一个 > target

``` go
func upperBound(nums []int, target int) int {
    left, right := 0, len(nums)
    for left < right {
        mid := left + (right-left)/2
        if nums[mid] > target {  // condition: > target
            right = mid
        } else {
            left = mid + 1
        }
    }
    return left
}
```

### Exact Search：基于 Lower Bound

``` go
func exactSearch(nums []int, target int) int {
    i := lowerBound(nums, target)
    if i < len(nums) && nums[i] == target {
        return i
    }
    return -1
}
```

### 所有变体的统一关系

``` text
first >= x   = lowerBound(x)
first > x    = upperBound(x)
last < x     = lowerBound(x) - 1
last <= x    = upperBound(x) - 1
exact x      = lowerBound(x)，然后检查 == x
count of x   = upperBound(x) - lowerBound(x)
```

### Search on Answer（搜索答案空间）

当问题不是在数组里搜索，而是在答案空间里搜索最小/最大可行值：

``` go
left, right := minPossible, maxPossible
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

### Rotated Sorted Array

先判断哪半边是 sorted，再决定 target 在哪边：

``` go
func search(nums []int, target int) int {
    left, right := 0, len(nums)-1
    for left <= right {
        mid := left + (right-left)/2
        if nums[mid] == target {
            return mid
        }
        if nums[left] <= nums[mid] { // left half sorted
            if target >= nums[left] && target < nums[mid] {
                right = mid - 1
            } else {
                left = mid + 1
            }
        } else { // right half sorted
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

### 关键词 → Binary Search

``` text
sorted array + find target          → exact search / lower bound
first/last occurrence               → lower bound / upper bound
"minimum X such that condition"     → search on answer
rotated sorted array                → modified binary search
peak element / mountain array       → binary search on condition
```

### 复杂度

``` text
Time:  O(log n)
Space: O(1)
```

## 5. Linked List --- A

### Go Struct 定义

``` go
type ListNode struct {
    Val  int
    Next *ListNode
}
```

### Dummy Head 技巧

当 head 可能被修改（删除、插入）时，用 dummy node 避免特殊处理：

``` go
dummy := &ListNode{Next: head}
curr := dummy
// ... 操作 ...
return dummy.Next
```

### Reverse Linked List

Mental model：三个指针 prev / curr / next

``` go
func reverseList(head *ListNode) *ListNode {
    var prev *ListNode
    curr := head
    for curr != nil {
        next := curr.Next
        curr.Next = prev
        prev = curr
        curr = next
    }
    return prev
}
```

### Detect Cycle（快慢指针）

``` go
func hasCycle(head *ListNode) bool {
    slow, fast := head, head
    for fast != nil && fast.Next != nil {
        slow = slow.Next
        fast = fast.Next.Next
        if slow == fast {
            return true
        }
    }
    return false
}
```

### Find Cycle Entry

``` go
func detectCycle(head *ListNode) *ListNode {
    slow, fast := head, head
    for fast != nil && fast.Next != nil {
        slow = slow.Next
        fast = fast.Next.Next
        if slow == fast {
            slow = head
            for slow != fast {
                slow = slow.Next
                fast = fast.Next
            }
            return slow
        }
    }
    return nil
}
```

### Find Middle

``` go
func middleNode(head *ListNode) *ListNode {
    slow, fast := head, head
    for fast != nil && fast.Next != nil {
        slow = slow.Next
        fast = fast.Next.Next
    }
    return slow
}
```

### Merge Two Sorted Lists

``` go
func mergeTwoLists(l1, l2 *ListNode) *ListNode {
    dummy := &ListNode{}
    curr := dummy
    for l1 != nil && l2 != nil {
        if l1.Val <= l2.Val {
            curr.Next = l1
            l1 = l1.Next
        } else {
            curr.Next = l2
            l2 = l2.Next
        }
        curr = curr.Next
    }
    if l1 != nil {
        curr.Next = l1
    } else {
        curr.Next = l2
    }
    return dummy.Next
}
```

### 关键词 → Linked List Pattern

``` text
reverse / palindrome            → reverse linked list
cycle detection                 → fast-slow pointers
find middle                     → fast-slow pointers
merge sorted                    → dummy head + two pointers
remove nth from end             → two pointers (gap = n)
intersection of two lists       → align lengths / two-pass
```

### 复杂度

``` text
Reverse:     O(n) time, O(1) space
Cycle:       O(n) time, O(1) space
Find Middle: O(n) time, O(1) space
Merge:       O(n+m) time, O(1) space
```

## 6. LRU Cache --- A-/B+

核心结构：

``` text
HashMap<key, *Node>  +  Doubly Linked List

head(dummy) ⇄ MRU ⇄ ... ⇄ LRU ⇄ tail(dummy)
```

操作逻辑：

``` text
get → lookup → moveToHead
put existing → update value → moveToHead
put new → create node → map insert → addToHead
over capacity → remove tail.prev → delete map[lru.key]
```

### 完整 Go 实现

``` go
type LRUCache struct {
    capacity   int
    cache      map[int]*Node
    head, tail *Node
}

type Node struct {
    key, value int
    prev, next *Node
}

func Constructor(capacity int) LRUCache {
    head := &Node{}
    tail := &Node{}
    head.next = tail
    tail.prev = head
    return LRUCache{capacity, map[int]*Node{}, head, tail}
}

func (c *LRUCache) Get(key int) int {
    if node, ok := c.cache[key]; ok {
        c.moveToHead(node)
        return node.value
    }
    return -1
}

func (c *LRUCache) Put(key, value int) {
    if node, ok := c.cache[key]; ok {
        node.value = value
        c.moveToHead(node)
        return
    }
    node := &Node{key: key, value: value}
    c.cache[key] = node
    c.addToHead(node)
    if len(c.cache) > c.capacity {
        lru := c.removeTail()
        delete(c.cache, lru.key)
    }
}

func (c *LRUCache) addToHead(node *Node) {
    node.prev = c.head
    node.next = c.head.next
    c.head.next.prev = node
    c.head.next = node
}

func (c *LRUCache) removeNode(node *Node) {
    node.prev.next = node.next
    node.next.prev = node.prev
}

func (c *LRUCache) moveToHead(node *Node) {
    c.removeNode(node)
    c.addToHead(node)
}

func (c *LRUCache) removeTail() *Node {
    node := c.tail.prev
    c.removeNode(node)
    return node
}
```

### 为什么需要 Doubly Linked List？

``` text
HashMap → O(1) lookup by key
DLL    → O(1) insert/remove/reorder
```

Singly linked list 无法 O(1) 删除（不知道 prev）。

### 为什么 Node 需要存 key？

``` text
evict tail 时需要从 map 中删除，但 map.delete 需要 key。
如果 Node 不存 key，就不知道该删 map 中的哪个 entry。
```

**结论：不用重新学，mock 前完整手写一次。**

## 7. Two Pointers / Sliding Window --- A-/B+

Two Sum Sorted：

``` text
sum < target → left++
sum > target → right--
```

3Sum：

``` text
sort → fix i → left/right
```

需要加强 duplicate handling：

``` go
if i > 0 && nums[i] == nums[i-1] {
    continue
}
```

Longest Substring Without Repeating Characters：

``` text
HashMap/Frequency + Sliding Window
```

Invariant：window 内不能存在 frequency \> 1 的 character。

## 8. Prefix Sum --- A-

统一使用 `n+1`：

``` text
prefix[i] = sum(nums[0...i-1])
```

``` go
prefix := make([]int, len(nums)+1)
for i := 0; i < len(nums); i++ {
    prefix[i+1] = prefix[i] + nums[i]
}

sum := prefix[right+1] - prefix[left]
```

复杂度：preprocessing O(n)，query O(1)，space O(n)。

## 9. Monotonic Stack --- B

条件反射：

> 对每个元素寻找右侧第一个 greater/smaller element → Monotonic Stack。

### Next Greater Element

通常存 index：

``` go
func dailyTemperatures(temperatures []int) []int {
    n := len(temperatures)
    result := make([]int, n)
    stack := []int{}  // stores indices, monotonically decreasing

    for i := 0; i < n; i++ {
        for len(stack) > 0 && temperatures[i] > temperatures[stack[len(stack)-1]] {
            j := stack[len(stack)-1]
            stack = stack[:len(stack)-1]
            result[j] = i - j
        }
        stack = append(stack, i)
    }
    return result
}
```

每个 index 最多 push/pop 一次，所以 O(n)。

### Monotonic Stack 变体

``` text
Next Greater Element  → 维护递减栈，遇到更大的就 pop
Next Smaller Element  → 维护递增栈，遇到更小的就 pop
Previous Greater      → 从左往右，递减栈
Previous Smaller      → 从左往右，递增栈
```

### 关键词 → Monotonic Stack

``` text
next greater / next warmer day   → Monotonic Stack
largest rectangle in histogram   → Monotonic Stack
stock span                       → Monotonic Stack
```

## 10. Tree --- B-/C+

需要系统补基础。

### Go Struct 定义

``` go
type TreeNode struct {
    Val   int
    Left  *TreeNode
    Right *TreeNode
}
```

### Traversal 顺序

``` text
Preorder:  Root → Left → Right   (常用于 copy / serialize)
Inorder:   Left → Root → Right   (BST 中得到有序序列)
Postorder: Left → Right → Root   (常用于 delete / 计算子树结果)
```

### DFS 递归模板

``` go
// Preorder
func preorder(root *TreeNode, result *[]int) {
    if root == nil { return }
    *result = append(*result, root.Val)
    preorder(root.Left, result)
    preorder(root.Right, result)
}

// Inorder
func inorder(root *TreeNode, result *[]int) {
    if root == nil { return }
    inorder(root.Left, result)
    *result = append(*result, root.Val)
    inorder(root.Right, result)
}

// Postorder
func postorder(root *TreeNode, result *[]int) {
    if root == nil { return }
    postorder(root.Left, result)
    postorder(root.Right, result)
    *result = append(*result, root.Val)
}
```

### DFS 通用递归框架

大部分 Tree 题都是这个 pattern：

``` go
func dfs(root *TreeNode) ResultType {
    // base case
    if root == nil {
        return baseValue
    }
    // 递归处理左右子树
    left := dfs(root.Left)
    right := dfs(root.Right)
    // 用 left, right, root.Val 合并出当前节点的结果
    return combine(left, right, root.Val)
}
```

### 经典 DFS 示例

``` go
// Maximum Depth
func maxDepth(root *TreeNode) int {
    if root == nil { return 0 }
    return 1 + max(maxDepth(root.Left), maxDepth(root.Right))
}

// Invert Binary Tree
func invertTree(root *TreeNode) *TreeNode {
    if root == nil { return nil }
    root.Left, root.Right = invertTree(root.Right), invertTree(root.Left)
    return root
}

// Is Balanced
func isBalanced(root *TreeNode) bool {
    return height(root) != -1
}
func height(root *TreeNode) int {
    if root == nil { return 0 }
    l := height(root.Left)
    r := height(root.Right)
    if l == -1 || r == -1 || abs(l-r) > 1 {
        return -1
    }
    return 1 + max(l, r)
}

// Lowest Common Ancestor
func lowestCommonAncestor(root, p, q *TreeNode) *TreeNode {
    if root == nil || root == p || root == q {
        return root
    }
    left := lowestCommonAncestor(root.Left, p, q)
    right := lowestCommonAncestor(root.Right, p, q)
    if left != nil && right != nil {
        return root
    }
    if left != nil { return left }
    return right
}

// Diameter of Binary Tree
var diameter int
func diameterOfBinaryTree(root *TreeNode) int {
    diameter = 0
    depthForDiameter(root)
    return diameter
}
func depthForDiameter(root *TreeNode) int {
    if root == nil { return 0 }
    l := depthForDiameter(root.Left)
    r := depthForDiameter(root.Right)
    diameter = max(diameter, l+r)
    return 1 + max(l, r)
}
```

### BFS 层序遍历模板

``` go
func levelOrder(root *TreeNode) [][]int {
    if root == nil { return nil }
    var result [][]int
    queue := []*TreeNode{root}

    for len(queue) > 0 {
        levelSize := len(queue)  // 关键：先取当前层的大小
        level := make([]int, 0, levelSize)

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

### DFS 迭代版本（用显式栈）

``` go
// Iterative Preorder
func preorderIterative(root *TreeNode) []int {
    if root == nil { return nil }
    var result []int
    stack := []*TreeNode{root}
    for len(stack) > 0 {
        node := stack[len(stack)-1]
        stack = stack[:len(stack)-1]
        result = append(result, node.Val)
        if node.Right != nil { stack = append(stack, node.Right) }
        if node.Left != nil { stack = append(stack, node.Left) }
    }
    return result
}

// Iterative Inorder
func inorderIterative(root *TreeNode) []int {
    var result []int
    var stack []*TreeNode
    curr := root
    for curr != nil || len(stack) > 0 {
        for curr != nil {
            stack = append(stack, curr)
            curr = curr.Left
        }
        curr = stack[len(stack)-1]
        stack = stack[:len(stack)-1]
        result = append(result, curr.Val)
        curr = curr.Right
    }
    return result
}
```

### BST 特殊性质

``` text
Inorder traversal of BST → sorted sequence
Search / Insert / Delete → O(h), balanced = O(log n)
Validate BST → inorder check 或 递归传递 (min, max) range
```

``` go
func isValidBST(root *TreeNode) bool {
    return validate(root, math.MinInt64, math.MaxInt64)
}
func validate(node *TreeNode, min, max int) bool {
    if node == nil { return true }
    if node.Val <= min || node.Val >= max { return false }
    return validate(node.Left, min, node.Val) && validate(node.Right, node.Val, max)
}
```

### 关键词 → Tree Pattern

``` text
depth / height / balanced         → DFS 递归返回 int
path sum / max path sum           → DFS 递归 + 全局变量
LCA                               → DFS 递归返回 *TreeNode
serialize / deserialize           → preorder DFS
level order / zigzag / right view → BFS
BST search / validate / kth       → BST 性质 + inorder
```

### 复杂度

``` text
Time:  O(n) — 每个节点访问一次
Space: O(h) — 递归栈深度
  balanced tree: O(log n)
  skewed tree:   O(n)
BFS space: O(w) — 最宽层的宽度，worst case O(n/2)
```

### 常见错误

``` text
✗ Maximum Depth 误判为 O(log n) time → 实际 O(n)，每个节点都要访问
✗ Space 误判为 O(1) → 递归栈是 O(h)
✗ Preorder / Inorder 混淆 → 记住 "Pre" = root 在前，"In" = root 在中间
```

## 11. Graph --- B-/C+

当前最高优先级模块之一。

### Node vs Edge

``` text
edges = [[0,1], [1,2], [3,4]]
```

Nodes 是 `0,1,2,3,4`；数组中的 pair 才是 edges。

Graph node 有任意多个 neighbors，不是 binary tree 的 left/right。

### Adjacency List 构建

``` go
// Undirected graph
graph := make([][]int, n)
for _, edge := range edges {
    a, b := edge[0], edge[1]
    graph[a] = append(graph[a], b)
    graph[b] = append(graph[b], a)  // 无向图双向
}

// Directed graph
graph := make([][]int, n)
for _, edge := range edges {
    from, to := edge[0], edge[1]
    graph[from] = append(graph[from], to)  // 有向图单向
}
```

### DFS 完整模板

``` go
func dfs(graph [][]int, node int, visited []bool) {
    if visited[node] {
        return
    }
    visited[node] = true
    for _, next := range graph[node] {
        dfs(graph, next, visited)
    }
}

// 调用
visited := make([]bool, n)
dfs(graph, startNode, visited)
```

### BFS 完整模板

``` go
func bfs(graph [][]int, start int, n int) {
    visited := make([]bool, n)
    visited[start] = true           // mark when enqueued!
    queue := []int{start}

    for len(queue) > 0 {
        node := queue[0]
        queue = queue[1:]

        for _, next := range graph[node] {
            if visited[next] {
                continue
            }
            visited[next] = true    // mark when enqueued, NOT when dequeued
            queue = append(queue, next)
        }
    }
}
```

**关键：mark visited when enqueued, not when dequeued**。否则同一个节点会被多次入队。

### BFS Shortest Path（带距离）

``` go
func shortestPath(graph [][]int, start, end, n int) int {
    visited := make([]bool, n)
    visited[start] = true
    queue := []int{start}
    dist := 0

    for len(queue) > 0 {
        levelSize := len(queue)
        for i := 0; i < levelSize; i++ {
            node := queue[0]
            queue = queue[1:]
            if node == end {
                return dist
            }
            for _, next := range graph[node] {
                if !visited[next] {
                    visited[next] = true
                    queue = append(queue, next)
                }
            }
        }
        dist++
    }
    return -1
}
```

### Connected Components

``` go
func countComponents(n int, edges [][]int) int {
    graph := make([][]int, n)
    for _, e := range edges {
        graph[e[0]] = append(graph[e[0]], e[1])
        graph[e[1]] = append(graph[e[1]], e[0])
    }
    visited := make([]bool, n)
    count := 0
    for i := 0; i < n; i++ {
        if !visited[i] {
            count++
            dfs(graph, i, visited)
        }
    }
    return count
}
```

### Grid DFS（Number of Islands）

``` go
func numIslands(grid [][]byte) int {
    rows, cols := len(grid), len(grid[0])
    count := 0
    for i := 0; i < rows; i++ {
        for j := 0; j < cols; j++ {
            if grid[i][j] == '1' {
                count++
                gridDFS(grid, i, j, rows, cols)
            }
        }
    }
    return count
}

func gridDFS(grid [][]byte, i, j, rows, cols int) {
    if i < 0 || i >= rows || j < 0 || j >= cols || grid[i][j] == '0' {
        return
    }
    grid[i][j] = '0' // mark visited by modifying in-place
    gridDFS(grid, i+1, j, rows, cols)
    gridDFS(grid, i-1, j, rows, cols)
    gridDFS(grid, i, j+1, rows, cols)
    gridDFS(grid, i, j-1, rows, cols)
}
```

### Grid BFS（Shortest Path）

四方向：

``` go
dirs := [4][2]int{{-1, 0}, {1, 0}, {0, -1}, {0, 1}}
```

``` go
func gridBFS(grid [][]int, start, end [2]int) int {
    rows, cols := len(grid), len(grid[0])
    dirs := [4][2]int{{-1, 0}, {1, 0}, {0, -1}, {0, 1}}
    visited := make([][]bool, rows)
    for i := range visited {
        visited[i] = make([]bool, cols)
    }

    visited[start[0]][start[1]] = true
    queue := [][2]int{start}
    steps := 0

    for len(queue) > 0 {
        levelSize := len(queue)
        for i := 0; i < levelSize; i++ {
            cell := queue[0]
            queue = queue[1:]
            if cell == end {
                return steps
            }
            for _, d := range dirs {
                nr, nc := cell[0]+d[0], cell[1]+d[1]
                if nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
                    !visited[nr][nc] && grid[nr][nc] != 1 {
                    visited[nr][nc] = true
                    queue = append(queue, [2]int{nr, nc})
                }
            }
        }
        steps++
    }
    return -1
}
```

条件反射：

> **Unweighted graph + minimum steps/hops → BFS.**

### Cycle Detection（Directed Graph，3 states）

``` go
// 0=unvisited, 1=visiting, 2=visited
func hasCycleDirected(graph [][]int, node int, state []int) bool {
    state[node] = 1  // visiting
    for _, next := range graph[node] {
        if state[next] == 1 { return true }  // back edge = cycle
        if state[next] == 0 {
            if hasCycleDirected(graph, next, state) { return true }
        }
    }
    state[node] = 2  // visited
    return false
}
```

### Cycle Detection（Undirected Graph，DFS + parent）

无向图不能用 3-state（因为 A→B 和 B→A 总是同时存在）。用 parent 区分"回边"和"来时的路"：

``` go
func hasCycleUndirected(graph [][]int, node, parent int, visited []bool) bool {
    visited[node] = true
    for _, next := range graph[node] {
        if !visited[next] {
            if hasCycleUndirected(graph, next, node, visited) {
                return true
            }
        } else if next != parent {
            return true  // visited 且不是 parent → cycle
        }
    }
    return false
}

// 调用（检查所有 component）
func containsCycle(n int, graph [][]int) bool {
    visited := make([]bool, n)
    for i := 0; i < n; i++ {
        if !visited[i] {
            if hasCycleUndirected(graph, i, -1, visited) {
                return true
            }
        }
    }
    return false
}
```

也可以用 **Union Find**：加边时如果两个 node 已经在同一个 component → cycle。

### Dijkstra（Weighted Shortest Path）

条件反射：**带正权重的图求最短路 → Dijkstra。**

核心思想：贪心 + 优先队列。每次取出距离最小的未确定节点，用它更新邻居距离。

``` go
import "container/heap"

type Edge struct {
    to, weight int
}

type Item struct {
    node, dist int
}

type PQ []Item
func (h PQ) Len() int            { return len(h) }
func (h PQ) Less(i, j int) bool  { return h[i].dist < h[j].dist }  // min heap by dist
func (h PQ) Swap(i, j int)       { h[i], h[j] = h[j], h[i] }
func (h *PQ) Push(x any)         { *h = append(*h, x.(Item)) }
func (h *PQ) Pop() any {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[:n-1]
    return x
}

func dijkstra(n int, graph [][]Edge, src int) []int {
    dist := make([]int, n)
    for i := range dist {
        dist[i] = math.MaxInt64
    }
    dist[src] = 0

    pq := &PQ{{src, 0}}
    heap.Init(pq)

    for pq.Len() > 0 {
        curr := heap.Pop(pq).(Item)
        if curr.dist > dist[curr.node] {
            continue  // 已经有更短的路径，跳过
        }
        for _, e := range graph[curr.node] {
            newDist := dist[curr.node] + e.weight
            if newDist < dist[e.to] {
                dist[e.to] = newDist
                heap.Push(pq, Item{e.to, newDist})
            }
        }
    }
    return dist
}
```

### Dijkstra 使用示例：Network Delay Time

``` go
func networkDelayTime(times [][]int, n int, k int) int {
    graph := make([][]Edge, n+1)
    for _, t := range times {
        from, to, w := t[0], t[1], t[2]
        graph[from] = append(graph[from], Edge{to, w})
    }

    dist := dijkstra(n+1, graph, k)

    maxDist := 0
    for i := 1; i <= n; i++ {
        if dist[i] == math.MaxInt64 {
            return -1  // unreachable
        }
        maxDist = max(maxDist, dist[i])
    }
    return maxDist
}
```

### Shortest Path 选择指南

``` text
Unweighted graph          → BFS                    O(V+E)
Positive weights          → Dijkstra               O((V+E) log V)
Negative weights (no neg cycle) → Bellman-Ford      O(V·E)
All pairs                 → Floyd-Warshall          O(V³)
DAG                       → Topological Sort + relax O(V+E)
```

### BFS/Dijkstra + Extra State

有些最短路问题需要额外状态维度（如"最多经过 K 站"、"带钥匙状态"）：

``` go
// 示例：Cheapest Flights Within K Stops
// state = (node, stops_used)
type State struct {
    node, cost, stops int
}

func findCheapestPrice(n int, flights [][]int, src, dst, k int) int {
    graph := make([][]Edge, n)
    for _, f := range flights {
        graph[f[0]] = append(graph[f[0]], Edge{f[1], f[2]})
    }

    // dist[node] = min cost to reach node
    dist := make([]int, n)
    for i := range dist { dist[i] = math.MaxInt64 }
    dist[src] = 0

    // BFS by level (each level = one stop)
    queue := []State{{src, 0, 0}}
    for len(queue) > 0 {
        curr := queue[0]
        queue = queue[1:]
        if curr.stops > k { continue }
        for _, e := range graph[curr.node] {
            newCost := curr.cost + e.weight
            if newCost < dist[e.to] {
                dist[e.to] = newCost
                queue = append(queue, State{e.to, newCost, curr.stops + 1})
            }
        }
    }

    if dist[dst] == math.MaxInt64 { return -1 }
    return dist[dst]
}
```

### Minimum Spanning Tree（MST）⚠️ 知道即可

条件反射：**连接所有节点，总权重最小 → MST。**

### Kruskal（贪心 + Union Find）

思路：把所有边按权重排序，从小到大加边，如果两端不在同一个 component 就合并。

``` go
func kruskal(n int, edges [][]int) int {
    // edges[i] = [from, to, weight]
    sort.Slice(edges, func(i, j int) bool {
        return edges[i][2] < edges[j][2]
    })

    uf := NewUnionFind(n)
    totalWeight := 0
    edgesUsed := 0

    for _, e := range edges {
        if uf.Union(e[0], e[1]) {
            totalWeight += e[2]
            edgesUsed++
            if edgesUsed == n-1 {
                break  // MST 有 n-1 条边
            }
        }
    }

    if edgesUsed < n-1 {
        return -1  // graph not connected
    }
    return totalWeight
}
```

### Prim（贪心 + Priority Queue）

思路：从任意节点开始，每次把当前 MST 集合能到达的最短边加进来。

``` go
func prim(n int, graph [][]Edge) int {
    visited := make([]bool, n)
    pq := &PQ{{0, 0}}  // start from node 0, cost 0
    heap.Init(pq)
    totalWeight := 0
    nodesAdded := 0

    for pq.Len() > 0 && nodesAdded < n {
        curr := heap.Pop(pq).(Item)
        if visited[curr.node] {
            continue
        }
        visited[curr.node] = true
        totalWeight += curr.dist
        nodesAdded++

        for _, e := range graph[curr.node] {
            if !visited[e.to] {
                heap.Push(pq, Item{e.to, e.weight})
            }
        }
    }

    if nodesAdded < n { return -1 }
    return totalWeight
}
```

### Kruskal vs Prim

| | Kruskal | Prim |
|---|---|---|
| 思路 | 全局排序边，贪心加边 | 从一个点扩展，贪心加最近的边 |
| 数据结构 | Union Find | Priority Queue |
| 适合 | 边少（sparse graph） | 边多（dense graph） |
| 复杂度 | O(E log E) | O((V+E) log V) |

### Graph 问题分类总览

``` text
Graph Problems
│
├── 1. Traversal / Connectivity
│      ├── DFS
│      └── BFS
│
├── 2. Shortest Path
│      ├── Unweighted → BFS
│      ├── Positive weighted → Dijkstra
│      └── With extra state → BFS/Dijkstra + State
│
├── 3. Dependency / Ordering
│      └── Topological Sort (Kahn's BFS)
│
├── 4. Connected Components
│      ├── DFS / BFS
│      └── Union Find (DSU)
│
├── 5. Cycle Detection
│      ├── Undirected → DFS + parent / Union Find
│      └── Directed → DFS 3-state / Topological Sort
│
└── 6. Minimum Spanning Tree
       ├── Kruskal (sort edges + Union Find)
       └── Prim (priority queue expansion)
```

### 关键词 → Graph Pattern

``` text
connected components / islands         → DFS/BFS + visited
shortest path (unweighted)             → BFS
shortest path (positive weights)       → Dijkstra
shortest path (with constraints)       → BFS/Dijkstra + extra state
cycle detection (directed)             → DFS 3-state / Topo Sort
cycle detection (undirected)           → DFS + parent / Union Find
prerequisites / dependencies           → Topological Sort
"is A connected to B" (dynamic)        → Union Find
minimum cost to connect all nodes      → MST (Kruskal / Prim)
```

### 常见错误

``` text
✗ BFS 在 dequeue 时才 mark visited → 导致重复入队，TLE
✗ 无向图忘记双向添加边
✗ Grid 越界检查遗漏
✗ 混淆 node 和 edge
✗ Dijkstra 用于负权图 → 不适用，需要 Bellman-Ford
✗ Undirected cycle 用 3-state → 无法区分回边和来时的路，需要 parent 参数
✗ MST 忘记检查 graph 是否 connected
```

## 12. Topological Sort --- C+/B-

### 核心概念

`indegree` = number of incoming edges（有多少边指向这个 node）。

Dependency 方向：

``` text
A depends on B → edge: B → A → indegree[A]++
"要先完成 B 才能做 A"
```

### Kahn's Algorithm（BFS）完整 Go 实现

``` go
func topologicalSort(n int, prerequisites [][]int) ([]int, bool) {
    graph := make([][]int, n)
    indegree := make([]int, n)

    for _, p := range prerequisites {
        // p = [course, prerequisite]
        // prerequisite → course
        course, prereq := p[0], p[1]
        graph[prereq] = append(graph[prereq], course)
        indegree[course]++
    }

    // 所有 indegree == 0 的入队
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

        for _, next := range graph[node] {
            indegree[next]--              // decrement neighbor's indegree
            if indegree[next] == 0 {
                queue = append(queue, next)
            }
        }
    }

    if len(order) < n {
        return nil, false  // cycle detected
    }
    return order, true
}
```

### Course Schedule（能否修完所有课）

``` go
func canFinish(numCourses int, prerequisites [][]int) bool {
    _, ok := topologicalSort(numCourses, prerequisites)
    return ok
}
```

### 关键词 → Topological Sort

``` text
prerequisites / dependencies    → Topo Sort
build order / task scheduling   → Topo Sort
detect cycle in directed graph  → Topo Sort (len(order) < n)
```

### 常见错误

``` text
✗ edge direction 写反：A depends on B，edge 应该是 B → A，不是 A → B
✗ decrement 了错误 node 的 indegree：应该 decrement neighbor 的，不是当前 node 的
✗ 忘记检测 cycle：len(order) < n 说明有 cycle
```

## 13. Basic DP --- B

### DP 面试固定流程

``` text
1. Define state:  dp[i] 代表什么？
2. Choices:       每一步有什么选择？
3. Transition:    dp[i] 怎么从之前的状态得到？
4. Base cases:    dp[0], dp[1] 等初始值
5. Complexity:    Time & Space
6. Optimization:  能否只用 O(1) 变量代替数组？
```

### 三种 DP 类型

``` go
// Counting（多少种方式？） → 加法
dp[i] = dp[i-1] + dp[i-2]                       // Climbing Stairs

// Optimization（最小/最大？） → min/max
dp[i] = max(dp[i-1], dp[i-2] + nums[i])         // House Robber
dp[i] = min(dp[i-coin] + 1, dp[i])              // Coin Change

// Longest Sequence → max with condition
dp[i] = max(dp[j]+1) for j < i where nums[j] < nums[i]  // LIS
```

### House Robber 完整实现

``` go
func rob(nums []int) int {
    n := len(nums)
    if n == 1 { return nums[0] }

    dp := make([]int, n)
    dp[0] = nums[0]
    dp[1] = max(nums[0], nums[1])

    for i := 2; i < n; i++ {
        dp[i] = max(dp[i-1], dp[i-2]+nums[i])
    }
    return dp[n-1]
}

// Space optimized O(1)
func rob(nums []int) int {
    prev2, prev1 := 0, 0
    for _, num := range nums {
        curr := max(prev1, prev2+num)
        prev2 = prev1
        prev1 = curr
    }
    return prev1
}
```

### Coin Change 完整实现

``` go
func coinChange(coins []int, amount int) int {
    dp := make([]int, amount+1)
    for i := range dp {
        dp[i] = amount + 1  // impossible value
    }
    dp[0] = 0

    for i := 1; i <= amount; i++ {
        for _, coin := range coins {
            if coin <= i {
                dp[i] = min(dp[i], dp[i-coin]+1)
            }
        }
    }

    if dp[amount] > amount { return -1 }
    return dp[amount]
}
```

### Longest Increasing Subsequence

``` go
func lengthOfLIS(nums []int) int {
    n := len(nums)
    dp := make([]int, n)
    for i := range dp { dp[i] = 1 }
    result := 1

    for i := 1; i < n; i++ {
        for j := 0; j < i; j++ {
            if nums[j] < nums[i] {
                dp[i] = max(dp[i], dp[j]+1)
            }
        }
        result = max(result, dp[i])
    }
    return result
}
```

### 2D DP：Unique Paths

``` go
func uniquePaths(m, n int) int {
    dp := make([][]int, m)
    for i := range dp {
        dp[i] = make([]int, n)
        dp[i][0] = 1
    }
    for j := 0; j < n; j++ { dp[0][j] = 1 }

    for i := 1; i < m; i++ {
        for j := 1; j < n; j++ {
            dp[i][j] = dp[i-1][j] + dp[i][j-1]
        }
    }
    return dp[m-1][n-1]
}
```

### 关键词 → DP Pattern

``` text
how many ways              → counting DP (加法)
minimum cost / maximum     → optimization DP (min/max)
longest / shortest seq     → sequence DP
can I reach / is possible  → boolean DP
grid paths                 → 2D DP
```

## 14. 0/1 Knapsack --- B-/C+

### 核心区别

``` text
0/1 Knapsack     → 每个 item 最多用一次 → 容量从大到小遍历
Complete Knapsack → 每个 item 可以无限用 → 容量从小到大遍历
```

**为什么 0/1 必须倒序？** 正序时 `dp[w-weight]` 可能已经在本轮被更新（包含了当前 item），导致同一个 item 被重复使用。

### 0/1 Knapsack 完整实现

``` go
func knapsack01(weights, values []int, capacity int) int {
    dp := make([]int, capacity+1)

    for i := 0; i < len(weights); i++ {
        // 必须从大到小！
        for w := capacity; w >= weights[i]; w-- {
            dp[w] = max(dp[w], dp[w-weights[i]]+values[i])
        }
    }
    return dp[capacity]
}
```

### Complete Knapsack 完整实现

``` go
func knapsackComplete(weights, values []int, capacity int) int {
    dp := make([]int, capacity+1)

    for i := 0; i < len(weights); i++ {
        // 从小到大，允许重复使用
        for w := weights[i]; w <= capacity; w++ {
            dp[w] = max(dp[w], dp[w-weights[i]]+values[i])
        }
    }
    return dp[capacity]
}
```

### 常见变体

``` text
Subset Sum (能否凑出 target?)    → 0/1 Knapsack, dp[w] = bool
Coin Change (最少硬币数)         → Complete Knapsack, dp[w] = min coins
Coin Change II (组合数)          → Complete Knapsack, dp[w] += dp[w-coin]
Partition Equal Subset Sum       → 0/1 Knapsack, target = sum/2
```

## 15. Backtracking --- B-/C+

### 核心 Mental Model

``` text
current state → choices → choose → recurse → unchoose
```

核心 invariant：**进入一个 branch 前是什么状态，从 branch 返回后就恢复成什么状态。**

### Subsets

``` go
func subsets(nums []int) [][]int {
    var result [][]int
    var backtrack func(start int, path []int)
    backtrack = func(start int, path []int) {
        // 每个状态都是一个合法子集
        result = append(result, append([]int{}, path...))

        for i := start; i < len(nums); i++ {
            path = append(path, nums[i])
            backtrack(i+1, path)
            path = path[:len(path)-1]  // unchoose
        }
    }
    backtrack(0, []int{})
    return result
}
```

### Permutations

``` go
func permute(nums []int) [][]int {
    var result [][]int
    used := make([]bool, len(nums))
    var backtrack func(path []int)
    backtrack = func(path []int) {
        if len(path) == len(nums) {
            result = append(result, append([]int{}, path...))
            return
        }
        for i := 0; i < len(nums); i++ {
            if used[i] { continue }
            used[i] = true
            path = append(path, nums[i])
            backtrack(path)
            path = path[:len(path)-1]
            used[i] = false
        }
    }
    backtrack([]int{})
    return result
}
```

### Combination Sum（可重复使用元素）

``` go
func combinationSum(candidates []int, target int) [][]int {
    var result [][]int
    sort.Ints(candidates)
    var backtrack func(start, remain int, path []int)
    backtrack = func(start, remain int, path []int) {
        if remain == 0 {
            result = append(result, append([]int{}, path...))
            return
        }
        for i := start; i < len(candidates); i++ {
            if candidates[i] > remain { break }
            path = append(path, candidates[i])
            backtrack(i, remain-candidates[i], path)  // i not i+1, can reuse
            path = path[:len(path)-1]
        }
    }
    backtrack(0, target, []int{})
    return result
}
```

### Generate Parentheses（Constraint Pruning）

``` go
func generateParenthesis(n int) []string {
    var result []string
    var backtrack func(path []byte, open, close int)
    backtrack = func(path []byte, open, close int) {
        if len(path) == 2*n {
            result = append(result, string(path))
            return
        }
        if open < n {
            backtrack(append(path, '('), open+1, close)
        }
        if close < open {
            backtrack(append(path, ')'), open, close+1)
        }
    }
    backtrack([]byte{}, 0, 0)
    return result
}
```

### 关键词 → Backtracking

``` text
all subsets / combinations      → Subsets template (start index)
all permutations / arrangements → Permutations template (used array)
generate valid X                → constraint pruning
word search / path finding      → grid backtracking
```

### Go Slice 陷阱

**保存结果时必须 copy**，否则后续修改会影响已保存的结果：

``` go
// ✗ 错误：直接 append path
result = append(result, path)

// ✓ 正确：copy 一份
result = append(result, append([]int{}, path...))
```

### 常见错误

``` text
✗ Generate Parentheses 识别成 Stack 题 → 它是 backtracking + constraint pruning
✗ 不理解为什么要 unchoose → 因为要回到 branch 前的状态，才能探索其他 branch
✗ Subsets 用 i+1，Combination Sum (reuse) 用 i → 是否允许重复使用
```

## 16. Greedy --- TBD，约 B-/C+

Stock 题最初主要是漏看 `buy once / sell once`。理解后能得到：

``` text
minPrice
maxProfit
```

扫描时：

``` text
profit if selling today = price - minPrice
```

维护 `minPrice` 与 `maxProfit`。

Greedy 更准确的理解：

> Make a locally optimal choice that can be proven not to hurt the
> global optimum.

需要再用 1--2 道题确认真实水平。

## 17. Union Find / DSU --- D

### 核心操作

``` text
find(x)    → x 属于哪个 connected component（返回 root）
union(a,b) → merge two components
```

### 完整 Go 实现（Path Compression + Union by Rank）

``` go
type UnionFind struct {
    parent []int
    rank   []int
    count  int  // number of components
}

func NewUnionFind(n int) *UnionFind {
    parent := make([]int, n)
    rank := make([]int, n)
    for i := range parent {
        parent[i] = i
    }
    return &UnionFind{parent, rank, n}
}

func (uf *UnionFind) Find(x int) int {
    if uf.parent[x] != x {
        uf.parent[x] = uf.Find(uf.parent[x])  // path compression
    }
    return uf.parent[x]
}

func (uf *UnionFind) Union(x, y int) bool {
    px, py := uf.Find(x), uf.Find(y)
    if px == py { return false }  // already connected
    // union by rank
    if uf.rank[px] < uf.rank[py] {
        px, py = py, px
    }
    uf.parent[py] = px
    if uf.rank[px] == uf.rank[py] {
        uf.rank[px]++
    }
    uf.count--
    return true
}

func (uf *UnionFind) Connected(x, y int) bool {
    return uf.Find(x) == uf.Find(y)
}
```

### 使用示例：Redundant Connection

``` go
func findRedundantConnection(edges [][]int) []int {
    n := len(edges)
    uf := NewUnionFind(n + 1)
    for _, e := range edges {
        if !uf.Union(e[0], e[1]) {
            return e  // already connected → this edge creates cycle
        }
    }
    return nil
}
```

### 关键词 → Union Find

``` text
dynamic connectivity / "are A and B connected"  → Union Find
detect cycle in undirected graph                 → Union Find
number of connected components (dynamic edges)   → Union Find
accounts merge / friend circles                  → Union Find
```

### Union Find vs DFS/BFS

| | Union Find | DFS/BFS |
|---|---|---|
| 适用 | 动态加边，在线查询 | 静态图，一次性遍历 |
| 优势 | merge + query 近似 O(1) | 完整路径/组件探索 |
| 典型 | Redundant Connection | Number of Islands |

### 复杂度

``` text
Find:  O(α(n)) ≈ O(1) amortized (with path compression + union by rank)
Union: O(α(n)) ≈ O(1) amortized
Space: O(n)
```

## 18. Rate Limiter --- B

### Fixed Window --- B+

``` text
userID → windowStart + count
```

窗口对齐。主要问题是 boundary burst。

### Sliding Window Log --- B+/A-

``` text
userID → []timestamp
```

对于 `(t-60, t]`：

``` text
remove timestamp <= t-60
keep timestamp > t-60
```

可以 binary search upper bound，也可以 deque 从 head 清理。

### Concurrency

相同 timestamp 本身完全合法。

真正需要 atomic 的是：

``` text
cleanup → check quota → update state
```

单机可 per-user mutex；distributed 可以使用 Redis atomic operation /
Lua。

### Sliding Window Counter

保存 previous/current fixed-window counts，通过 previous window 的
weighted portion 近似 sliding window。

优点 O(1) state/user；缺点是 approximation。

### Token Bucket --- C+/B-

状态：

``` text
tokens
lastRefillTime
```

不是周期性 reset。

``` text
refill = elapsed * refillRate
tokens = min(capacity, tokens + refill)
```

``` text
capacity → maximum burst
refill rate → long-term rate
```

## 19. Clarification：跨题核心能力

有时不是不会算法，而是 requirement 没完全读清楚。Stock 题漏掉 `once`
是典型例子。

Live Coding 固定流程：

``` text
1. Restate the problem
2. Clarify constraints
3. Give example / edge case
4. Explain approach
5. Analyze complexity
6. Code
7. Test
```

特别确认：

``` text
duplicates?
sorted?
negative numbers?
empty input?
one solution or multiple?
can reuse elements?
once or unlimited?
directed or undirected?
weighted or unweighted?
input size?
```

## 20. 最终能力地图

  Topic                                      Level     Priority
  ----------------------------- ------------------ ------------
  HashMap                                    **A**          Low
  Heap / Priority Queue                      **A**          Low
  Binary Search                              **A**          Low
  Linked List                                **A**          Low
  LRU Cache                              **A-/B+**       Medium
  Two Pointers                              **A-**          Low
  Sliding Window                         **A-/B+**       Medium
  Prefix Sum                                **A-**          Low
  Intervals                              **A-/B+**          Low
  Monotonic Stack                            **B**       Medium
  Basic DP                                   **B**       Medium
  Tree                                   **B-/C+**     **High**
  Graph BFS/DFS                          **B-/C+**     **High**
  Grid BFS                                  **B-**     **High**
  Topological Sort                       **C+/B-**     **High**
  0/1 Knapsack                           **B-/C+**     **High**
  Backtracking                           **B-/C+**     **High**
  Greedy                          **TBD \~ B-/C+**       Medium
  Union Find                                 **D**   Medium-Low
  Fixed Window Rate Limiter                 **B+**       Medium
  Sliding Window Rate Limiter            **B+/A-**       Medium
  Token Bucket                           **C+/B-**       Medium

## 21. 接下来两天复习优先级

### Priority 1

``` text
Graph
├── adjacency list
├── DFS
├── BFS
├── connected components
├── grid BFS / shortest path
└── topological sort

Tree
├── preorder / inorder / postorder
├── recursive DFS
├── level-order BFS
└── common tree recursion

Backtracking
├── subsets
├── permutations
├── generate parentheses
└── choose → explore → unchoose

DP
├── House Robber
└── 0/1 Knapsack
```

### Priority 2

``` text
LRU Cache → 完整手写一次
Rate Limiter → 完整手写一次
Monotonic Stack → 完整手写一次
```

### Priority 3

进入 Live Coding Mock。重点测试：

``` text
clarify
→ identify pattern
→ explain
→ code
→ test
→ handle follow-up
```

## 22. Jacksite 推荐结构

``` text
Interview Preparation
│
├── Algorithm Capability Map
├── Algorithm Patterns
│   ├── HashMap
│   ├── Sliding Window
│   ├── Binary Search
│   ├── Tree
│   ├── Graph
│   ├── Backtracking
│   ├── DP
│   ├── Knapsack
│   ├── Rate Limiter
│   └── LRU
├── Live Coding Retrospectives
├── System Design
│   ├── Asset Price Watching
│   ├── Order Routing
│   └── Account Opening
└── Interview Question Bank
```

Capability Map 应动态维护：

``` text
Graph = C+
→ 练习
→ Graph = B
→ Mock 中独立完成
→ Graph = B+
```

## 23. 本次摸底最值得保留的错误清单

1.  Tree traversal：Preorder / Inorder 一开始混淆。
2.  Tree complexity：Maximum Depth 一开始误判为 O(log n) time / O(1)
    space。
3.  Graph representation：一开始混淆 node 与 edge，不熟悉 adjacency
    list。
4.  Graph BFS：enqueue neighbor 时漏掉 `visited = true`。
5.  Topological Sort：dependency edge direction 写反。
6.  Topological Sort：decrement 了错误 node 的 indegree。
7.  0/1 Knapsack：没有稳定记住 capacity 必须倒序。
8.  Generate Parentheses：一开始识别成 Valid Parentheses / Stack。
9.  Backtracking：开始不理解 recursion 返回后为什么必须 unchoose。
10. Token Bucket：一开始理解成周期性 reset，而不是 elapsed-time refill。
11. Stock / Greedy：漏读 `buy once / sell once`，说明 requirement
    clarification 需要刻意执行。
12. Sliding Window Rate Limiter：主动识别 concurrency 问题；需记住问题是
    atomic check-and-update，而不是相同 timestamp 本身。

## 24. 面试前最终原则

不要追求"所有算法都学过"。

更重要的是：

> **强项稳定拿分，弱项补到能识别 pattern，并把 Live Coding
> 的完整执行流程练熟。**

每一道题强制按照：

``` text
Clarify
→ Define
→ Approach
→ Invariant / State
→ Complexity
→ Code
→ Test
→ Follow-up
```

执行。
