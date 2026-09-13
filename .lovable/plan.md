# Incident Cards, Motion, and Accessibility Polish

## What will change

- Replace the custom information modal with the existing accessible dialog pattern so focus moves into it, stays trapped, returns to the opening link, and Escape/overlay close work correctly.
- Redesign only the incident-card media area: make video and imagery nearly full card width, preserve a stable 16:9 frame, and keep the click-to-load behavior.
- Improve mobile cards with a single-column reading order, cleaner header wrapping, larger touch targets, and consistent inner spacing so no text, poll, rating, or drawer content touches an edge.
- Add restrained polish inspired by professional public-interest and government data sites:
  - subtle card reveal as each incident enters view;
  - a quick hero-counter countdown from 99 to the actual streak on first view;
  - clear reduced-motion behavior that skips both animations;
  - modest borders, spacing, and transitions rather than decorative effects.
- Keep the existing footer links and add a satirical contact address: `1600 Pennsylvania Avenue Weast, Washington, DC 20500`.
- Preserve the current government-parody visual direction, incident content, polls, references, ratings, agency navigation, and dashboard structure.

## Technical details

- Use the project’s Radix-based dialog components rather than hand-built focus management.
- Add a reusable intersection-observer reveal wrapper with a visible default during server rendering and a no-motion fallback.
- Animate only the displayed hero number; all statistics continue using the real calculated value.
- Keep media responsive with `aspect-video`, full-width constraints, and object-fit behavior appropriate to video versus source images.
- Validate desktop and 390px mobile views, keyboard dialog behavior, horizontal overflow, and reduced-motion handling.
