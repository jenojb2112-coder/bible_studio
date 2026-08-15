## 2024-05-24 - DOM Traversal Optimization for UI Routing
**Learning:** In a single-page application using class toggling for routing (e.g., `goTo(id)`), calling `document.querySelectorAll('.screen')` on every route change is an inefficient O(N) DOM operation.
**Action:** Caching the active screen in a local variable (e.g., `_activeScreen`) reduces the DOM traversal and class manipulation, yielding measurable performance improvements (e.g., ~60% faster transitions). Always track the active element state locally when frequently toggling single-active elements.
## 2023-10-25 - Cache repeatedly accessed DOM element immediately
**Learning:** For script blocks executing after the DOM is fully parsed (such as `<script type="module">` at the end of the `<body>`), DOM elements can safely be queried and cached in module-level variables immediately, removing the need for a lazy-loading branch (`var = var || getElementById`) inside frequently called functions.
**Action:** Identify performance-critical DOM interactions that lazily query `getElementById` on every invocation, and refactor them to store the element in a module-scoped variable to avoid unnecessary layout or tree access latency.
## 2024-05-24 - Prevent DOM repaints on duplicate route navigation
**Learning:** In a single-page application that uses DOM class toggling (e.g., removing and adding 'active' classes) for routing, calling the navigation function with the already active route ID causes unnecessary DOM manipulations and repaints.
**Action:** Add an early return condition (`if(_activeScreen && _activeScreen.id === id) return;`) at the beginning of the navigation function to bail out early if the target route is already active, preventing inefficient DOM traversal and repaints.

## 2024-05-24 - DOM Query Optimization in Form Submission
**Learning:** Repeatedly calling `document.getElementById` within form submission or event handler functions (like `saveChurchInfo`) adds unnecessary DOM traversal overhead. Since the elements are statically defined in the HTML and parsed before the module script runs, they can safely be queried once.
**Action:** Extract repeated `document.getElementById` calls from frequently executed functions (like form handlers) and cache them as module-level constants to improve execution speed and reduce main thread blocking.
## 2024-05-24 - LCP and Off-screen Image Optimization
**Learning:** Missing resource preloading for critical above-the-fold assets (like splash logos and initial backgrounds) delays the Largest Contentful Paint (LCP). Conversely, loading off-screen images (like backgrounds for hidden screens) eagerly consumes unnecessary bandwidth and delays critical resources.
**Action:** Always add `<link rel="preload" as="image">` for critical above-the-fold images to improve perceived load time, and add `loading="lazy"` to `<img ...>` tags for off-screen or below-the-fold images to defer their loading.
## 2024-08-10 - Cache DOM Queries

**Learning:** Repeatedly querying the DOM using `document.getElementById` for elements that don't change (like static input fields) is inefficient, especially when those inputs are accessed across multiple user interactions (signup, signin, toggle pass, etc.).

**Action:** Cache these DOM elements in global variables (e.g., `let _loginEmailEl = null;`) upon their first access, and reuse the cached reference for subsequent actions. This reduces unnecessary DOM traversals.

## 2026-08-15 - Resource Preconnection for External Modules
**Learning:** Relying on ES module imports in the body to initiate connections to external domains (like gstatic.com) delays module fetching due to DNS, TCP, and TLS overhead.
**Action:** Always include <link rel="preconnect"> in the document head for critical external domains (especially those hosting essential scripts like Firebase) to parallelize connection setup with initial HTML parsing.
