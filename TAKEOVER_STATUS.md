# SwiftTab Takeover Status

Date: 2026-08-04

## Source Of Truth

The active project is the SwiftTab monorepo in this folder:

```text
outputs/dineflow
```

The active Next.js app is:

```text
outputs/dineflow/apps/web
```

The older flat DineFlow scaffold is no longer the active app structure.

## Current Git Baseline

Latest committed history:

```text
1327d92 feat: add PDF support for AI menu import
9ae7ce6 feat: upgrade AI menu parser to gemini-3.5-flash
49768f9 feat: complete operational audit features (GST, Waiter role, order acks)
1550de1 Initial commit with DineFlow MVP and AI Menu Import
```

There is a large uncommitted working set from Antigravity/latest work. I am preserving it and working on top of it, not reverting it.

Major current areas in the uncommitted layer:

- registration and authentication
- QR table customer flow
- payment claim/confirmation flow
- customer review flow
- admin dashboard
- kitchen operations
- waiter operations
- restaurant setup and QR pages
- AI menu import
- demo seed endpoint
- promo video assets/app
- operational docs

## Verification Completed During Takeover

From `outputs/dineflow/apps/web`:

```bash
npm.cmd test
```

Result: passed.

```bash
npx.cmd next build
```

Result: passed. This verifies the Next.js app compiles, type-checks, and generates routes.

## Fixes Applied During Takeover

1. Removed `next/font/google` from `apps/web/app/layout.tsx`.

   Reason: production build tried to fetch Google Fonts and failed in the restricted/offline environment.

2. Changed the global font stack in `apps/web/app/globals.css` to local/system fonts.

3. Restored a minimal unit test suite in `apps/web/tests/upsell.test.ts`.

   Reason: `npm.cmd test` previously failed because no test files existed.

## Known Local Environment Issue

The normal package build command still fails at:

```bash
npm.cmd run build
```

The failure occurs before Next.js build, inside Prisma generation:

```text
EPERM: operation not permitted, rename ...\node_modules\.prisma\client\query_engine-windows.dll.node.tmp... -> query_engine-windows.dll.node
```

This is a Windows file lock / permission issue on the Prisma native query engine under hoisted root `node_modules`.

Important details:

- `npx.cmd next build` passes.
- `npx.cmd prisma generate --no-engine` passes.
- `npx.cmd prisma generate` fails only when replacing the native Windows engine DLL.
- The existing `query_engine-windows.dll.node` file is present.

Do not treat this as a TypeScript or Next.js compile failure. To fully clear it, close any Node/dev server processes that may be holding Prisma, or restart the machine/session, then rerun:

```bash
cd outputs/dineflow/apps/web
npx prisma generate
npm run build
```

## Recommended Next Steps

1. Start the app from the active workspace:

```bash
cd outputs/dineflow/apps/web
npm run dev
```

The custom server defaults to port `3001`.

2. Validate the core routes:

```text
http://localhost:3001
http://localhost:3001/register
http://localhost:3001/demo
http://localhost:3001/admin
http://localhost:3001/admin/kitchen
http://localhost:3001/admin/waiter
```

3. Add Playwright smoke tests for:

- registration
- demo seed
- customer QR order
- payment claim/confirm
- kitchen status update
- waiter bill request

4. Once validated, commit the current Antigravity work plus takeover fixes as a single checkpoint.
