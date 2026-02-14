---
name: debug-eavfw
description: Diagnose and fix common EAVFW development issues. Catalogs known error patterns and their fixes.
user_invocable: true
---

# EAVFW Debug Skill

When invoked, diagnose the user's EAVFW development issue by checking against known problems and their fixes. If the user describes a specific error, match it against the catalog below. If no specific error is given, run the diagnostic steps to identify issues.

## Known Issue Catalog

### 1. Fluent UI `disableGlobalClassNames` Build Error

**Error pattern**: Build fails with errors mentioning `disableGlobalClassNames` or type mismatches in `@fluentui/*` packages.

**Root cause**: Version mismatch between `@fluentui/react` v8 packages. The `disableGlobalClassNames` API changed between minor versions.

**Fix**:
1. Update all `@fluentui/*` packages to their latest v8 versions in the root `package.json`
2. Run `npm install --force`
3. Rebuild with `npm run build-app`

### 2. Docker Credential Store Errors

**Error pattern**: Docker errors mentioning `credsStore`, `docker-credential-desktop`, or credential helper failures when pulling container images (e.g., SQL Server, Mailpit).

**Root cause**: Stale Docker credential store configuration, common in devcontainers where the host's Docker config is mounted.

**Fix**:
1. Check `~/.docker/config.json`
2. Remove or rename the `credsStore` key (e.g., change `"credsStore": "desktop"` to `"credStore": ""` or remove it entirely)
3. Retry the Docker operation

### 3. `ASPIRE_ALLOW_UNSECURED_TRANSPORT` Not Set

**Error pattern**: Aspire dashboard or resources fail to start with errors about HTTPS/TLS requirements, or `ASPIRE_ALLOW_UNSECURED_TRANSPORT` environment variable warnings.

**Root cause**: In devcontainers, HTTPS endpoints are typically not available. Aspire requires this env var to allow HTTP.

**Fix**:
1. In the AppHost project's `Properties/launchSettings.json`, ensure the `http` profile has:
   ```json
   "environmentVariables": {
     "ASPIRE_ALLOW_UNSECURED_TRANSPORT": "true"
   }
   ```
2. Run the AppHost: `aspire run`

### 4. `manifest.g.json` Not Found

**Error pattern**: Application fails to start because it cannot find `manifest.g.json`, or the model resource shows errors about missing manifest file.

**Root cause**: The `PublishEAVFWProjectLifecycleHook` has not completed successfully. The model project must generate `manifest.g.json` before the app can start.

**Diagnosis**:
1. Use `mcp__aspire__list_resources` to check the model resource status
2. Use `mcp__aspire__list_structured_logs` and look for `[EAVFW MODEL READY]` or `[EAVFW MODEL FAILED]` markers
3. Check console logs of the model resource with `mcp__aspire__list_console_logs`

**Fix**: Ensure the model project builds successfully. Check that the manifest source files exist and the dotnet build completes. Restart the model resource if needed.

### 5. `ClaimsPrincipal is null` / Signin Token Not Created

**Error pattern**: Login fails with `ClaimsPrincipal is null` or similar authentication errors. No signin link appears in the Aspire dashboard.

**Root cause**: The signin token creation step in `PublishEAVFWProjectLifecycleHook` did not complete, usually because DB creation or migrations failed first.

**Diagnosis**:
1. Check for `[EAVFW SIGNIN READY]` in structured logs - if missing, signin was not created
2. Check for `[EAVFW DB CREATE READY]` and `[EAVFW MIGRATION READY]` - these must succeed first
3. Look at the model resource console logs for detailed error messages

**Fix**: Resolve the underlying DB or migration issue first, then restart the model resource.

### 6. Playwright System Dependencies in Devcontainers

**Error pattern**: Playwright tests fail with missing system library errors (e.g., `libatk-bridge-2.0.so`, `libgbm.so`).

**Root cause**: In devcontainers, system libraries may already be pre-installed, but Playwright's `--with-deps` flag can conflict.

**Fix**:
1. Use `npx playwright install chromium` (without `--with-deps`) in devcontainers where system libs are pre-installed
2. If libs are truly missing, install them manually: `apt-get install -y libatk-bridge2.0-0 libgbm1 libxkbcommon0`

### 7. npm Build Fails with Exit Code 1

**Error pattern**: The `eav-build` resource shows "Exited" with exit code 1 in the Aspire dashboard.

**Diagnosis**:
1. Use `mcp__aspire__list_console_logs` for the build resource to see the actual npm error output
2. Look for `[BUILD ERROR]` lines in the console logs
3. Common causes: missing dependencies (run `npm install --force`), TypeScript errors, missing environment variables

## Diagnostic Steps

When no specific error is described, run these checks using Aspire MCP tools:

1. **Check resource states**: Call `mcp__aspire__list_resources` and verify all resources are in expected states (`Running` or `Finished`)
2. **Check structured logs**: Call `mcp__aspire__list_structured_logs` and look for any `[EAVFW` markers indicating completion or failure
3. **Check console logs for errored resources**: For any resource not in a healthy state, call `mcp__aspire__list_console_logs` with that resource name
4. **Check traces for errors**: Call `mcp__aspire__list_traces` and look for traces with errors

## Key Files Reference

- **Aspire lifecycle hooks**: `external/eavframework/aspire/EAVFramework.Extensions.Aspire.Hosting/PublishEAVFWProjectLifecycleHook.cs` (this is in the eavframework submodule, not the scaffolded project)
- **Aspire builder extensions**: `external/eavframework/aspire/EAVFramework.Extensions.Aspire.Hosting/AspireBuilderExtensions.cs` (this is in the eavframework submodule, not the scaffolded project)
- **EAVFW manifest types**: `packages/manifest/src/`
- **Form engine**: `packages/forms/src/EAVForm.tsx`
- **App orchestrator**: `packages/apps/src/ModelDrivenApp.ts`
