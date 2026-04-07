---
title: "Introducing envoy: environment setup, handled"
date: 2026-03-26
description: Every project starts with the same tedious ritual — copy .env.example, track down the values, paste them in. In a monorepo, that ritual scales badly. Here's a tool I built to eliminate it entirely.
tags:
  - tooling
  - dx
  - monorepo
featured: true
---

Here's what nobody tells you about onboarding: the hardest part isn't the architecture docs, the branching strategy, or even getting the right access. It's `.env`.

Every project I've ever worked on starts the same way. Copy `.env.example` to `.env`. Open Notion, or 1Password, or a Slack thread from six months ago. Track down the values. Paste them in. Repeat. In a monorepo, this ritual scales badly — five packages, five `.env.example` files, five rounds of the same scavenger hunt. It's not hard work. It's just tedious work, and tedious work is the kind that gets skipped, done wrong, or turned into a half-finished onboarding doc that nobody updates.

I built **[envoy](https://github.com/castastrophe/envoy)** to eliminate it.

## The problem with `.env` management

Let's be honest about what `.env` setup actually is: a key lookup exercise. You have a template (`.env.example`) that tells you what keys a project needs, and you have the real values stored somewhere on your machine or in your secrets manager. The only "work" involved is matching those two things together — and yet we do it manually, every time, for every project.

There are a few ways this tends to go wrong in practice.

**The incomplete setup.** A contributor clones the repo, misses a value in the `.env.example`, and spends the next hour debugging why a feature isn't working. The error message points nowhere near the actual problem.

**The stale example file.** Someone adds a new required key to the codebase and forgets to document it in `.env.example`. Now the example file lies. Every new contributor is set up to fail before they write a single line of code.

**The monorepo multiplication problem.** Package A needs `DATABASE_URL`. Package B needs `API_KEY`. Package C needs both plus three others. You're now maintaining five different `.env` files by hand and hoping none of them drift out of sync. In practice, they always drift.

The solution to all three is the same: treat `.env` setup as a deterministic process that can be automated, not a manual ritual that depends on tribal knowledge.

## How envoy works

The premise is straightforward. You probably already have a `~/.env` on your machine — or you will after using envoy for five minutes — with the real values: API keys, database URLs, tokens, secrets. The values that follow you from project to project.

**envoy** reads your `.env.example` as a template, pulls matching keys from `~/.env`, and writes a complete `.env` file alongside it. Comments, blank lines, and keys you haven't defined yet all survive the process exactly as written.

```bash
yarn dlx @allons-y/envoy
# ✨ Created /your/project/.env
```

That's the whole thing. No config files, no network calls, no global state. Just a template and a source of truth, merged together.

> **Why `~/.env` instead of a secrets manager?**
> The short answer: zero dependencies. envoy works offline, doesn't require an account, and integrates with whatever secrets workflow you already have. Pull values from 1Password or Vault into `~/.env` as a sync step — that's a separate concern and envoy doesn't try to own it.

## The details that matter

### Safe by default

envoy will never overwrite an existing `.env` without your permission. If a `.env` already exists, it skips that file and moves on. This is the behavior you want — running envoy repeatedly on an established project should be a no-op, not a destructive operation.

When you *do* want to overwrite — say, you've added keys and need to regenerate — pass `--force`:

```bash
yarn dlx @allons-y/envoy --force
```

### Monorepo-aware

envoy recursively walks your project directory, finds every `.env.example` it can, and processes each one. It skips `node_modules` automatically. You don't have to tell it where your packages live or configure a list of paths — it just finds them.

```bash
# Finds and processes all of these:
# packages/api/.env.example
# packages/web/.env.example
# packages/workers/.env.example
```

### Non-destructive key handling

If a key exists in `.env.example` but *not* in `~/.env`, envoy falls back to the example value instead of dropping the key entirely. This matters: you don't want a missing global key to silently produce a broken `.env`. You want the key present with a placeholder, so the next person knows it needs a real value.

### Preview before writing

Not sure what envoy is going to write? Run it with `--dry-run` first:

```bash
yarn dlx @allons-y/envoy --dry-run
```

You'll see a full diff of what would be created or changed — nothing touches the filesystem. This is especially useful the first time you run it on an existing monorepo.

---

## The postinstall hook

This is the highest-value use case by a significant margin. Wire envoy into your project's `postinstall` script:

```json
{
  "scripts": {
    "postinstall": "envoy"
  }
}
```

Now every contributor who clones the repo and runs `npm install` or `yarn` gets a populated `.env` automatically. No onboarding doc to write. No values to chase down in Slack. No "why doesn't this work" messages on day one.

> **If your package is published to npm**, use [pinst](https://github.com/typicode/pinst) to strip the postinstall hook from your tarball. You don't want consumers running envoy when they install your library — only developers working on the project itself should trigger it.
>
> ```json
> {
>   "scripts": {
>     "postinstall": "envoy",
>     "prepublishOnly": "pinst --disable",
>     "postpublish": "pinst --enable"
>   }
> }
> ```

The practical effect: onboarding goes from "follow these twelve steps in the right order" to "clone the repo and run install." That's not a small improvement in developer experience — that's the difference between a smooth first day and a frustrated one.

## The MCP tool

If you're running Claude Desktop or Claude Code, envoy exposes a `copy_env` tool through an MCP server. The same options available in the CLI — `--force`, `--dry-run`, and a target path — are available directly from your AI tools.

```bash
# Start the MCP server
envoy --mcp
```

This means you can ask Claude to set up your environment as part of a broader workflow — scaffolding a new package, bootstrapping a project, or running a setup checklist — without breaking out to the terminal. The tool validates paths, respects the `--force` flag, and returns the same output you'd see from the CLI.

> **Practical example:** You're scaffolding a new package in your monorepo. Claude creates the directory structure, writes the `package.json` and `tsconfig.json`, and calls `copy_env` to generate the `.env` — all in the same workflow, without manual steps between.

## Configuring your `~/.env`

For envoy to do its job, you need a `~/.env` with your real values. If you're starting from scratch, the pattern is simple: collect every key you use across all your projects and put the real values here.

```bash
# ~/.env

# Shared database
DATABASE_URL=postgresql://localhost:5432/dev

# API keys
STRIPE_SECRET_KEY=sk_test_...
OPENAI_API_KEY=sk-...
GITHUB_TOKEN=ghp_...

# Internal services
INTERNAL_API_BASE_URL=http://localhost:3001
```

If you're already using a secrets manager, the recommended pattern is to sync into `~/.env` as part of your shell startup or a manual pull command. envoy reads whatever is there — it doesn't care how it got there.

## Dos and don'ts

### Do

- **Add envoy to `postinstall`** so environment setup happens automatically on `npm install` or `yarn`
- **Commit `.env.example` with sensible placeholder values** — the fallback behavior depends on those placeholders being meaningful
- **Use `--dry-run`** the first time you run envoy on an existing project
- **Keep `~/.env` as your source of truth** for shared values across projects
- **Use `pinst`** if your package is published to npm

### Don't

- **Don't commit real values to `.env.example`** — that file belongs in source control; treat it like documentation, not secrets
- **Don't run envoy without `--force` expecting it to update an existing `.env`** — safe-by-default means it won't
- **Don't rely on envoy to sync secrets from a remote source** — that's a separate concern; handle it at the `~/.env` layer
- **Don't use envoy as a replacement for proper secrets management in CI** — it's a local developer tool, not a deployment pipeline

## Try it

No installation required:

```bash
npx @allons-y/envoy --dry-run
```

The source is small, readable, and fully tested. Apache 2.0.

→ GitHub: [github.com/castastrophe/envoy](https://github.com/castastrophe/envoy)
→ npm: [`@allons-y/envoy`](https://www.npmjs.com/package/@allons-y/envoy)

## Wrapping up

The best developer tooling solves problems so completely that you stop thinking about them. Environment setup is one of those problems — it's not interesting, it doesn't require expertise, and the only thing it produces (when done manually) is friction. envoy makes it automatic, repeatable, and boring in the best way possible.

Set up `~/.env` once. Add envoy to `postinstall`. Clone any project. Run install. Done.

That's the goal: the setup ritual disappears, and you get straight to the work that matters.
