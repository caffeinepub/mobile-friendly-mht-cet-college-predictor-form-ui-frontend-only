# Specification

## Summary
**Goal:** Add the uploaded banner image to the Home page hero and update the site’s global theme to a navy blue palette with faint/light blue accents.

**Planned changes:**
- Add `photo_2026-02-13_15-36-18-1.jpg` as a static frontend asset and render it at the very top of the Home page hero section (above the main heading), centered, responsive, and preserving aspect ratio (no distortion), with English alt text.
- Update the global CSS theme tokens/variables so the primary color becomes navy blue and accents become faint/light blue across backgrounds, buttons, links, icons, cards, and borders; ensure both light and dark modes remain readable and consistent without editing `frontend/src/components/ui/*`.

**User-visible outcome:** The Home page displays a centered, responsive banner above the hero heading, and the entire site adopts a navy + faint/light blue color theme in both light and dark modes.
