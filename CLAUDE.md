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
- **Database**: Neon (PostgreSQL)

## Commands

```bash
yarn install        # Install dependencies
yarn start          # Development server with hot reload (opens Firefox)
yarn build          # Production build
yarn ci             # Clean + build (used in CI)
yarn clean          # Remove public/ directory
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
