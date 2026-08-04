## 2024-08-04 - Caching Active DOM Elements
**Learning:** The application routing relies heavily on toggling an `active` class on `.screen` elements. The original implementation used `document.querySelectorAll` across the entire document for every route change.
**Action:** Always look for opportunities to cache active state locally (e.g., `_activeScreen`) when dealing with frequent DOM querying, especially for application-level routing mechanics.
