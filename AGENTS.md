<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:ui-ux-rules -->
# UI/UX standards for every page and component

Whenever a task involves building, designing, or refactoring any user-facing UI
(pages, components, layouts, color, typography, charts, accessibility, etc.):

- Use the **ui-ux-pro-max** skill for all design decisions (styles, color
  palettes, font pairings, UX guidelines, per-stack guidance). Consult it
  before writing UI code, not after.
- Use the **magic** MCP server (21st.dev) for generating and refining UI
  components and for logo/icon search:
  - `21st_magic_component_builder` — create new components
  - `21st_magic_component_refiner` — improve existing component UI
  - `21st_magic_component_inspiration` — browse UI examples
  - `logo_search` — fetch company logos/icons (SVG/JSX/TSX)

Apply these by default for all UI work without needing to be asked each time.
<!-- END:ui-ux-rules -->
