---
name: eavfw-scaffold-dev
description: Scaffold an EAVFW sample project for local development and testing of framework changes. Uses local project references instead of NuGet packages.
user_invocable: true
---

# EAVFW Developer Scaffold Skill

Scaffolds a fresh EAVFW project inside `sandbox/` for testing local changes to the framework, templates, Aspire hosting, and extension packages.

## When to Use

- Testing changes to `external/eavframework/`, `external/EAVFW.Extensions.*`, `external/eavfw-templates/`, or `packages/`
- End-to-end validation of the full EAVFW developer experience
- Manual exploration of a scaffolded project

## Quick Start (5 steps)

### Step 1: Install Templates

```bash
dotnet new install ./external/eavfw-templates/templates/EAVFW/ --force
dotnet new install ./external/eavfw-templates/templates/EAVFW.NextJS/ --force
```

### Step 2: Scaffold

```bash
mkdir -p sandbox/{Namespace}
cd sandbox/{Namespace}

dotnet new eavfw \
  --namespace {Namespace} \
  --appName Portal \
  --databaseName {Namespace} \
  --schemaName dbo \
  --yourUserEmail admin@{namespace}.dev \
  --yourUserName Admin \
  --skipPortal \
  --skipGitCommit \
  --useLocalReferences \
  --targetFramework net10.0 \
  --allow-scripts yes

dotnet new eavfw-nextjs \
  --namespace {Namespace} \
  --appName Portal \
  --skipGitCommit \
  --skipCertGen \
  --allow-scripts yes
```

Key flags:

- `--useLocalReferences` sets `UseEAVFromNuget=false` and configures `LocalEAVFrameworkPath` and `LocalExternalpath` in Directory.Build.props
- `--skipPortal` skips automated setup (we do it via Aspire)
- `--skipGitCommit` since this is inside the EAVFW repo

### Step 3: Build (twice)

```bash
cd sandbox/{Namespace}
dotnet tool restore --no-cache
dotnet build {Namespace}.sln        # First build generates manifest.g.json, will error
dotnet build {Namespace}.sln        # Second build succeeds with generated types
```

The first build always fails with "Please build again, since the initial manifest.g.json has now been generated" — this is expected.

### Step 4: Configure Local Extension References

The scaffolded Models.csproj has unconditional NuGet references to extensions. Replace them with conditional groups so local references are used when `UseEAVFromNuget=false`:

**Edit `src/{Namespace}.Models/{Namespace}.Models.csproj`** — replace the extension PackageReferences at the bottom:

```xml
<!-- Replace unconditional NuGet refs: -->
<ItemGroup>
    <PackageReference Include="EAVFW.Extensions.SecurityModel" Version="4.0.2" />
    <PackageReference Include="EAVFW.Extensions.Documents" Version="4.0.2" />
    <PackageReference Include="EAVFW.Extensions.Configuration" Version="3.0.1" />
</ItemGroup>

<!-- With conditional groups: -->
<ItemGroup Condition="$(RemoteEAVFramework) == 'false'">
    <ProjectReference Include="$(LocalExternalpath)\EAVFW.Extensions.SecurityModel\src\EAVFW.Extensions.SecurityModel\EAVFW.Extensions.SecurityModel.csproj" />
    <ProjectReference Include="$(LocalExternalpath)\EAVFW.Extensions.Documents\src\EAVFW.Extensions.Documents\EAVFW.Extensions.Documents.csproj" />
    <ProjectReference Include="$(LocalExternalpath)\EAVFW.Extensions.Configuration\src\EAVFW.Extensions.Configuration\EAVFW.Extensions.Configuration.csproj" />
</ItemGroup>
<ItemGroup Condition="$(RemoteEAVFramework) != 'false'">
    <PackageReference Include="EAVFW.Extensions.SecurityModel" Version="4.0.2" />
    <PackageReference Include="EAVFW.Extensions.Documents" Version="4.0.2" />
    <PackageReference Include="EAVFW.Extensions.Configuration" Version="3.0.1" />
</ItemGroup>
```

