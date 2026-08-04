## 2024-08-03 - Accessible Transparent Hitboxes
**Learning:** Using absolutely positioned transparent buttons (hitboxes) over a single background image entirely breaks accessibility for screen readers because the buttons have no text or visual label in the DOM.
**Action:** Always ensure that descriptive `aria-label`s are explicitly added to such invisible hitbox elements so that screen reader users can understand and interact with them.
