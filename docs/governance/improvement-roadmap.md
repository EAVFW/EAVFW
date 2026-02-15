# EAVFW Improvement Roadmap

A phased plan to improve code quality, type safety, testing, and architecture of the EAVFW monorepo. Each phase builds on the previous, and phases are designed to minimize risk to downstream consumers. The goal is to move from the current state (zero tests, zero linting, significant technical debt) to a well-tested, strictly typed, modular codebase — without breaking existing projects that depend on `@eavfw/*` packages.

## Current State (Baseline Metrics)

| Metric            | Current               |
| ----------------- | --------------------- |
| Test files        | 0                     |
| `any` occurrences | 201 (across 78 files) |
| Files >400 lines  | 8                     |
| Default exports   | 29                    |
| React contexts    | 33                    |
| JSDoc coverage    | ~5%                   |
| ESLint config     | None                  |
| Prettier config   | None                  |

## Phase 1: Foundation — Tooling & Standards

**Consumer risk: Zero — no functional changes**

- Create governance folder, ADR template, ADR-0001 through ADR-0005
- ESLint config (warn-only initially): `no-explicit-any` (warn), `no-restricted-exports` (warn for default), `max-lines` (warn at 400)
- Prettier config + initial formatting commit (one-time mass format, then enforced)
- Vitest setup + first tests for `@eavfw/utils` pure logic: `capitalize`, `deepDiff`, `mergeDeep`, `flattenObject`, etc.
- Add `lint`, `test`, `format` scripts to root `package.json`
- CI workflow: lint (warn-only, no fail) + test + format check
- JSDoc all `@eavfw/utils` exports (sets the documentation template)

**Deliverables**: ESLint config, Prettier config, Vitest config, ~5 test files, CI workflow, documented utils package

## Phase 2: Type Safety — Eliminate `any`

**Consumer risk: Low-Medium (type signature changes may require consumer updates)**

- ADR-0006 (React component patterns), ADR-0007 (no-any policy)
- Fix `any` types package by package: manifest (~18), hooks (~5), utils (~17), expressions (~18), forms (~23)
- Enable strict tsconfig flags: `noUnusedLocals`, `noUnusedParameters` across all packages
- Vitest tests for expression parser + form state reducer (pure logic)
- Escalate `no-explicit-any` to error for fully-clean packages
- Replace `@ts-ignore` (20 occurrences) with `@ts-expect-error` and proper type fixes

**Deliverables**: Zero `any` in utils/hooks/manifest, strict tsconfig, ~10 additional test files

## Phase 3: Architecture — Split Files, Consolidate Contexts

**Consumer risk: Medium (mitigated by deprecated re-exports for one major version)**

- ADR-0008 (context consolidation strategy)
- Split 6 mega-files:
  - `ModelDrivenGridViewer.tsx` (1,027 lines -> 4-5 files: grid logic, column config, row rendering, toolbar, hooks)
  - `EAVForm.tsx` (~800 lines -> form container, field renderer, validation, submission, hooks)
  - `LookupControl.tsx` -> search logic, dropdown UI, option rendering
  - `SectionComponent.tsx` -> section layout, field grouping, visibility logic
  - `themeDuplicates.ts` (1,098 lines -> theme tokens, component styles, utility functions)
  - `useManifest.ts` -> entity resolution, attribute lookup, form/view retrieval
- Consolidate contexts (33 -> ~24):
  - Merge `AppContext` + `AppInfoContext` -> `AppContext`
  - Merge `MessageContext` + `WarningContext` -> `NotificationContext`
  - Fold `DirtyContext` into `EAVFormContext`
  - Other candidates identified by usage analysis
- Convert 29 default exports -> named exports (with deprecated re-exports)
- **Note**: `forms->apps` dependency is intentional plugin registration — deferred to multi-UI epic

**Deliverables**: Zero files >400 lines, ~24 contexts, zero default exports

## Phase 4: Expanded Testing

**Consumer risk: Zero**

