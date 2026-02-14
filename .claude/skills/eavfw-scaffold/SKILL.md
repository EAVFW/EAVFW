---
name: eavfw-scaffold
description: Scaffold a new EAVFW project from published NuGet packages for external use.
user_invocable: true
---

# EAVFW Project Scaffold Skill

This skill scaffolds a new EAVFW project using published NuGet packages. Use this when starting a new project that consumes EAVFW as a dependency (not for developing the framework itself — use `/eavfw-scaffold-dev` for that).

## Prerequisites

- .NET 8.0+ SDK (or .NET 10.0 for latest features)
- Node.js 20+
- Docker (for SQL Server container and Mailpit)
- EAVFW dotnet templates installed

## Step 1: Install EAVFW Templates

```bash
dotnet new install EAVFW.Templates
```

Or from a local clone:
```bash
dotnet new install ./path/to/eavfw-templates/templates/EAVFW/
dotnet new install ./path/to/eavfw-templates/templates/EAVFW.NextJS/
```

## Step 2: Create the Project

```bash
mkdir MyProject && cd MyProject

dotnet new eavfw \
  --namespace MyProject \
  --appName Portal \
  --databaseName MyProjectDb \
  --schemaName dbo \
  --yourUserEmail admin@example.com \
  --yourUserName "Admin User" \
  --allow-scripts yes
```

### Key Parameters

| Parameter | Required | Default | Description |
|---|---|---|---|
| `--namespace` | Yes | `EAVFW` | Root namespace and project prefix |
| `--appName` | Yes | `MainApp` | Application name (e.g., Portal) |
| `--databaseName` | Yes | `databaseName` | SQL Server database name |
| `--schemaName` | No | same as namespace | Database schema |
| `--yourUserEmail` | Yes | `pks@delegate.dk` | Initial admin user email |
| `--yourUserName` | No | `Poul Kjeldager` | Initial admin display name |
| `--sendgrid_api_token` | No | (none) | SendGrid API key for email |
| `--targetFramework` | No | `net10.0` | .NET target framework |
| `--skipPortal` | No | `false` | Skip automated frontend setup |
| `--skipGitCommit` | No | `false` | Skip git initialization |
| `--useLocalReferences` | No | `false` | Use local project references instead of NuGet (for dev inside EAVFW repo) |
| `--withSecurityModel` | No | `true` | Include security model extension |
| `--withDocuments` | No | `true` | Include documents extension |
| `--withConfiguration` | No | `true` | Include configuration extension |

## Step 3: Add the NextJS Frontend

```bash
dotnet new eavfw-nextjs \
  --namespace MyProject \
  --appName Portal \
  --allow-scripts yes
```

This creates the Next.js app under `apps/MyProject.Portal/` with:
- Page routing for EAVFW model-driven views
- Fluent UI integration
- Manifest type bindings
- Dev certificate generation

## Step 4: Build (twice)

EAVFW projects require two build passes. The first generates `manifest.g.json` via source generators, the second compiles with the generated types:

```bash
dotnet tool restore --no-cache
dotnet build MyProject.sln        # First build — generates manifest.g.json, will error
dotnet build MyProject.sln        # Second build — succeeds
```

The first build error ("Please build again, since the initial manifest.g.json has now been generated") is expected.

## Step 5: Run with Aspire (Recommended)

The scaffolded project includes an Aspire AppHost that orchestrates everything:

```bash
aspire run
```

This automatically:
- Starts a SQL Server container with persistent data volume
- Creates the database
- Runs EF migrations from the manifest
- Builds the frontend (npm install + npm run build-app)
- Creates a signin link
- Starts Mailpit for local email testing
- Starts the portal application

### Devcontainer Note

In devcontainers, use the `http` launch profile:

```bash
aspire run
```

Ensure `ASPIRE_ALLOW_UNSECURED_TRANSPORT=true` is set in the `http` profile's `launchSettings.json`.

## Step 6: Run Without Aspire (Legacy)

If not using Aspire, use the individual npm scripts:

```bash
# Start SQL Server
npm run db-create

# Configure connection string
npm run set-user-secrets

# Start mail server
npm run mail-create
npm run mail-server-config

# Run the application
npm run run
```

## Generated Project Structure

```
MyProject/
  MyProject.sln
  package.json                     # npm workspace root
  Directory.Build.props            # Shared MSBuild props + EAVFramework version
  global.json                      # SDK version pin
  src/
    MyProject.Models/              # EAV manifest + generated types
      manifest.json                # The EAV data model definition
      manifest.schema.json
    MyProject.BusinessLogic/       # Custom business logic
    MyProject.Common/              # Shared code
    MyProject.ServiceDefaults/     # OpenTelemetry, health checks
  apps/
    MyProject.Portal/              # Next.js + ASP.NET Core app
      src/                         # React/Next.js source
      pages/                       # Next.js pages
      next.config.js
    MyProject.AppHost/             # Aspire orchestration
      AppHost.cs                   # Resource definitions
  tests/
    MyProject.AppHost.Tests/       # E2E integration tests
```

## Customizing the Manifest

The data model is defined in `src/MyProject.Models/manifest.json`. After editing:

```bash
npm run gm       # Regenerate manifest.g.json
npm run build    # Rebuild everything
```

See `spec/1.0.0/spec.md` in the EAVFW repo for the manifest specification.

## NuGet Package Version Control

The EAVFramework NuGet version is controlled in `Directory.Build.props`:

```xml
<EAVFrameworkVersion>5.0.0</EAVFrameworkVersion>
<UseEAVFromNuget>true</UseEAVFromNuget>
```

To switch to local references, either re-scaffold with `--useLocalReferences` or manually set:

```xml
<UseEAVFromNuget>false</UseEAVFromNuget>
<LocalEAVFrameworkPath>path/to/eavframework</LocalEAVFrameworkPath>
<LocalExternalpath>path/to/external/</LocalExternalpath>
```

## Adding Azure DevOps CI/CD

```bash
dotnet new eavfw-ado --namespace MyProject --appName Portal --allow-scripts yes
npm run eavfw-add-ado-to-solution
```

## Troubleshooting

Use `/debug-eavfw` to diagnose common issues. Key things to check:

- **Database not starting**: Ensure Docker is running and port 1433 is available
- **Build fails**: Run `npm install --force` first, check for Fluent UI version mismatches
- **Manifest errors**: Run `dotnet tool restore --no-cache` then `npm run gm`
- **Aspire issues**: Use `/validate-eavfw` to check resource health
