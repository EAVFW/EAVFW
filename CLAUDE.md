# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EAVFW (Entity-Attribute-Value Framework) is a TypeScript monorepo for building model-driven applications with React, Next.js, and Fluent UI. It provides the specification for the EAVFW Manifest format and distributes type definitions and component libraries via NPM under the `@eavfw/*` scope.

## Development Commands

```bash
# Install dependencies
npm install --force --ignore-scripts

# Create npm links for all packages (for local development)
npm run link

# From a consuming project, link all EAVFW packages
npm link @eavfw/apps @eavfw/next @eavfw/expressions @eavfw/manifest @eavfw/hooks @eavfw/forms @eavfw/utils
```

There is no build step. Packages ship TypeScript source directly (`"main": "./src/index.ts"`). There is no test runner, linter, or formatter configured in this repo.

## Release & Commit Conventions

Releases are automated via **semantic-release** with **conventional commits**. Commit messages must follow the format:
- `feat: ...` — triggers a minor version bump
- `fix: ...` — triggers a patch version bump
- `feat!: ...` or `BREAKING CHANGE:` in body — triggers a major version bump

Release branches: `main` (stable), `dev` (prerelease), `vnext` (prerelease).

## Monorepo Structure

Uses **NPM Workspaces** (`packages/*`). All 11 packages are published to NPM as `@eavfw/<name>`.

### Package Dependency Graph

```
manifest        ← Base types for the EAVFW manifest spec
  ↑
  ├── forms     ← Form state management (EAVForm.tsx is the core, ~28KB)
  ├── expressions ← Expression parser for manifest expressions
  ├── hooks     ← React hooks (useAsyncMemo, useChangeDetector, etc.)
  └── utils     ← Utility functions (capitalize, deepDiff, mergeDeep, etc.)

apps            ← Model-driven app components (~1.2MB, depends on all above)
  ↑
  └── next      ← Next.js integration layer (packages/nextjs on disk)

codeeditor      ← Monaco editor wrapper (standalone)
query           ← Query API for RSC (standalone)
task-management ← Task UI components (standalone)
rich-text-editor ← Draft.js-based editor (standalone)
```

### Key Source Files

- `packages/apps/src/ModelDrivenApp.ts` — Core app orchestrator (~15KB)
- `packages/apps/src/Components/` — 16 component subdirectories (Controls, Views, Forms, Ribbon, Navigation, etc.)
- `packages/forms/src/EAVForm.tsx` — Main form component (~28KB)
- `packages/manifest/src/` — Type definitions organized by domain (Entities, Forms, Views, Validation, etc.)
- `spec/1.0.0/spec.md` — The EAVFW manifest specification

## Technical Details

- **TypeScript 5.4.2**, strict mode, ES modules (`"type": "module"`)
- **Target**: ES2015, **Module**: ESNext, **JSX**: preserve
- **UI Framework**: Fluent UI v8/v9, React JSON Schema Form (RJSF)
- **Peer dependencies** are used extensively — consuming projects must provide React 18, Next.js 14, Fluent UI, RJSF, etc.

## DevContainer

The development container includes Node 20, .NET 8/10, Docker-in-Docker, and a restrictive default-deny firewall. See `.devcontainer/CLAUDE.md` for firewall details and allowed domains. AI agents can edit `init-firewall.sh` to add domains but cannot apply changes directly — a container rebuild by the human is required.

## CI/CD

GitHub Actions runs on `windows-latest` with .NET 8 and Node 20. The test workflow creates a project from EAVFW dotnet templates, links local packages, and runs `npm run build` against it. There are no unit tests in this repo.
