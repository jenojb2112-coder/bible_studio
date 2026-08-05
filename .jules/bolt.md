## 2024-05-24 - DOM Traversal Optimization for UI Routing
**Learning:** In a single-page application using class toggling for routing (e.g., `goTo(id)`), calling `document.querySelectorAll('.screen')` on every route change is an inefficient O(N) DOM operation.
**Action:** Caching the active screen in a local variable (e.g., `_activeScreen`) reduces the DOM traversal and class manipulation, yielding measurable performance improvements (e.g., ~60% faster transitions). Always track the active element state locally when frequently toggling single-active elements.
## 2023-10-25 - Cache repeatedly accessed DOM element immediately
**Learning:** For script blocks executing after the DOM is fully parsed (such as `<script type="module">` at the end of the `<body>`), DOM elements can safely be queried and cached in module-level variables immediately, removing the need for a lazy-loading branch (`var = var || getElementById`) inside frequently called functions.
**Action:** Identify performance-critical DOM interactions that lazily query `getElementById` on every invocation, and refactor them to store the element in a module-scoped variable to avoid unnecessary layout or tree access latency.
## 2024-05-24 - Prevent DOM repaints on duplicate route navigation
**Learning:** In a single-page application that uses DOM class toggling (e.g., removing and adding 'active' classes) for routing, calling the navigation function with the already active route ID causes unnecessary DOM manipulations and repaints.
**Action:** Add an early return condition (`if(_activeScreen && _activeScreen.id === id) return;`) at the beginning of the navigation function to bail out early if the target route is already active, preventing inefficient DOM traversal and repaints.
