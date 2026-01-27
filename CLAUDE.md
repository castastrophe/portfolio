# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio site for Allons-Y Consulting built with Eleventy (11ty) v3 using WebC templates.

## Commands

```bash
yarn start          # Development server with hot reload (opens Firefox)
yarn build          # Production build
yarn ci             # Clean + build (used in CI)
yarn clean          # Remove public/ directory
```

## Architecture

### Eleventy Structure
- **Input**: `pages/` - Source templates (WebC, Markdown)
- **Output**: `public/` - Built site
- **Includes**: `_includes/` - Layouts and components
- **Data**: `_data/site.json` - Global site data including presentations list

### Template System
- Uses **WebC** as the primary template engine
- Layout alias: `base` → `layouts/base.webc`
- Global components auto-imported from `_includes/components/*.webc`
- Markdown files processed with markdown-it + anchor plugin

### Collections
- `posts` - Blog posts from `pages/posts/*`
- `proposals` - Proposals from `pages/proposals/*`

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

### Environment
- Node 24 (see `.nvmrc`)
- Yarn 4 (corepack)
- `ELEVENTY_ENV=production` enables HTML minification and CSS minification
