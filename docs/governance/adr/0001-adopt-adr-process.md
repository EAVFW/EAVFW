# ADR-0001: Adopt Architecture Decision Records

## Status
Accepted

## Context
EAVFW has no formal process for recording architectural decisions. As the framework grows and more contributors (human and AI) join, decisions get lost or revisited without context. Key choices — like shipping raw TypeScript, the monorepo package structure, and the manifest two-layer design — exist only as implicit knowledge in the codebase or in the minds of original contributors.

Without a record of why decisions were made, new contributors (and AI agents) must reverse-engineer intent from code, leading to repeated debates, inconsistent approaches, and accidental regressions of settled design choices.

## Decision
All significant architecture decisions will be recorded as Architecture Decision Records (ADRs) in `docs/governance/adr/`. Each ADR follows the Michael Nygard format (Status, Context, Decision, Consequences). ADRs are numbered sequentially starting from 0001.

ADRs are immutable once accepted. If a decision is reversed or significantly modified, a new ADR is created that supersedes the original. The original ADR's status is updated to "Superseded by ADR-XXXX" but its content is not changed.

A decision is "significant" if it affects:
- Package boundaries or dependencies
- Public API surface
- Developer experience or workflow
- Build, test, or release infrastructure
- Conventions that span multiple packages

## Consequences
### Positive
- Decisions have documented context and rationale
- Onboarding new contributors is easier — they can read the ADR log to understand the project's evolution
- AI agents can understand the rationale behind architectural choices, leading to more aligned contributions
- Prevents relitigating settled decisions without new information

### Negative
- Overhead of writing an ADR for each significant decision
- Risk of ADR process becoming bureaucratic if applied to trivial choices

### Neutral
- ADRs live in the repo alongside code, versioned with git
- The ADR log serves as a lightweight architecture journal for the project
