# ADR-0005: Adopt Vitest as Test Runner

## Status
Accepted

## Context
EAVFW has zero automated tests. The framework ships raw TypeScript with no build step (ADR-0002), uses ES modules (`"type": "module"` in all packages), and targets ES2015+ with ESNext module resolution. This combination creates friction with Jest, which requires extensive configuration for ESM projects (experimental `--experimental-vm-modules` flag, transform configuration, module name mapping).

The codebase has significant pure logic that is highly testable without any UI framework:
- `@eavfw/utils`: `capitalize`, `deepDiff`, `mergeDeep`, and other utility functions
- `@eavfw/expressions`: Expression parser for manifest expressions
- `@eavfw/manifest`: Type guards and manifest processing logic
- `@eavfw/apps`: `ModelDrivenApp` class methods for entity resolution and URL generation

React component and hook testing is a separate concern. The multi-UI-framework vision (abstracting away from Fluent UI to support multiple UI frameworks) means the component testing strategy depends on decisions about UI framework abstraction that have not yet been made. Testing components against a specific UI framework that may be swapped out would create test maintenance burden with limited long-term value.

## Decision
Adopt Vitest as the test runner for unit testing pure functions and logic.

**Initial test scope** (in priority order):
1. `@eavfw/utils` — Pure utility functions (`capitalize`, `deepDiff`, `mergeDeep`, etc.)
2. `@eavfw/expressions` — Expression parser and evaluator
3. `@eavfw/manifest` — Type guards and manifest validation logic

**Deferred scope**:
- React component tests — deferred to the multi-UI-framework epic
- React hook tests — deferred until component testing strategy is decided
- Integration tests — deferred until Aspire-based test harness is mature

**Configuration approach**:
- A single Vitest workspace configuration at the repo root
- Per-package test directories following `packages/<name>/src/__tests__/` convention
- Tests run with `vitest` (watch mode for development) and `vitest run` (CI)

## Consequences
### Positive
- Native ESM support — no build step or transform configuration needed, aligning with ADR-0002
- Fast execution with smart file watching and parallel test runs
- Compatible with the existing TypeScript setup (no `tsconfig` changes required)
- Familiar Jest-like API (`describe`, `it`, `expect`) reduces learning curve
- Workspace-aware configuration supports per-package test isolation

### Negative
- Another dev dependency added to the monorepo
- Team must learn Vitest-specific APIs and configuration (though Jest familiarity transfers)
- Initial test writing requires effort with no immediate feature value

### Neutral
- Component tests are deferred intentionally, not forgotten — this is a scoping decision, not an oversight
- The choice of Vitest over Jest is primarily driven by ESM compatibility, not feature differences
- Test coverage thresholds are not set initially — the goal is to establish the practice, not enforce metrics
