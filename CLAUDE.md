# CLAUDE.md

All project instructions, coding standards, and agent guidelines are in @AGENTS.md.

## Scaffolding Projects (eavfw-init)

**This is the EAVFW development repo.** When using `/eavfw-init` to scaffold a project, always use **dev mode**:

- Scaffold into `sandbox/{Namespace}` (not the repo root)
- Use local project references (`UseEAVFromNuget=false`) so changes to `external/eavframework/`, `external/EAVFW.Extensions.*`, and `packages/` are tested directly
- Follow the full `/eavfw-scaffold-dev` skill for step-by-step instructions
- Verify with the E2E Playwright test that exercises login and record creation

## DevContainer

The development container includes Node 20, .NET 8/10, Docker-in-Docker, and a restrictive default-deny firewall. See `.devcontainer/CLAUDE.md` for firewall details and allowed domains. AI agents can edit `init-firewall.sh` to add domains but cannot apply changes directly — a container rebuild by the human is required.

## Technical Details

- **TypeScript 5.4.2**, strict mode, ES modules (`"type": "module"`)
- **Target**: ES2015, **Module**: ESNext, **JSX**: preserve
- **UI Framework**: Fluent UI v8/v9, React JSON Schema Form (RJSF)
- **Peer dependencies** are used extensively — consuming projects must provide React 18, Next.js 14, Fluent UI, RJSF, etc.
- **.NET SDKs**: 8.0 and 10.0 available in devcontainer
- **EAVFramework version**: 5.0.0 (current submodule)

## CI/CD

GitHub Actions runs on `windows-latest` with .NET 8 and Node 20. The test workflow creates a project from EAVFW dotnet templates, links local packages, and runs `npm run build` against it.

## Aspire Dual ProjectReference Pattern

When an Aspire AppHost needs both an assembly reference (for `using Namespace.Models;`) and Aspire metadata type generation (`Projects.Namespace_Models`), use **two** `<ProjectReference>` entries:

```xml
<ProjectReference IsAspireProjectResource="false" Include="..." /> <!-- assembly ref -->
<ProjectReference Include="..." /> <!-- Aspire metadata type -->
```
