# EAVFW — Agent Instructions

## Project Identity

EAVFW (Entity-Attribute-Value Framework) is a full-stack framework for building model-driven business applications. This repository is the **core frontend monorepo** — 11 TypeScript packages providing React components, form engine, manifest types, hooks, and utilities.

The framework follows a model-driven architecture: applications are defined by a JSON manifest that describes entities, attributes, forms, views, and business rules. The runtime interprets this manifest to generate the UI dynamically.

### Key Concepts

- **Manifest**: JSON document defining the application model (entities, forms, views)
- **Entity**: A data object (equivalent to a database table, but always called "entity")
- **Attribute**: A property of an entity (equivalent to a column, but always called "attribute")
- **View**: A visual representation of entity records (grid, list, etc.)
- **Form**: UI for creating/editing a single entity record
- **Control**: A form field component (text input, lookup, toggle, etc.)
- **App**: A named application definition in the manifest with areas and navigation

### Ecosystem Architecture

EAVFW is a full-stack framework. This repo is the frontend half. The ecosystem includes:

- **This repo** (`EAVFW/`) — Frontend packages: React components, form engine, manifest types, hooks, utilities
- **eavframework** (`external/eavframework/`) — The .NET backend/application host. Includes EF Core, OData, security model, Aspire hosting extensions, and source generators.
- **eavfw-templates** (`external/eavfw-templates/`) — `dotnet new` template system for scaffolding new EAVFW projects.

Both external repos are included as git submodules under `external/`.

### Manifest: Human-Authored vs Generated

- **`manifest.json`** (in `src/{Namespace}.Models/`) — Human-authored, minimal. Entity keys use display names. Does NOT have `logicalName`, `collectionSchemaName`, or other derived properties.
- **`manifest.g.json`** (generated at build time) — The complete manifest with all generated properties. This is what the runtime uses.

When investigating runtime behavior, always look at `manifest.g.json` (in `obj/` or `bin/` directories), not `manifest.json`.

### Architecture Layers (Where to Look for Bugs)

- **Client-side errors** (JavaScript/React) → `packages/` folder (framework) or project's `src/pages/` (app routes)
- **Backend/API errors** → `external/eavframework/src/` (.NET backend)
- **URL routing / static file serving** → `external/EAVFW.Extensions.Infrastructure/` (NextJSMiddleware)
- **Aspire orchestration** → `external/eavframework/aspire/` (hosting extensions)
- **Template issues** → `external/eavfw-templates/templates/` (scaffolding)

### URL Conventions

EAVFW URLs follow the pattern: `/apps/{appName}/areas/{area}/entities/{entityName}/...`

Entity names in URLs should be **lowercase** (matching `logicalName` from the generated manifest).

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

### Debugging with Hot Reload

When Aspire is running with `.WithHotReload()`, the hot-reload dev server endpoint shows detailed Next.js error overlays with stack traces for client-side errors. Browser console errors (client-side JS) do NOT appear in Aspire dashboard logs.

## Aspire Operations

### General recommendations for working with Aspire

1. Before making any changes always run the apphost using `aspire run` and inspect the state of resources to make sure you are building from a known state.
1. Changes to the _apphost.cs_ file will require a restart of the application to take effect.
1. Make changes incrementally and run the aspire application using the `aspire run` command to validate changes.
1. Use the Aspire MCP tools to check the status of resources and debug issues.

### Running the application

To run the application run the following command:

```
aspire run
```

If there is already an instance of the application running it will prompt to stop the existing instance. You only need to restart the application if code in `apphost.cs` is changed, but if you experience problems it can be useful to reset everything to the starting state.

### Checking resources

To check the status of resources defined in the app model use the _list resources_ tool. This will show you the current state of each resource and if there are any issues. If a resource is not running as expected you can use the _execute resource command_ tool to restart it or perform other actions.

### Listing integrations

IMPORTANT! When a user asks you to add a resource to the app model you should first use the _list integrations_ tool to get a list of the current versions of all the available integrations. You should try to use the version of the integration which aligns with the version of the Aspire.AppHost.Sdk. Some integration versions may have a preview suffix. Once you have identified the correct integration you should always use the _get integration docs_ tool to fetch the latest documentation for the integration and follow the links to get additional guidance.

