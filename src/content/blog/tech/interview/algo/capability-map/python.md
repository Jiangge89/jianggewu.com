---
title: "Python"
weight: 2
---

# Algorithm Interview Capability Map & Assessment (Python)

> Based on a comprehensive algorithm assessment. The goal is not to record "which problems were solved" but to document
> current real ability, exposed weaknesses, templates to internalize, and review priorities before live coding.

## 1. Overall Conclusion

  -------------------------------------------------------------------------------------
  Level                   Current Ability              Topics
  ----------------------- ---------------------------- --------------------------------
  **A**                   Can solve directly in an      HashMap, Heap / Priority
                          interview                    Queue, Binary Search, Linked
                                                       List

  **A-/B+**               Can solve, minor details      LRU Cache, Two Pointers, Sliding
                          may go wrong                 Window, Prefix Sum, Intervals

  **B**                   Understand the core, need     Monotonic Stack, Basic DP, Tree
                          stable templates             BFS/DFS, Graph BFS/DFS, Rate
                                                       Limiter

  **C**                   Pattern recognition /         Topological Sort, 0/1
                          implementation unstable      Knapsack, Backtracking, Greedy

  **D**                   Never systematically studied Union Find
  -------------------------------------------------------------------------------------

### Highest ROI Right Now

Priorities before live coding:

1.  **Graph**
2.  **Tree**
3.  **Backtracking**
4.  **0/1 Knapsack**
5.  **Rate Limiter / LRU implementation**

HashMap, Heap, Binary Search, Linked List do not need significant additional time on basic problems.

## 2. HashMap --- A

Clear strength. When seeing frequency, lookup, duplicate, mapping, Two Sum, character
count, HashMap comes to mind naturally.

Complexity:

``` text
lookup: expected O(1)
insert: expected O(1)
delete: expected O(1)
```

**Conclusion: No major review needed.**

## 3. Heap / Priority Queue --- A

Pattern recognition is fairly stable. When seeing Top K, K-th
largest/smallest, continuously get min/max, merge K sorted
lists, Heap should be the first thought.

### Keywords to Heap

``` text
Top K / K-th largest / K-th smallest → Min Heap (size K)
Continuously get min/max             → Min/Max Heap
Merge K sorted lists/arrays          → Min Heap
Median of stream                     → Two Heaps (max + min)
Meeting Rooms / Intervals + overlap  → Min Heap (by end time)
```

### Python `heapq` Implementation

Python's `heapq` is a **Min Heap**. To implement a Max Heap, negate the values.

``` python
import heapq

# --- Min Heap ---
min_heap = []
heapq.heappush(min_heap, 3)
heapq.heappush(min_heap, 1)
heapq.heappush(min_heap, 2)
smallest = heapq.heappop(min_heap)  # 1

# --- Max Heap (negate values) ---
max_heap = []
heapq.heappush(max_heap, -3)
heapq.heappush(max_heap, -1)
heapq.heappush(max_heap, -2)
largest = -heapq.heappop(max_heap)  # 3

# --- heapify an existing list ---
nums = [5, 3, 1, 4, 2]
heapq.heapify(nums)  # O(n) in-place heapify
```

**Key points:**

| | Min Heap | Max Heap |
|---|---|---|
| Implementation | `heapq` directly | Negate values `-val` |
| `heappop()` returns | Smallest | Largest (negate back) |
| Top K largest | Maintain size K **Min Heap** | N/A |
| Top K smallest | N/A | Maintain size K **Max Heap** |

**Why use Min Heap for Top K largest?** Because popping the smallest keeps the K largest remaining.

### Example: Top K Frequent Elements

``` python
from collections import Counter
import heapq

def topKFrequent(nums: list[int], k: int) -> list[int]:
    freq = Counter(nums)
    return heapq.nlargest(k, freq.keys(), key=freq.get)

    # Or manually maintain a size K min heap
    # min_heap = []
    # for num, count in freq.items():
    #     heapq.heappush(min_heap, (count, num))
    #     if len(min_heap) > k:
    #         heapq.heappop(min_heap)
    # return [num for count, num in min_heap]
```

### Example: Merge K Sorted Lists

``` python
import heapq

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def mergeKLists(lists: list[ListNode]) -> ListNode:
    heap = []
    for i, l in enumerate(lists):
        if l:
            heapq.heappush(heap, (l.val, i, l))

    dummy = ListNode()
    curr = dummy
    while heap:
        val, i, node = heapq.heappop(heap)
        curr.next = node
        curr = curr.next
        if node.next:
            heapq.heappush(heap, (node.next.val, i, node.next))
    return dummy.next
```

### Common Mistakes

``` text
✗ Forgetting Python heapq is min-only         → use negation for max heap
✗ Comparison conflict (same first tuple elem)  → add index as tie-breaker
✗ Forgetting heapify is O(n), not O(n log n)
```

