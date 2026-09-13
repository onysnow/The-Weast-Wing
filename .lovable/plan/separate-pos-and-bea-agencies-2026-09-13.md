# Separate POS and BEA agencies

## Changes
- Keep the existing incident counter, latest report, statistics, incident log, polls, submissions, and disclaimers on the POS home page.
- Remove BEA attribution and styling from the POS statistics so they are clearly owned by the Presidential Office of Shitistics.
- Create a separate `/bea` agency page with its own title, description, agency identity, and reserved introductory state without duplicating POS statistics.
- Change the two-agency navigation from same-page anchors to real POS and BEA page links while preserving the acronym-first expansion treatment.
- Keep the existing footer and accessible information dialogs on the POS page.

## Technical details
- Add a typed TanStack route for `/bea` with unique social metadata.
- Use router links for cross-page agency navigation and keep smooth scrolling only for POS’s internal counter links.
- Verify desktop and 390px layouts, navigation, route titles, and horizontal overflow.
