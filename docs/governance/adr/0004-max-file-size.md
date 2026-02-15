# ADR-0004: Maximum 400 Lines Per File

## Status

Accepted

## Context

The codebase has 6 files over 500 lines, with the largest at 1,098 lines (`EAVForm.tsx` at approximately 28KB). Large files present several problems:

- **Code review**: Files over 400 lines are difficult to review as a unit. Reviewers tend to skim rather than carefully read, increasing the chance of missed issues.
- **Single responsibility**: Large files almost always contain multiple concerns. For example, `ModelDrivenGridViewer.tsx` (1,027 lines) contains 8 nested component definitions and mixes data fetching, state management, rendering, and event handling.
- **AI agent processing**: AI coding agents process files as atomic units. Files over 400 lines consume significant context window space, reducing the agent's ability to reason about the file in relation to other code.
- **Testing**: When tests are eventually introduced (see ADR-0005), smaller files with focused responsibilities are much easier to test in isolation.

The `apps` package is 75% of the codebase (169 files, 14K lines) and contains the worst offenders. Addressing file size is a prerequisite for making this package maintainable.

## Decision

The maximum file size is 400 lines, excluding import statements and type definitions (interfaces, type aliases, enums). This is measured as the number of non-blank, non-comment, non-import, non-type-definition lines.

An ESLint `max-lines` rule will enforce this:

- Initially configured as a **warning** to surface violations without blocking development
- Escalated to **error** after existing oversized files have been split

Files that genuinely need to exceed the limit must include a `/* eslint-disable max-lines -- [reason] */` comment at the top with a justification. This serves as documentation and makes exceptions visible in code review.

Existing oversized files will be split in Phase 3 of the improvement roadmap. The split strategy for each file will be documented in a tracking issue.

## Consequences

### Positive

- Files are focused and reviewable as complete units
- AI agents can process entire files within their context window
- Encourages single responsibility principle at the file level
- Makes future testing easier — smaller units have clearer boundaries

### Negative

- More files to navigate, which can feel fragmented
- The 400-line limit may feel arbitrary for some cases (though the escape hatch exists)
- Splitting existing files requires careful attention to circular dependencies

### Neutral

- 400 lines is generous enough for most React components and utility modules
- Import statements and type definitions are excluded from the count, so files with many types are not penalized
- The line count is a proxy metric — the real goal is single responsibility and reviewability