### Complexity

``` text
heapify:    O(n)
heappush:   O(log n)
heappop:    O(log n)
Top K:      O(n log k)
nlargest/nsmallest: O(n log k)
```

## 4. Binary Search --- A

### Core Insight

The core of Binary Search is not "finding a value" but **finding a boundary in a monotonic boolean sequence** — finding the first position where `condition(mid)` is true.

Lower bound / upper bound / exact search are just specializations of `condition()`.

### Unified Template (generic condition helper)

``` python
def binary_search(n: int, condition) -> int:
    left, right = 0, n
    while left < right:
        mid = left + (right - left) // 2
        if condition(mid):
            right = mid
        else:
            left = mid + 1
    return left
```

### Lower Bound: First >= target

``` python
import bisect

def lower_bound(nums: list[int], target: int) -> int:
    left, right = 0, len(nums)
    while left < right:
        mid = left + (right - left) // 2
        if nums[mid] >= target:  # condition: >= target
            right = mid
        else:
            left = mid + 1
    return left

# Or use bisect directly
# bisect.bisect_left(nums, target)
```

### Upper Bound: First > target

``` python
def upper_bound(nums: list[int], target: int) -> int:
    left, right = 0, len(nums)
    while left < right:
        mid = left + (right - left) // 2
        if nums[mid] > target:  # condition: > target
            right = mid
        else:
            left = mid + 1
    return left

# Or use bisect directly
# bisect.bisect_right(nums, target)
```

### Exact Search: Based on Lower Bound

``` python
def exact_search(nums: list[int], target: int) -> int:
    i = bisect.bisect_left(nums, target)
    if i < len(nums) and nums[i] == target:
        return i
    return -1
```

### Unified Relationships Between Variants

``` text
first >= x   = bisect_left(x)
first > x    = bisect_right(x)
last < x     = bisect_left(x) - 1
last <= x    = bisect_right(x) - 1
exact x      = bisect_left(x), then check == x
count of x   = bisect_right(x) - bisect_left(x)
```

### Search on Answer (searching the answer space)

``` python
left, right = min_possible, max_possible
while left < right:
    mid = left + (right - left) // 2
    if can_achieve(mid):
        right = mid     # feasible → try smaller
    else:
        left = mid + 1  # not feasible → go bigger
return left
```

### Rotated Sorted Array

``` python
def search(nums: list[int], target: int) -> int:
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if nums[mid] == target:
            return mid
        if nums[left] <= nums[mid]:  # left half sorted
            if nums[left] <= target < nums[mid]:
                right = mid - 1
            else:
                left = mid + 1
        else:  # right half sorted
            if nums[mid] < target <= nums[right]:
                left = mid + 1
            else:
                right = mid - 1
    return -1
```

### Keywords to Binary Search

``` text
sorted array + find target          → exact search / lower bound
first/last occurrence               → lower bound / upper bound
"minimum X such that condition"     → search on answer
rotated sorted array                → modified binary search
peak element / mountain array       → binary search on condition
```

### Complexity

``` text
Time:  O(log n)
Space: O(1)
```

## 5. Linked List --- A

### Python Class Definition

``` python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
```

### Dummy Head Technique

``` python
dummy = ListNode(0, head)
curr = dummy
# ... operations ...
return dummy.next
```

### Reverse Linked List

``` python
def reverseList(head: ListNode) -> ListNode:
    prev = None
    curr = head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev
```

### Detect Cycle (Fast-Slow Pointers)

``` python
def hasCycle(head: ListNode) -> bool:
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False
```

### Find Cycle Entry

``` python
def detectCycle(head: ListNode) -> ListNode:
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            slow = head
            while slow is not fast:
                slow = slow.next
                fast = fast.next
            return slow
    return None
```

### Find Middle

``` python
def middleNode(head: ListNode) -> ListNode:
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow
```

### Merge Two Sorted Lists

``` python
def mergeTwoLists(l1: ListNode, l2: ListNode) -> ListNode:
    dummy = ListNode()
    curr = dummy
    while l1 and l2:
        if l1.val <= l2.val:
            curr.next = l1
            l1 = l1.next
        else:
            curr.next = l2
            l2 = l2.next
        curr = curr.next
    curr.next = l1 or l2
    return dummy.next
```

### Keywords to Linked List Pattern

``` text
reverse / palindrome            → reverse linked list
cycle detection                 → fast-slow pointers
find middle                     → fast-slow pointers
merge sorted                    → dummy head + two pointers
remove nth from end             → two pointers (gap = n)
intersection of two lists       → align lengths / two-pass
```

### Complexity

``` text
Reverse:     O(n) time, O(1) space
Cycle:       O(n) time, O(1) space
Find Middle: O(n) time, O(1) space
Merge:       O(n+m) time, O(1) space
```

## 6. LRU Cache --- A-/B+

