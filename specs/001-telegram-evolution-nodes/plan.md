# Implementation Plan: RelayStack Nodes

**Branch**: `001-relaystack-nodes` | **Date**: 2026-05-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-relaystack-nodes/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Create an n8n community node package (`n8n-nodes-relaystack`) that lets n8n
users connect to a self-hosted RelayStack API server and automate messaging
workflows inside n8n. The package exposes four resource nodes (Instance,
Message, Chat, Event) and one trigger node that receives webhook events.

## Technical Context

**Language/Version**: TypeScript (strict mode enabled)

**Primary Dependencies**: n8n-workflow, n8n-core (bundled by n8n), axios

**Storage**: n8n credential system (encrypted at rest)

**Testing**: Jest + n8n test utilities

**Target Platform**: n8n 1.x (community node API)

**Project Type**: n8n community node package

**Performance Goals**: P95 single operation < 3s; trigger node event
normalization < 1s added latency

**Constraints**: Package must follow n8n community node packaging spec; no
publishing to npm for MVP; credentials never logged; no hardcoded API base URLs

**Scale/Scope**: Single package, 2 nodes (action + trigger), 4 resource
operation groups, MVP sends text messages only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The following gates are derived from the project constitution:

- [x] **Code Quality**: Modular file structure (one description file per
  resource). 500-line limit per node file will be respected. TypeScript strict
  mode enforced. Linter + type-checker required in build pipeline.
- [x] **Testing Standards**: Test plan includes unit tests (request helper,
  credential loading, signature validation, operation routing), integration
  tests (mocked API responses). Test-first approach documented.
- [x] **UX Consistency**: Parameter naming follows n8n camelCase convention.
  Error messages use NodeOperationError. Descriptions on all input fields.
- [x] **Performance**: Single API calls per operation (no unnecessary batching
  for MVP). Axios timeout handling. No memory-heavy patterns.
- [x] **Security & Reliability**: API key stored in n8n credential system, sent
  as Bearer token. No logging of secrets. HTTPS enforced. Error normalization
  prevents raw stack traces to users.

If any gate cannot be satisfied, document the violation and justification in
the Complexity Tracking section below.

## Project Structure

### Documentation (this feature)

```text
specs/001-relaystack-nodes/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
credentials/
└── RelayStackApi.credentials.ts

nodes/
├── RelayStack/
│   ├── RelayStack.node.ts
│   ├── GenericFunctions.ts
│   └── descriptions/
│       ├── InstanceDescription.ts
│       ├── MessageDescription.ts
│       ├── ChatDescription.ts
│       └── EventDescription.ts
└── RelayStackTrigger/
    └── RelayStackTrigger.node.ts

tests/
├── unit/
│   ├── GenericFunctions.test.ts
│   ├── credentials.test.ts
│   └── signature.test.ts
└── integration/
    └── operations.test.ts
```

**Structure Decision**: Single project (n8n community node package) using n8n's
standard community node layout. Credentials in `credentials/`, action node +
descriptions in `nodes/RelayStack/`, trigger node in `nodes/RelayStackTrigger/`,
tests in `tests/`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *None — all constitution gates pass* | | |
