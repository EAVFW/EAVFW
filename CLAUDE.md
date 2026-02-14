# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EAVFW (Entity-Attribute-Value Framework) is an EAV Business Application Framework. This repo is the **core frontend monorepo** — a TypeScript monorepo for building model-driven applications with React, Next.js, and Fluent UI. It provides the specification for the EAVFW Manifest format and distributes type definitions and component libraries via NPM under the `@eavfw/*` scope.

### Ecosystem Architecture

EAVFW is a full-stack framework. This repo is the frontend half. The ecosystem includes:

- **This repo** (`EAVFW/`) — Frontend packages: React components, form engine, manifest types, hooks, utilities
- **eavframework** (`external/eavframework/`) — The .NET backend/application host that serves this frontend. Includes EF Core, OData, security model, Aspire hosting extensions, and source generators.
- **eavfw-templates** (`external/eavfw-templates/`) — `dotnet new` template system for scaffolding new EAVFW projects with all the boilerplate (solution structure, Next.js app, models, business logic, DevOps pipelines).

Both external repos are included as git submodules under `external/`.

### How a New Project Is Created

A developer scaffolds a new EAVFW project using `dotnet new`:

```bash
dotnet new eavfw --namespace GjellerVand --appName Portal --databaseName GjellerVand --schemaName dbo \
  --yourUserEmail poul@kjeldager.com --allow-scripts yes \
  --sendgrid_api_token SG.xxx
```

This generates a full solution structure with C# backend, Next.js frontend, models, business logic, and npm scripts. The `eavfw-nextjs` template is then applied inside the scaffolded project to add the web layer.

### Aspire Integration (New — In Progress)

The latest development direction uses **.NET Aspire** for orchestrating the full development environment. The `EAVFramework.Extensions.Aspire.Hosting` package (in `external/eavframework/aspire/`) provides:

- `AddEAVFWApp<T>()` — Register an EAVFW application with npm build integration
- `WithEAVModel<TModel, TContext, TIdentity, TSignin>()` — Full model setup with database publishing and signin tokens
- `WithMailPit()` — Local SMTP testing via Mailpit container
- `ForwardEnvironmentVariables<T>()` — Forward configuration from AppHost to services
- `WithRestoreBacpacCommand()` — Interactive BACPAC restore for SQL Server
- `WithDbGate()` — Web-based database administration

This replaces the prior approach of many `npm run` scripts in the root `package.json` for database setup, mail servers, etc.

### Spikes and Samples

The `spikes/` directory contains reference implementations and experiments. `spikes/eavfw-aspire.md` has an example AppHost.cs from a real customer project showing the Aspire setup pattern.

## Development Commands

