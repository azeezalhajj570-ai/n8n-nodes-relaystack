# Feature Specification: RelayStack Nodes

**Feature Branch**: `001-relaystack-nodes`

**Created**: 2026-05-17

**Status**: Draft

**Input**: User description: "Create an n8n community node package for RelayStack API..."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Instance Authentication (Priority: P1)

An n8n user installs the RelayStack package, configures credentials with their
server URL and API key, creates a messaging session instance, and authenticates
it using their phone number, OTP code, and optional 2FA password. Once
authenticated, they verify the connection status.

**Why this priority**: All downstream operations (messaging, chat, webhooks)
depend on having an authenticated and connected instance. This is the critical
path.

**Independent Test**: Can be fully tested by configuring valid credentials,
creating an instance, sending a login code, verifying it, and confirming the
connection status shows as "connected". Delivers the ability to manage messaging
sessions.

**Acceptance Scenarios**:

1. **Given** the user has installed the package and opened n8n, **When** they
   add RelayStack API Credentials with a valid Base URL and API key, **Then**
   the credentials save successfully and pass validation.
2. **Given** valid credentials exist, **When** the user creates a new instance
   with a unique name, **Then** the instance appears in the instance list with
   a "created" status.
3. **Given** a created instance, **When** the user sends a login code to the
   target phone number, **Then** the API returns a success response and the OTP
   is dispatched.
4. **Given** an OTP has been sent, **When** the user submits the correct OTP
   code, **Then** the instance authenticates successfully.
5. **Given** the account has 2FA enabled and OTP verification succeeded, **When**
   the user submits the correct 2FA password, **Then** the instance completes
   authentication.
6. **Given** an authenticated instance, **When** the user checks connection
   status, **Then** the status shows "connected".
7. **Given** a connected instance, **When** the user disconnects the instance,
   **Then** the status changes to "disconnected".
8. **Given** any instance, **When** the user deletes it, **Then** it no longer
   appears in the instance list.

---

### User Story 2 - Messaging & Chat (Priority: P2)

With an authenticated and connected instance, the user sends a text message to
a contact or group, lists their available chats, and reads messages from a
specific chat.

**Why this priority**: Sending messages and reading conversations is the core
value proposition of integrating RelayStack with n8n workflows. This story
builds on a functioning authenticated instance.

**Independent Test**: Can be fully tested by using an already-connected instance
to send a text message to a known chat, listing chats to confirm the
conversation appears, and fetching messages to verify the sent message is
visible. Delivers the ability to automate messaging.

**Acceptance Scenarios**:

1. **Given** a connected instance, **When** the user sends a text message with
   a target chat ID and message body, **Then** the message is delivered and the
   operation returns a success response with a message ID.
2. **Given** a connected instance, **When** the user lists chats, **Then** the
   operation returns a list of active conversations with chat ID, name, and
   type.
3. **Given** a specific chat, **When** the user fetches messages with optional
   limit and offset parameters, **Then** the operation returns the requested
   messages with sender, content, and timestamp.

---

### User Story 3 - Webhook & Trigger (Priority: P3)

The user configures RelayStack webhooks to send events to n8n, and uses a
trigger node to start workflows automatically when events occur (messages
received, messages sent, connection status changes, or authentication required).

**Why this priority**: Real-time automation is a powerful feature but depends on
having authenticated instances and an understanding of messaging interactions.
It extends the core messaging capability into event-driven workflows.

**Independent Test**: Can be fully tested by configuring a webhook URL, sending
a test webhook event, and verifying the trigger node receives and normalizes the
event data in n8n.

**Acceptance Scenarios**:

1. **Given** a connected instance, **When** the user sets a webhook URL for a
   specific event type (e.g., "message received"), **Then** the API confirms the
   webhook registration and returns the current configuration.
2. **Given** an active webhook configuration, **When** the user retrieves the
   current webhook settings, **Then** the system returns the configured URL and
   enabled event types.
3. **Given** an existing webhook, **When** the user sends a test event, **Then**
   the webhook endpoint receives the test payload.
4. **Given** a configured webhook, **When** the user deletes it, **Then** no
   further events are sent to that URL.
5. **Given** an n8n workflow with the RelayStack trigger node, **When** an event
   occurs (e.g., a new message arrives), **Then** the trigger node emits a
   normalized workflow item with the event data.
6. **Given** the trigger node, **When** the user selects event type filtering
   (e.g., "message received" only), **Then** only matching events trigger the
   workflow.

### Edge Cases

- User enters an invalid Base URL (not a valid URL or unreachable server).
- API key is incorrect or expired — credentials validation fails with clear
  error.
