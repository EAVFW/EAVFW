# Apps Package Decomposition

## Problem

The `@eavfw/apps` package contains 169 files and 14,141 lines of code — 75% of the entire codebase. This makes it:

- Hard to navigate and understand
- Impossible to use partially (need grid views but not forms? Too bad)
- Difficult to test in isolation
- A bottleneck for parallel development

## Current Structure

```
packages/apps/src/
├── Components/
│   ├── Controls/      # Form controls (lookup, toggle, text, etc.)
│   ├── Views/         # Grid, list, detail views
│   ├── Forms/         # Form layout and rendering
│   ├── Ribbon/        # Command bar components
│   ├── Navigation/    # App nav, breadcrumbs, area switching
│   ├── Dashboard/     # Dashboard components
│   └── ... (16 subdirectories total)
├── Hooks/             # App-level React hooks
├── ModelDrivenApp.ts  # Core orchestrator (~15KB)
└── index.ts
```

## Target Architecture

```
@eavfw/views       ← Grid, list, detail view components
@eavfw/controls    ← Form control components (input, lookup, toggle, etc.)
@eavfw/navigation  ← App navigation, breadcrumbs, area switching
@eavfw/ribbon      ← Command bar / ribbon components
@eavfw/apps        ← Facade: re-exports all above + ModelDrivenApp orchestrator
```

## Migration Strategy: Facade Pattern

1. **Extract** — Move source files to new packages
2. **Facade** — `@eavfw/apps` re-exports everything from sub-packages
3. **Deprecate** — Mark direct `@eavfw/apps` imports of moved symbols as deprecated
4. **Remove** — After one major version, remove re-exports

This ensures zero breaking changes at the time of extraction.

```typescript
// packages/apps/src/index.ts (after extraction)
/** @deprecated Import from @eavfw/views instead */
export * from '@eavfw/views';
/** @deprecated Import from @eavfw/controls instead */
export * from '@eavfw/controls';
// ... ModelDrivenApp stays here as the orchestrator
export { ModelDrivenApp } from './ModelDrivenApp';
```

## Blocked By

This decomposition is **blocked by the multi-UI-framework epic** because:

1. Package boundaries should align with the plugin architecture
2. Controls extracted now as `@eavfw/controls` would become `@eavfw/controls-fluentui` later
3. Better to decompose once with the right architecture than decompose and re-decompose

## Sequencing

1. Phase 3: Split mega-files within `@eavfw/apps` (prerequisite — can't extract files that are 1000+ lines)
2. Multi-UI epic: Decide on plugin architecture and package naming
3. Phase 5: Execute decomposition aligned with multi-UI architecture

## Success Criteria

- `@eavfw/apps` is <2000 lines (just ModelDrivenApp + facade re-exports)
- Each extracted package is independently testable
- No consumer breaks (facade re-exports maintain backward compatibility)
- Integration tests verify the facade API surface matches the original
