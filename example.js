/**
 * example.js — Runnable demo of the LRU Cache
 *
 * Run with:  node example.js
 *
 * Reproduces the exact assessment example plus demonstrates TTL/expiration.
 */

const { LRUCache } = require("./src/LRUCache");

// ─── Helper to format output ────────────────────────────────────────────────

function logOperation(operation, result) {
  if (result !== undefined) {
    console.log(`  ${operation.padEnd(30)} -> ${result}`);
  } else {
    console.log(`  ${operation}`);
  }
}

function printCacheState(cache) {
  const entries = cache.toArray();
  const items = entries.map((e) => `${e.key}:${e.value}`).join(" → ");
  console.log(`  Cache state (MRU→LRU): [${items}]  (size: ${cache.size}/${cache.capacity})`);
}

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE 1: Assessment Example (Exact)
// ═══════════════════════════════════════════════════════════════════════════

console.log("═".repeat(60));
console.log("  EXAMPLE 1: Assessment Example (Exact)");
console.log("═".repeat(60));
console.log();

const cache = new LRUCache(2);
logOperation("cache = Cache(2)");
printCacheState(cache);
console.log();

cache.put("A", 10);
logOperation('cache.put("A", 10)');
printCacheState(cache);
console.log();

cache.put("B", 20);
logOperation('cache.put("B", 20)');
printCacheState(cache);
console.log();

let result;

result = cache.get("A");
logOperation('cache.get("A")', result); // -> 10
printCacheState(cache);
console.log();

cache.put("C", 30);
logOperation('cache.put("C", 30)', "evicts B (LRU)");
printCacheState(cache);
console.log();

result = cache.get("B");
logOperation('cache.get("B")', result); // -> -1
printCacheState(cache);
console.log();

result = cache.get("C");
logOperation('cache.get("C")', result); // -> 30
printCacheState(cache);
console.log();

result = cache.get("A");
logOperation('cache.get("A")', result); // -> 10
printCacheState(cache);
console.log();

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE 2: Update Existing Key
// ═══════════════════════════════════════════════════════════════════════════

console.log("═".repeat(60));
console.log("  EXAMPLE 2: Update Existing Key");
console.log("═".repeat(60));
console.log();

const cache2 = new LRUCache(2);
cache2.put("X", 100);
cache2.put("Y", 200);
logOperation("cache.put(\"X\", 100)");
logOperation("cache.put(\"Y\", 200)");
printCacheState(cache2);
console.log();

cache2.put("X", 999);
logOperation('cache.put("X", 999)', "update value, X becomes MRU");
printCacheState(cache2);
console.log();

cache2.put("Z", 300);
logOperation('cache.put("Z", 300)', "evicts Y (LRU), not X");
printCacheState(cache2);
console.log();

result = cache2.get("Y");
logOperation('cache.get("Y")', result); // -> -1 (evicted)

result = cache2.get("X");
logOperation('cache.get("X")', result); // -> 999 (still present)

result = cache2.get("Z");
logOperation('cache.get("Z")', result); // -> 300
console.log();

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE 3: TTL / Expiration (Bonus Feature)
// ═══════════════════════════════════════════════════════════════════════════

console.log("═".repeat(60));
console.log("  EXAMPLE 3: TTL / Expiration (Bonus Feature)");
console.log("═".repeat(60));
console.log();

async function ttlDemo() {
  const cache3 = new LRUCache(3);

  cache3.put("session", "abc123", 100); // Expires in 100ms
  cache3.put("token", "xyz789", 500);   // Expires in 500ms
  cache3.put("config", "dark-mode");    // No TTL — never expires

  logOperation('cache.put("session", "abc123", 100ms TTL)');
  logOperation('cache.put("token", "xyz789", 500ms TTL)');
  logOperation('cache.put("config", "dark-mode", no TTL)');
  printCacheState(cache3);
  console.log();

  // Immediately: all are valid
  console.log("  --- Immediately after put ---");
  logOperation('cache.get("session")', cache3.get("session")); // -> abc123
  logOperation('cache.get("token")', cache3.get("token"));     // -> xyz789
  logOperation('cache.get("config")', cache3.get("config"));   // -> dark-mode
  console.log();

  // Wait 150ms: session should expire, token and config still valid
  await new Promise((resolve) => setTimeout(resolve, 150));
  console.log("  --- After 150ms ---");
  logOperation('cache.get("session")', cache3.get("session")); // -> -1 (expired)
  logOperation('cache.get("token")', cache3.get("token"));     // -> xyz789
  logOperation('cache.get("config")', cache3.get("config"));   // -> dark-mode
  console.log();

  // Wait another 400ms (550ms total): token should also expire
  await new Promise((resolve) => setTimeout(resolve, 400));
  console.log("  --- After 550ms total ---");
  logOperation('cache.get("session")', cache3.get("session")); // -> -1 (expired)
  logOperation('cache.get("token")', cache3.get("token"));     // -> -1 (expired)
  logOperation('cache.get("config")', cache3.get("config"));   // -> dark-mode (no TTL)
  printCacheState(cache3);
  console.log();

  console.log("═".repeat(60));
  console.log("  All examples completed successfully!");
  console.log("═".repeat(60));
}

ttlDemo();
