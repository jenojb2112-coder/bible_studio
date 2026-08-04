## 2024-08-04 - Added ARIA labels to Image-background Buttons
**Learning:** Found an accessibility issue pattern in the app's components where transparent "hitzone" buttons placed over background images lack accessible names. Without text content or `aria-label` attributes, screen readers cannot identify the purpose of these interactive elements.
**Action:** Always add `aria-label` attributes to image-background buttons or icon-only buttons (`.hit`, `.eye-toggle`) to ensure they have accessible names for screen reader users.
