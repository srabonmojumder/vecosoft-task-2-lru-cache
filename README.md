# LRU Cache — Task 2: Problem-Solving

A Least Recently Used (LRU) Cache implementation in JavaScript with **O(1) average time complexity** for both `get()` and `put()` operations, plus optional **TTL (Time-To-Live) expiration** support.

## Table of Contents

- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Data Structures Used](#data-structures-used)
- [How LRU Ordering is Maintained](#how-lru-ordering-is-maintained)
- [Time Complexity](#time-complexity)
- [Space Complexity](#space-complexity)
- [TTL / Expiration (Bonus)](#ttl--expiration-bonus)
- [Project Structure](#project-structure)

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ (for built-in test runner)

### Run the Example

```bash
node example.js
```

or

```bash
npm start
```

### Run the Tests

```bash
node --test test/lruCache.test.js
```

or

```bash
npm test
```

---

## API Reference

### `new LRUCache(capacity, defaultTTL?)`

Creates a new LRU Cache.

| Parameter    | Type             | Description                                          |
|-------------|------------------|------------------------------------------------------|
| `capacity`  | `number`         | Maximum number of entries. Must be a positive integer.|
| `defaultTTL`| `number \| null` | Optional. Default TTL in milliseconds for all entries.|

### `cache.get(key)`

Returns the stored value if the key exists and has not expired; otherwise returns `-1`.  
A successful `get()` promotes the key to **most recently used**.

### `cache.put(key, value, ttl?)`

Inserts a new key/value pair or updates an existing one.  
When capacity is exceeded, the **least recently used** entry is evicted.

| Parameter | Type             | Description                                             |
|----------|------------------|---------------------------------------------------------|
| `key`    | `string`         | The cache key.                                          |
| `value`  | `any`            | The value to store.                                     |
| `ttl`    | `number \| null` | Optional per-key TTL in ms. Overrides `defaultTTL`.     |

### `cache.size`

Returns the current number of entries in the cache.

### `cache.toArray()`

Returns cache contents as an array of `{ key, value }` objects, ordered from MRU to LRU. Useful for debugging.

---

## Data Structures Used

### HashMap (`Map`) + Doubly-Linked List

The LRU Cache uses a combination of two data structures to achieve O(1) time complexity:

```
HashMap (Map)                   Doubly-Linked List
┌──────────────────┐           ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐
│ "A" → Node(A,10) │──────────▸│ HEAD │◄──▸│ A:10 │◄──▸│ B:20 │◄──▸│ TAIL │
│ "B" → Node(B,20) │──────┐   │(sent)│    │(MRU) │    │(LRU) │    │(sent)│
└──────────────────┘      │   └──────┘    └──────┘    └──────┘    └──────┘
                          └───────────────────────────────────┘
```

**Why these data structures?**

| Data Structure      | Purpose                                   | Key Benefit                            |
|---------------------|-------------------------------------------|----------------------------------------|
| `Map` (HashMap)     | Key → Node lookup                         | O(1) access by key                     |
| Doubly-Linked List  | Ordering by recency (MRU ↔ LRU)          | O(1) insert/remove at any position     |
| Sentinel Nodes      | Dummy head & tail                         | Eliminates null-check edge cases       |

**Why not a singly-linked list?**  
A singly-linked list requires O(n) to remove a node from the middle (you need the previous node's reference). A doubly-linked list stores both `prev` and `next` pointers, enabling O(1) removal from any position.

**Why not just an array?**  
Removing an element from the middle of an array is O(n) due to shifting. A linked list avoids this.

---

## How LRU Ordering is Maintained

1. **Most Recently Used (MRU)** entries are at the **head** of the linked list.
2. **Least Recently Used (LRU)** entries are at the **tail**.
3. On every `get()` or `put()` (including updates), the accessed node is **moved to the head**.
4. When eviction is needed, the node **right before the tail** sentinel is removed — this is always the LRU entry.

### Step-by-step example:

```
cache = Cache(2)

put("A", 10):  HEAD ↔ A:10 ↔ TAIL

put("B", 20):  HEAD ↔ B:20 ↔ A:10 ↔ TAIL

get("A"):      HEAD ↔ A:10 ↔ B:20 ↔ TAIL     ← A promoted to MRU

put("C", 30):  Evict B (LRU, right before TAIL)
               HEAD ↔ C:30 ↔ A:10 ↔ TAIL

get("B"):      -1 (evicted)

get("C"):      HEAD ↔ C:30 ↔ A:10 ↔ TAIL     ← C promoted (already MRU)
               Returns 30

get("A"):      HEAD ↔ A:10 ↔ C:30 ↔ TAIL     ← A promoted to MRU
               Returns 10
```

---

## Time Complexity

| Operation | Time Complexity | Explanation                                                  |
|-----------|:--------------:|--------------------------------------------------------------|
| `get()`   | **O(1)**       | Map lookup O(1) + linked list move-to-head O(1)              |
| `put()`   | **O(1)**       | Map lookup O(1) + linked list insert/remove O(1)             |

All internal operations (`_addToHead`, `_removeNode`, `_moveToHead`, `_evictLRU`) run in constant time because they only manipulate a fixed number of pointer references.

---

## Space Complexity

| Component         | Space         |
|-------------------|:-------------:|
| HashMap (`Map`)   | O(n)          |
| Linked List nodes | O(n)          |
| **Total**         | **O(n)**      |

Where `n` = cache capacity. Each entry is stored once in the Map (as a key-value pair) and once in the linked list (as a Node), so the space is proportional to the capacity.

---

## TTL / Expiration (Bonus)

### Feature Overview

The cache supports optional **Time-To-Live (TTL)** expiration at two levels:

1. **Default TTL**: Set via the constructor — applies to all entries unless overridden.
2. **Per-key TTL**: Set via `put(key, value, ttl)` — overrides the default for that specific entry.

### Expiration Strategy: Lazy Deletion

Expired entries are **not removed proactively** (no background timers or sweeps). Instead, expiration is checked **lazily** during `get()`:

```
get(key):
  1. Look up key in Map
  2. If found, check if node.expiresAt < Date.now()
  3. If expired → remove from Map and list → return -1
  4. If valid → move to head → return value
```

### Trade-offs

| Aspect                  | Lazy Deletion                                      | Active Deletion (alternative)                  |
|-------------------------|----------------------------------------------------|-------------------------------------------------|
| **Implementation**      | Simple — no background timers                      | Complex — requires setTimeout or intervals      |
| **Memory**              | Expired entries remain until accessed               | Entries removed immediately on expiry            |
| **CPU**                 | No background processing                           | Background processing for cleanup                |
| **get/put Latency**     | O(1) — single expiration check                     | O(1) for operations, but cleanup adds overhead   |
| **Best for**            | Caches with frequent access patterns                | Caches where memory is very constrained          |

**Why lazy deletion was chosen:**
- Keeps O(1) complexity without hidden costs
- Simpler implementation, no dependency on timers
- Memory impact is minimal for reasonably sized caches
- Expired entries are cleaned up naturally as they're accessed

### Usage Example

```javascript
const { LRUCache } = require("./src/LRUCache");

// Default TTL of 5 seconds for all entries
const cache = new LRUCache(100, 5000);

// This entry uses the default 5s TTL
cache.put("session", "abc123");

// This entry has a custom 30s TTL
cache.put("token", "xyz789", 30000);

// This entry never expires (no TTL)
cache.put("config", "dark-mode", null);
```

---

## Project Structure

```
lru-cache/
├── src/
│   └── LRUCache.js          # Core implementation (LRUCache + Node classes)
├── test/
│   └── lruCache.test.js      # Unit tests (Node.js built-in test runner)
├── example.js                 # Runnable demo with formatted output
├── package.json               # Project configuration
└── README.md                  # This file
```

---

## License

MIT
