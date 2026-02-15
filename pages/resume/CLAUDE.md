# Project Guidelines

## Tech Stack

- **Node.js**: v24+ (use `nvm use` to switch to the correct version)
- **Package manager**: Yarn
- **Static site generator**: Eleventy (11ty) 3.x
- **Data format**: YAML for resume content

## Development

```bash
# Install dependencies
yarn install

# Start dev server with hot reload
yarn start

# Build for production
yarn build

# Clean build output
yarn clean
```

## Project Structure

- `_data/base.yaml` — Resume content data
- `pages/` — Eleventy page templates (.njk)
- `_includes/layouts/` — Base layout templates
- `public/` — Build output (gitignored)

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
