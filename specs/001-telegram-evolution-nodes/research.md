# Research: RelayStack Nodes

## Technical Decisions

### Package Structure
- **Decision**: n8n community node package (`n8n-nodes-relaystack`).
- **Rationale**: Follows the official n8n community node packaging spec, which
  requires a specific `package.json` layout, credential class, and node class
  exports.
- **Alternatives considered**: Monorepo with multiple packages — rejected for
  MVP since all functionality belongs in one package.

### Language & Tooling
- **Decision**: TypeScript strict mode, Jest for testing, axios for HTTP.
- **Rationale**: TypeScript strict mode aligns with the constitution (principle
  I). n8n bundles axios, avoiding an extra dependency. Jest is n8n's standard
  test framework.
- **Alternatives considered**: node-fetch — rejected (axios is already in n8n).

### Credential Storage
- **Decision**: n8n `ICredentialType` with `baseUrl` (string) and `apiKey`
  (password, hidden). API key sent as `Authorization: Bearer <token>`.
- **Rationale**: n8n encrypts password-type fields at rest. Aligns with
  constitution principle V (Security & Reliability).
- **Alternatives considered**: Custom encryption — rejected (n8n handles this).

### Resource Modularity
- **Decision**: One description file per resource group. Action node routes
  operations via `resource` + `operation` selectors.
- **Rationale**: Keeps files under 500 lines (constitution principle I). Each
  description file is self-contained and independently testable.
- **Alternatives considered**: Single monolithic file — rejected (would exceed
  500 lines and reduce maintainability).

### Trigger Node Design
- **Decision**: Extend n8n's `ITriggerNode` with webhook-based activation.
  On activation: generate n8n webhook URL, register with RelayStack API via
  event/set endpoint. On deactivation: deregister webhook.
- **Rationale**: n8n trigger nodes have a standard lifecycle (activation ->
  deactivation). Webhook-based receiving is the standard pattern for external
  event sources.
- **Alternatives considered**: Polling-based trigger — rejected (higher latency,
  unnecessary API load).

### HMAC Signature Validation
- **Decision**: Support optional webhook secret validation. If the RelayStack
  API returns a webhook secret during registration, the trigger node validates
  the HMAC signature on incoming requests.
- **Rationale**: Provides defense-in-depth against forged webhook events.
- **Alternatives considered**: No validation — rejected (would violate
  constitution principle V).

### Error Handling
- **Decision**: Wrap all API errors in `NodeOperationError` with user-facing
  messages. Never surface raw API responses or stack traces.
- **Rationale**: Constitution principle III (UX Consistency) and principle V
  (Security & Reliability) both require this pattern.
- **Alternatives considered**: Letting axios errors bubble up — rejected (raw
  errors leak implementation details).

### Testing Approach
- **Decision**: Unit tests for GenericFunctions (request helper, credential
  loading, signature validation, operation routing). Integration tests with
  mocked API responses for end-to-end operation flows.
- **Rationale**: Aligns with constitution principle II (Testing Standards
  NON-NEGOTIABLE).
- **Alternatives considered**: E2E tests against real API — deferred to future
  (would require live RelayStack API server in CI).

## RelayStack API Contract Research

The RelayStack API is expected to follow a RESTful pattern similar to messaging
automation platforms. Operations map to HTTP methods on resource paths:

- **Instance resources**: CRUD + actions (connect, disconnect, status, auth)
- **Message resources**: Send operations
- **Chat resources**: Query operations (list, messages)
- **Event resources**: Webhook management

All requests carry the API key as `Authorization: Bearer <token>` and use
`Content-Type: application/json`.

## Key Risks

1. **API contract divergence**: The RelayStack API may differ from expected
   endpoint paths. Mitigation: implement a thin request helper that can be
   adjusted without changing node logic.
2. **No public spec**: If the RelayStack API lacks documentation, integration
   testing against a real server becomes critical.
3. **Rate limiting**: Unknown rate limits. Mitigation: document that users
   should configure respectful polling intervals.
