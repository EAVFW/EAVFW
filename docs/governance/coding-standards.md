# EAVFW Coding Standards

This document defines the coding standards for the EAVFW monorepo. All new code must follow these standards. Existing code should be migrated incrementally as files are touched.

---

## TypeScript

`strict: true` is mandatory in all `tsconfig.json` files. The following additional compiler flags must also be enabled:

- `noUnusedLocals`
- `noUnusedParameters`
- `noImplicitReturns`

### No `any`

Never use `any`. The codebase currently has 201 instances of `any` -- these are tech debt, not precedent. Use the following alternatives:

- `unknown` with type narrowing (type guards, `instanceof`, `typeof`, discriminated unions)
- Generics for flexible but type-safe APIs
- Specific types or interfaces for known shapes
- `Record<string, unknown>` instead of `Record<string, any>` for arbitrary key-value objects

```typescript
// Bad
function parseManifest(input: any): any { ... }

// Good
function parseManifest(input: unknown): ManifestDefinition {
  if (!isManifestDefinition(input)) {
    throw new Error('Invalid manifest structure');
  }
  return input;
}
```

### Interfaces vs Types

- Prefer `interface` for object shapes (they produce better error messages and support declaration merging)
- Use `type` for unions, intersections, mapped types, and conditional types

```typescript
// Object shape: use interface
interface EntityDefinition {
  logicalName: string;
  pluralName: string;
  attributes: Record<string, AttributeDefinition>;
}

// Union: use type
type AttributeType = 'string' | 'number' | 'lookup' | 'choice';

// Mapped/conditional: use type
type ReadonlyEntity<T> = { readonly [K in keyof T]: T[K] };
```

### `satisfies` Operator

Use `satisfies` for type-safe object literals where you want to validate the shape but preserve the narrower inferred type:

```typescript
const defaultFormConfig = {
  columns: 2,
  labelPosition: 'top',
  validationMode: 'onChange',
} satisfies FormConfig;
```

### Exhaustive Switch Statements

All switch statements on discriminated unions must include a `never` check in the default case:

```typescript
function handleAttributeType(type: AttributeType): string {
  switch (type) {
    case 'string':
      return 'text';
    case 'number':
      return 'numeric';
    case 'lookup':
      return 'reference';
    case 'choice':
      return 'select';
    default: {
      const _exhaustive: never = type;
      throw new Error(`Unhandled attribute type: ${_exhaustive}`);
    }
  }
}
```

### Template Literal Types

Use template literal types for string patterns where applicable:

```typescript
type EntityRoute = `/apps/${string}/areas/${string}/entities/${string}`;
type LogicalName = Lowercase<string>;
```

---

## React Components

### Component Declaration

Use plain arrow functions. Do not use `React.FC` -- it adds an implicit `children` prop and does not support generics well.

```typescript
// Bad
const EntityList: React.FC<EntityListProps> = (props) => { ... };

// Good
const EntityList = (props: EntityListProps) => { ... };

// Good (with generics)
const TypedList = <T extends EntityDefinition>(props: TypedListProps<T>) => { ... };
```

### Props

- Name props interfaces `{ComponentName}Props`
- Destructure props in the function signature
- Place the props interface in a `.types.ts` file if it exceeds ~10 lines

```typescript
interface RibbonButtonProps {
  label: string;
  icon?: string;
  disabled?: boolean;
  onClick: () => void;
}

const RibbonButton = ({ label, icon, disabled = false, onClick }: RibbonButtonProps) => {
  // ...
};
```

### Memoization

Use `React.memo` for components that receive object or array props whose identity does not change between renders:

```typescript
const EntityRow = React.memo(({ entity, columns }: EntityRowProps) => {
  // ...
});
```

### Custom Hooks

Extract custom hooks into their own files named `useComponentName.ts`:

```
FormPanel/
  useFormPanel.ts
  FormPanel.tsx
```

### Composition Over Configuration

Prefer composition patterns (render props, children, compound components) over large prop interfaces with many configuration options:

```typescript
// Bad: large config prop interface
<DataGrid columns={[...]} onRowClick={...} renderHeader={...} renderFooter={...} />

// Good: composition
<DataGrid data={items}>
  <DataGrid.Header>
    <SearchBox />
  </DataGrid.Header>
  <DataGrid.Body columns={columns} onRowClick={handleClick} />
  <DataGrid.Footer>
    <Pagination />
  </DataGrid.Footer>
</DataGrid>
```

---

## State Management

| Scope | Pattern |
|---|---|
| Component-local | `useState` / `useReducer` |
| Parent-child (1-2 levels) | Props drilling |
| Subtree (3+ levels) | React Context with dedicated provider |
| Server cache | SWR (already in use) |
| Derived data | `useMemo` (pure computation) |