Core structure:

``` text
HashMap<key, Node>  +  Doubly Linked List

head(dummy) ⇄ MRU ⇄ ... ⇄ LRU ⇄ tail(dummy)
```

Operation logic:

``` text
get → lookup → moveToHead
put existing → update value → moveToHead
put new → create node → map insert → addToHead
over capacity → remove tail.prev → delete map[lru.key]
```

### Python Full Implementation (OrderedDict shortcut)

``` python
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity: int):
        self.cache = OrderedDict()
        self.capacity = capacity

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)
```

### Python Full Implementation (Manual Doubly Linked List)

``` python
class Node:
    def __init__(self, key=0, value=0):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = {}
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.prev = self.head

    def get(self, key: int) -> int:
        if key in self.cache:
            node = self.cache[key]
            self._move_to_head(node)
            return node.value
        return -1

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            node = self.cache[key]
            node.value = value
            self._move_to_head(node)
            return
        node = Node(key, value)
        self.cache[key] = node
        self._add_to_head(node)
        if len(self.cache) > self.capacity:
            lru = self._remove_tail()
            del self.cache[lru.key]

    def _add_to_head(self, node: Node):
        node.prev = self.head
        node.next = self.head.next
        self.head.next.prev = node
        self.head.next = node

    def _remove_node(self, node: Node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _move_to_head(self, node: Node):
        self._remove_node(node)
        self._add_to_head(node)

    def _remove_tail(self) -> Node:
        node = self.tail.prev
        self._remove_node(node)
        return node
```

### Why Doubly Linked List?

``` text
HashMap → O(1) lookup by key
DLL    → O(1) insert/remove/reorder
```

A singly linked list cannot O(1) delete (no access to prev).

### Why Does Node Need to Store Key?

``` text
When evicting the tail, we need to delete from the map, which requires the key.
If the Node doesn't store the key, we don't know which map entry to delete.
```

**Conclusion: No re-learning needed, just do one full handwrite before mock. For Python interviews, the OrderedDict version is acceptable.**

## 7. Two Pointers / Sliding Window --- A-/B+

Two Sum Sorted:

``` text
sum < target → left++
sum > target → right--
```

3Sum:

``` text
sort → fix i → left/right
```

Need to strengthen duplicate handling:

``` python
if i > 0 and nums[i] == nums[i - 1]:
    continue
```

Longest Substring Without Repeating Characters:

``` text
HashMap/Frequency + Sliding Window
```

Invariant: no character in the window can have frequency > 1.

## 8. Prefix Sum --- A-

Always use `n+1` size:

``` text
prefix[i] = sum(nums[0...i-1])
```

``` python
prefix = [0] * (len(nums) + 1)
for i in range(len(nums)):
    prefix[i + 1] = prefix[i] + nums[i]

total = prefix[right + 1] - prefix[left]
```

Alternatively, use `itertools.accumulate`:

``` python
from itertools import accumulate

prefix = [0] + list(accumulate(nums))
```

Complexity: preprocessing O(n), query O(1), space O(n).

## 9. Monotonic Stack --- B

Instinct:

> For each element, find the first greater/smaller element to the right → Monotonic Stack.

### Next Greater Element

Typically store indices:

``` python
def dailyTemperatures(temperatures: list[int]) -> list[int]:
    n = len(temperatures)
    result = [0] * n
    stack = []  # stores indices, monotonically decreasing

    for i in range(n):
        while stack and temperatures[i] > temperatures[stack[-1]]:
            j = stack.pop()
            result[j] = i - j
        stack.append(i)
    return result
```

Each index is pushed/popped at most once, so O(n).

### Monotonic Stack Variants

``` text
Next Greater Element  → maintain decreasing stack, pop when larger found
Next Smaller Element  → maintain increasing stack, pop when smaller found
Previous Greater      → left to right, decreasing stack
Previous Smaller      → left to right, increasing stack
```

### Keywords to Monotonic Stack

``` text
next greater / next warmer day   → Monotonic Stack
largest rectangle in histogram   → Monotonic Stack
stock span                       → Monotonic Stack
```

## 10. Tree --- B-/C+

Needs systematic fundamentals review.

### Python Class Definition

``` python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
```

### Traversal Order

``` text
Preorder:  Root → Left → Right   (common for copy / serialize)
Inorder:   Left → Root → Right   (yields sorted sequence for BST)
Postorder: Left → Right → Root   (common for delete / computing subtree results)
```

### DFS Recursive Templates

``` python
# Preorder
def preorder(root: TreeNode, result: list):
    if not root:
        return
    result.append(root.val)
    preorder(root.left, result)
    preorder(root.right, result)

# Inorder
def inorder(root: TreeNode, result: list):
    if not root:
        return
    inorder(root.left, result)
    result.append(root.val)
    inorder(root.right, result)

# Postorder
def postorder(root: TreeNode, result: list):
    if not root:
        return
    postorder(root.left, result)
    postorder(root.right, result)
    result.append(root.val)
```