### Debugging issues

IMPORTANT! Aspire is designed to capture rich logs and telemetry for all resources defined in the app model. Use the following diagnostic tools when debugging issues with the application before making changes to make sure you are focusing on the right things.

1. _list structured logs_; use this tool to get details about structured logs.
2. _list console logs_; use this tool to get details about console logs.
3. _list traces_; use this tool to get details about traces.
4. _list trace structured logs_; use this tool to get logs related to a trace

### Other Aspire MCP tools

1. _select apphost_; use this tool if working with multiple app hosts within a workspace.
2. _list apphosts_; use this tool to get details about active app hosts.

### Playwright MCP server

The playwright MCP server has also been configured in this repository and you should use it to perform functional investigations of the resources defined in the app model as you work on the codebase. To get endpoints that can be used for navigation using the playwright MCP server use the list resources tool.

### Updating the app host

The user may request that you update the Aspire apphost. You can do this using the `aspire update` command. This will update the apphost to the latest version and some of the Aspire specific packages in referenced projects, however you may need to manually update other packages in the solution to ensure compatibility. You can consider using the `dotnet-outdated` with the users consent. To install the `dotnet-outdated` tool use the following command:

```
dotnet tool install --global dotnet-outdated-tool
```

### Persistent containers

IMPORTANT! Consider avoiding persistent containers early during development to avoid creating state management issues when restarting the app.

### Aspire workload

IMPORTANT! The aspire workload is obsolete. You should never attempt to install or use the Aspire workload.

### Official documentation

IMPORTANT! Always prefer official documentation when available. The following sites contain the official documentation for Aspire and related components

1. https://aspire.dev
2. https://learn.microsoft.com/dotnet/aspire
3. https://nuget.org (for specific integration package details)

## Frontend Development

### Package Architecture

```
manifest        <- Base types for the EAVFW manifest spec
  |
  +-- forms     <- Form state management
  +-- expressions <- Expression parser for manifest expressions
  +-- hooks     <- React hooks (useAsyncMemo, useChangeDetector, etc.)
  +-- utils     <- Utility functions (capitalize, deepDiff, mergeDeep, etc.)

apps            <- Model-driven app components (depends on all above)
  |
  +-- next      <- Next.js integration layer

codeeditor      <- Monaco editor wrapper (standalone)
query           <- Query API for RSC (standalone)
task-management <- Task UI components (standalone)
rich-text-editor <- Draft.js-based editor (standalone)
```

### Development Setup

```bash
npm install --force --ignore-scripts
npm run link
git submodule update --init --recursive
```

### No Build Step

Packages ship raw TypeScript source (`"main": "./src/index.ts"`). There is no transpilation or bundling. Consuming projects handle compilation.

### Coding Standards Summary

- **TypeScript**: `strict: true`, never use `any`, use `unknown` with type narrowing
- **Exports**: Named exports only, never `export default`
- **Files**: Maximum 400 lines per file
- **Components**: Plain arrow functions (not `React.FC`), destructured props
- **Naming**: PascalCase for components/types, camelCase for hooks/utils, `is`/`has` prefix for booleans
- **Testing**: Vitest for pure logic (see `docs/governance/coding-standards.md` for full details)

See `docs/governance/coding-standards.md` for the complete standards document.

## Anti-Patterns — DO NOT

1. **DO NOT** use `export default` — named exports only (see ADR-0003)
2. **DO NOT** use `any` — use `unknown`, generics, or specific types
3. **DO NOT** create files over 400 lines — split into focused modules
4. **DO NOT** add a build step — packages ship raw TypeScript (see ADR-0002)
5. **DO NOT** use `React.FC` — use plain arrow functions with typed props
6. **DO NOT** create new React contexts without checking existing ones first
7. **DO NOT** put business logic in React components — extract to hooks or pure functions
8. **DO NOT** use wrong vocabulary — say "entity" not "table", "attribute" not "field", "manifest" not "schema"
9. **DO NOT** import from internal paths of `@eavfw/*` packages — import from package root only
10. **DO NOT** leave empty catch blocks or use `@ts-ignore`

