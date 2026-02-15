# EAVFW Architecture

## Overview

EAVFW (Entity-Attribute-Value Framework) is a full-stack framework for building model-driven business applications. Applications are defined by a **manifest** (JSON schema) that describes entities, attributes, forms, views, and business rules. The framework generates database schemas, C# types, and UI from this manifest.

## Ecosystem Components

### 1. Frontend Monorepo (this repo: `EAVFW/`)

A TypeScript monorepo using NPM Workspaces. All packages are published to NPM as `@eavfw/<name>`.

**Package dependency graph:**

```
manifest        -- Base types for the EAVFW manifest spec
  |
  +-- forms     -- Form state management (EAVForm.tsx is the core)
  +-- expressions -- Expression parser for manifest expressions
  +-- hooks     -- React hooks (useAsyncMemo, useChangeDetector, etc.)
  +-- utils     -- Utility functions (capitalize, deepDiff, mergeDeep, etc.)

apps            -- Model-driven app components (depends on all above)
  |
  +-- next      -- Next.js integration layer (packages/nextjs on disk)

codeeditor      -- Monaco editor wrapper (standalone)
query           -- Query API for RSC (standalone)
task-management -- Task UI components (standalone)
rich-text-editor -- Draft.js-based editor (standalone)
```

**Key files:**

- `packages/apps/src/ModelDrivenApp.ts` -- Core app orchestrator
- `packages/apps/src/Components/` -- 16 component subdirectories (Controls, Views, Forms, Ribbon, Navigation, etc.)
- `packages/forms/src/EAVForm.tsx` -- Main form component
- `packages/manifest/src/` -- Type definitions organized by domain
- `spec/1.0.0/spec.md` -- The EAVFW manifest specification

### 2. Backend Framework (`external/eavframework/`)

The .NET backend. Git submodule at `external/eavframework/`, published as NuGet packages.

**Key areas:**

- `src/` -- Core framework: EF Core integration, OData API, security model, plugin system
- `aspire/` -- `EAVFramework.Extensions.Aspire.Hosting` for .NET Aspire orchestration
- `generators/` -- Source generators that produce C# types from the manifest

**What the backend provides:**

- ASP.NET Core host that serves the Next.js frontend
- EF Core database context generated from manifest
- OData-compatible REST API for CRUD operations
- Plugin pipeline for business logic (pre/post operation hooks)
- Security model with role-based access control
- Source generators that turn `manifest.json` into C# classes and DB schemas

### 3. Template System (`external/eavfw-templates/`)

`dotnet new` templates for scaffolding new EAVFW projects. Git submodule at `external/eavfw-templates/`.

**Templates available:**

- `eavfw` -- Main template: C# solution, models, business logic, npm scripts
- `eavfw-nextjs` -- Adds Next.js frontend (pages, components, themes)
- `eavfw-ado` -- Azure DevOps CI/CD pipeline
- `EAVFW.Blazor` -- Blazor integration

## How the Pieces Connect

### Manifest-Driven Architecture

The central concept is the **manifest** (`manifest.json`). It defines:

- Entities (tables) and their attributes (columns)
- Forms (UI layout for editing records)
- Views (list/grid configurations)
- Ribbons (toolbar actions)
- Validation rules
- Security roles and permissions

**Flow:**

```
manifest.json
    |
    +-- Source Generator --> C# entity classes + EF Core DbContext
    |
    +-- SQL Migration Generator --> Database schema (CREATE TABLE, etc.)
    |
    +-- Frontend (runtime) --> React forms, views, navigation auto-generated from manifest
```

### Runtime Architecture

```
Browser
  |
  +-- Next.js (SSG/SSR) --> React components from @eavfw/apps
  |                          Form engine from @eavfw/forms
  |                          Manifest types from @eavfw/manifest
  |
  +-- HTTP API calls
  |
ASP.NET Core Host
  |
  +-- OData endpoints (CRUD)
  +-- Plugin pipeline (business logic)
  +-- EF Core --> SQL Server
```

The Next.js app is served by the ASP.NET Core host. Pages use dynamic routes that resolve entity/form/view from the manifest at build time.

### Extension Points

**Frontend:**

- `RegisterFeature(name, value)` -- Register themes, expression providers, custom controls, or any named feature
- Custom controls in `packages/apps/src/Components/Controls/`
- Custom ribbon actions

**Backend:**

- Plugin system: pre/post operation hooks on entity CRUD
- `RegisterFeature()` pattern for .NET services
- EF Core model customization
- Custom OData actions

## Technology Stack

| Layer              | Technology                                            |
| ------------------ | ----------------------------------------------------- |
| Frontend           | TypeScript 5.4, React 18, Next.js 14, Fluent UI v8/v9 |
| Form Engine        | React JSON Schema Form (RJSF)                         |
| Backend            | .NET 8/10, ASP.NET Core, EF Core                      |
| Database           | SQL Server                                            |
| Orchestration      | .NET Aspire (replacing docker-compose)                |
| Package Management | NPM Workspaces (frontend), NuGet (backend)            |
| Templates          | `dotnet new` template engine                          |
| CI/CD              | GitHub Actions, semantic-release                      |
