# Multi-UI Framework Architecture

## Vision
Transform EAVFW from a Fluent UI-coupled framework into a UI-agnostic platform where `apps` is the core orchestration layer and UI implementations register themselves as plugins.

## Current State
- All components tightly coupled to Fluent UI v8/v9
- `@eavfw/forms` imports from `@eavfw/apps` (intentional — this IS the plugin registration pattern)
- Controls, views, and form elements directly render Fluent UI components
- No abstraction layer between business logic and UI rendering

## Target Architecture
```
@eavfw/core (manifest types, state management, expression engine)
    ↑ registers into
@eavfw/forms-fluentui (current forms with Fluent UI controls)
@eavfw/forms-shadcn (future: shadcn/radix form controls)
@eavfw/views-fluentui (current grid/list views)
@eavfw/views-shadcn (future)
    ↑ consumed by
@eavfw/next (Next.js integration)
@eavfw/remix (future: Remix integration)
```

## Key Design Decisions
1. **Plugin Registration**: The current `forms→apps` dependency is the embryo of this pattern. It will be formalized with a typed plugin registry.
2. **Control Interface**: Define a `Control<TProps>` interface that all UI implementations must satisfy. The manifest declares control type; the registry resolves to the active UI implementation.
3. **View Interface**: Similarly, `View<TConfig>` interface for grid/list/detail views.
4. **Theme Abstraction**: Replace direct Fluent UI theme usage with an abstract token system that maps to each UI framework's theming.

## Migration Path
1. Extract pure logic from current components (state, validation, data fetching)
2. Define abstract interfaces for controls, views, forms
3. Wrap current Fluent UI components as the first implementation
4. Build shadcn/radix implementation as proof of concept
5. Refactor consuming projects to select UI implementation

## Implications for Current Work
- **DO NOT** break the `forms→apps` dependency — it's the plugin pattern foundation
- **DO** extract business logic from UI components (this prepares for multi-UI)
- **DO** keep pure logic tests separate from component tests
- Context consolidation (Phase 3) should preserve the ability to swap UI providers
- Apps decomposition (Phase 5) should align package boundaries with this architecture

## Related ADRs
- ADR-0005 (Vitest): Testing strategy split into pure logic (shared) vs component (per-UI)
- ADR-0008 (future): Context consolidation
- ADR-0009 (future): Apps decomposition

## Status
**Planning** — This epic informs architectural decisions across all improvement phases but active implementation is deferred until Phase 3+ groundwork is complete.
