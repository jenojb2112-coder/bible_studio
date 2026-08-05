## 2026-08-04 - Screen Reader Support for Transparent Hitzone UI
**Learning:** The application implements interactive elements (buttons and inputs) as transparent 'hitzone' overlays over background images. Since these `<button>` elements contain no text or icons, they are completely invisible to screen readers, causing a severe accessibility issue where users don't know what the buttons do.
**Action:** Always ensure transparent hitzone elements have explicit `aria-label` attributes assigned to describe their function (e.g., `aria-label="Sign In"`).

## 2024-05-24 - Keyboard Accessibility for Transparent Hitzone UI
**Learning:** The application implements interactive elements as transparent 'hitzone' overlays over background images. Their default browser outlines are typically hidden by the underlying structure, making keyboard navigation difficult.
**Action:** Always implement explicit `:focus-visible` CSS rules (e.g., `outline: 2px solid #c9a15a !important`) for transparent hitzone elements.