### DFS General Recursive Framework

Most tree problems follow this pattern:

``` python
def dfs(root: TreeNode):
    # base case
    if not root:
        return base_value
    # recursively process left and right subtrees
    left = dfs(root.left)
    right = dfs(root.right)
    # combine left, right, root.val into current node's result
    return combine(left, right, root.val)
```

### Classic DFS Examples

``` python
# Maximum Depth
def maxDepth(root: TreeNode) -> int:
    if not root:
        return 0
    return 1 + max(maxDepth(root.left), maxDepth(root.right))

# Invert Binary Tree
def invertTree(root: TreeNode) -> TreeNode:
    if not root:
        return None
    root.left, root.right = invertTree(root.right), invertTree(root.left)
    return root

# Is Balanced
def isBalanced(root: TreeNode) -> bool:
    def height(node):
        if not node:
            return 0
        l = height(node.left)
        r = height(node.right)
        if l == -1 or r == -1 or abs(l - r) > 1:
            return -1
        return 1 + max(l, r)
    return height(root) != -1

# Lowest Common Ancestor
def lowestCommonAncestor(root: TreeNode, p: TreeNode, q: TreeNode) -> TreeNode:
    if not root or root is p or root is q:
        return root
    left = lowestCommonAncestor(root.left, p, q)
    right = lowestCommonAncestor(root.right, p, q)
    if left and right:
        return root
    return left or right

# Diameter of Binary Tree
def diameterOfBinaryTree(root: TreeNode) -> int:
    diameter = 0
    def depth(node):
        nonlocal diameter
        if not node:
            return 0
        l = depth(node.left)
        r = depth(node.right)
        diameter = max(diameter, l + r)
        return 1 + max(l, r)
    depth(root)
    return diameter
```

### BFS Level-Order Traversal Template

``` python
from collections import deque

def levelOrder(root: TreeNode) -> list[list[int]]:
    if not root:
        return []
    result = []
    queue = deque([root])

    while queue:
        level_size = len(queue)
        level = []
        for _ in range(level_size):
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(level)
    return result
```

### DFS Iterative Versions (explicit stack)

``` python
# Iterative Preorder
def preorderIterative(root: TreeNode) -> list[int]:
    if not root:
        return []
    result = []
    stack = [root]
    while stack:
        node = stack.pop()
        result.append(node.val)
        if node.right:
            stack.append(node.right)
        if node.left:
            stack.append(node.left)
    return result

# Iterative Inorder
def inorderIterative(root: TreeNode) -> list[int]:
    result = []
    stack = []
    curr = root
    while curr or stack:
        while curr:
            stack.append(curr)
            curr = curr.left
        curr = stack.pop()
        result.append(curr.val)
        curr = curr.right
    return result
```

### BST Special Properties

``` text
Inorder traversal of BST → sorted sequence
Search / Insert / Delete → O(h), balanced = O(log n)
Validate BST → inorder check or recursive (min, max) range
```

``` python
def isValidBST(root: TreeNode) -> bool:
    def validate(node, lo=float('-inf'), hi=float('inf')):
        if not node:
            return True
        if node.val <= lo or node.val >= hi:
            return False
        return validate(node.left, lo, node.val) and validate(node.right, node.val, hi)
    return validate(root)
```

### Keywords to Tree Pattern

``` text
depth / height / balanced         → DFS recursive returning int
path sum / max path sum           → DFS recursive + nonlocal variable
LCA                               → DFS recursive returning TreeNode
serialize / deserialize           → preorder DFS
level order / zigzag / right view → BFS
BST search / validate / kth       → BST properties + inorder
```

### Complexity

``` text
Time:  O(n) — visit each node once
Space: O(h) — recursion stack depth
  balanced tree: O(log n)
  skewed tree:   O(n)
BFS space: O(w) — width of widest level, worst case O(n/2)
```

### Common Mistakes

``` text
✗ Misjudging Maximum Depth as O(log n) time → actually O(n), every node is visited
✗ Misjudging space as O(1) → recursion stack is O(h)
✗ Confusing Preorder / Inorder → remember "Pre" = root first, "In" = root in middle
```

## 11. Graph --- B-/C+

One of the highest priority modules right now.

### Node vs Edge

``` text
edges = [[0,1], [1,2], [3,4]]
```

Nodes are `0,1,2,3,4`; the pairs in the array are the edges.

Graph nodes can have any number of neighbors, unlike binary tree's left/right.

### Adjacency List Construction