- Vitest tests for `ModelDrivenApp` class (entity lookup, URL generation, app resolution)
- Manifest type guard tests (validate correct/incorrect manifest shapes)
- Test fixtures: sample `ManifestDefinition` objects for common scenarios
- Coverage reporting with target: 30% for packages with tests
- **Note**: React hook/component tests deferred to multi-UI epic (testing strategy depends on UI framework abstraction)

**Deliverables**: ~25 total test files, coverage reporting, shared test fixtures

## Phase 5: Apps Package Decomposition

**Consumer risk: Low (facade preserves existing imports)**

- ADR-0009 (decomposition strategy)
- Extract domain packages from `@eavfw/apps` (169 files, 14K lines):
  - `@eavfw/views` — Grid, list, and detail views
  - `@eavfw/controls` — Form controls (input, lookup, toggle, etc.)
  - `@eavfw/navigation` — App navigation, breadcrumbs, area switching
  - `@eavfw/ribbon` — Command bar / ribbon components
- `@eavfw/apps` becomes a facade package re-exporting all sub-packages
- Integration tests verifying facade API surface matches original
- **Blocked by**: Multi-UI-framework decisions (decomposition should align with plugin architecture)

**Deliverables**: 4 new packages extracted, `apps` as facade, integration tests

## Phase 6: Polish & AI Optimization

**Consumer risk: Zero**

- ADR-0010 (JSDoc requirements), ADR-0011 (Fluent UI v8->v9 migration), ADR-0012 (deprecation process)
- JSDoc all exported symbols across all packages with `@example` tags
- Per-package `README.md` with architecture diagrams and usage examples
- Escalate all ESLint rules from warn -> error
- Performance audit: identify and memoize expensive renders
- `@module` comments in all `index.ts` files

**Deliverables**: 100% JSDoc coverage, package READMEs, ESLint errors enforced

## Target Metrics

| Metric            | Now | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Phase 6 |
| ----------------- | --- | ------- | ------- | ------- | ------- | ------- | ------- |
| Test files        | 0   | 5+      | 15+     | 15+     | 25+     | 30+     | 40+     |
| `any` occurrences | 201 | 201     | <50     | <20     | <20     | <10     | 0       |
| Files >400 lines  | 8   | 8       | 8       | 0       | 0       | 0       | 0       |
| Default exports   | 29  | 29      | 29      | 0       | 0       | 0       | 0       |
| Contexts          | 33  | 33      | 33      | ~24     | ~24     | ~20     | <20     |
| JSDoc coverage    | ~5% | ~15%    | ~25%    | ~40%    | ~50%    | ~70%    | 100%    |

## Dependencies and Sequencing

```
Phase 1 (Foundation) ──> Phase 2 (Type Safety) ──> Phase 3 (Architecture) ──> Phase 5 (Decomposition)
                    └──> Phase 4 (Testing) ──────────────────────────────────> Phase 6 (Polish)
```

Phases 4 and 5 can proceed in parallel after Phase 3. Phase 6 depends on all prior phases.

The multi-UI-framework epic (see `docs/roadmap/multi-ui-framework.md`) influences Phases 3, 5, and the component testing strategy in Phase 4.

## Cross-Cutting Epics (Run in Parallel)

These epics are independent of the phases above and can be worked on incrementally alongside any phase:

- **OpenTelemetry** (`docs/roadmap/opentelemetry.md`) — Full-stack observability: backend spans/metrics, frontend tracing, Aspire dashboard enrichment. Touches `external/eavframework/` (backend) and `packages/` (frontend).
- **Release Strategy** (`docs/roadmap/release-strategy.md`) — Unified versioning with Release Please. All npm + NuGet packages share one version. Central trigger from this repo, human-gated via release PRs. Replaces semantic-release.
- **Multi-UI Framework** (`docs/roadmap/multi-ui-framework.md`) — Abstract away Fluent UI dependency.
- **Testing Strategy** (`docs/roadmap/testing-strategy.md`) — Comprehensive testing approach.
- **Apps Decomposition** (`docs/roadmap/apps-decomposition.md`) — Break up the 14K-line `@eavfw/apps` package.
