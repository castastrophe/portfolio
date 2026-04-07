# Allons-y Consulting | Portfolio site

[![Netlify Status](https://api.netlify.com/api/v1/badges/bd35124e-c577-496b-9371-ce9e18da1248/deploy-status)](https://app.netlify.com/projects/allons-y/deploys)

**Working on a design system? Let's talk.** Reach out at [allons-y.llc](https://allons-y.llc) or connect on [LinkedIn](https://www.linkedin.com/in/castastrophe/).

---

## About us

Allons-y Consulting, LLC is a front-end consultancy specializing in scalable design systems. We help teams build component libraries, establish CSS architecture, and bridge the gap between design and engineering — so that the two disciplines can move together and expand their impact.

Founded by Cassondra, a front-end architect with deep experience in web components and design systems, Allons-y is positioned to help your organization, big or small, scale your work quickly and beautifully.

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
| Data | Netlify Blobs |
| Runtime | Node.js 24 / Yarn 4 |

---

## Local Development

### Data

The site pulls content from Netlify Blobs at build time.

### Site

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

### Netlify Dev

To test serverless functions locally, you need to authenticate with Netlify first:

```bash
yarn netlify login
```

Then use `yarn netlify dev` to run the local development server with function support. Note that all `netlify` commands should be prefixed with `yarn` to use the locally installed CLI package. See the [Netlify CLI docs](https://docs.netlify.com/api-and-cli-guides/cli-guides/get-started-with-cli/) for more details.

---

## Project Structure

```
pages/          # Source content (Nunjucks templates, Markdown)
_includes/      # Layouts and reusable components
_data/          # Global site data (navigation, presentations, etc.)
public/         # Built output (generated, not committed)
```
