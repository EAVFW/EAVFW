# Release Strategy: Unified Versioning with Release Please

## Goal

All EAVFW packages (npm and NuGet) share a single version number. Releases are coordinated from this repo (the frontend monorepo) using Release Please. A human merges the release PR to trigger the actual publish — no surprise releases on every commit to main.

## Current State

| Repo | Package(s) | Current release method | Current versioning |
|------|-----------|----------------------|-------------------|
| `EAVFW/` (this repo) | 11 `@eavfw/*` npm packages | semantic-release + conventional commits | Independent per package via `semantic-release-monorepo` |
| `external/eavframework/` | `EAVFramework` NuGet | Manual / separate CI | Independent (v5.0.0) |
| `external/eavframework/aspire/` | `EAVFramework.Extensions.Aspire.Hosting` NuGet | Manual / separate CI | Independent |
| `external/eavfw-templates/` | `dotnet new` templates | Manual / separate CI | Independent (v2.2.11) |
| `external/EAVFW.Extensions.*` | Various NuGet packages | Manual / separate CI | Independent |

### Problems

- Version numbers are disconnected — no way to know which `@eavfw/apps@3.x` works with `EAVFramework@5.x`
- Releases happen ad-hoc across repos with no coordination
- No unified changelog showing "what changed in EAVFW this week"
- semantic-release publishes on every merge to main — no gate for review

## Design: Central Trigger from This Repo

### How It Works

1. **Conventional commits** land on `main` (or `dev`, `future`) in any EAVFW repo
2. **Release Please** runs in **this repo only** and creates a release PR that:
   - Bumps the unified version number across all packages
   - Aggregates changelog entries from this repo's commits
   - Lists the version bump (e.g., `6.0.0 -> 6.1.0`)
3. **A human reviews and merges** the release PR
4. **On merge**, GitHub Actions in this repo:
   - Publishes all 11 npm packages at the new version
   - Triggers release workflows in the other repos (via `workflow_dispatch` or `repository_dispatch`) with the same version number
5. **Downstream repos** receive the version and publish their NuGet packages at that version

### Cross-Repo Version Sync

Since repos are separate, we need a mechanism to propagate the version:

```
EAVFW/ (this repo)                    external/eavframework/
┌──────────────────┐                  ┌──────────────────────┐
│ Release Please   │                  │                      │
│ creates PR with  │──── merge ──────>│ repository_dispatch   │
│ version 6.1.0    │   triggers       │ receives version     │
│                  │                  │ publishes NuGet@6.1.0│
└──────────────────┘                  └──────────────────────┘
         │
         │ same trigger
         v
external/eavfw-templates/
┌──────────────────────┐
│ receives version     │
│ updates template     │
│ versions to 6.1.0   │
└──────────────────────┘
```

### Version Bump Rules

All packages always share the exact same version (like Aspire, Angular):

- A `feat:` commit in **any** repo bumps the minor version for **all** packages
- A `fix:` commit in **any** repo bumps the patch version for **all** packages
- A `feat!:` or `BREAKING CHANGE` in **any** repo bumps the major version for **all** packages
- Even if a package had no changes, it still gets the new version number

This means consumers can always use a single version: "we're on EAVFW 6.1.0" — no compatibility matrix needed.

### Handling Commits from Other Repos

Since Release Please only sees commits in this repo, we need to surface changes from other repos. Two approaches:

**Option A: Submodule bump commits (Recommended)**
- When `external/eavframework/` or `external/eavfw-templates/` have changes, update the submodule pointer in this repo
- The submodule bump commit message includes the changelog: `feat: update eavframework — add WithDbGate() Aspire extension`
- Release Please picks this up as a normal conventional commit

**Option B: Sync workflow**
- A GitHub Action in each external repo, on push to main, creates a commit in this repo summarizing the changes
- More automated but adds complexity

## Branch Strategy

```
feature branches ──> future ──> dev ──> main
                                 │        │
                          prerelease   stable
                          (6.2.0-dev.1) (6.1.0)
```

### Branch Purposes

| Branch | Purpose | Release channel | npm tag | NuGet suffix |
|--------|---------|----------------|---------|-------------|
| `main` | Stable releases | `latest` | `latest` | (none) |
| `dev` | Next release candidate, small changes | `dev` | `dev` | `-dev.N` |
| `future` | Big experiments, AI refactors, breaking changes | `future` | `future` | `-future.N` |

### Flow

- **Small fixes/features**: feature branch -> `dev` -> `main`
- **Big refactors** (like the current AI work): feature branch -> `future` -> validated -> `dev` -> `main`
- **Hotfixes**: feature branch -> `main` directly (then backport to `dev`)

Release Please creates separate release PRs for each branch:
- PR to `main`: stable release (e.g., `6.1.0`)
- PR to `dev`: prerelease (e.g., `6.2.0-dev.1`)
- PR to `future`: prerelease (e.g., `7.0.0-future.1`)

## Migration Plan

### Step 1: Set Up Release Please in This Repo

- Add `release-please-config.json` listing all 11 npm packages
- Add `.release-please-manifest.json` with current versions
- Configure for `node` release type with conventional commits
- Set up for `main`, `dev`, and `future` branches

### Step 2: Replace semantic-release

- Remove `semantic-release` and `semantic-release-monorepo` from `devDependencies`
- Remove `.releaserc` or `release` config from `package.json`
- Update CI to use Release Please GitHub Action instead

### Step 3: Add Cross-Repo Dispatch

- Create `workflow_dispatch` workflows in `eavframework` and `eavfw-templates` repos
- These accept a `version` input and publish at that version
- This repo's release workflow triggers them after npm publish succeeds

### Step 4: Align Version Numbers

- Pick a new unified version (e.g., `6.0.0`) as the starting point
- All repos publish their next release at this version
- Document the "last independent version" for each package for reference

### Step 5: Update Templates

- Update `eavfw-templates` to reference the unified version in scaffolded `package.json` and `.csproj` files
- Single version pin: `"@eavfw/*": "^6.0.0"` and `<PackageReference Include="EAVFramework" Version="6.0.0" />`

## Dependencies

- This can proceed **independently** of the improvement roadmap and OpenTelemetry work
- Step 1-2 (Release Please in this repo) can happen immediately
- Step 3-5 require changes in external repos

## Success Criteria

- Running `npm view @eavfw/apps version` and checking the `EAVFramework` NuGet version returns the same number
- A human always reviews and merges the release PR — no automatic publishes
- Unified changelog at GitHub Releases shows all changes across all repos
- Consuming projects can pin to a single version and know everything is compatible
- `dev` and `future` branches produce prerelease versions automatically
