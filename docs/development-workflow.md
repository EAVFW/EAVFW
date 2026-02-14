# Development Workflow

## Working in the Monorepo

### Package Development

EAVFW packages **ship TypeScript source directly**. There is no build step.

Each package's `package.json` has:
```json
{
  "main": "./src/index.ts"
}
```

This means changes to any package are immediately available to consumers -- no compilation needed.

### Installing Dependencies

```bash
npm install --force --ignore-scripts
```

- `--force` resolves peer dependency conflicts between Fluent UI v8 and v9
- `--ignore-scripts` skips post-install scripts that may fail in the monorepo context

### Testing Changes with a Consuming Project

Use `npm link` to test local package changes in a real EAVFW project:

```bash
# Step 1: Register all packages for linking (from EAVFW monorepo root)
npm run link

# Step 2: Link packages in your consuming project
cd /path/to/my-eavfw-project
npm link @eavfw/apps @eavfw/next @eavfw/expressions @eavfw/manifest @eavfw/hooks @eavfw/forms @eavfw/utils

# Step 3: To unlink and go back to published versions
npm install --force
```

The `npm run link` command runs `npm link` in each workspace package concurrently.

### Using the sandbox/ Directory

The `sandbox/` directory is available for integration testing. You can scaffold a test project there:

```bash
cd samples
dotnet new eavfw --namespace TestApp --appName Portal --databaseName TestDB --allow-scripts yes
dotnet new eavfw-nextjs --namespace TestApp --appName Portal --allow-scripts yes
cd ..
npm run link
cd samples
npm link @eavfw/apps @eavfw/next @eavfw/expressions @eavfw/manifest @eavfw/hooks @eavfw/forms @eavfw/utils
npm install --force
npm run build
```

## Package Structure

Each package under `packages/` follows this layout:

```
packages/<name>/
  src/
    index.ts       -- Main export
    ...            -- Source files
  package.json     -- Package config (name: @eavfw/<name>)
  tsconfig.json    -- TypeScript config
```

### Adding a New @eavfw Package

1. Create the package directory:
   ```bash
   mkdir -p packages/my-package/src
   ```

2. Create `packages/my-package/package.json`:
   ```json
   {
     "name": "@eavfw/my-package",
     "version": "1.0.0",
     "main": "./src/index.ts",
     "types": "./src/index.ts",
     "publishConfig": {
       "access": "public"
     }
   }
   ```

3. Create `packages/my-package/src/index.ts`

4. Add link/publish/release scripts to root `package.json`:
   ```json
   {
     "scripts": {
       "link-my-package": "npm --workspace packages/my-package link",
       "publish-my-package": "npm --workspace packages/my-package publish --access public",
       "release-my-package": "npm run release --workspace packages/my-package"
     }
   }
   ```

5. The NPM Workspaces glob `"packages/*"` in the root `package.json` auto-discovers it.

## Git Submodules

External dependencies are tracked as git submodules:

```bash
# Initialize submodules (first time)
git submodule update --init --recursive

# Update submodules to latest
git submodule update --remote
```

Submodules:
- `external/eavframework/` -- .NET backend framework
- `external/eavfw-templates/` -- dotnet new templates

## Commit Conventions

Releases are automated via **semantic-release** with **conventional commits**.

```
feat: add new date picker control        --> minor version bump (1.1.0)
fix: correct form validation on blur     --> patch version bump (1.0.1)
feat!: redesign form state management    --> major version bump (2.0.0)
```

A `BREAKING CHANGE:` footer in the commit body also triggers a major bump.

### Release Branches

| Branch | Channel | Version Format |
|--------|---------|---------------|
| `main` | stable | `1.2.3` |
| `dev` | prerelease | `1.2.3-dev.1` |
| `vnext` | prerelease | `1.2.3-vnext.1` |

Each package releases independently via `multi-semantic-release`.

## CI/CD Pipeline

GitHub Actions runs on `windows-latest` with .NET 8 and Node 20. The test workflow:

1. Installs EAVFW dotnet templates
2. Scaffolds a test project using `dotnet new eavfw`
3. Links local packages into the scaffolded project
4. Runs `npm run build` to verify everything compiles

There are no unit tests in this repo. The CI validates that packages can be consumed by a freshly scaffolded project.

## Useful Commands Reference

```bash
# Install deps
npm install --force --ignore-scripts

# Register all packages for npm link
npm run link

# Release all packages (CI only)
npm run release

# Publish all packages (CI only)
npm run publish

# Install dotnet templates from local source
dotnet new install ./external/eavfw-templates/templates/EAVFW/
dotnet new install ./external/eavfw-templates/templates/EAVFW.NextJS/
```
