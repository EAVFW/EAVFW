# Testing Strategy

## Vision

Establish a comprehensive testing pyramid for EAVFW that respects the multi-UI-framework architecture and no-build-step philosophy.

## Testing Layers

### Layer 1: Pure Logic Unit Tests (NOW — Phase 1-2)

**Runner**: Vitest
**Scope**: Functions with no React/DOM dependencies
**Packages**: `@eavfw/utils`, `@eavfw/expressions`, `@eavfw/manifest`, `@eavfw/forms` (reducer logic)

Examples:

- `capitalize("hello world")` → `"Hello World"`
- `deepDiff(objA, objB)` → diff object
- `parseExpression("$entity.name")` → AST
- `manifestTypeGuard(input)` → boolean
- `ModelDrivenApp.getEntity("permission")` → entity definition
- Form state reducer: dispatch action → new state

**Why start here**: Zero dependencies, fast execution, highest confidence-to-effort ratio.

### Layer 2: React Hook Tests (Multi-UI Epic)

**Runner**: Vitest + `@testing-library/react` (renderHook)
**Scope**: Custom hooks that manage state and side effects
**Packages**: `@eavfw/hooks`, `@eavfw/forms` (useEAVForm)

Examples:

- `useAsyncMemo` with loading/error/success states
- `useChangeDetector` tracking form dirty state
- `useExpressionParser` evaluating expressions against entity data

**Why deferred**: Hook tests need a React test environment. The testing setup should be designed alongside the multi-UI abstraction to ensure hooks are testable independent of UI framework.

### Layer 3: Component Tests (Per-UI Implementation)

**Runner**: Vitest + `@testing-library/react`
**Scope**: React components with DOM assertions
**Packages**: Future `@eavfw/forms-fluentui`, `@eavfw/views-fluentui`, etc.

**Why deferred**: Component tests are specific to a UI framework implementation. Testing a Fluent UI `LookupControl` is different from testing a shadcn `LookupControl`. These tests belong in the UI-specific packages.

### Layer 4: E2E Tests (EXISTS)

**Runner**: Playwright via Aspire
**Scope**: Full application flow (login, navigation, CRUD operations)
**Where**: Scaffolded test projects using `dotnet new eavfw` templates

Already exists and will continue to be the primary integration validation.

## Why Vitest

| Requirement              | Vitest                | Jest                                           |
| ------------------------ | --------------------- | ---------------------------------------------- |
| Native ESM support       | Yes                   | Requires experimental flags + transform config |
| TypeScript without build | Yes (via esbuild)     | Requires ts-jest or babel                      |
| Watch mode               | Yes (fast, HMR-based) | Yes (slower)                                   |
| Jest API compatibility   | ~95% compatible       | N/A                                            |
| Workspace support        | Native                | Requires projects config                       |
| No build step alignment  | Works with raw .ts    | Needs transform pipeline                       |

## Configuration

Root `vitest.config.ts` with workspace-aware config. Each package can override with local `vitest.config.ts`. Test files co-located with source: `{module}.test.ts`.

## Coverage Targets

| Phase   | Target                   | Scope                        |
| ------- | ------------------------ | ---------------------------- |
| Phase 1 | >0% (establish baseline) | `@eavfw/utils`               |
| Phase 2 | 30% for tested packages  | utils, expressions, manifest |
| Phase 4 | 30% overall              | All packages with pure logic |
| Phase 6 | 60%+                     | All packages                 |

## Test Fixtures

Create shared test fixtures in a `test-utils/` directory:

- Sample `ManifestDefinition` objects (minimal, complex, edge cases)
- Sample entity definitions with various attribute types
- Mock form state for reducer tests
- Expression AST examples