``` python
from collections import defaultdict

# Undirected graph
graph = defaultdict(list)
for a, b in edges:
    graph[a].append(b)
    graph[b].append(a)  # undirected: add both directions

# Directed graph
graph = defaultdict(list)
for frm, to in edges:
    graph[frm].append(to)  # directed: one direction only

# Or use list of lists (when nodes are 0..n-1)
graph = [[] for _ in range(n)]
for a, b in edges:
    graph[a].append(b)
    graph[b].append(a)
```

### DFS Full Template

``` python
def dfs(graph, node, visited):
    if visited[node]:
        return
    visited[node] = True
    for nxt in graph[node]:
        dfs(graph, nxt, visited)

# Usage
visited = [False] * n
dfs(graph, start_node, visited)
```

### BFS Full Template

``` python
from collections import deque

def bfs(graph, start, n):
    visited = [False] * n
    visited[start] = True           # mark when enqueued!
    queue = deque([start])

    while queue:
        node = queue.popleft()
        for nxt in graph[node]:
            if visited[nxt]:
                continue
            visited[nxt] = True     # mark when enqueued, NOT when dequeued
            queue.append(nxt)
```

**Key: mark visited when enqueued, not when dequeued.** Otherwise the same node gets enqueued multiple times.

### BFS Shortest Path (with distance)

``` python
from collections import deque

def shortestPath(graph, start, end, n):
    visited = [False] * n
    visited[start] = True
    queue = deque([start])
    dist = 0

    while queue:
        for _ in range(len(queue)):
            node = queue.popleft()
            if node == end:
                return dist
            for nxt in graph[node]:
                if not visited[nxt]:
                    visited[nxt] = True
                    queue.append(nxt)
        dist += 1
    return -1
```

### Connected Components

``` python
def countComponents(n, edges):
    graph = [[] for _ in range(n)]
    for a, b in edges:
        graph[a].append(b)
        graph[b].append(a)

    visited = [False] * n
    count = 0
    for i in range(n):
        if not visited[i]:
            count += 1
            dfs(graph, i, visited)
    return count
```

### Grid DFS (Number of Islands)

``` python
def numIslands(grid: list[list[str]]) -> int:
    rows, cols = len(grid), len(grid[0])
    count = 0

    def dfs(i, j):
        if i < 0 or i >= rows or j < 0 or j >= cols or grid[i][j] == '0':
            return
        grid[i][j] = '0'  # mark visited
        dfs(i + 1, j)
        dfs(i - 1, j)
        dfs(i, j + 1)
        dfs(i, j - 1)

    for i in range(rows):
        for j in range(cols):
            if grid[i][j] == '1':
                count += 1
                dfs(i, j)
    return count
```

### Grid BFS (Shortest Path)

Four directions:

``` python
dirs = [(-1, 0), (1, 0), (0, -1), (0, 1)]
```

``` python
from collections import deque

def gridBFS(grid, start, end):
    rows, cols = len(grid), len(grid[0])
    dirs = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    visited = [[False] * cols for _ in range(rows)]

    visited[start[0]][start[1]] = True
    queue = deque([start])
    steps = 0

    while queue:
        for _ in range(len(queue)):
            r, c = queue.popleft()
            if (r, c) == tuple(end):
                return steps
            for dr, dc in dirs:
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and \
                   not visited[nr][nc] and grid[nr][nc] != 1:
                    visited[nr][nc] = True
                    queue.append((nr, nc))
        steps += 1
    return -1
```

Instinct:

> **Unweighted graph + minimum steps/hops → BFS.**

### Cycle Detection (Directed Graph, 3 states)

``` python
# 0=unvisited, 1=visiting, 2=visited
def hasCycleDirected(graph, node, state):
    state[node] = 1  # visiting
    for nxt in graph[node]:
        if state[nxt] == 1:
            return True  # back edge = cycle
        if state[nxt] == 0:
            if hasCycleDirected(graph, nxt, state):
                return True
    state[node] = 2  # visited
    return False
```

### Cycle Detection (Undirected Graph, DFS + parent)

Undirected graphs cannot use 3-state (A→B and B→A always coexist). Use parent to distinguish back edges from the path we came from:

``` python
def hasCycleUndirected(graph, node, parent, visited):
    visited[node] = True
    for nxt in graph[node]:
        if not visited[nxt]:
            if hasCycleUndirected(graph, nxt, node, visited):
                return True
        elif nxt != parent:
            return True  # visited and not parent → cycle
    return False

# Usage (check all components)
def containsCycle(n, graph):
    visited = [False] * n
    for i in range(n):
        if not visited[i]:
            if hasCycleUndirected(graph, i, -1, visited):
                return True
    return False
```

### Dijkstra (Weighted Shortest Path)

Instinct: **Positive weighted graph + shortest path → Dijkstra.**

``` python
import heapq

def dijkstra(n, graph, src):
    dist = [float('inf')] * n
    dist[src] = 0
    pq = [(0, src)]  # (distance, node)

    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue  # already found a shorter path, skip
        for v, w in graph[u]:
            new_dist = dist[u] + w
            if new_dist < dist[v]:
                dist[v] = new_dist
                heapq.heappush(pq, (new_dist, v))
    return dist
```

