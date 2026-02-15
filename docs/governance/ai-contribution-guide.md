# AI Contribution Guide for EAVFW

## Purpose

This guide helps AI agents (Claude Code, Copilot, etc.) contribute effectively to EAVFW. It establishes conventions that make AI-generated code consistent, reviewable, and maintainable.

EAVFW is a TypeScript/React monorepo for model-driven business applications. It uses NPM workspaces with 11 packages under `@eavfw/*`. Key concepts: entities (not tables), attributes (not fields/columns), manifest (not schema), views/forms defined in JSON manifest.

## Documentation Requirements

### JSDoc

All exported functions, types, interfaces, and components MUST have JSDoc comments. This is non-negotiable for AI contributions.

- Include `@param` for each parameter with description
- Include `@returns` with description
- Include `@example` with a working code snippet for non-trivial APIs
- Include `@see` to reference related functions/types

Example:

````typescript
/**
 * Deeply merges two objects, with source values overriding target values.
 * Arrays are replaced, not concatenated.
 *
 * @param target - The base object to merge into
 * @param source - The object whose values take priority
 * @returns A new object with merged values (does not mutate inputs)
 *
 * @example
 * ```typescript
 * const result = mergeDeep(
 *   { a: 1, b: { c: 2, d: 3 } },
 *   { b: { c: 4 } }
 * );
 * // result: { a: 1, b: { c: 4, d: 3 } }
 * ```
 *
 * @see deepDiff - For comparing objects instead of merging
 */
export const mergeDeep = <T extends Record<string, unknown>>(target: T, source: Partial<T>): T => {
  // implementation
};
````

### Module-Level Documentation

Every `index.ts` barrel file should have a `@module` JSDoc comment describing the package purpose, its dependency context, and key exports:

```typescript
/**
 * @module @eavfw/utils
 *
 * Utility functions for the EAVFW framework. Pure functions with no
 * React or framework dependencies. Safe to use in any context.
 *
 * Key exports:
 * - {@link capitalize} - String capitalization
 * - {@link deepDiff} - Object comparison
 * - {@link mergeDeep} - Deep object merging
 */
```

## File Organization Principles

### Single Responsibility

Each file should have ONE clear purpose. AI agents process files as atomic units -- a focused file is easier to understand, modify, and test.

Good:

- `useEntityLookup.ts` -- One hook that resolves entity definitions
- `validateManifest.ts` -- One function that validates manifest structure

Bad:

- `helpers.ts` -- Grab bag of unrelated functions
- `utils.ts` -- Ambiguous, could contain anything

### Predictable File Locations

Given a feature name, an AI agent should be able to predict where the code lives:

| Looking for...          | Look in...                                          |
| ----------------------- | --------------------------------------------------- |
| Entity type definitions | `packages/manifest/src/Entities/`                   |
| Form components         | `packages/apps/src/Components/Forms/`               |
| View components         | `packages/apps/src/Components/Views/`               |
| Control components      | `packages/apps/src/Components/Controls/`            |
| React hooks             | `packages/hooks/src/` or `packages/apps/src/Hooks/` |
| Expression parsing      | `packages/expressions/src/`                         |
| Form state management   | `packages/forms/src/`                               |
| Next.js integration     | `packages/nextjs/src/`                              |
| Utility functions       | `packages/utils/src/`                               |

### New File Checklist

When creating a new file:

1. Place it in the correct package and directory
2. Add JSDoc to all exports
3. Add re-export to the nearest `index.ts` barrel file
4. Use named exports only (never `export default`)
5. Keep under 400 lines
6. Add corresponding `.test.ts` file for pure logic

## EAVFW Vocabulary

Use these terms consistently. Never use the alternatives. This vocabulary reflects the EAV (Entity-Attribute-Value) domain model that EAVFW is built on.

| Correct Term | DO NOT Use                     | Description                                             |
| ------------ | ------------------------------ | ------------------------------------------------------- |
| Entity       | Table, Model, Resource         | A data object defined in the manifest                   |
| Attribute    | Field, Column, Property        | A property of an entity                                 |
| Manifest     | Schema, Config, Spec           | The JSON document defining the application model        |
| View         | Grid, Table, List              | A visual representation of entity records               |
| Form         | Detail, Editor, Screen         | A UI for creating/editing a single entity record        |
| Control      | Widget, Input, Component       | A form field control (text, lookup, toggle, etc.)       |
| Ribbon       | Toolbar, CommandBar, ActionBar | The command/action bar above views and forms            |
| Area         | Section, Module, Zone          | A navigation grouping in the app sidebar                |
| App          | Application, Portal            | A named application definition in the manifest          |
| Logical Name | slug, key, identifier          | The lowercase programmatic name (e.g., `security_role`) |
| Display Name | label, title                   | The human-readable name (e.g., `"Security Role"`)       |