### Context Guidelines

The codebase currently has 33 React contexts. New contexts must follow these rules:

1. **Narrow scope.** Each context should own a single concern. Do not bundle unrelated state into one context.
2. **Split by update frequency.** Never put frequently-changing values (e.g., cursor position, input text) in the same context as rarely-changing values (e.g., theme, permissions). Changes to any value in a context re-render all consumers.
3. **Dedicated provider component.** Each context must have a corresponding `{Name}Provider` component that encapsulates the state logic.
4. **Custom hook for consumption.** Expose a `use{Name}` hook rather than exporting the context object directly. The hook should throw if used outside the provider.

```typescript
const FormStateContext = createContext<FormState | null>(null);

const useFormState = (): FormState => {
  const ctx = useContext(FormStateContext);
  if (ctx === null) {
    throw new Error('useFormState must be used within a FormStateProvider');
  }
  return ctx;
};
```

---

## Exports

- **Named exports only.** Never use `export default`. See ADR-0003 for rationale.
- **Barrel files** (`index.ts`) at both the package level and directory level for grouping re-exports.
- Use `export * from './Module'` for re-exports in barrel files.

```typescript
// packages/forms/src/index.ts
export * from './EAVForm';
export * from './FormContext';
export * from './validation';
```

---

## Formatting (Prettier)

The following Prettier configuration applies to all packages:

| Option | Value |
|---|---|
| `printWidth` | 100 |
| `tabWidth` | 2 |
| `useTabs` | false |
| `semi` | true |
| `singleQuote` | true |
| `trailingComma` | all |
| `arrowParens` | always |
| `bracketSpacing` | true |
| `endOfLine` | lf |

### Adoption Strategy

1. One initial formatting commit per package (message: `style: apply prettier formatting to {package}`)
2. After the initial commit, all changes must conform to the formatter
3. Do not mix formatting changes with logic changes in the same commit

---

## File Organization

Components should follow this directory structure:

```
ComponentName/
  index.ts              # Re-exports from ComponentName.tsx
  ComponentName.tsx      # Component implementation
  ComponentName.types.ts # Props, interfaces, types
  useComponentName.ts    # Custom hook (if needed)
```

For simple components (under ~50 lines with few types), a single file is acceptable. The directory structure is required once a component grows beyond that or gains a custom hook.

---

## Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Component files | PascalCase | `ModelDrivenApp.ts`, `EntityList.tsx` |
| Hook files | camelCase with `use` prefix | `useAsyncMemo.ts`, `useEAVForm.ts` |
| Utility files | camelCase | `deepDiff.ts`, `mergeDeep.ts` |
| Components | PascalCase | `ModelDrivenGridViewer` |
| Hooks | camelCase with `use` prefix | `useEAVForm`, `useChangeDetector` |
| Utility functions | camelCase, verb-noun | `capitalizeString`, `mergeDeep` |
| Types / Interfaces | PascalCase | `ManifestDefinition`, `EntityDefinition` |
| Boolean variables | `is`/`has`/`should`/`can` prefix | `isLoading`, `hasPermission`, `canEdit` |
| True constants | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE`, `DEFAULT_PAGE_SIZE` |
| Configuration objects | camelCase | `defaultFormConfig`, `gridOptions` |

### Abbreviation Policy

Do not abbreviate names except for the following universally understood abbreviations:

- `id` (identifier)
- `url` (uniform resource locator)
- `api` (application programming interface)

All other words must be spelled out: `button` not `btn`, `message` not `msg`, `configuration` not `config`.

---

## Error Handling

### Async Operations

Wrap all async operations in `try/catch`. Never let promise rejections go unhandled.

```typescript
const loadEntity = async (entityName: string): Promise<EntityDefinition | null> => {
  try {
    const response = await fetch(`/api/entities/${entityName}`);
    if (!response.ok) {
      throw new Error(`Failed to load entity "${entityName}": ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading entity "${entityName}":`, error);
    return null;
  }
};
```

### Error Boundaries

Place error boundaries at domain boundaries:

- Per-route (catches failures in an entire page)
- Per-panel (isolates failures in sidepanels, dialogs, embedded views)
- Around third-party components (Monaco editor, rich text editor)

### Rules

- Never write an empty `catch` block. At minimum, log the error.
- Prefer early returns for guard clauses to reduce nesting.
- Error messages must be actionable -- tell the user or developer what to do, not just what happened.

```typescript
// Bad
catch (e) {}

// Bad
catch (e) { throw new Error('Something went wrong'); }

// Good
catch (error) {
  console.error('Failed to save record. Check network connectivity and retry.', error);
  setErrorMessage('Unable to save. Please check your connection and try again.');
}
```

---

## Imports

### Ordering

Group imports in this order, with a blank line between each group:

1. React and Next.js (`react`, `next/*`)
2. External libraries (`@fluentui/*`, `swr`, `lodash`, etc.)
3. `@eavfw/*` packages (`@eavfw/manifest`, `@eavfw/forms`, etc.)
4. Relative imports (`./`, `../`)

```typescript
import { useState, useMemo } from 'react';
import { useRouter } from 'next/router';

import { Stack, DetailsList } from '@fluentui/react';
import useSWR from 'swr';

import { ManifestDefinition } from '@eavfw/manifest';
import { useEAVForm } from '@eavfw/forms';

import { EntityRow } from './EntityRow';
import { useEntityList } from './useEntityList';
```

### Circular Imports

Circular imports between packages are forbidden. The one intentional exception is the plugin registration pattern between `@eavfw/forms` and `@eavfw/apps`, which uses dynamic registration to break the cycle.

---

## Comments and Documentation

### JSDoc

All exported functions, types, and components must have JSDoc comments:

```typescript
/**
 * Resolves an entity definition from the manifest by logical name.
 *
 * Performs a case-insensitive lookup and returns the full entity definition
 * including attributes, views, and forms.
 *
 * @param manifest - The complete generated manifest
 * @param entityName - The logical name of the entity (e.g., 'securityrole')
 * @returns The entity definition, or undefined if not found
 *
 * @example
 * ```typescript
 * const entity = resolveEntity(manifest, 'permission');
 * if (entity) {
 *   console.log(entity.pluralName);
 * }
 * ```
 */
export const resolveEntity = (
  manifest: ManifestDefinition,
  entityName: string,
): EntityDefinition | undefined => {
  // ...
};
```

### Module Comments

Each `index.ts` barrel file should have a `@module` comment at the top:

```typescript
/**
 * @module @eavfw/manifest
 *
 * Type definitions for the EAVFW manifest specification.
 * Includes entity, attribute, form, view, and validation types.
 */
export * from './EntityDefinition';
export * from './AttributeDefinition';
```

### Inline Comments

- Use inline comments only to explain "why", never "what". The code itself should communicate what it does.
- Never commit commented-out code. Use git history to recover old implementations.

---

## Performance

### Memoization

- Use `React.memo` for components that receive stable props (objects/arrays passed from parent that do not change identity on every render).
- Use `useMemo` for expensive computations or to stabilize object/array identity.
- Use `useCallback` for callback functions passed as props to memoized children.

### Render Optimization

Avoid creating new objects, arrays, or functions inside render. These create new references on every render and defeat memoization:

```typescript
// Bad: new object on every render
<Component style={{ marginTop: 8 }} />

// Good: stable reference
const style = useMemo(() => ({ marginTop: 8 }), []);
<Component style={style} />

// Bad: new array on every render
<List items={data.filter((d) => d.active)} />

// Good: memoized
const activeItems = useMemo(() => data.filter((d) => d.active), [data]);
<List items={activeItems} />
```

### Lazy Loading

Use `React.lazy` with `Suspense` for heavy components that are not needed on initial render:

```typescript
const MonacoEditor = React.lazy(() =>
  import('@eavfw/codeeditor').then((m) => ({ default: m.CodeEditor })),
);

const EditorPanel = () => (
  <Suspense fallback={<Spinner label="Loading editor..." />}>
    <MonacoEditor />
  </Suspense>
);
```

---

## Testing (see ADR-0005)

### Framework

Use **Vitest** for all pure logic tests. There is currently no test runner configured in this repo -- tests will be added incrementally.

### File Naming and Location

Test files are co-located with source files:

```
deepDiff.ts
deepDiff.test.ts
```

### Structure

Use `describe`/`it` blocks with readable names that form a sentence:

```typescript
describe('deepDiff', () => {
  it('returns an empty object when both inputs are identical', () => {
    const obj = { name: 'Permission', logicalName: 'permission' };
    expect(deepDiff(obj, obj)).toEqual({});
  });

  it('detects added properties', () => {
    const before = { name: 'Permission' };
    const after = { name: 'Permission', logicalName: 'permission' };
    expect(deepDiff(before, after)).toEqual({ logicalName: 'permission' });
  });
});
```

### Guidelines

- One assertion concept per test. A single `it` block should verify one behavior.
- Use test fixtures for `ManifestDefinition` objects and other complex structures. Place shared fixtures in a `__fixtures__/` directory.
- Prefer `toEqual` for deep comparisons, `toBe` for primitives and referential identity.
- Do not test implementation details. Test the public API of each module.
