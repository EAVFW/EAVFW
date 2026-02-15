# ADR-0002: Ship Raw TypeScript With No Build Step

## Status

Accepted

## Context

EAVFW is a TypeScript monorepo with 11 packages under NPM workspaces. The packages ship raw TypeScript source, with each package's `"main"` field pointing to `./src/index.ts`. Consuming projects — typically Next.js applications scaffolded from EAVFW templates — handle all compilation as part of their own build process.

This approach eliminates the need for build coordination across 11 interdependent packages. In a traditional setup, changing a type in `@eavfw/manifest` would require rebuilding `manifest`, then `forms`, then `apps`, then `next` — a cascade that slows development and introduces stale artifact bugs. With raw TypeScript, changes propagate immediately.

The consuming project's bundler (webpack via Next.js) already compiles all TypeScript. Adding a separate compilation step in the monorepo would duplicate work and introduce a class of "forgot to rebuild" errors.

## Decision

Packages will continue to ship raw TypeScript source. There is no transpilation, no bundling, and no declaration file generation in this repo. The `"main"` field in each package's `package.json` points to `./src/index.ts`.

Consuming projects must configure their bundler or compiler to handle `.ts` imports from `node_modules/@eavfw/*`. For Next.js projects, this means adding `@eavfw/*` to the `transpilePackages` configuration (or equivalent).

Type checking is performed by the consuming project's `tsc` invocation, not by the monorepo itself.

## Consequences

### Positive

- Zero build step simplifies the developer experience — `npm install` and you are ready
- No stale build artifacts — what you edit is what gets consumed
- Hot reload works naturally since the source files are the distribution files
- Consuming projects control their own compilation targets (ES2015, ES2020, etc.)
- No build cache invalidation issues across 11 packages

### Negative

- Consuming projects must explicitly configure TypeScript path resolution for `node_modules/@eavfw/*`
- Not compatible with tools or environments that expect pre-built JavaScript in `node_modules`
- Cannot be consumed by plain JavaScript projects without a TypeScript compilation step
- IDE "Go to Definition" navigates to source in `node_modules`, which can be confusing

### Neutral

- This is an unusual pattern in the npm ecosystem but has worked well for EAVFW for 3+ years
- The pattern is becoming more common with tools like tsup, unbuild, and Vite that handle TypeScript natively
