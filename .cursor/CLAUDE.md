# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Technology:
- Eleventy (https://www.11ty.dev/) as a static site generator
- Vanilla web components defined in *.webc syntax
- Scss or Sass for styles
- Markdown-based content system
- Netlify for hosting

## Architecture of the project

- Shared data exists in the _data folder as JSON
- Components are defined in _includes/components (see design-system rule)
- Shared base layouts are defined in _includes/layouts
    - base.webc is the root for all pages
    - post.webc extends base and is used for blog posts
    - proposal.webc extends base and is used for the proposals

## Build & Development Commands
- `yarn clean`: remove the `public` directory with the compiled results
- `yarn build`: basic eleventy build that leverages eleventy.config.js by default
- `yarn start`: spins up an eleventy localhost server
- `yarn test`: placeholder for future test suite
- `yarn ci`: Clean & build the static website for CI

## GitHub Contribution Process

- Most requests from users should follow one of two patterns:
    - Not confident how to proceed, in which case end with asking a clarifying question (via `gh`)
    - Confident how to proceed, you make changes, commit on a branch, and open a PR for the user to review
- Check existing elements before suggesting adding new elements
- Always commit in a branch, not directly to `main`; use Conventional Commit best practices (https://www.conventionalcommits.org/en/v1.0.0/)
- Always use simple commit messages, focus on describing what you did and why as succinctly as possible
- Create PRs using `gh pr create ...`
- File PRs with clear descriptions, and sign your PR
- For tasks that can be broken down into related work, create the PR after the first task, then keep working on the same branch, committing and pushing with individual commit messages outlining the distinct work

## Handling GitHub issues and requests
- Use `gh` to read and write issues/PRs
- Sign all commits and PRs