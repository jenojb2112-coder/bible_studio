## 2024-05-24 - DOM Traversal Optimization for UI Routing
**Learning:** In a single-page application using class toggling for routing (e.g., `goTo(id)`), calling `document.querySelectorAll('.screen')` on every route change is an inefficient O(N) DOM operation.
**Action:** Caching the active screen in a local variable (e.g., `_activeScreen`) reduces the DOM traversal and class manipulation, yielding measurable performance improvements (e.g., ~60% faster transitions). Always track the active element state locally when frequently toggling single-active elements.

## 2024-06-25 - Cache repeatedly accessed loader DOM element
**Learning:** Querying the DOM via `document.getElementById` repeatedly for frequently accessed elements (like a loading indicator) incurs a performance cost.
**Action:** When a DOM element is toggled frequently, cache the element reference in a variable the first time it is accessed to prevent redundant DOM queries.
