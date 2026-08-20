# AGENTS.md — DineFlow

Tool-selection policy for AI coding agents working in this repository.

## Tools
- **Serena (MCP) first** for understanding and navigating code: `get_symbols_overview`, `find_symbol`, `find_referencing_symbols`, `find_declaration`, `search_for_pattern`. Pre-indexed (156 TS files, 11s). If a symbol isn't found, prefer `serena` CLI (`~/.local/bin/serena.exe`) before grep.
- **Shell** for: git, npm/pnpm, Prisma, running tests, builds (`npm run build`), and anything needing execution.
- **Context7** only for external library documentation (e.g. Next.js, Prisma).
- **Playwright** only for real browser verification (rare).
- **Read/Glob/Grep** for targeted file reads and quick pattern searches.

## Conventions
- Windows shell is PowerShell 5.1: use `;`, `$?`, call operator `&` for paths with spaces; no `&&`.
- Do NOT commit changes unless the user explicitly asks.
- Never log or commit secrets, env files, or `*.pem`.
- Production is a separate Dokku VPS — no deploys or prod-data access without explicit instruction.
- This repo is a git checkout of a Dokku deploy. `apps/web` is the Next.js app; `prisma/` holds the schema.
