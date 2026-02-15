# OpenTelemetry: Logging, Tracing & Metrics

## Goal

Full-stack observability for EAVFW applications — from browser click to database query — using OpenTelemetry as the standard. App developers and ops teams get telemetry "for free" when they scaffold an EAVFW project. Vendor-neutral (OTLP) by default, with easy Azure Monitor opt-in.

## Current State

| Layer            | What exists                                                                                                                     | What's missing                                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Aspire dev**   | ServiceDefaults template has full OTLP setup (tracing + metrics + logging), Aspire dashboard shows traces                       | No custom spans from EAVFW business logic — only framework-level auto-instrumentation                                     |
| **.NET backend** | 3 auth counters (`EAVMetrics.cs`), Serilog request logging, correlation ID middleware, W3C `traceparent` propagation to Next.js | No `ActivitySource` spans for CRUD/plugins/workflows, sparse `ILogger` usage, no database operation metrics               |
| **Frontend**     | `@opentelemetry/api` peer dep in `@eavfw/apps`, partial wizard span code                                                        | No OTel SDK/exporter, no auto-instrumentation of fetch, trace propagation commented out, no metrics or structured logging |

### Key Files (existing)

- `external/eavframework/src/OpenTelemetry/EAVMetrics.cs` — 3 auth counters
- `external/eavfw-templates/.../ServiceDefaults/Extensions.cs` — Aspire OTLP setup
- `external/EAVFW.Extensions.Infrastructure/.../Logging/SerilogApplicationExtensions.cs` — Serilog middleware
- `external/EAVFW.Extensions.Infrastructure/.../Middlewares/RequestLoggingMiddleware.cs` — Correlation IDs
- `external/EAVFW.Extensions.Infrastructure/.../Middlewares/NextJSMiddleware.cs` — W3C trace context + `traceparent` cookie
- `packages/apps/src/Components/Wizards/WizardReducer.tsx` — Partial browser spans (no SDK)

## Phased Plan

### Phase A: Backend Instrumentation (eavframework)

**Goal**: Every CRUD operation, plugin execution, and workflow step emits a trace span and relevant metrics.

1. **Create `ActivitySource`** in `EAVFramework` core
   - Name: `EAVFramework` (matches `builder.Environment.ApplicationName` pattern)
   - Register in DI via `AddEAVFrameworkTracing()` extension method

2. **Instrument CRUD endpoints** with spans
   - `CreateRecordsEndpoint` — span with entity name, record count, duration
   - `PatchRecordsEndpoint` — span with entity name, changed attributes
   - `DeleteRecordEndpoint` — span with entity name, record ID
   - Each span records exceptions via `span.RecordException()`

3. **Instrument plugin/workflow execution**
   - Span per plugin invocation with plugin type, entity, stage
   - Span per workflow step with workflow name, step index

4. **Expand metrics** beyond auth
   - `eavfw.entity.operations` (counter) — tagged by entity, operation type (create/read/update/delete)
   - `eavfw.entity.operation.duration` (histogram) — tagged by entity, operation type
   - `eavfw.plugin.execution.duration` (histogram) — tagged by plugin type, entity
   - `eavfw.migration.duration` (histogram) — tagged by migration type

5. **Enrich ILogger usage** in existing endpoints
   - Structured log events with entity name, record ID, user ID
   - Use `LoggerMessage.Define` for high-performance logging

### Phase B: Frontend Instrumentation (@eavfw/apps)

**Goal**: Browser traces connected to backend traces via W3C trace context. Page loads, navigation, and API calls are automatically traced.

1. **Create `@eavfw/telemetry` package** (or add to `@eavfw/utils`)
   - Wraps `@opentelemetry/sdk-trace-web`, `@opentelemetry/instrumentation-fetch`, `@opentelemetry/exporter-trace-otlp-http`
   - `initEAVTelemetry({ endpoint, serviceName })` — one-call setup
   - Auto-instruments `fetch` and `XMLHttpRequest`
   - Reads `traceparent` cookie from backend for trace continuity

2. **Activate W3C trace context propagation**
   - Uncomment and fix the `traceparent` header injection in API calls
   - Ensure `propagation.inject()` adds headers to all `fetch` calls to the backend

3. **Add page/navigation spans**
   - Next.js route change spans (using `next/router` events)
   - Form load/submit spans in `EAVForm.tsx`
   - View load spans in grid/list components

4. **Complete wizard tracing**
   - Fix the existing commented-out code in `WizardReducer.tsx`
   - Add proper span attributes and error recording

5. **Frontend metrics** (stretch)
   - Page load timing
   - Form submission success/failure rates
   - Control render counts (identify performance issues)

### Phase C: Aspire Dev Experience

**Goal**: The Aspire dashboard becomes the go-to debugging tool during development. All custom spans and metrics are visible.

1. **Register custom `ActivitySource`** in ServiceDefaults
   - Add `AddSource("EAVFramework")` to tracing configuration
   - Add custom meter names to metrics configuration

2. **Add spans to Aspire lifecycle hooks**
   - Model publish: span covering `dacpac` generation, database publish, signin link generation
   - npm build: span covering install, link, build steps
   - Each step as a child span with output captured in span events

3. **Health check metrics**
   - Expose database health check results as metrics
   - SQL Server connection pool metrics

4. **Dashboard annotations**
   - Custom resource properties showing entity count, last migration, etc.

## Dependencies

- Phase A is independent — can start immediately in `external/eavframework/`
- Phase B depends on Phase A being at least partially done (need backend spans to connect to)
- Phase C can proceed in parallel with A and B

## Integration with Improvement Roadmap

- Phases A-C can run **in parallel** with the existing improvement roadmap phases
- Phase B's `@eavfw/telemetry` package (if created) should follow Phase 1 standards (ESLint, Prettier, Vitest, JSDoc)
- Phase A touches `external/eavframework/` which is a separate release unit — coordinate with release strategy

## Success Criteria

- A scaffolded EAVFW project shows end-to-end traces in the Aspire dashboard: browser -> API -> database
- Custom metrics visible in Aspire dashboard (entity operation counts, durations)
- Production deployments can export to Azure Monitor or any OTLP-compatible backend with zero code changes (config only)
- App developers do not need to write any telemetry code — it's built into the framework