This is needed because NuGet extension packages pull in the NuGet version of EAVFramework transitively, silently overriding your local changes.

### Step 5: Run with Aspire

```bash
cd sandbox/{Namespace}
aspire run
```

This starts SQL Server, MailPit, runs npm install + build, creates the database, seeds the admin user, and starts the portal.

## That's It

After `aspire run`, use `/validate-eavfw` to check all resources are healthy.

## Iterating on Changes

After the initial scaffold, you can iterate without re-scaffolding:

- **Frontend packages** (`packages/*`): Changes picked up immediately via npm link (TypeScript source used directly)
- **Aspire hosting / EAVFramework core / Extensions**: Restart Aspire (`aspire run`)
- **Templates** (`external/eavfw-templates/`): Must re-scaffold (delete sample, start from Step 1)
- **Manifest** (`src/{Namespace}.Models/manifest.json`): Run `npm run gm` then restart

## Running E2E Tests

The scaffolded project includes Playwright tests:

```bash
# Quick smoke test (no Aspire needed)
cd sandbox/{Namespace}
dotnet test tests/{Namespace}.AppHost.Tests --filter PlaywrightSmokeTest

# Full login flow (starts Aspire, logs in, creates a record)
dotnet test tests/{Namespace}.AppHost.Tests --filter FullLoginFlow -- MSTest.TestTimeout=600000
```

Test output (screenshots + video) goes to `videos/` in the project root.

## Prerequisites

These should already be set up in the EAVFW devcontainer:

- Git submodules initialized: `git submodule update --init --recursive`
- npm links created from EAVFW root: `npm install --force --ignore-scripts && npm run link`
- Extension submodules present under `external/` (SecurityModel, Documents, Configuration, Infrastructure, DynamicManifest)

## Reference

### Generated Project Structure

```
{Namespace}/
  {Namespace}.sln
  Directory.Build.props              # UseEAVFromNuget=false, local paths
  src/
    {Namespace}.Models/              # Manifest + generated types
    {Namespace}.BusinessLogic/       # Custom business logic
    {Namespace}.Common/              # Shared code + Constants
    {Namespace}.ServiceDefaults/     # OpenTelemetry, health checks
  apps/
    {Namespace}.Portal/              # Next.js + ASP.NET Core
    {Namespace}.AppHost/             # Aspire orchestration
      AppHost.cs                     # Resource definitions
  tests/
    {Namespace}.AppHost.Tests/       # E2E Playwright tests
```

### Extension Submodules

| Package                          | Submodule Path                              | csproj Path                                                                    |
| -------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------ |
| EAVFW.Extensions.SecurityModel   | `external/EAVFW.Extensions.SecurityModel`   | `src/EAVFW.Extensions.SecurityModel/EAVFW.Extensions.SecurityModel.csproj`     |
| EAVFW.Extensions.Documents       | `external/EAVFW.Extensions.Documents`       | `src/EAVFW.Extensions.Documents/EAVFW.Extensions.Documents.csproj`             |
| EAVFW.Extensions.Configuration   | `external/EAVFW.Extensions.Configuration`   | `src/EAVFW.Extensions.Configuration/EAVFW.Extensions.Configuration.csproj`     |
| EAVFW.Extensions.Infrastructure  | `external/EAVFW.Extensions.Infrastructure`  | `src/EAVFW.Extensions.Infrastructure/EAVFW.Extensions.Infrastructure.csproj`   |
| EAVFW.Extensions.DynamicManifest | `external/EAVFW.Extensions.DynamicManifest` | `src/EAVFW.Extensions.DynamicManifest/EAVFW.Extensions.DynamicManifest.csproj` |

## Troubleshooting

If something goes wrong, use `/debug-eavfw` to diagnose and `/validate-eavfw` to check Aspire resources.
