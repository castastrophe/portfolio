# Allons-Y Consulting | Portfolio Site

[![Netlify Status](https://api.netlify.com/api/v1/badges/bd35124e-c577-496b-9371-ce9e18da1248/deploy-status)](https://app.netlify.com/projects/allons-y/deploys)

**Working on a design system? Let's talk.** Reach out at [allons-y.llc](https://allons-y.llc) or connect on [LinkedIn](https://www.linkedin.com/in/castastrophe/).

---

## About us

Allons-Y Consulting, LLC is a front-end consultancy specializing in scalable design systems. We help teams build component libraries, establish CSS architecture, and bridge the gap between design and engineering — so that the two disciplines can move together and expand their impact.

Founded by Cassondra, a front-end architect with deep experience in web components and design systems, Allons-Y is positioned to help your organization, big or small, scale your work quickly and beautifully.

---

## About this project

This repository is the source code for [allons-y.llc](https://allons-y.llc) — our landing page. It showcases past work, conference talks, and writing on front-end architecture and design systems.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Static site generator | [Eleventy (11ty) v3](https://www.11ty.dev/) |
| Styling | [PostCSS](https://postcss.org/) with modern CSS features |
| Scripting | JavaScript (ES modules, bundled for the browser) |
| Hosting | [Netlify](https://www.netlify.com/) |
| Runtime | Node.js 24 / Yarn 4 |

---

## Local Development

```bash
# Install dependencies
yarn install

# Start development server (with hot reload)
yarn start

# Production build
yarn build

# Run tests
yarn test
```

The development server will be available at `http://localhost:8080`.

---

## Project Structure

```
pages/          # Source content (Nunjucks templates, Markdown)
_includes/      # Layouts and reusable components
_data/          # Global site data (navigation, presentations, etc.)
public/         # Built output (generated, not committed)
```
