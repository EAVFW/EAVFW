---
name: eavfw-init
description: Scaffold a new EAVFW project, configure it, and verify it works end-to-end with Aspire. Use when anyone wants to create a project using the EAVFW framework.
user_invocable: true
---

# EAVFW Init Skill

Scaffold a new EAVFW project and verify it works end-to-end.

## Trigger

Use this skill when a user wants to:
- Create a new project using the EAVFW framework
- Scaffold an EAVFW application
- Set up a new EAVFW-based system (CRM, case management, etc.)
- Test the full EAVFW developer experience

## Parameter Derivation

Derive these from the user's description. Ask only if truly ambiguous:

| Parameter | How to derive | Default |
|---|---|---|
| **Namespace** | PascalCase from project name (e.g., "small CRM" -> `SimpleCRM`, "case management" -> `CaseManager`) | Required |
| **App Name** | Always `Portal` unless user specifies otherwise | `Portal` |
| **Database Name** | Same as Namespace | Same as Namespace |
| **Schema** | `dbo` | `dbo` |
| **User Email** | `admin@{namespace-lowercase}.dev` | Derived |
| **User Name** | `Admin` | `Admin` |

## Context Detection

This skill supports two modes. **Check the project's CLAUDE.md for instructions on which mode to use.**

### Dev Mode (EAVFW development repo)

When the CLAUDE.md or AGENTS.md instructs you to use dev mode (e.g., because you're inside the EAVFW monorepo), follow the `/eavfw-scaffold-dev` skill. Key differences:
- Scaffold into `samples/{Namespace}`
- Use local project references (`--useLocalReferences`)
- Configure conditional extension references in csproj files

### Standard Mode (external consumer)

When there is no dev-mode instruction, scaffold a standalone project using NuGet packages:

```bash
dotnet new install EAVFW.Templates

mkdir {Namespace} && cd {Namespace}

dotnet new eavfw \
  --namespace {NS} \
  --appName Portal \
  --databaseName {NS} \
  --schemaName dbo \
  --yourUserEmail {derived-email} \
  --yourUserName "{derived-name}" \
  --allow-scripts yes

dotnet new eavfw-nextjs \
  --namespace {NS} \
  --appName Portal \
  --allow-scripts yes
```

Then build twice and run:

```bash
dotnet tool restore --no-cache
dotnet build {NS}.sln          # First build generates manifest.g.json (will error)
dotnet build {NS}.sln          # Second build succeeds
aspire run
```

## Execution

### Dev mode (3 phases):

| Phase | What |
|---|---|
| 1 | Install templates, scaffold with `--useLocalReferences`, apply NextJS template |
| 2 | Build twice (manifest generation), configure local extension references in csproj |
| 3 | Run `aspire run` and verify with `/validate-eavfw` |

### Standard mode (2 phases):

| Phase | What |
|---|---|
| 1 | Install templates, scaffold, apply NextJS template |
| 2 | Build twice, run `aspire run` and verify |

## Troubleshooting

If anything fails, use `/debug-eavfw` to diagnose against the known issue catalog, and `/validate-eavfw` to check Aspire resource states via MCP tools.

Common issues:
- **First build fails with "Please build again"**: Expected — run `dotnet build` a second time
- **Extension submodule missing**: Run `git submodule update --init --recursive`
- **npm link not working**: Run `npm run link` from EAVFW repo root first
- **Aspire dashboard unreachable**: Ensure `ASPIRE_ALLOW_UNSECURED_TRANSPORT=true` in launchSettings.json
