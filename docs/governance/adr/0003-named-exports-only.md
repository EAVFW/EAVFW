# ADR-0003: Named Exports Only

## Status

Accepted

## Context

The codebase has 29 `export default` statements across packages. Default exports cause several problems:

- **Inconsistent naming**: Each import site can choose a different name for the same module, making it harder to search for usages (`import Foo` vs `import Bar` for the same component).
- **Tree-shaking**: Default exports are harder for bundlers to analyze statically, resulting in larger bundles for consuming projects.
- **Refactoring**: Automated refactoring tools (including AI agents) cannot reliably rename default exports across the codebase because the name is defined at the import site, not the export site.
- **Discoverability**: Named exports appear in IDE autocomplete when typing `import { }` from a module, while default exports require knowing the module path first.

Named exports make the codebase more grep-friendly, more predictable, and more amenable to automated analysis and transformation.

## Decision

All exports must be named exports. `export default` is not permitted in new code.

Barrel files (`index.ts`) re-export using `export * from "./Module"` or `export { SpecificThing } from "./Module"` patterns.

An ESLint rule (`no-restricted-exports`) will enforce this convention once ESLint is adopted (see improvement roadmap).

Existing `export default` statements will be migrated as follows:

1. Add a named export alongside the default export
2. Keep the default export as a deprecated re-export for one major version cycle
3. Remove the default export in the next major version

This migration is scheduled for Phase 3 of the improvement roadmap.

## Consequences

### Positive

- Consistent import names across the entire codebase — a component has one canonical name everywhere
- Better tree-shaking for consuming projects
- AI-friendly: agents can predict export names from file names and grep reliably
- IDE autocomplete works more predictably with named exports

### Negative

- Breaking change for consumers currently importing defaults (mitigated by the deprecated re-export strategy)
- Slightly more verbose for single-export modules (`export function Foo` vs `export default function`)

### Neutral

- Aligns with modern TypeScript community conventions (the TypeScript team itself uses named exports exclusively)
- Barrel files become the single source of truth for a package's public API
