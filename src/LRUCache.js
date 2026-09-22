/**
 * Node in a doubly-linked list.
 * Stores key (needed for eviction to remove from Map), value,
 * pointers to previous/next nodes, and optional expiration timestamp.
 */
class Node {
  constructor(key, value, ttl = null) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
    // If TTL is provided (in milliseconds), record when this entry expires
    this.expiresAt = ttl !== null ? Date.now() + ttl : null;
  }

  /**
   * Check whether this node's TTL has expired.
   * Returns false if no TTL was set.
   */
  isExpired() {
    return this.expiresAt !== null && Date.now() > this.expiresAt;
  }
}

/**
 * LRU Cache implementation using a HashMap (Map) + Doubly-Linked List.
 *
 * ┌──────────────────┐       Doubly-Linked List (MRU ↔ LRU)
 * │   Map             │      ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐
 * │  key → Node ref   │─────▸│ HEAD │◄─▸│ MRU  │◄─▸│ LRU  │◄─▸│ TAIL │
 * └──────────────────┘      │(sent)│   │      │   │      │   │(sent)│
 *                            └──────┘   └──────┘   └──────┘   └──────┘
 *
 * - Map provides O(1) lookup by key.
 * - Doubly-linked list provides O(1) insertion/removal at any position.
 * - Sentinel head/tail nodes eliminate null-check edge cases.
 * - Most Recently Used (MRU) is right after head.
 * - Least Recently Used (LRU) is right before tail.
 */
class LRUCache {
  /**
   * Create an LRU Cache.
   * @param {number} capacity - Maximum number of entries (must be positive).
   * @param {number|null} defaultTTL - Optional default TTL in milliseconds for all entries.
   */
  constructor(capacity, defaultTTL = null) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new Error(`Capacity must be a positive integer, got: ${capacity}`);
    }

    this.capacity = capacity;
    this.defaultTTL = defaultTTL;
    this.map = new Map();

    // Sentinel nodes — never hold real data, simplify edge-case handling
    this.head = new Node(null, null); // dummy head
    this.tail = new Node(null, null); // dummy tail
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  /**
   * Get the value associated with the key.
   * On a cache hit, the key becomes the most recently used.
   *
   * Time complexity: O(1)
   *
   * @param {string} key
   * @returns {*} The stored value, or -1 if not found / expired.
   */
  get(key) {
    const node = this.map.get(key);

    if (!node) {
      return -1;
    }

    // Lazy expiration: check if the entry has expired
    if (node.isExpired()) {
      this._removeNode(node);
      this.map.delete(key);
      return -1;
    }

    // Move to head (most recently used)
    this._moveToHead(node);
    return node.value;
  }

  /**
   * Insert or update a key/value pair.
   * If the key already exists, update its value and promote to MRU.
   * If inserting and at capacity, evict the LRU entry first.
   *
   * Time complexity: O(1)
   *
   * @param {string} key
   * @param {*} value
   * @param {number|null} ttl - Optional per-key TTL in ms (overrides defaultTTL).
   */
  put(key, value, ttl = undefined) {
    const effectiveTTL = ttl !== undefined ? ttl : this.defaultTTL;
    const existingNode = this.map.get(key);

    if (existingNode) {
      // Update existing entry
      existingNode.value = value;
      existingNode.expiresAt =
        effectiveTTL !== null ? Date.now() + effectiveTTL : null;
      this._moveToHead(existingNode);
      return;
    }

    // Create new node
    const newNode = new Node(key, value, effectiveTTL);

    // Evict if at capacity
    if (this.map.size >= this.capacity) {
      this._evictLRU();
    }

    // Insert at head (most recently used)
    this._addToHead(newNode);
    this.map.set(key, newNode);
  }

  /**
   * Return the current number of entries in the cache.
   * @returns {number}
   */
  get size() {
    return this.map.size;
  }

  /**
   * Return cache contents as an array from MRU to LRU.
   * Useful for debugging and testing.
   * @returns {Array<{key: string, value: *}>}
   */
  toArray() {
    const result = [];
    let current = this.head.next;
    while (current !== this.tail) {
      if (!current.isExpired()) {
        result.push({ key: current.key, value: current.value });
      }
      current = current.next;
    }
    return result;
  }

  // ─── Internal helpers ──────────────────────────────────────────────

  /**
   * Add a node right after the head sentinel (MRU position).
   * @param {Node} node
   * @private
   */
  _addToHead(node) {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next.prev = node;
    this.head.next = node;
  }

  /**
   * Remove a node from its current position in the list.
   * @param {Node} node
   * @private
   */
  _removeNode(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
    node.prev = null;
    node.next = null;
  }

  /**
   * Move an existing node to the head (MRU position).
   * @param {Node} node
   * @private
   */
  _moveToHead(node) {
    this._removeNode(node);
    this._addToHead(node);
  }

  /**
   * Evict the least recently used entry (node right before tail sentinel).
   * @private
   */
  _evictLRU() {
    const lruNode = this.tail.prev;
    if (lruNode === this.head) {
      return; // Cache is empty, nothing to evict
    }
    this._removeNode(lruNode);
    this.map.delete(lruNode.key);
  }
}

module.exports = { LRUCache, Node };
