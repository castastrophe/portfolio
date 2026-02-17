# Plan: Extract DataProcessor into a Reusable npm Package

This document outlines the steps to turn `pages/resume/data-processor.js` into a standalone GitHub repository and npm package for dynamically loading and rendering content from JSON into the DOM. It also suggests naming, positioning, and marketing angles.

---

## 1. What the Package Does (Value Proposition)

The **DataProcessor** is a small, DOM-based engine that:

- **Accepts JSON** (object or string) and a **DOM context** (element or `document`).
- **Walks the data** and updates the DOM using conventions:
  - `data-replace-key="keyName"` — elements to fill with the value for `keyName`.
  - `data-template="templateId"` — use `<template id="templateId">` to clone and repeat for arrays/objects.
  - `data-target` — within a container, the element to use as the target for nested keys.
  - `data-type="formatterName"` — apply a named formatter to the value before rendering.
- **Handles** primitives (string, number, boolean), **arrays** (with optional template cloning), and **nested objects**.
- **Formatters** are pluggable (e.g. `window.formatter` or an injected registry) for things like phone, email, or custom markup.
- **Config options**: `context`, `verbose`, `forceKeep` (keep or clear when value is empty).
- **Collects** logs, warnings, and errors for inspection (e.g. `instance.logs`, `instance.warnings`, `instance.errors`).
- **Zero runtime dependencies**; uses only standard DOM APIs and works in any browser (and in jsdom/happy-dom for tests).

**Reuse cases:** Resumes/CVs, config-driven UIs, CMS-style content injection, dashboards, forms, or any “load JSON and fill the page” scenario without a full framework.

---

## 2. Refactors Before Extraction

To maximize reusability and testability, make these adjustments in the new package (or in this repo first, then move):

| Item | Current behavior | Recommended change |
|------|------------------|---------------------|
| **Formatter source** | Reads `window.formatter` only | Support **injected formatters** via config, e.g. `config.formatters` (object) or `config.getFormatter(el)`, with `window.formatter` as fallback in browser. |
| **API consistency** | Tests call `getProcessor()`; implementation has `getProcessor()` | Expose one public name (e.g. `getProcessor`) and alias or update tests so the package has a single, documented API. |
| **Console grouping** | Uses `console.group` / `console.groupEnd` in hot paths | Consider making verbose logging optional and/or less noisy (e.g. only group when `config.verbose === true`) so production use is cleaner. |
| **Context in config** | `config.context` used for root element | Already flexible; document that `context` defaults to `document` when in a browser. |

No need to bundle the resume-specific **formatter.js** (toEmail, toPhone, etc.) in the core package; the package can either ship a small **optional** set of generic formatters (e.g. `raw`, `clean` for paragraphs) or document how to pass custom formatters and point to the current formatter as an example in the README.

---

## 3. New GitHub Repository

### 3.1 Create the repo

- **Where:** GitHub (e.g. under your user or an org).
- **Visibility:** Public (for open source and npm).
- **Name:** See “Naming & branding” below.
- **Initial setup:** Add a README, .gitignore (Node), and optionally a license (MIT is common). Do **not** initialize with a full Eleventy project; keep the repo focused on the single package.

### 3.2 Suggested directory structure

```text
package-name/
├── .github/
│   └── workflows/
│       └── ci.yml          # Lint, test, optional release
├── src/
│   └── index.js            # DataProcessor (and any default formatters you include)
├── test/
│   └── data-processor.test.js
├── package.json
├── README.md
├── LICENSE
├── .gitignore
└── .nvmrc                  # Optional; e.g. 20 or 22
```

- **Single entry:** `package.json` `"main"` / `"exports"` pointing at `src/index.js` (or a built file if you add a build step later).
- **ESM:** Keep the package ESM-only (or dual publish ESM + CJS if you want maximum compatibility); your current code is ESM.

### 3.3 Dependencies and tooling

- **Runtime:** No dependencies.
- **DevDependencies:** Vitest, happy-dom (or jsdom), ESLint, Prettier (or your preferred lint/format). Match your current stack so tests can be moved with minimal change.
- **Node:** Set `engines` in `package.json` if you care (e.g. `"node": ">=20"` for ESM and modern syntax).

---

## 4. Steps to Create the Package and Publish to npm