This vocabulary applies to code, comments, JSDoc, commit messages, and PR descriptions. For example, write "added a new attribute to the entity" not "added a new field to the table".

## Registry Patterns

EAVFW uses registry patterns for extensibility. Understand these before modifying component resolution.

### ControlRegister

Maps control types to React components. Found in `packages/apps/src/Components/Controls/`.

```typescript
// Register a new control type
registerControl('MyCustomControl', MyCustomControlComponent);
```

### ViewRegister

Maps view types to React components. Found in `packages/apps/src/Components/Views/`.

### How Resolution Works

1. Manifest defines a form/view with control references
2. `ModelDrivenApp` resolves entity from the form/view definitions
3. Form/view renderer looks up control type in the registry
4. Registry returns the React component to render

Understanding this flow is critical when debugging why a control does not appear or renders incorrectly. The manifest is the source of truth; the registry is the runtime lookup mechanism.

## Anti-Patterns (DO NOT)

1. **DO NOT** use `export default` -- use named exports only. Default exports make refactoring harder and prevent consistent import naming across the codebase.
2. **DO NOT** use `any` -- use `unknown`, generics, or specific types. The `any` type defeats the purpose of TypeScript and hides bugs.
3. **DO NOT** create files over 400 lines. Split into focused modules instead.
4. **DO NOT** add dependencies without checking if the functionality exists in `@eavfw/utils`. Duplicate utility functions create maintenance burden.
5. **DO NOT** use `React.FC` -- use plain arrow functions with typed props. `React.FC` adds implicit `children` and has other quirks that cause confusion.
6. **DO NOT** create new React contexts without checking if an existing context covers the use case. The codebase already has many contexts; adding more increases complexity.
7. **DO NOT** put business logic in React components -- extract to hooks or pure functions. Components should focus on rendering; logic should be testable in isolation.
8. **DO NOT** use abbreviations in names (except `id`, `url`, `api`). Write `entityDefinition` not `entDef`, write `attribute` not `attr`.
9. **DO NOT** leave empty catch blocks -- at minimum log the error. Silent failures are the hardest bugs to diagnose.
10. **DO NOT** use `@ts-ignore` -- use `@ts-expect-error` with an explanation comment, or fix the type. `@ts-expect-error` at least fails when the suppressed error is resolved.
11. **DO NOT** import from internal paths of other `@eavfw/*` packages -- only import from the package root (e.g., `import { foo } from "@eavfw/utils"`, not `import { foo } from "@eavfw/utils/src/internal"`).
12. **DO NOT** use "table", "field", "column", "schema" -- use EAVFW vocabulary (entity, attribute, manifest). See the vocabulary section above.

## Common Tasks

### Adding a New Control

1. Create component in `packages/apps/src/Components/Controls/{ControlName}/`
2. Create `{ControlName}.tsx`, `{ControlName}.types.ts`, `index.ts`
3. Register in `ControlRegister`
4. Add re-export to `packages/apps/src/Components/Controls/index.ts`
5. Add JSDoc with `@example` showing manifest configuration

### Adding a New View Type

1. Create component in `packages/apps/src/Components/Views/{ViewName}/`
2. Same file structure as controls
3. Register in `ViewRegister`
4. Add re-export

### Adding Manifest Types

1. Add interface to appropriate file in `packages/manifest/src/`
2. Export from `packages/manifest/src/index.ts`
3. Add JSDoc with example manifest JSON showing how the type is used in a real manifest

### Adding Utility Functions

1. Add to `packages/utils/src/`
2. Export from `packages/utils/src/index.ts`
3. Add JSDoc with `@example`
4. Add Vitest test in `packages/utils/src/{function}.test.ts`

### Adding React Hooks

1. Add to `packages/hooks/src/` (framework-level) or `packages/apps/src/Hooks/` (app-level)
2. Name with `use` prefix
3. Export from package barrel file
4. Add JSDoc with `@param`, `@returns`, and `@example`

## Code Review Checklist for AI

Before submitting any change, verify:

- [ ] All exports have JSDoc with `@example`
- [ ] No `any` types introduced
- [ ] No `export default`
- [ ] No files exceed 400 lines
- [ ] EAVFW vocabulary used consistently (in code, comments, and commit messages)
- [ ] Named exports added to barrel files
- [ ] Pure logic has corresponding test file
- [ ] No new React contexts without justification
- [ ] No circular dependencies between packages
- [ ] Commit message follows conventional commits format (`feat:`, `fix:`, `refactor:`, etc.)