## Common Tasks

### Adding a New Control

1. Create directory: `packages/apps/src/Components/Controls/{ControlName}/`
2. Create files: `{ControlName}.tsx`, `{ControlName}.types.ts`, `index.ts`
3. Register control in `ControlRegister`
4. Re-export from `packages/apps/src/Components/Controls/index.ts`
5. Add JSDoc with `@example` showing manifest configuration

### Adding a New View Type

1. Create directory: `packages/apps/src/Components/Views/{ViewName}/`
2. Same structure as controls
3. Register in `ViewRegister`
4. Re-export from views barrel file

### Adding Manifest Types

1. Add interface to `packages/manifest/src/{Domain}/`
2. Export from `packages/manifest/src/index.ts`
3. Add JSDoc with example manifest JSON snippet

### Adding Utility Functions

1. Add to `packages/utils/src/{functionName}.ts`
2. Export from `packages/utils/src/index.ts`
3. Add JSDoc with `@example`
4. Add Vitest test: `packages/utils/src/{functionName}.test.ts`

### Adding React Hooks

1. Framework hooks: `packages/hooks/src/use{HookName}.ts`
2. App-level hooks: `packages/apps/src/Hooks/use{HookName}.ts`
3. Export from package barrel file
4. Add JSDoc with usage example

### Modifying the Manifest Spec

1. Update types in `packages/manifest/src/`
2. Update spec document: `spec/1.0.0/spec.md`
3. Ensure backward compatibility (new fields should be optional)

## Verification After Large Changes

After completing a phase, epic, or any large body of work, verify in two stages. This is mandatory.

### Stage 1: Scaffold + Build

```bash
dotnet test tests/ScaffoldIntegrationTests --filter ScaffoldAndRunSmokeTest -- MSTest.TestTimeout=600000
```

Automatically cleans sandbox, scaffolds, installs npm dependencies, runs the Next.js build, and runs a Playwright smoke test. If this passes, scaffold + build is healthy.

**Debugging test failures:** If the scaffold test fails, the Next.js build error output is included in the assertion message. You can also reproduce the error directly by running `npm run build-app` in the scaffolded sandbox project (`sandbox/TestCRM/`). This gives you the full Next.js build output with the actual error (e.g., type errors, circular dependency issues) instead of an opaque test failure.

### Stage 2: Full E2E

```bash
dotnet test tests/ScaffoldIntegrationTests --filter ScaffoldAndRunFullE2E -- MSTest.TestTimeout=600000
```

Runs the full login flow Playwright test with Aspire (SQL Server, portal, etc.). This test works in the devcontainer environment when the code is correct.

**Debugging test failures:** If the full E2E test fails, run Aspire directly in the sandbox and use the MCP tools to inspect logs:

```bash
cd sandbox/TestCRM && aspire run
```

Then use the Aspire MCP tools (`list_resources`, `list_console_logs`, `list_structured_logs`) to find the actual error — e.g., SQL Server not starting, npm build failure, Aspire config issue. You can also run `npm run build-app` in the sandbox to check for Next.js build errors directly. Once the issue is fixed and resources are healthy, run Playwright tests directly:

```bash
dotnet test tests/TestCRM.AppHost.Tests --filter FullLoginFlow --no-build -- MSTest.TestTimeout=600000
```

### Quick checks (always run first)

```bash
npm run format:check && npm run lint && npm run test
```

Screenshots + videos go to `sandbox/TestCRM/videos/` for human inspection.

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

## Release & Commit Conventions

Releases are automated via **semantic-release** with **conventional commits**:

- `feat: ...` — minor version bump
- `fix: ...` — patch version bump
- `feat!: ...` or `BREAKING CHANGE:` in body — major version bump

Release branches: `main` (stable), `dev` (prerelease), `vnext` (prerelease).

## Governance

- Architecture Decision Records: `docs/governance/adr/`
- Coding Standards: `docs/governance/coding-standards.md`
- Improvement Roadmap: `docs/governance/improvement-roadmap.md`
- AI Contribution Guide: `docs/governance/ai-contribution-guide.md`