### Dijkstra Example: Network Delay Time

``` python
def networkDelayTime(times, n, k):
    graph = [[] for _ in range(n + 1)]
    for u, v, w in times:
        graph[u].append((v, w))

    dist = dijkstra(n + 1, graph, k)

    max_dist = max(dist[1:n + 1])
    return -1 if max_dist == float('inf') else max_dist
```

### Shortest Path Selection Guide

``` text
Unweighted graph          → BFS                    O(V+E)
Positive weights          → Dijkstra               O((V+E) log V)
Negative weights (no neg cycle) → Bellman-Ford      O(V·E)
All pairs                 → Floyd-Warshall          O(V³)
DAG                       → Topological Sort + relax O(V+E)
```

### Minimum Spanning Tree (MST) — know the concept

Instinct: **Connect all nodes with minimum total weight → MST.**

### Kruskal (Greedy + Union Find)

``` python
def kruskal(n, edges):
    # edges[i] = [from, to, weight]
    edges.sort(key=lambda e: e[2])
    uf = UnionFind(n)
    total_weight = 0
    edges_used = 0

    for frm, to, w in edges:
        if uf.union(frm, to):
            total_weight += w
            edges_used += 1
            if edges_used == n - 1:
                break

    return -1 if edges_used < n - 1 else total_weight
```

### Prim (Greedy + Priority Queue)

``` python
import heapq

def prim(n, graph):
    visited = [False] * n
    pq = [(0, 0)]  # (cost, node), start from node 0
    total_weight = 0
    nodes_added = 0

    while pq and nodes_added < n:
        cost, u = heapq.heappop(pq)
        if visited[u]:
            continue
        visited[u] = True
        total_weight += cost
        nodes_added += 1

        for v, w in graph[u]:
            if not visited[v]:
                heapq.heappush(pq, (w, v))

    return -1 if nodes_added < n else total_weight
```

### Graph Problem Classification Overview

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

### Keywords to Graph Pattern

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

### Common Mistakes

``` text
✗ BFS marks visited on dequeue → causes duplicate enqueues, TLE
✗ Forgetting to add edges in both directions for undirected graphs
✗ Missing grid bounds checks
✗ Confusing nodes and edges
✗ Using Dijkstra on negative-weight graphs → need Bellman-Ford
✗ Using 3-state for undirected cycle detection → can't distinguish back edge from return path, need parent param
✗ Forgetting to check if graph is connected for MST
```

## 12. Topological Sort --- C+/B-

### Core Concept

`indegree` = number of incoming edges (how many edges point to this node).

Dependency direction:

``` text
A depends on B → edge: B → A → indegree[A]++
"Must finish B before doing A"
```

### Kahn's Algorithm (BFS) Full Python Implementation

``` python
from collections import deque

def topologicalSort(n, prerequisites):
    graph = [[] for _ in range(n)]
    indegree = [0] * n

    for course, prereq in prerequisites:
        graph[prereq].append(course)
        indegree[course] += 1

    queue = deque(i for i in range(n) if indegree[i] == 0)
    order = []

    while queue:
        node = queue.popleft()
        order.append(node)
        for nxt in graph[node]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                queue.append(nxt)

    if len(order) < n:
        return None  # cycle detected
    return order
```

### Course Schedule (can all courses be finished?)

``` python
def canFinish(numCourses, prerequisites):
    return topologicalSort(numCourses, prerequisites) is not None
```

### Keywords to Topological Sort

``` text
prerequisites / dependencies    → Topo Sort
build order / task scheduling   → Topo Sort
detect cycle in directed graph  → Topo Sort (len(order) < n)
```

### Common Mistakes

``` text
✗ Edge direction reversed: A depends on B, edge should be B → A, not A → B
✗ Decrementing wrong node's indegree: should decrement neighbor's, not current node's
✗ Forgetting cycle detection: len(order) < n means a cycle exists
```

## 13. Basic DP --- B

### DP Interview Fixed Process

``` text
1. Define state:  What does dp[i] represent?
2. Choices:       What choices at each step?
3. Transition:    How is dp[i] derived from previous states?
4. Base cases:    Initial values for dp[0], dp[1], etc.
5. Complexity:    Time & Space
6. Optimization:  Can we use O(1) variables instead of an array?
```

### Three DP Types

``` python
# Counting (how many ways?) → addition
dp[i] = dp[i-1] + dp[i-2]                       # Climbing Stairs

# Optimization (min/max?) → min/max
dp[i] = max(dp[i-1], dp[i-2] + nums[i])         # House Robber
dp[i] = min(dp[i-coin] + 1, dp[i])              # Coin Change

# Longest Sequence → max with condition
dp[i] = max(dp[j]+1 for j in range(i) if nums[j] < nums[i])  # LIS
```

