1. **Identify the UX/Accessibility issue:** Many icon-only buttons (like delete '🗑', close '✕', move up '▲', move down '▼', move left '◄', move right '►', and reset '↺') are lacking `aria-label` and `title` attributes. This makes them inaccessible to screen readers and lacking tooltips for mouse users.
2. **Apply fixes:** Add `aria-label` and `title` attributes to these icon-only buttons in `index-html`.
3. **Verify:** Check that the buttons now have the correct attributes.
4. **Update Journal:** Add an entry to `.jules/palette.md` for this UX/accessibility improvement, but only if it matches the criteria for "CRITICAL LEARNINGS ONLY" (the prompt says: `Add ARIA labels to icon-only buttons` is "PALETTE'S FAVORITE ENHANCEMENTS", but `DO NOT journal routine work like: - "Added ARIA label to button"`). So I won't add a journal entry for this routine work.
5. **Pre-commit:** Run `pre_commit_instructions`.
6. **Submit:** Submit the PR.
