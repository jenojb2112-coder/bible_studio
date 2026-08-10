## 2026-08-04 - Screen Reader Support for Transparent Hitzone UI
**Learning:** The application implements interactive elements (buttons and inputs) as transparent 'hitzone' overlays over background images. Since these `<button>` elements contain no text or icons, they are completely invisible to screen readers, causing a severe accessibility issue where users don't know what the buttons do.
**Action:** Always ensure transparent hitzone elements have explicit `aria-label` attributes assigned to describe their function (e.g., `aria-label="Sign In"`).

## 2026-08-05 - Keyboard Accessibility for Transparent Hitzone UI
**Learning:** The application implements interactive elements (buttons and inputs) as transparent 'hitzone' overlays over background images. These elements lack default focus indicators, making it impossible for keyboard users (like those using Tab to navigate) to know which element is currently focused.
**Action:** Always ensure transparent hitzone elements have explicit `:focus-visible` styles (e.g., `outline: 2px solid #c9a15a`) to provide visual feedback for keyboard navigation without affecting mouse clicks.

## 2024-05-18 - Enter-to-Submit Accessibility
**Learning:** Custom transparent input overlays often lack form wrapping, meaning users cannot hit 'Enter' to submit, breaking standard keyboard UX.
**Action:** Always add onkeydown listeners to inputs or wrap them in semantic form tags when building custom transparent hitzones.
## 2026-08-06 - Improve text contrast for input overlays
**Learning:** When input fields are overlaid on background images, using a distinct, high-contrast text color (like gold #e8c876) and hiding placeholder helps user-typed text stand out clearly against both dark backgrounds and baked-in placeholder text.
**Action:** Ensure custom text color is used for inputs positioned over background images.
## 2024-05-24 - Add ARIA live regions to dynamic overlays
**Learning:** JS-driven UI overlays like toast messages and loaders are invisible to screen readers without ARIA roles. Using `role="alert" aria-live="assertive"` for messages and `role="status" aria-live="polite"` for loaders ensures they are announced appropriately.
**Action:** Always add ARIA roles to dynamic overlays and loaders in applications to ensure screen reader accessibility.
## 2024-08-10 - Dynamic aria-label and title for stateful toggle buttons
**Learning:** Stateful toggle buttons (like password visibility) with static labels (e.g. "Toggle password visibility") provide insufficient context for screen reader and mouse users.
**Action:** Always dynamically update `aria-label` and `title` attributes within the JavaScript event handler that alters the visual state to ensure accurate context (e.g., "Show password" vs "Hide password"). Additionally, apply `aria-hidden="true"` to internal decorative SVGs to prevent redundant announcements.
