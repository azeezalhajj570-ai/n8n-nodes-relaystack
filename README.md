# n8n-nodes-relaystack

n8n community node package for [RelayStack API](https://relaystack.dev) — messaging automation platform.

## Installation

### Option 1: n8n Community Nodes (n8n >= 1.x)

1. Go to **Settings > Community Nodes** in your n8n instance
2. Enter the npm package name: `n8n-nodes-relaystack`
3. Click **Install**

### Option 2: Local Development

```bash
# Clone the repository
git clone <repo-url>
cd n8n-nodes-relaystack

# Install dependencies
npm install

# Build the package
npm run build

# Link to your local n8n
npm link
# Then in your n8n directory:
npm link n8n-nodes-relaystack
```

### Option 3: Custom Nodes Directory

Copy the `dist/` folder contents to your n8n custom nodes directory:

```bash
cp -r dist/* ~/.n8n/custom/nodes/
```

## Credential Setup

1. In n8n, create a new **RelayStack API** credential
2. Enter your RelayStack server **Base URL** (e.g., `https://relaystack.example.com`)
3. Enter your **API Key** (provided by your RelayStack instance)
4. The API key is sent as a Bearer token in the `Authorization` header

## Nodes

### RelayStack Node

Action node with four resources:

| Resource | Operations |
|----------|-----------|
| **Instance** | Create, List, Get, Delete, Connect, Disconnect, Get Status, Send Login Code, Verify Code, Verify 2FA Password |
| **Message** | Send Text |
| **Chat** | List Chats, Get Chat Messages |
| **Event** | Set Webhook, Get Webhook, Delete Webhook, Test Webhook |

### RelayStack Trigger Node

Receives events from RelayStack via webhook. Supports filtering by event type:

- **All Events** — receive everything
- **Message Received** — new incoming messages
- **Message Sent** — outgoing message confirmations
- **Connection Status Changed** — instance connection state changes
- **Authentication Required** — when re-authentication is needed

## Usage Examples

### Send a Message

1. Add a **RelayStack** node to your workflow
2. Select resource **Instance** > operation **Create** and set an instance name
3. Add another **RelayStack** node with **Instance** > **Send Login Code** with your phone number
4. Add **Instance** > **Verify Code** with the OTP you received
5. (Optional) Add **Instance** > **Verify Password** if 2FA is enabled
6. Add a **RelayStack** node with resource **Message** > **Send Text**, set the chat ID and message

### Trigger Workflow on Incoming Message

1. Add a **RelayStack Trigger** node as the workflow trigger
2. Select the instance name and event type
3. Connect downstream nodes to process the event data
4. Activate the workflow — n8n automatically registers the webhook URL with RelayStack

## Known MVP Limitations

- **Text messages only** — media, files, and location messages are not supported in MVP
- **No batch operations** — each message is sent individually
- **No npm publishing** — install via local methods or community node settings
- **Webhook secret validation** — optional HMAC validation is not yet exposed in the UI

## Development

```bash
# Build TypeScript
npm run build

# Run linter
npm run lint

# Run tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration
```

## License

MIT