- Phone number is entered in invalid format (missing country code, wrong
  digits).
- OTP code expires before user submits it — instance remains in "waiting for
  code" state.
- 2FA password is incorrect — instance remains unauthenticated with a clear
  error.
- User tries to create an instance with a name that already exists.
- User tries to send a message to a chat ID that doesn't exist or is invalid.
- User tries to list chats when no chats exist — returns empty list.
- Trigger node webhook URL is reconfigured and old webhook events still arrive
  at the old URL.
- Network timeout connecting to self-hosted RelayStack API server.
- Multiple n8n workflows use the same instance and webhook.
- User tries to operate on a deleted or disconnected instance.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to configure RelayStack API credentials with a
  Base URL and API key.
- **FR-002**: Credentials MUST store the API key as a Bearer token for
  authenticated requests.
- **FR-003**: Credentials MUST validate that the Base URL is reachable before
  saving.
- **FR-004**: Users MUST be able to create a new instance with a unique name.
- **FR-005**: Users MUST be able to view a list of all created instances.
- **FR-006**: Users MUST be able to view details of a single instance.
- **FR-007**: Users MUST be able to delete an existing instance.
- **FR-008**: Users MUST be able to connect to a created instance.
- **FR-009**: Users MUST be able to disconnect a connected instance.
- **FR-010**: Users MUST be able to check the connection status of an instance.
- **FR-011**: Users MUST be able to send a login code to a phone number for a
  given instance.
- **FR-012**: Users MUST be able to verify a login code (OTP) for a given
  instance.
- **FR-013**: Users MUST be able to verify a 2FA password for a given instance.
- **FR-014**: Users MUST be able to send a text message to a chat from a
  connected instance.
- **FR-015**: Users MUST be able to list all chats for a connected instance.
- **FR-016**: Users MUST be able to fetch messages from a specific chat.
- **FR-017**: Users MUST be able to configure webhook events for a connected
  instance.
- **FR-018**: Users MUST be able to view current webhook configuration.
- **FR-019**: Users MUST be able to delete an existing webhook configuration.
- **FR-020**: Users MUST be able to send a test event to a configured webhook.
- **FR-021**: A trigger node MUST create an n8n webhook URL and register it with
  the RelayStack API.
- **FR-022**: The trigger node MUST support filtering by event type: message
  received, message sent, connection status changed, authentication required, or
  all events.
- **FR-023**: When an event arrives at the webhook, the trigger node MUST emit a
  normalized n8n workflow item with event data.
- **FR-024**: The trigger node MUST handle webhook deregistration when the
  workflow is deactivated.
- **FR-025**: All API errors MUST be surfaced as user-facing n8n errors with
  actionable messages.

### Key Entities

- **Instance**: Represents a messaging account session managed through the
  RelayStack API. Key attributes include instance name, phone number, connection
  status, and authentication state.
- **Message**: A text message sent to or received from a chat. Attributes
  include message ID, chat ID, sender, content, timestamp, and direction
  (sent/received).
- **Chat**: A conversation with a contact, group, or channel. Attributes include
  chat ID, name, type (private/group/channel), and unread count.
- **Webhook Configuration**: Defines how RelayStack events are forwarded to n8n.
  Attributes include webhook URL, enabled event types, and associated instance.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can install the package in a local n8n instance and
  configure RelayStack API credentials in under 5 minutes.
- **SC-002**: A user can create an instance and complete the authentication flow
  (phone -> OTP -> 2FA) in under 2 minutes.
- **SC-003**: A user can send a text message to a chat in 3 steps or fewer from
  within an n8n workflow.
- **SC-004**: A user can list their chats and view recent messages without
  leaving n8n.
- **SC-005**: A user can configure a webhook and receive events as n8n workflow
  triggers in under 5 minutes.
- **SC-006**: All operations provide clear, user-facing error messages — no raw
  API errors or stack traces are shown to the user.
- **SC-007**: The trigger node processes and normalizes incoming webhook events
  with less than 1 second added latency.

## Assumptions

- Users have access to a running, self-hosted RelayStack API server with a
  reachable Base URL.
- Users already have a messaging account (e.g., Telegram) and the corresponding
  mobile app installed to receive OTP codes.
- The RelayStack API is already configured and provides a REST API at the
  specified Base URL.
- Users have basic familiarity with n8n (creating workflows, adding nodes,
  configuring credentials).
- The self-hosted RelayStack API server has network connectivity to n8n for
  webhook delivery.
- The n8n instance has outbound network access to reach the RelayStack API
  server.
- Phone numbers are provided in international format with country code
  (e.g., +1234567890).
