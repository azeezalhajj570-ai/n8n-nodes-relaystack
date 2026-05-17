---

description: "Task list for RelayStack n8n community node package implementation"

---

# Tasks: RelayStack Nodes

**Input**: Design documents from `specs/001-relaystack-nodes/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are MANDATORY per the Testing Standards principle in the constitution — include tests for every user story. Write tests before implementation (test-first).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **n8n package**: `credentials/`, `nodes/` at repository root
- **Tests**: `tests/unit/`, `tests/integration/`
- Paths shown reflect the n8n community node structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic tooling

- [ ] T001 [P] Initialize npm project at repository root with `npm init`
- [ ] T002 [P] Configure package.json with n8n community node metadata (`n8n` field, `main` pointing to `index.js`, node types, credential types)
- [ ] T003 [P] Configure TypeScript (tsconfig.json with strict mode, ES2022 target, NodeNext module)
- [ ] T004 [P] Configure ESLint and Prettier (.eslintrc.js, .prettierrc with n8n conventions)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Create `credentials/RelayStackApi.credentials.ts` with Base URL (string) and API Key (password) fields, Bearer token auth
- [ ] T006 Create `nodes/RelayStack/GenericFunctions.ts` with relayStackApiRequest() helper
- [ ] T007 Implement relayStackApiRequest() — read credentials, build full API URL from baseUrl, send JSON requests with Authorization header, support query parameters
- [ ] T008 Implement API error normalization — wrap axios errors in NodeOperationError with user-facing messages
- [ ] T009 [P] Add tests for relayStackApiRequest() and error normalization in `tests/unit/GenericFunctions.test.ts`

**Checkpoint**: Foundation ready — credentials save, API helper sends authenticated requests, errors surface cleanly. User story implementation can now begin.

---

## Phase 3: User Story 1 — Instance Authentication (Priority: P1) 🎯 MVP

**Goal**: User creates an instance, authenticates via phone/OTP/2FA, and manages connection state.

**Independent Test**: Configure valid credentials, create an instance, send login code, verify OTP, check connection status shows "connected", then disconnect.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US1] Add mocked API tests for instance create/delete in `tests/integration/operations.test.ts`

### Implementation for User Story 1

- [ ] T011 [P] [US1] Create `nodes/RelayStack/RelayStack.node.ts` with resource selector (Instance, Message, Chat, Event)
- [ ] T012 [P] [US1] Create `nodes/RelayStack/descriptions/InstanceDescription.ts` with resource name and all operation definitions
- [ ] T013 [US1] Add "create" instance operation with instance name parameter in InstanceDescription.ts
- [ ] T014 [P] [US1] Add "list" instances operation in InstanceDescription.ts
- [ ] T015 [P] [US1] Add "get" instance operation with instance name parameter in InstanceDescription.ts
- [ ] T016 [P] [US1] Add "delete" instance operation with instance name parameter in InstanceDescription.ts
- [ ] T017 [P] [US1] Add "connect" instance operation in InstanceDescription.ts
- [ ] T018 [P] [US1] Add "disconnect" instance operation in InstanceDescription.ts
- [ ] T019 [P] [US1] Add "status" instance operation in InstanceDescription.ts
- [ ] T020 [P] [US1] Add "sendLoginCode" operation with phone number parameter in InstanceDescription.ts
- [ ] T021 [P] [US1] Add "verifyCode" operation with OTP code parameter in InstanceDescription.ts
- [ ] T022 [P] [US1] Add "verifyPassword" operation with 2FA password parameter in InstanceDescription.ts
- [ ] T023 [US1] Implement execution routing for all Instance operations in RelayStack.node.ts (switch on operation, call relayStackApiRequest)
- [ ] T024 [US1] Add tests for instance operation routing in `tests/integration/operations.test.ts`
- [ ] T025 [US1] Wire InstanceDescription into RelayStack.node.ts descriptions array

**Checkpoint**: User can create, authenticate, connect, disconnect, and manage instances. This is the MVP foundation.

---

## Phase 4: User Story 2 — Messaging & Chat (Priority: P2)

**Goal**: User sends a text message, lists chats, and fetches chat messages from a connected instance.

**Independent Test**: Use an already-connected instance to send a text message to a known chat, list chats to confirm the conversation appears, and fetch messages.

### Tests for User Story 2 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T026 [P] [US2] Add mocked API tests for message sendText in `tests/integration/operations.test.ts`
- [ ] T027 [P] [US2] Add mocked API tests for chat list/fetch in `tests/integration/operations.test.ts`

### Implementation for User Story 2

- [ ] T028 [P] [US2] Create `nodes/RelayStack/descriptions/MessageDescription.ts` with resource name and sendText operation definition (chatId, text parameters)
- [ ] T029 [P] [US2] Create `nodes/RelayStack/descriptions/ChatDescription.ts` with resource name and listChats/getChatMessages operation definitions
- [ ] T030 [P] [US2] Add "listChats" operation in ChatDescription.ts
- [ ] T031 [P] [US2] Add "getChatMessages" operation with limit/offset parameters in ChatDescription.ts
- [ ] T032 [US2] Implement execution routing for Message operations in RelayStack.node.ts
- [ ] T033 [US2] Implement execution routing for Chat operations in RelayStack.node.ts
- [ ] T034 [US2] Wire MessageDescription and ChatDescription into RelayStack.node.ts descriptions array

**Checkpoint**: User can send text messages, list chats, and read messages from a connected instance.

---

## Phase 5: User Story 3 — Webhook & Trigger (Priority: P3)

**Goal**: User configures webhook events and uses a trigger node to start workflows automatically when events arrive.

**Independent Test**: Configure a webhook URL, send a test event, and verify the trigger node receives and normalizes event data in n8n.

### Tests for User Story 3 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T035 [P] [US3] Add mocked API tests for event webhook operations in `tests/integration/operations.test.ts`
- [ ] T036 [P] [US3] Add tests for HMAC signature validation in `tests/unit/signature.test.ts`

### Implementation for User Story 3

- [ ] T037 [P] [US3] Create `nodes/RelayStack/descriptions/EventDescription.ts` with resource name and webhook operation definitions
- [ ] T038 [P] [US3] Add "setWebhook" operation with webhook URL and event type parameters in EventDescription.ts
- [ ] T039 [P] [US3] Add "getWebhook" operation in EventDescription.ts
- [ ] T040 [P] [US3] Add "deleteWebhook" operation in EventDescription.ts
- [ ] T041 [P] [US3] Add "testWebhook" operation in EventDescription.ts
- [ ] T042 [US3] Implement execution routing for Event operations in RelayStack.node.ts
- [ ] T043 [US3] Wire EventDescription into RelayStack.node.ts descriptions array
- [ ] T044 [P] [US3] Create `nodes/RelayStackTrigger/RelayStackTrigger.node.ts` with credential reference, instance ID field, and event type selection dropdown
- [ ] T045 [US3] Implement trigger node webhook lifecycle — register n8n webhook URL with RelayStack API on activation (call event/set endpoint)
- [ ] T046 [US3] Implement trigger node deactivation — delete webhook registration via event/delete endpoint
- [ ] T047 [US3] Implement webhook event filtering in trigger node — emit normalized n8n workflow items only for selected event types
- [ ] T048 [US3] Implement optional HMAC signature validation helper in trigger node (verify HMAC-SHA256 signature if webhook secret exists)
- [ ] T049 [US3] Add tests for credential loading and trigger node initialization in `tests/unit/credentials.test.ts`

**Checkpoint**: User can configure webhooks, receive events as workflow triggers, and verify incoming event signatures.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, examples, build verification, and final validation

- [ ] T050 [P] Add tests for operation routing across all resources in `tests/integration/operations.test.ts`
- [ ] T051 Write README installation instructions (local setup, npm link, custom nodes directory)
- [ ] T052 Write README credential setup instructions (Base URL, API key, Bearer token)
- [ ] T053 Write README examples for sending a message (Instance -> Message flow)
- [ ] T054 Write README example for trigger workflow (event-driven workflow)
- [ ] T055 Add example n8n workflow JSON for send message in `examples/send-message.json`
- [ ] T056 Add example n8n workflow JSON for incoming message trigger in `examples/incoming-trigger.json`
- [ ] T057 Run `npm run build` and fix all TypeScript errors
- [ ] T058 Run `npm test` and fix all failing tests
- [ ] T059 Verify package can be installed locally in n8n (npm link or custom nodes)
- [ ] T060 Document known MVP limitations in README (single message type, no media, no npm publish)
- [ ] T061 Prepare final implementation summary

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - US2 (Message & Chat) functionally depends on US1 (needs a connected instance)
  - US3 (Webhook & Trigger) functionally depends on US1 (needs an instance)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — no dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational — code is independent but testing needs a connected instance concept
- **User Story 3 (P3)**: Can start after Foundational — code is independent but functionally builds on instance management

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Description files before routing
- Individual operations before wiring
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- Phase 1 (Setup): All tasks [P] can run in parallel
- Phase 2 (Foundational): T009 (tests) can run in parallel with earlier tasks once GenericFunctions exists
- Phase 3 (US1): T011 (main node) and T012 (InstanceDescription) can start in parallel once T006 exists
- Phase 4 (US2): T028 (MessageDescription) and T029 (ChatDescription) can run in parallel
- Phase 5 (US3): T037 (EventDescription) and T044 (Trigger node) can run in parallel
- Phase 6 (Polish): All documentation tasks [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch description file creation in parallel:
Task: "Create RelayStack.node.ts with resource selector"
Task: "Create InstanceDescription.ts with all operation definitions"

# Launch individual operation tasks in parallel (once description files exist):
Task: "Add create instance operation in InstanceDescription.ts"
Task: "Add list instances operation in InstanceDescription.ts"
Task: "Add delete instance operation in InstanceDescription.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Instance Authentication)
4. **STOP and VALIDATE**: Create an instance, authenticate, connect
5. Demo MVP to stakeholders

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready
2. Add Instance management -> Independently testable (MVP!)
3. Add Message sending + Chat reading -> Independently testable
4. Add Webhook + Trigger node -> Independently testable
5. Polish docs, examples, and verify build

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Instance)
   - Developer B: User Story 2 (Message & Chat)
   - Developer C: User Story 3 (Webhook & Trigger)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
