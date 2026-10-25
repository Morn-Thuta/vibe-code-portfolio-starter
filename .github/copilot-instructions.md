# Instructions for AI coding assistants

This is a **student's personal portfolio website**, built during a beginner "Vibe Code Your Portfolio" workshop. The student may be new to coding and to Git.

## Project rules
- **Plain HTML, CSS and JavaScript only.** No frameworks (React, Vue, Tailwind build, etc.), no npm, no build step. The site must work by opening `index.html` directly and when deployed as a **Render Static Site** that publishes the repo root (see `render.yaml`).
- Keep the structure: `index.html` at the root, styles in `css/style.css`, scripts in `js/main.js`, images in `assets/images/`.
- Extra pages are fine (e.g. `projects.html`) but link them with **relative paths** (`css/style.css`, not `/css/style.css`).
- Colours are CSS variables in `:root` and `[data-theme="dark"]`. Change those rather than hard-coding colours, and keep dark mode working.
- External libraries or fonts are fine only via a CDN `<link>`/`<script>` tag (e.g. Google Fonts).
- File names are case-sensitive once deployed: keep them lowercase with no spaces.
- Keep it responsive (mobile first) and accessible (alt text, sufficient contrast, semantic HTML).

## How to help
- Make **small, focused changes** and say which files you changed.
- Briefly **explain what you did in plain language** so the student learns.
- Don't invent personal details. Ask the student, or leave clearly marked placeholders.
- Don't run `git push`, change Git remotes, or rewrite history unless the student asks. When a change works, remind them they can commit it.