```bash
# Install dependencies
npm install --force --ignore-scripts

# Create npm links for all packages (for local development)
npm run link

# From a consuming project, link all EAVFW packages
npm link @eavfw/apps @eavfw/next @eavfw/expressions @eavfw/manifest @eavfw/hooks @eavfw/forms @eavfw/utils

# Initialize git submodules (eavframework + eavfw-templates)
git submodule update --init --recursive

# Install EAVFW dotnet templates locally
dotnet new install ./external/eavfw-templates/templates/EAVFW/
dotnet new install ./external/eavfw-templates/templates/EAVFW.NextJS/
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

### External Submodules

- `external/eavframework/` — .NET backend framework (v5.0.0). Key directories: `src/` (core), `aspire/` (Aspire hosting), `generators/` (source generators)
- `external/eavfw-templates/` — dotnet new templates (v2.2.11). Templates: `EAVFW`, `EAVFW.NextJS`, `EAVFW.AureDevOps`, `EAVFW.Blazor`

## Technical Details

- **TypeScript 5.4.2**, strict mode, ES modules (`"type": "module"`)
- **Target**: ES2015, **Module**: ESNext, **JSX**: preserve
- **UI Framework**: Fluent UI v8/v9, React JSON Schema Form (RJSF)
- **Peer dependencies** are used extensively — consuming projects must provide React 18, Next.js 14, Fluent UI, RJSF, etc.
- **.NET SDKs**: 8.0 and 10.0 available in devcontainer
- **EAVFramework version**: 5.0.0 (current submodule)

## DevContainer

The development container includes Node 20, .NET 8/10, Docker-in-Docker, and a restrictive default-deny firewall. See `.devcontainer/CLAUDE.md` for firewall details and allowed domains. AI agents can edit `init-firewall.sh` to add domains but cannot apply changes directly — a container rebuild by the human is required.

## Scaffolding Projects (eavfw-init)

**This is the EAVFW development repo.** When using `/eavfw-init` to scaffold a project, always use **dev mode**:
- Scaffold into `sandbox/{Namespace}` (not the repo root)
- Use local project references (`UseEAVFromNuget=false`) so changes to `external/eavframework/`, `external/EAVFW.Extensions.*`, and `packages/` are tested directly
- Follow the full `/eavfw-scaffold-dev` skill for step-by-step instructions
- Verify with the E2E Playwright test that exercises login and record creation

This ensures scaffolded projects test against the local source code, not published NuGet/npm packages.

## EAVFW Fundamentals

### Manifest: Human-Authored vs Generated

The manifest system has two layers:
- **`manifest.json`** (in `src/{Namespace}.Models/`) — Human-authored, minimal. Entity keys use display names (e.g., `"Permission"`, `"Security Role"`). Does NOT have `logicalName`, `collectionSchemaName`, or other derived properties.
- **`manifest.g.json`** (generated at build time) — The complete manifest with all generated properties: `logicalName` (e.g., `"permission"`), `collectionSchemaName`, attribute metadata, etc. This is what the runtime uses.

When investigating runtime behavior, always look at `manifest.g.json` (in `obj/` or `bin/` directories), not `manifest.json`.

### Architecture Layers (Where to Look for Bugs)

- **Client-side errors** (JavaScript/React) → `packages/` folder (framework) or project's `src/pages/` (app routes)
- **Backend/API errors** → `external/eavframework/src/` (.NET backend)
- **URL routing / static file serving** → `external/EAVFW.Extensions.Infrastructure/` (NextJSMiddleware)
- **Aspire orchestration** → `external/eavframework/aspire/` (hosting extensions)
- **Template issues** → `external/eavfw-templates/templates/` (scaffolding)

Each scaffolded project defines its own Next.js page routes in `apps/{Namespace}.{AppName}/src/pages/` — these wrap framework components from `packages/`.

### URL Conventions

EAVFW URLs follow the pattern: `/apps/{appName}/areas/{area}/entities/{entityName}/...`

Entity names in URLs should be **lowercase** (matching `logicalName` from the generated manifest). The `getEntity()` method in `ModelDrivenApp.ts` lowercases the input for lookup.

### Debugging with Hot Reload

When Aspire is running with `.WithHotReload()`, the hot-reload dev server endpoint shows detailed Next.js error overlays with stack traces for client-side errors. This is much more useful for debugging than the static portal which only shows "Application error: a client-side exception has occurred". Browser console errors (client-side JS) do NOT appear in Aspire dashboard logs.

### Aspire Resource Names

Resources created by `EAVFramework.Extensions.Aspire.Hosting`:
- `sqlserver` — SQL Server container
- `sql-db` — SQL database
- `mail-server` — Mailpit container
- `{databaseName}-portal` — The ASP.NET Core app serving the Next.js frontend
- `{databaseName}-portal-next-dev` — Hot-reload Next.js dev server (when `.WithHotReload()` is configured)
- `{databaseName}-model` — EAV model publish resource (runs to `Finished` state)
- `dbgate` — DbGate web database admin

Container resources (sqlserver, mail-server) have health checks — use `WaitForResourceHealthyAsync()` not `WaitForResourceAsync(..., Running)` in tests.

### Aspire Dual ProjectReference Pattern

When an Aspire AppHost needs both an assembly reference (for `using Namespace.Models;`) and Aspire metadata type generation (`Projects.Namespace_Models`), use **two** `<ProjectReference>` entries:
```xml
<ProjectReference IsAspireProjectResource="false" Include="..." /> <!-- assembly ref -->
<ProjectReference Include="..." /> <!-- Aspire metadata type -->
```

## CI/CD

GitHub Actions runs on `windows-latest` with .NET 8 and Node 20. The test workflow creates a project from EAVFW dotnet templates, links local packages, and runs `npm run build` against it. There are no unit tests in this repo.

## Coding Standards Summary

Full standards: `docs/governance/coding-standards.md`. Key rules:

- **TypeScript**: `strict: true`, never `any` (use `unknown` + narrowing), prefer `interface` for object shapes
- **Exports**: Named only — never `export default` (see ADR-0003)
- **File size**: Maximum 400 lines per file (see ADR-0004)
- **Components**: Plain arrow functions (not `React.FC`), destructure props in signature, `React.memo` for object/array props
- **Hooks**: Own file, `use` prefix, camelCase (`useEntityLookup.ts`)
- **Naming**: PascalCase for components/types, camelCase for hooks/utils, `is`/`has`/`should` for booleans, no abbreviations (except `id`/`url`/`api`)
- **State**: `useState` for local, props for 1-2 levels, Context for 3+, SWR for server cache, `useMemo` for derived
- **Imports**: Group by 1) React/Next, 2) External, 3) `@eavfw/*`, 4) Relative — blank line between groups
- **JSDoc**: Required on all exports with `@example` for non-trivial APIs
- **Testing**: Vitest for pure logic, co-located test files (`{module}.test.ts`)
- **Formatting**: Prettier (2-space indent, trailing commas, single quotes, print width 100)

## Anti-Patterns — DO NOT

1. **DO NOT** use `export default` — named exports only
2. **DO NOT** use `any` — use `unknown`, generics, or specific types
3. **DO NOT** create files over 400 lines — split into focused modules
4. **DO NOT** add a build step — packages ship raw TypeScript (see ADR-0002)
5. **DO NOT** use `React.FC` — use plain arrow functions with typed props
6. **DO NOT** create new React contexts without checking existing ones (33 is already too many)
7. **DO NOT** put business logic in React components — extract to hooks or pure functions
8. **DO NOT** use wrong vocabulary — see Glossary below
9. **DO NOT** import from internal paths of `@eavfw/*` packages — import from package root only
10. **DO NOT** leave empty catch blocks or use `@ts-ignore` (use `@ts-expect-error` with explanation)
11. **DO NOT** add commented-out code — use git history
12. **DO NOT** create `helpers.ts` or `utils.ts` grab-bag files — one purpose per file

## Glossary

Use these terms consistently across code, comments, docs, and commit messages.

| EAVFW Term | DO NOT Use | Meaning |
|------------|-----------|---------|
| **Entity** | table, model, resource | A data object defined in the manifest |
| **Attribute** | field, column, property | A property of an entity |
| **Manifest** | schema, config, spec | The JSON document defining the application model |
| **View** | grid, table, list | A visual representation of entity records |
| **Form** | detail, editor, screen | UI for creating/editing a single entity record |
| **Control** | widget, input, component | A form field component (text, lookup, toggle, etc.) |
| **Ribbon** | toolbar, commandbar, actionbar | The command/action bar above views and forms |
| **Area** | section, module, zone | A navigation grouping in the app sidebar |
| **App** | application, portal | A named application definition in the manifest |
| **Logical Name** | slug, key, identifier | Lowercase programmatic name (e.g., `security_role`) |
| **Display Name** | label, title | Human-readable name (e.g., `"Security Role"`) |

## Verification After Large Changes

After completing a phase, epic, or any large body of work, run the integration test suite at `tests/ScaffoldIntegrationTests/`. This is the single source of truth for "does everything work?"

```bash
dotnet test tests/ScaffoldIntegrationTests -- MSTest.TestTimeout=600000
```

This test automatically:
1. Cleans `sandbox/TestCRM` if it exists
2. Installs EAVFW templates from local `external/eavfw-templates/`
3. Scaffolds a full project with local references
4. Builds (twice — first generates manifest, second compiles)
5. Runs Playwright smoke test and full login flow via Aspire
6. Produces screenshots + videos in `sandbox/TestCRM/videos/` for human inspection

**Do not manually scaffold for verification.** Just run the test. The `/eavfw-scaffold-dev` skill is separate — it's for humans and AI agents to interactively explore a scaffolded project.

Note: `npm run test` (Vitest) runs unit tests for pure logic. `dotnet test tests/ScaffoldIntegrationTests` runs the full E2E integration test. They are different things.

## Governance Documents

- **ADRs**: `docs/governance/adr/` — Architecture Decision Records
- **Coding Standards**: `docs/governance/coding-standards.md`
- **Improvement Roadmap**: `docs/governance/improvement-roadmap.md`
- **AI Contribution Guide**: `docs/governance/ai-contribution-guide.md`
- **Roadmap Epics**: `docs/roadmap/` — Multi-UI framework, testing strategy, apps decomposition
