---
name: validate-eavfw
description: Validate that an EAVFW Aspire development environment is healthy by checking all resource states, logs, and endpoints.
user_invocable: true
---

# EAVFW Aspire Environment Validation

When invoked, perform a comprehensive health check of the running EAVFW Aspire environment using MCP tools. Report results as a summary table with pass/fail indicators.

## Validation Steps

Execute the following checks in order:

### Step 1: List All Resources

Call `mcp__aspire__list_resources` to get the full resource list.

**Expected resources** (names may vary by project):
- SQL Server resource (type: container)
- SQL Database resource (type: database)
- Mail server resource (type: container, e.g., Mailpit)
- Portal/App resource (type: project)
- Model resource (type: Data Model)
- Build resource(s) (type: EAV Build and/or NPM Install)

**Check**: All expected resource types are present. Report any missing resources.

### Step 2: Check Resource States

For each resource from Step 1, verify its state:

| Resource Type | Expected State |
|---|---|
| SQL Server | `Running` |
| SQL Database | `Running` |
| Mail server | `Running` |
| Portal/App | `Running` |
| Model (Data Model) | `Finished` |
| NPM Install | `Finished` |
| EAV Build | `Finished` |

**Check**: All resources are in their expected state. Flag any resource in `FailedToStart`, `Exited`, or error states.

### Step 3: Check Structured Logs for EAVFW Markers

Call `mcp__aspire__list_structured_logs` and search for these markers:

| Marker | Meaning | Required |
|---|---|---|
| `[EAVFW BUILD READY]` | npm build completed successfully | Yes (if build resource exists) |
| `[EAVFW NPM INSTALL READY]` | npm install completed successfully | Yes (if npm install resource exists) |
| `[EAVFW DB CREATE READY]` | Database created successfully | Yes |
| `[EAVFW MIGRATION READY]` | Migrations applied successfully | Yes |
| `[EAVFW SIGNIN READY]` | Signin link created | Yes (if signin configured) |
| `[EAVFW MODEL READY]` | All model operations completed | Yes |
| `[EAVFW BUILD HOOK READY]` | Build lifecycle hook completed | Yes (if build resource exists) |

**Check**: All required markers are present. If any `FAILED` markers are found (e.g., `[EAVFW BUILD FAILED]`, `[EAVFW MODEL FAILED]`), report them prominently.

### Step 4: Check Console Logs for Errors

For any resource that is NOT in a healthy state (`Running` or `Finished`), call `mcp__aspire__list_console_logs` with that resource name.

**Check**: Look for error messages, stack traces, or failure indicators. Summarize the key error for each unhealthy resource.

### Step 5: Validate Portal Health

Check the portal/app resource:
1. Verify it has HTTP endpoints listed in its resource properties
2. Check that endpoints are allocated (have URLs)
3. Look for any health check failures

**Check**: Portal has at least one HTTP endpoint with an allocated URL.

### Step 6: Validate Signin Link

Check the model resource or portal resource properties for a `signinlink` property.

**Check**: A signin link exists and is a valid URL path (starts with `/`). If the portal has endpoints, construct the full signin URL and report it.

### Step 7: Report Summary

Produce a summary table in this format:

```
## EAVFW Environment Health Check

| Check | Status | Details |
|---|---|---|
| Resources present | PASS/FAIL | N/N expected resources found |
| SQL Server | PASS/FAIL | State: Running/... |
| Database | PASS/FAIL | State: Running/... |
| Mail server | PASS/FAIL | State: Running/... |
| NPM Install | PASS/FAIL | State: Finished/... |
| EAV Build | PASS/FAIL | State: Finished/... |
| Model operations | PASS/FAIL | State: Finished/... |
| Portal | PASS/FAIL | State: Running/..., Endpoint: URL |
| Build markers | PASS/FAIL | Found: [list of markers] |
| Model markers | PASS/FAIL | Found: [list of markers] |
| Signin link | PASS/FAIL | Link: URL or "not found" |

**Overall: PASS/FAIL**
```

If any check fails, add a "Recommended Actions" section with specific fix suggestions. Reference the `/debug-eavfw` skill for known issue fixes.
