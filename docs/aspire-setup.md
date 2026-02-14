# Aspire Setup Guide

## What Aspire Replaces

Previously, EAVFW projects used a collection of npm scripts and Docker commands in the root `package.json` to manage infrastructure:

```bash
# Old approach -- many manual scripts
npm run db-docker          # Start SQL Server container
npm run db-initialize      # Create database
npm run mail-create        # Start Mailpit container
npm run db-connection-string  # Set user secrets
npm run eavfw-gen-migrations  # Generate SQL migrations
npm run eavfw-apply-migrations # Apply migrations
```

**.NET Aspire** replaces all of this with a single orchestrator (`AppHost`) that:
- Manages SQL Server containers with persistent volumes
- Creates databases and applies schema migrations automatically
- Runs Mailpit for local email testing
- Provides DbGate for web-based database administration
- Handles BACPAC restore for production data copies
- Builds the Next.js frontend (with change detection to skip unnecessary rebuilds)
- Generates signin tokens for development login

## The AppHost Pattern

Every Aspire-enabled EAVFW project has an **AppHost** project that orchestrates all services.

### Minimal AppHost Example

```csharp
using EAVFramework.Extensions.Aspire.Hosting;
using EAVFramework.Extensions.Aspire.Hosting.Database;
using Aspire.Hosting;

var builder = DistributedApplication.CreateBuilder(args);

// SQL Server with persistent volume
var sqlPass = builder.AddParameter("sql-server-password", "Your_strong_password123!", secret: true);
var sqlServer = builder
    .AddSqlServer("sqlserver", sqlPass)
    .WithDataVolume("myapp-sql")
    .WithLifetime(ContainerLifetime.Persistent)
    .WithRestoreBacpacCommand(defaultDatabaseName: "sql-db");

// Optional: web-based DB admin
sqlServer.WithDbGate(dbgate => dbgate.WithParentRelationship(sqlServer));

// Database
var db = sqlServer.AddDatabase("sql-db");

// EAVFW Application
var portal = builder
    .AddEAVFWApp<Projects.MyApp_Portal>("portal", "build-app", "https")
    .ForwardEnvironmentVariables<Projects.MyApp_Portal>()
    .WithMailPit()
    .WithEAVModel<Projects.MyApp_Models, DynamicContext, Identity, Signin>(
        "model", db,
        "admin@example.com",
        Guid.Parse("..."),
        "Admin User");

builder.Build().Run();
```

### AppHost Project File

```xml
<Project Sdk="Aspire.AppHost.Sdk/13.1.0">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Aspire.Hosting.SqlServer" Version="13.1.0" />
    <PackageReference Include="CommunityToolkit.Aspire.Hosting.SqlServer.Extensions" Version="13.1.1" />
    <PackageReference Include="Microsoft.SqlServer.DacFx" Version="170.2.70" />
    <ProjectReference IsAspireProjectResource="False"
      Include="path/to/EAVFramework.Extensions.Aspire.Hosting.csproj" />
    <ProjectReference IsAspireProjectResource="False"
      Include="path/to/MyApp.Models.csproj" />
    <ProjectReference Include="path/to/MyApp.Portal.csproj" />
  </ItemGroup>
</Project>
```

## Extension Methods Reference

All from `EAVFramework.Extensions.Aspire.Hosting`:

### `AddEAVFWApp<TProject>(name, npmBuildCommand, launchProfile)`

Registers an EAVFW web application project. Handles:
- Adding the project as an Aspire resource
- Running `npm install --force && npm run <npmBuildCommand>` before startup
- **Smart build caching**: hashes the `src/` directory and skips builds when unchanged

### `WithEAVModel<TModel, TContext, TIdentity, TSignin>(modelName, database, email, userId, username)`

Full model setup in one call. Internally:
1. Adds an `EAVFWModelProjectResource`
2. Publishes schema to the target database (creates DB if needed, generates and runs migrations)
3. Sets up signin token generation
4. Waits for model completion before starting the app

### `WithMailPit(name?, httpPort?, smtpPort?)`

Adds a Mailpit container and configures SMTP environment variables on the project:
- `Smtp__Host`, `Smtp__Port`, `Smtp__Password`, `Smtp__Username`, `Smtp__EnableSsl`
- Uses random ports by default to avoid conflicts
- Web UI available at the allocated HTTP port

### `ForwardEnvironmentVariables<TProject>()`

Forwards configuration values prefixed with the project type name as environment variables. For example, if the project type is `Projects.SCL_Portal`:
- `SCL_Portal__CrmFeatureFlags__EnableCrmPolling` in appsettings/user-secrets
- Becomes `CrmFeatureFlags__EnableCrmPolling` in the service environment

### `WithRestoreBacpacCommand(defaultDataDirectory?, defaultDatabaseName?)`

Adds an interactive command to the Aspire dashboard for restoring `.bacpac` files. Prompts for:
- BACPAC file path (auto-detects files in `../../data/`)
- Target database name
- Whether to overwrite existing database

### `WithDbGate()`

Adds DbGate (web-based database administration tool) as a child resource of the SQL Server. Uses `CommunityToolkit.Aspire.Hosting.SqlServer.Extensions`.

## Lifecycle Sequence

When you run the AppHost (`dotnet run`), the following happens in order:

1. **SQL Server container starts** (persistent, survives app restarts)
2. **Database created** if it doesn't exist (`CREATE DATABASE` + `SET RECOVERY SIMPLE`)
3. **Schema migrations generated** from `manifest.g.json` using `EAVFW.Extensions.Manifest.SDK`
4. **Migrations applied** to the database (skipped if migrations already exist)
5. **Signin token generated** and displayed in the Aspire dashboard
6. **npm build runs** (`npm install --force && npm run build-app`) -- skipped if source hash unchanged
7. **ASP.NET Core app starts** and serves the built Next.js frontend

The model resource retries up to 10 times with exponential backoff if the database isn't ready.

## Running the AppHost

```bash
# From the aspire/AppHost directory
dotnet run

# The Aspire dashboard opens automatically, showing:
# - SQL Server status
# - Database migration progress
# - Build output
# - Application URL with signin link
# - Mailpit web UI link
# - DbGate link (if configured)
```

## Configuration

Use .NET user secrets for the AppHost project:

```bash
# Set SQL Server password
dotnet user-secrets set "Parameters:sql-server-password" "Your_strong_password123!"

# Forward config to the portal service
dotnet user-secrets set "MyApp_Portal__SomeSection__SomeKey" "value"
```
