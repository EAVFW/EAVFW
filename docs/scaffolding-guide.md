# Scaffolding a New EAVFW Project

## Prerequisites

- **.NET SDK** 8.0+ (10.0 for Aspire)
- **Node.js** 20+
- **Docker** (for SQL Server and Mailpit containers)
- **npm** (comes with Node.js)

## Step 1: Install EAVFW Templates

```bash
# From the EAVFW monorepo root (or wherever eavfw-templates is checked out)
dotnet new install ./external/eavfw-templates/templates/EAVFW/
dotnet new install ./external/eavfw-templates/templates/EAVFW.NextJS/
```

To update templates after changes:
```bash
dotnet new uninstall ./external/eavfw-templates/templates/EAVFW/
dotnet new install ./external/eavfw-templates/templates/EAVFW/
dotnet new --debug:rebuildcache
```

## Step 2: Scaffold the Solution

```bash
mkdir MyProject && cd MyProject

dotnet new eavfw \
  --namespace MyProject \
  --appName Portal \
  --databaseName MyProjectDB \
  --schemaName dbo \
  --yourUserEmail admin@example.com \
  --allow-scripts yes
```

### Template Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--namespace` | Solution namespace. Used for project names, file names. | `EAVFW` |
| `--appName` | Application name (e.g., "Portal"). Creates `{namespace}.{appName}` | `MainApp` |
| `--databaseName` | SQL Server database name | `databaseName` |
| `--schemaName` | Database schema | Falls back to namespace |
| `--yourUserEmail` | Initial admin email for DB seeding | `pks@delegate.dk` |
| `--yourUserName` | Initial admin username | `Poul Kjeldager` |
| `--sendgrid_api_token` | SendGrid API token for email | (none) |
| `--dotnetSDK` | .NET SDK version | `8.0.301` |
| `--targetFramework` | Target framework | `net8.0` |
| `--withSecurityModel` | Include EAVFW.Extensions.SecurityModel | `true` |
| `--withDocuments` | Include EAVFW.Extensions.Documents | `true` |
| `--skipRestore` | Skip NuGet restore | `false` |

### Generated Structure

```
MyProject.sln
src/
  MyProject.Models/           -- EF Core models + manifest.json
  MyProject.BusinessLogic/    -- Plugin configuration
  MyProject.Common/           -- Shared services
apps/
  MyProject.Portal/           -- ASP.NET Core app
package.json                  -- npm scripts for build, db, migrations
global.json                   -- .NET SDK version pin
.config/dotnet-tools.json     -- eavfw-manifest CLI tool
```

## Step 3: Add the Next.js Frontend

```bash
# Run from the solution root
dotnet new eavfw-nextjs --namespace MyProject --appName Portal --allow-scripts yes
```

This adds to `apps/MyProject.Portal/`:
```
src/
  pages/          -- Next.js dynamic routes
  components/     -- Custom components + RegisterFeature calls
  themes/         -- Fluent UI theme definitions
next.config.js
package.json
tsconfig.json
.env
```

## Step 4: Install Dependencies

```bash
npm install --force
```

The `--force` flag is needed because of peer dependency conflicts between Fluent UI versions.

## Step 5: Set Up Aspire AppHost (Recommended)

Create an Aspire AppHost project to orchestrate the full development environment. See [aspire-setup.md](./aspire-setup.md) for the complete guide.

```bash
# Create the AppHost project
mkdir -p aspire/AppHost
cd aspire/AppHost
dotnet new aspire-apphost
```

Add the necessary project references and NuGet packages, then configure the `AppHost.cs` as described in the Aspire setup guide.

### Without Aspire (Legacy Approach)

If not using Aspire, use the npm scripts in `package.json`:

```bash
# Set up database (Docker + SQL Server)
npm run db-create

# Set up mail server
npm run mail-create
npm run mail-server-config

# Set connection strings
npm run set-user-secrets
```

## Step 6: First Build

```bash
# Generate manifest + build frontend + build backend
npm run build
```

**Important: The first build requires running twice.** The manifest generation (`npm run gm`) produces `manifest.g.json`, which the source generators need. The source generators then produce C# types. The second build picks up these generated types.

```bash
# If first build has errors about missing types:
npm run gm          # Generate manifest
dotnet build        # Build with source generators
npm run build-app   # Build Next.js frontend
```

## Step 7: Link Local EAVFW Packages (For Development)

If you're developing EAVFW packages alongside your project:

```bash
# In the EAVFW monorepo root
npm install --force --ignore-scripts
npm run link

# In your project root
npm run eavfw-link
# Or manually:
npm link @eavfw/apps @eavfw/next @eavfw/expressions @eavfw/manifest @eavfw/hooks @eavfw/forms @eavfw/utils
```

## Common Issues

### "Cannot find module '@eavfw/manifest'"
Run `npm install --force` again. Peer dependency resolution sometimes fails on first install.

### Source generator types not found
Run `npm run gm` to regenerate the manifest, then `dotnet build` to trigger source generators.

### SQL Server connection refused
Ensure Docker is running and the SQL Server container is up:
```bash
docker ps | grep sql
```

### Next.js build fails with TypeScript errors
Check that your `tsconfig.json` includes the correct paths and that all `@eavfw/*` packages are installed or linked.
