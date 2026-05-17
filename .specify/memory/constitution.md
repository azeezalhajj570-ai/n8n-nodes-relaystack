<!--
  Sync Impact Report
  Version change: (template) → 1.0.0
  Modified principles: N/A (initial creation from template)
  Added sections: Core Principles (5 principles), Additional Constraints,
    Development Workflow & Quality Gates, Governance
  Removed sections: N/A
  Templates requiring updates:
    - .specify/templates/plan-template.md (constitution check gates) ✅ updated
    - .specify/templates/tasks-template.md (test mandatory note) ✅ updated
    - .specify/templates/spec-template.md ⚠ verified - no changes needed
    - .specify/templates/checklist-template.md ⚠ verified - no changes needed
  Follow-up TODOs: None
-->

# RelayStack Nodes Constitution

## Core Principles

### I. Code Quality

All code MUST be clean, maintainable, and self-documenting.
- Each node file MUST NOT exceed 500 lines; extract helpers when it does.
- TypeScript types MUST be explicit for all node parameters, inputs, and outputs.
- Complex logic (conditionals >3 branches, nested callbacks, async chains)
  MUST include inline rationale.
- Dead code, commented-out blocks, and console.log debug output MUST NOT
  be committed.
- Linter and type-checker MUST pass with zero warnings before any commit.

*Rationale*: n8n nodes are consumed as dependencies. Future maintainers
and community contributors MUST be able to understand each node's intent
without external documentation.

### II. Testing Standards (NON-NEGOTIABLE)

Every feature MUST include tests before implementation (test-first).
- **Unit tests** MUST cover all helper functions, utility methods, and
  parameter validation logic.
- **Integration tests** MUST verify that each node executes correctly
  against a real or mocked Telegram Evolution API endpoint.
- **Contract tests** MUST validate that node output schemas match
  documented API response shapes.
- Tests MUST fail before implementation begins (Red-Green-Refactor).
- A feature is NOT complete until its test suite passes.

*Rationale*: Telegram API contracts can change silently. Without a
robust test suite, regressions go undetected and break user workflows.

### III. User Experience Consistency

Every node MUST follow n8n's native UX conventions.
- Parameter naming, tooltip text, and placeholder values MUST match the
  n8n design language (camelCase for IDs, sentence case for labels).
- All input fields MUST include descriptive `description` strings.
- Error messages MUST be user-facing (actionable, jargon-free) and use
  n8n's `NodeOperationError` pattern.
- Node colors, icons, and category placement MUST align with n8n's
  ecosystem guidelines.
- Output properties MUST be consistently structured across all nodes.

*Rationale*: n8n users expect a cohesive experience. Inconsistent
parameter patterns or error handling erodes trust and increases support
burden.

### IV. Performance Requirements

Nodes MUST be efficient in API usage and resource consumption.
- API calls MUST be batched when the Telegram Evolution API supports it.
- Polling intervals MUST be configurable, with sensible defaults
  (minimum 5 seconds between polls).
- Response payloads MUST be parsed lazily; avoid loading full bodies
  into memory when streaming is possible.
- n8n execution timeout MUST be respected; long-running operations
  MUST provide progress feedback.
- P95 execution time for a single node operation MUST NOT exceed 3
  seconds under normal network conditions.

*Rationale*: n8n workflows chain multiple nodes. A single slow node
blocks the entire pipeline, degrading the user experience.

### V. Security & Reliability

Credentials and sensitive data MUST be handled safely.
- API tokens, secrets, and keys MUST use n8n's credential system;
  never store secrets in node parameters or hardcoded values.
- All external API requests MUST use HTTPS with certificate validation.
- Network errors, timeouts, and API error responses MUST be caught
  and surfaced as typed n8n errors (never raw stack traces).
- Rate-limit responses (429) MUST trigger exponential backoff.
- Node execution MUST be idempotent where the Telegram API allows it.

*Rationale*: Nodes handle users' Telegram bot credentials. A leak or
misrouted credential is irrecoverable and damages the project's reputation.

## Additional Constraints

### Technology Stack

- Language: TypeScript (strict mode enabled).
- Runtime: Node.js 18+ (n8n's minimum supported version).
- HTTP client: `axios` (matches n8n's bundled dependency).
- Testing: Jest + n8n's test utilities (`n8n-workflow` test helpers).

### n8n Compatibility

- Nodes MUST target n8n 1.x API surface. Breaking changes in n8n 2.x
  MUST be explicitly version-gated.
- Package must export via `package.json` `n8n` field following the
  n8n community node packaging spec.

### API Compatibility

- All nodes target the Telegram Evolution API v1.x contract.
- API version negotiation MUST happen at node initialization; fail
  gracefully with a clear message if the API version is unsupported.

## Development Workflow & Quality Gates

### Pull Request Process

1. Feature branch MUST follow `###-description` naming convention.
2. All checks MUST pass before review: lint, type-check, unit tests,
   integration tests.
3. At least one reviewer MUST approve. The reviewer MUST verify:
   - No secrets or credentials in code.
   - Test coverage for new/modified paths.
   - UX consistency with existing nodes.
   - Performance impact assessment.
4. Squash-merge to main. Commit message MUST reference the feature
   branch number.

### Quality Gates

- **Lint gate**: `npm run lint` — zero warnings.
- **Type gate**: `npm run typecheck` — strict mode, no `any` escapes.
- **Unit gate**: `npm run test:unit` — 100% pass.
- **Integration gate**: `npm run test:integration` — 100% pass against
  mocked API.
- **Constitution Check**: Every plan MUST reference applicable
  principles from this constitution. Violations MUST be documented
  with justification in the Complexity Tracking section.

## Governance

### Supremacy

This constitution supersedes all ad-hoc practices, personal preferences,
and undocumented conventions. All code reviews, plans, and specifications
MUST reference these principles.

### Amendment Procedure

1. A proposal MUST be documented as a Pull Request modifying this file.
2. The PR description MUST explain the rationale and impact on existing
   principles.
3. Amendment requires majority approval from active maintainers.
4. After approval, `CONSTITUTION_VERSION` MUST be bumped per semantic
   versioning rules:
   - MAJOR: Backward incompatible governance/principle removals or
     redefinitions.
   - MINOR: New principle/section added or materially expanded guidance.
   - PATCH: Clarifications, wording, typo fixes, non-semantic refinements.

### Compliance Review

- Every `/speckit.plan` execution MUST include a Constitution Check.
- Every PR review MUST verify compliance with applicable principles.
- A full constitution compliance audit SHOULD be run at each minor
  release.

**Version**: 1.0.0 | **Ratified**: 2026-05-17 | **Last Amended**: 2026-05-17