1. **Create the GitHub repo** (name, README, .gitignore, license).
2. **Clone locally** and add the structure above.
3. **Copy and refactor the DataProcessor** from `pages/resume/data-processor.js` into `src/index.js`:
   - Add config support for injected formatters (and optionally for `document` for testing).
   - Align public API (e.g. `getProcessor` only) and reduce or guard `console.group` when not verbose.
4. **Add `package.json`** with:
   - `name`, `version`, `description`, `keywords`, `author`, `license`, `repository`, `homepage`, `bugs`.
   - `"type": "module"`.
   - `"main"` and `"exports"` (e.g. `".": "./src/index.js"` or `"./package.json"`).
   - `"files": ["src"]` (or list the files you want published).
   - `engines` and `scripts` (e.g. `test`, `lint`).
5. **Move and adapt tests** from `test/resume/data-processor.test.js` into the new repo (update imports, fix `getProcessor` → `getProcessor` if you keep that name).
6. **Write a short README**: what it does, install, minimal example (HTML with `data-replace-key` + one script that passes JSON and runs the processor), config and formatter API, and link to the resume (or another) demo if you host one.
7. **Set up CI** (e.g. GitHub Actions): run lint and tests on push/PR; optionally add a release workflow (e.g. `npm publish` on tag or using a release bot).
8. **Publish to npm:**
   - Create an npm account if needed.
   - `npm login` and then `npm publish --access public` (for scoped packages, e.g. `@yourname/package-name`).
9. **Consume in Allons-y:** In this repo, add the new package as a dependency and replace the local `data-processor.js` import with the package import; keep the resume-specific formatter in this repo and pass it via config (or `window.formatter` if you keep that fallback).

---

## 5. Naming and Branding

### 5.1 Name ideas (npm / GitHub)

- **json-dom** — Short; suggests “JSON → DOM”.
- **data-replace** — Matches the main attribute `data-replace-key`; easy to remember.
- **dom-from-json** — Very descriptive.
- **json-hydrate** — Familiar term (“hydrate” from SSR/hydration).
- **@yourname/json-dom** — Scoped; clarifies ownership and avoids name clashes.

Pick one that is free on npm and GitHub and that you’re happy to say out loud (“I use data-replace for my resume”).

### 5.2 Tagline / one-liner

Examples for README and npm description:

- “Declarative DOM hydration from JSON — no framework, just data attributes.”
- “Turn JSON into DOM with data-replace-key and optional templates.”
- “Lightweight, attribute-driven JSON-to-DOM engine for resumes, dashboards, and config-driven UIs.”

### 5.3 Positioning

- **Not:** A full framework or a build-time templating engine.
- **Is:** A small runtime that takes JSON + DOM and fills in content using conventions. Good for:
  - Static or server-rendered HTML that you “fill” with client-loaded JSON.
  - Resumes, portfolios, and simple CMS-like pages.
  - Prototypes and internal tools where you want minimal setup.

---

## 6. Marketing and Visibility (Optional)

- **README:** Clear “What” and “Why”, one minimal code example, and a link to a live demo (e.g. your resume page or a CodePen).
- **npm:** Good `description` and `keywords` (e.g. `json`, `dom`, `hydration`, `data-attributes`, `resume`, `template`, `no-framework`).
- **Blog / post:** Short post (e.g. dev.to, your site) explaining the problem (e.g. “I wanted to drive my resume from JSON without a framework”) and how the package solves it.
- **Demo repo:** A tiny HTML + JSON example repo (or a second page in the same repo) that people can clone and run.
- **Community:** Share in places that value small, focused tools (e.g. Eleventy Discord, indie web, or “less JavaScript” discussions) and frame it as “zero-dependency, attribute-based JSON-to-DOM.”

---

## 7. Checklist Summary

- [ ] Create GitHub repo (name, README, .gitignore, license).
- [ ] Set up package structure (`src/`, `test/`, `package.json`).
- [ ] Move and refactor DataProcessor (injected formatters, optional console grouping, consistent API).
- [ ] Move/adapt tests; fix references (e.g. `getProcessor` → `getProcessor`).
- [ ] Add README with example and config docs.
- [ ] Add CI (lint + test).
- [ ] Publish to npm (`npm publish --access public`).
- [ ] In Allons-y: depend on the new package and switch imports to it; keep formatter in this repo or in a separate “formatters” example.
- [ ] (Optional) Add a live demo and a short blog post or social post.

Once this is done, the DataProcessor lives as a reusable, marketable package while your site continues to use it via the new dependency and optional formatter layer.
