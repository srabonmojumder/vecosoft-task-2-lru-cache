# AI Prompt History — Practical Assessment

**Candidate:** Srabon Mozumder  
**Assessment:** Frontend Developer Practical Assessment — Vecosoft  
**AI Tools Used:** Google Antigravity IDE (Gemini 3.8 / Claude Opus)  

---

## Task 1: Order Tracking Screen

### Prompt 1: Initial Architecture & Screen Recreation
> "Please analyze the provided Order Tracking Screen mockups and specifications. Recreate the complete frontend interface including:
> - Order Header (Order ID, Status badge, Timestamp, Tracking Number)
> - Progress Stepper / Timeline (Ordered, Processing, Shipped, Delivered) with appropriate active/completed states
> - Delivery Estimate and Courier details card
> - Order Items table/list with product thumbnails, quantities, pricing, and total calculations
> - Shipping and Billing Address cards
> - Responsive layout matching the visual hierarchy and color palette."

### Prompt 2: Modern Polish & Interactive Animations
> "Enhance the Order Tracking application with modern UI patterns and smooth micro-interactions:
> - Add subtle CSS transitions to the status timeline steps
> - Improve card elevation, hover states, and glassmorphism styling
> - Ensure seamless mobile responsiveness and clean typography
> - Structure components into reusable units (`OrderStatusCard`, `OrderTimeline`, `OrderItemsList`)."

### Prompt 3: Production Codebase & Git Version Control
> "Structure the project for production readiness:
> - Ensure clean, descriptive Git commit history documenting the incremental development of components
> - Avoid conventional prefix noise and maintain standard developer commit messages
> - Provide clear local setup and run instructions in the README."

---

## Task 2: LRU Cache / Problem-Solving

### Prompt 1: Core LRU Cache Implementation (O(1) Constraints)
> "Implement a Least Recently Used (LRU) Cache data structure adhering to the assessment requirements:
> - `Cache(capacity)`: Initialize with a positive integer capacity.
> - `get(key)`: Return the stored value if present (promoting the key to Most Recently Used); return `-1` if not found.
> - `put(key, value)`: Insert or update the key-value pair. When capacity is exceeded, evict the least recently used item.
> - Ensure strict O(1) average time complexity for both `get()` and `put()` operations using a HashMap combined with a Doubly-Linked List."

### Prompt 2: TTL Expiration Support (Bonus Feature)
> "Extend the LRU Cache with Time-To-Live (TTL) / expiration support:
> - Support an optional TTL parameter per key (`put(key, value, ttl)`) as well as a default cache-level TTL.
> - Implement a clean lazy deletion strategy to preserve O(1) time complexity without timer overhead.
> - If an expired key is requested via `get()`, remove it and return `-1`."

### Prompt 3: Unit Testing & Verification
> "Develop a comprehensive automated test suite and runnable demo script:
> - Reproduce the exact test sequence from the assessment problem statement.
> - Verify edge cases: capacity of 1, invalid inputs, eviction order, key updates, and TTL expirations.
> - Output formatted terminal logs showing actual cache state transitions (MRU to LRU) for verification."

### Prompt 4: Documentation & Visual Output
> "Generate a complete `README.md` explaining:
> - Choice of data structures (HashMap + Doubly-Linked List) and why alternatives like arrays are insufficient.
> - Step-by-step diagram of how MRU/LRU ordering is maintained.
> - Time and space complexity analysis.
> - Discussion of TTL expiration design trade-offs (Lazy vs. Active cleanup).
> - Render a clean terminal output capture demonstrating all operations and passing test cases."