### House Robber Full Implementation

``` python
def rob(nums: list[int]) -> int:
    n = len(nums)
    if n == 1:
        return nums[0]

    dp = [0] * n
    dp[0] = nums[0]
    dp[1] = max(nums[0], nums[1])

    for i in range(2, n):
        dp[i] = max(dp[i-1], dp[i-2] + nums[i])
    return dp[n-1]

# Space optimized O(1)
def rob(nums: list[int]) -> int:
    prev2 = prev1 = 0
    for num in nums:
        curr = max(prev1, prev2 + num)
        prev2 = prev1
        prev1 = curr
    return prev1
```

### Coin Change Full Implementation

``` python
def coinChange(coins: list[int], amount: int) -> int:
    dp = [amount + 1] * (amount + 1)
    dp[0] = 0

    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i:
                dp[i] = min(dp[i], dp[i - coin] + 1)

    return -1 if dp[amount] > amount else dp[amount]
```

### Longest Increasing Subsequence

``` python
def lengthOfLIS(nums: list[int]) -> int:
    n = len(nums)
    dp = [1] * n
    result = 1

    for i in range(1, n):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
        result = max(result, dp[i])
    return result
```

### 2D DP: Unique Paths

``` python
def uniquePaths(m: int, n: int) -> int:
    dp = [[1] * n for _ in range(m)]

    for i in range(1, m):
        for j in range(1, n):
            dp[i][j] = dp[i-1][j] + dp[i][j-1]
    return dp[m-1][n-1]
```

### Keywords to DP Pattern

``` text
how many ways              → counting DP (addition)
minimum cost / maximum     → optimization DP (min/max)
longest / shortest seq     → sequence DP
can I reach / is possible  → boolean DP
grid paths                 → 2D DP
```

## 14. 0/1 Knapsack --- B-/C+

### Core Difference

``` text
0/1 Knapsack     → each item used at most once → iterate capacity large to small
Complete Knapsack → each item can be used unlimited → iterate capacity small to large
```

**Why must 0/1 iterate in reverse?** In forward order, `dp[w-weight]` may have already been updated in the current round (including the current item), causing the same item to be used multiple times.

### 0/1 Knapsack Full Implementation

``` python
def knapsack01(weights, values, capacity):
    dp = [0] * (capacity + 1)

    for i in range(len(weights)):
        # Must iterate large to small!
        for w in range(capacity, weights[i] - 1, -1):
            dp[w] = max(dp[w], dp[w - weights[i]] + values[i])
    return dp[capacity]
```

### Complete Knapsack Full Implementation

``` python
def knapsackComplete(weights, values, capacity):
    dp = [0] * (capacity + 1)

    for i in range(len(weights)):
        # Small to large, allows repeated use
        for w in range(weights[i], capacity + 1):
            dp[w] = max(dp[w], dp[w - weights[i]] + values[i])
    return dp[capacity]
```

### Common Variants

``` text
Subset Sum (can we make target?)     → 0/1 Knapsack, dp[w] = bool
Coin Change (fewest coins)           → Complete Knapsack, dp[w] = min coins
Coin Change II (number of combos)    → Complete Knapsack, dp[w] += dp[w-coin]
Partition Equal Subset Sum           → 0/1 Knapsack, target = sum/2
```

## 15. Backtracking --- B-/C+

### Core Mental Model

``` text
current state → choices → choose → recurse → unchoose
```

Core invariant: **the state before entering a branch must be restored when returning from that branch.**

### Subsets

``` python
def subsets(nums: list[int]) -> list[list[int]]:
    result = []

    def backtrack(start, path):
        result.append(path[:])  # must copy

        for i in range(start, len(nums)):
            path.append(nums[i])
            backtrack(i + 1, path)
            path.pop()  # unchoose

    backtrack(0, [])
    return result
```

### Permutations

``` python
def permute(nums: list[int]) -> list[list[int]]:
    result = []
    used = [False] * len(nums)

    def backtrack(path):
        if len(path) == len(nums):
            result.append(path[:])
            return
        for i in range(len(nums)):
            if used[i]:
                continue
            used[i] = True
            path.append(nums[i])
            backtrack(path)
            path.pop()
            used[i] = False

    backtrack([])
    return result
```

### Combination Sum (elements can be reused)

``` python
def combinationSum(candidates: list[int], target: int) -> list[list[int]]:
    result = []
    candidates.sort()

    def backtrack(start, remain, path):
        if remain == 0:
            result.append(path[:])
            return
        for i in range(start, len(candidates)):
            if candidates[i] > remain:
                break
            path.append(candidates[i])
            backtrack(i, remain - candidates[i], path)  # i not i+1, can reuse
            path.pop()

    backtrack(0, target, [])
    return result
```

