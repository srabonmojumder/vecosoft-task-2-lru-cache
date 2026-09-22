const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { LRUCache } = require("../src/LRUCache");

// ─── Basic Functionality ────────────────────────────────────────────────────

describe("LRU Cache — Basic Operations", () => {
  it("should return -1 for a key not in the cache", () => {
    const cache = new LRUCache(2);
    assert.strictEqual(cache.get("X"), -1);
  });

  it("should store and retrieve a value", () => {
    const cache = new LRUCache(2);
    cache.put("A", 10);
    assert.strictEqual(cache.get("A"), 10);
  });

  it("should update an existing key's value", () => {
    const cache = new LRUCache(2);
    cache.put("A", 10);
    cache.put("A", 99);
    assert.strictEqual(cache.get("A"), 99);
    assert.strictEqual(cache.size, 1);
  });

  it("should handle the exact assessment example", () => {
    const cache = new LRUCache(2);

    cache.put("A", 10);
    cache.put("B", 20);
    assert.strictEqual(cache.get("A"), 10); // A exists → 10, A is now MRU

    cache.put("C", 30); // Capacity exceeded → evict LRU (B)
    assert.strictEqual(cache.get("B"), -1); // B was evicted → -1
    assert.strictEqual(cache.get("C"), 30); // C exists → 30
    assert.strictEqual(cache.get("A"), 10); // A exists → 10
  });
});

// ─── Eviction ───────────────────────────────────────────────────────────────

describe("LRU Cache — Eviction", () => {
  it("should evict the least recently used entry when capacity is exceeded", () => {
    const cache = new LRUCache(3);
    cache.put("A", 1);
    cache.put("B", 2);
    cache.put("C", 3);

    // Access A to make it recently used; B is now LRU
    cache.get("A");

    cache.put("D", 4); // Evicts B (LRU)
    assert.strictEqual(cache.get("B"), -1);
    assert.strictEqual(cache.get("A"), 1);
    assert.strictEqual(cache.get("C"), 3);
    assert.strictEqual(cache.get("D"), 4);
  });

  it("should evict correctly with capacity of 1", () => {
    const cache = new LRUCache(1);
    cache.put("A", 1);
    assert.strictEqual(cache.get("A"), 1);

    cache.put("B", 2); // Evicts A
    assert.strictEqual(cache.get("A"), -1);
    assert.strictEqual(cache.get("B"), 2);
  });

  it("should update an existing key without eviction", () => {
    const cache = new LRUCache(2);
    cache.put("A", 1);
    cache.put("B", 2);
    cache.put("A", 100); // Update, NOT a new entry → no eviction
    assert.strictEqual(cache.size, 2);
    assert.strictEqual(cache.get("A"), 100);
    assert.strictEqual(cache.get("B"), 2);
  });
});

// ─── LRU Ordering ───────────────────────────────────────────────────────────

describe("LRU Cache — Ordering", () => {
  it("should maintain MRU→LRU order via toArray()", () => {
    const cache = new LRUCache(3);
    cache.put("A", 1);
    cache.put("B", 2);
    cache.put("C", 3);

    // Order: C (MRU) → B → A (LRU)
    let order = cache.toArray().map((n) => n.key);
    assert.deepStrictEqual(order, ["C", "B", "A"]);

    // Access A → becomes MRU
    cache.get("A");
    order = cache.toArray().map((n) => n.key);
    assert.deepStrictEqual(order, ["A", "C", "B"]);
  });

  it("should promote on put() update", () => {
    const cache = new LRUCache(3);
    cache.put("A", 1);
    cache.put("B", 2);
    cache.put("C", 3);

    cache.put("A", 99); // Update A → becomes MRU
    const order = cache.toArray().map((n) => n.key);
    assert.deepStrictEqual(order, ["A", "C", "B"]);
  });
});

// ─── Edge Cases ─────────────────────────────────────────────────────────────

describe("LRU Cache — Edge Cases", () => {
  it("should throw for capacity of 0", () => {
    assert.throws(() => new LRUCache(0), {
      message: /Capacity must be a positive integer/,
    });
  });

  it("should throw for negative capacity", () => {
    assert.throws(() => new LRUCache(-5), {
      message: /Capacity must be a positive integer/,
    });
  });

  it("should throw for non-integer capacity", () => {
    assert.throws(() => new LRUCache(2.5), {
      message: /Capacity must be a positive integer/,
    });
  });

  it("should handle large number of operations", () => {
    const cache = new LRUCache(100);
    for (let i = 0; i < 1000; i++) {
      cache.put(`key${i}`, i);
    }
    // Only the last 100 should remain
    assert.strictEqual(cache.size, 100);
    assert.strictEqual(cache.get("key999"), 999);
    assert.strictEqual(cache.get("key900"), 900);
    assert.strictEqual(cache.get("key899"), -1); // Evicted
  });
});

// ─── TTL / Expiration (Bonus) ───────────────────────────────────────────────

describe("LRU Cache — TTL / Expiration (Bonus)", () => {
  it("should expire an entry after its TTL", async () => {
    const cache = new LRUCache(2);
    cache.put("A", 10, 50); // 50ms TTL
    assert.strictEqual(cache.get("A"), 10); // Immediately: still valid

    await sleep(80);
    assert.strictEqual(cache.get("A"), -1); // Expired
  });

  it("should not expire entries without TTL", async () => {
    const cache = new LRUCache(2);
    cache.put("A", 10); // No TTL
    cache.put("B", 20, 50); // 50ms TTL

    await sleep(80);
    assert.strictEqual(cache.get("A"), 10); // No TTL → still valid
    assert.strictEqual(cache.get("B"), -1); // TTL expired
  });

  it("should use defaultTTL when no per-key TTL is provided", async () => {
    const cache = new LRUCache(2, 50); // 50ms default TTL
    cache.put("A", 10);

    await sleep(80);
    assert.strictEqual(cache.get("A"), -1); // Expired via default TTL
  });

  it("should allow per-key TTL to override defaultTTL", async () => {
    const cache = new LRUCache(2, 50); // 50ms default
    cache.put("A", 10); // Uses default 50ms
    cache.put("B", 20, 200); // Override: 200ms

    await sleep(80);
    assert.strictEqual(cache.get("A"), -1); // Default TTL expired
    assert.strictEqual(cache.get("B"), 20); // Per-key TTL still valid
  });

  it("should not count expired entries toward capacity for eviction", async () => {
    const cache = new LRUCache(2);
    cache.put("A", 10, 50); // 50ms TTL
    cache.put("B", 20);

    await sleep(80);
    // A is expired. Accessing it should return -1 and remove it.
    assert.strictEqual(cache.get("A"), -1);

    // Now cache has only B. We can add C without evicting B.
    cache.put("C", 30);
    assert.strictEqual(cache.get("B"), 20);
    assert.strictEqual(cache.get("C"), 30);
  });
});

// ─── Helper ─────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
