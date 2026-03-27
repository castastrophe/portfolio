---
description:
alwaysApply: true
---

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio site for Allons-y Consulting built with Eleventy (11ty).

## Tech Stack

- **Node.js**: v24+ (use `nvm use` to switch to the correct version)
- **Package manager**: Yarn
- **Static site generator**: Eleventy (11ty) 3.x
- **Data format**: YAML for resume content
- **Environment variables**: `.env` file
- **Database**: MySQL 8.0 (Docker)
- **Container orchestration**: Docker Compose

## Commands

```bash
yarn install        # Install dependencies
yarn start          # Development server with hot reload (opens Firefox)
yarn build          # Production build
yarn ci             # Clean + build (used in CI)
yarn clean          # Remove public/ directory
docker compose up -d    # Start MySQL database container
docker compose down     # Stop MySQL database container
```

## Architecture

### Eleventy Structure
- **Input**: `pages/` - Source templates (Nunjucks, Markdown)
- **Output**: `public/` - Built site
- **Includes**: `_includes/` - Layouts and components
- **Data**: `_data/` - Global data

### Template System
- Layout alias: `base` → `layouts/base.njk`
- Web components imported from `pages/components/*.js`
- Markdown files processed with markdown-it and anchor plugin

### Collections
- `posts` - Blog posts from `pages/posts/*`
- `proposals` - Proposals from `pages/proposals/*`

### Database

- Connection config is read from `.env` — copy `.env.example` to get started
- Data is persisted in the `mysql-data` Docker named volume (never written to the project directory)
- **Known issue**: `_data/resume.js` still uses PostgreSQL-specific syntax (`array_agg`, `json_agg`, `json_build_object`, `array_position`, `ANY()`, `to_char`) left over from a prior Neon/Postgres setup. These functions do not exist in MySQL and will cause the build to fail. They need to be rewritten using MySQL 8.0 equivalents (`JSON_ARRAYAGG`, `JSON_OBJECT`, `FIND_IN_SET`, etc.) before database-driven pages will render correctly.

### CSS Processing
PostCSS pipeline configured in `postcss.config.js`:
- `postcss-import` for @import resolution
- `postcss-extend` and `postcss-each` utilities
- `postcss-preset-env` (stage 3) for modern CSS
- Stylelint runs inline during build with auto-fix
- cssnano minification in production only

### Code Style
- Tabs for indentation (tabWidth: 4)
- CSS printWidth: 500
- Stylelint enforces logical properties (`csstools/use-logical`)
- Custom properties must come before declarations (`order/order`)
- High-performance animation checks enabled

## Style Guide

This project follows the **Chicago Manual of Style** with the following project-specific exceptions:

### Capitalization

- **Section titles**: Use sentence case (capitalize only the first word)
  - Correct: "About me", "Experience", "Skills"
  - Incorrect: "About Me", "ABOUT ME"
- **Hyphenated compounds**: Only capitalize the first element
  - Correct: "Front-end"
  - Incorrect: "Front-End"

### Punctuation & Formatting

- **Ampersands**: Use `&` instead of "and" consistently throughout
  - Correct: "scalable web applications & design systems"
  - Incorrect: "scalable web applications and design systems"
- **Numbers**: Prefer numerals over written-out numbers to keep the resume brief and scannable
  - Correct: "12+ years"
  - Incorrect: "twelve-plus years"

### Chicago Style Elements (Retained)

- **Months**: Spell out in full (November, not Nov)
- **Date ranges**: Use en dashes (–) not hyphens (-)
  - Correct: "January 2014–July 2021"
  - Incorrect: "January 2014 - July 2021" or "Jan 2014-Jul 2021"
- **Serial comma**: Use the Oxford comma in lists

### CSS Conventions

- Use `text-transform: uppercase` in CSS for visual capitalization rather than uppercase content in source files

## Testing

### Commands

```bash
yarn test              # Run all tests once
yarn test:watch        # Run tests in watch mode
```

### Architecture

Tests live in `test/` and run via **Vitest** (v4+) with the **happy-dom** environment. Vitest config is in `vitest.config.js`.

- **`test/a11y.test.js`** — Accessibility audit for every built HTML page in `public/`. It recursively collects all `.html` files, parses each one into a happy-dom `Window`, injects axe-core, and runs an audit against WCAG 2.1 AA + best-practice rules. Each page gets its own `describe` block; each individual violation becomes a separate `it()` labelled with impact level, rule ID, and the offending element — so failures are immediately actionable in the Vitest output.

### Key dependencies

- **Vitest** — https://vitest.dev — test runner and assertion library
- **happy-dom** — https://github.com/capricorn86/happy-dom — lightweight DOM implementation (used as the Vitest environment)
- **axe-core** v4 — https://github.com/dequelabs/axe-core — Deque's accessibility rules engine; the canonical implementation of WCAG 2.x checks

### Rules disabled for happy-dom compatibility

`color-contrast` and `meta-viewport` are turned off because they require a real CSS cascade and computed styles that happy-dom does not simulate. All other WCAG 2.1 AA and best-practice rules run normally.

### HTML pre-processing and happy-dom workarounds

Three happy-dom limitations require pre-processing before each page is audited:

1. **Inline SVGs are stripped** — happy-dom's HTML parser enters SVG/XML mode on any `<svg>` tag and never returns to HTML context, silently dropping all subsequent elements (including `<main>`, headings, form fields, etc.) from the DOM. SVG content is irrelevant to the a11y rules being tested.

2. **CSS-invalid element IDs are sanitized** — the markdown-it anchor plugin generates heading IDs from raw heading text, which can include apostrophes, `%`-encoded characters, and spaces (e.g. `id="what's-the-harm%3F"`). axe-core calls `querySelectorAll` internally with the raw ID value, and happy-dom throws a `SyntaxError` for selectors containing these characters. Any character outside `[a-zA-Z0-9_-]` is replaced with a hyphen before parsing.

3. **`iframes: false` is passed to `axe.run()`** — happy-dom's `postMessage`-based frame communication throws "Respondable target must be a frame in the current window" when axe tries to inject itself into `<iframe>` elements (e.g. YouTube embeds).

### Important: run `yarn build` before `yarn test`

The accessibility tests read from `public/` (the Eleventy build output). If `public/` is empty or stale the tests will fail with a clear message telling you to build first.