### Generate Parentheses (Constraint Pruning)

``` python
def generateParenthesis(n: int) -> list[str]:
    result = []

    def backtrack(path, open_count, close_count):
        if len(path) == 2 * n:
            result.append("".join(path))
            return
        if open_count < n:
            path.append('(')
            backtrack(path, open_count + 1, close_count)
            path.pop()
        if close_count < open_count:
            path.append(')')
            backtrack(path, open_count, close_count + 1)
            path.pop()

    backtrack([], 0, 0)
    return result
```

### Keywords to Backtracking

``` text
all subsets / combinations      → Subsets template (start index)
all permutations / arrangements → Permutations template (used array)
generate valid X                → constraint pruning
word search / path finding      → grid backtracking
```

### Python List Pitfall

**Must copy when saving results**, otherwise later modifications affect already-saved results:

``` python
# ✗ Wrong: append path directly (reference)
result.append(path)

# ✓ Correct: make a copy
result.append(path[:])
# or
result.append(list(path))
```

### Common Mistakes

``` text
✗ Misidentifying Generate Parentheses as a Stack problem → it's backtracking + constraint pruning
✗ Not understanding why unchoose is needed → must restore state before the branch to explore other branches
✗ Subsets uses i+1, Combination Sum (reuse) uses i → whether repeated use is allowed
```

## 16. Greedy --- TBD, approx B-/C+

The Stock problem was initially missed due to not reading `buy once / sell once`. After understanding:

``` text
minPrice
maxProfit
```

While scanning:

``` text
profit if selling today = price - minPrice
```

Maintain `minPrice` and `maxProfit`.

``` python
def maxProfit(prices: list[int]) -> int:
    min_price = float('inf')
    max_profit = 0
    for price in prices:
        min_price = min(min_price, price)
        max_profit = max(max_profit, price - min_price)
    return max_profit
```

More precise understanding of Greedy:

> Make a locally optimal choice that can be proven not to hurt the
> global optimum.

## 17. Union Find / DSU --- D

### Core Operations

``` text
find(x)    → which connected component does x belong to (returns root)
union(a,b) → merge two components
```

### Full Python Implementation (Path Compression + Union by Rank)

``` python
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n
        self.count = n  # number of components

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])  # path compression
        return self.parent[x]

    def union(self, x, y):
        px, py = self.find(x), self.find(y)
        if px == py:
            return False  # already connected
        # union by rank
        if self.rank[px] < self.rank[py]:
            px, py = py, px
        self.parent[py] = px
        if self.rank[px] == self.rank[py]:
            self.rank[px] += 1
        self.count -= 1
        return True

    def connected(self, x, y):
        return self.find(x) == self.find(y)
```

### Example: Redundant Connection

``` python
def findRedundantConnection(edges):
    n = len(edges)
    uf = UnionFind(n + 1)
    for a, b in edges:
        if not uf.union(a, b):
            return [a, b]  # already connected → this edge creates cycle
    return []
```

### Keywords to Union Find

``` text
dynamic connectivity / "are A and B connected"  → Union Find
detect cycle in undirected graph                 → Union Find
number of connected components (dynamic edges)   → Union Find
accounts merge / friend circles                  → Union Find
```

### Union Find vs DFS/BFS

| | Union Find | DFS/BFS |
|---|---|---|
| Best for | Dynamic edges, online queries | Static graph, one-time traversal |
| Strength | Merge + query in near O(1) | Full path/component exploration |
| Typical | Redundant Connection | Number of Islands |

### Complexity

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

Window-aligned. Main issue is boundary burst.

### Sliding Window Log --- B+/A-

``` text
userID → [timestamp]
```

For window `(t-60, t]`:

``` text
remove timestamp <= t-60
keep timestamp > t-60
```

Can use binary search upper bound or deque cleanup from head.

``` python
from collections import defaultdict, deque

class SlidingWindowRateLimiter:
    def __init__(self, max_requests, window_seconds):
        self.max_requests = max_requests
        self.window = window_seconds
        self.logs = defaultdict(deque)

    def allow(self, user_id, timestamp):
        log = self.logs[user_id]
        while log and log[0] <= timestamp - self.window:
            log.popleft()
        if len(log) >= self.max_requests:
            return False
        log.append(timestamp)
        return True
```

### Token Bucket --- C+/B-

``` python
class TokenBucket:
    def __init__(self, capacity, refill_rate):
        self.capacity = capacity
        self.refill_rate = refill_rate  # tokens per second
        self.tokens = capacity
        self.last_refill = 0

    def allow(self, timestamp):
        elapsed = timestamp - self.last_refill
        self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_rate)
        self.last_refill = timestamp

        if self.tokens >= 1:
            self.tokens -= 1
            return True
        return False
```

``` text
capacity → maximum burst
refill rate → long-term rate
```

## 19. Final Capability Map

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
