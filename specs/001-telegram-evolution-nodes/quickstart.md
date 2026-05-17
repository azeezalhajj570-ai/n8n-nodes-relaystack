# Quickstart: RelayStack Nodes

## Installation

```bash
# Clone or copy the package into your n8n custom nodes directory
mkdir -p ~/.n8n/custom/
cp -r n8n-nodes-relaystack ~/.n8n/custom/

# Or link during development
cd n8n-nodes-relaystack
npm link
# In your n8n installation directory:
npm link n8n-nodes-relaystack
```

## Build

```bash
npm install
npm run build
```

## Configure Credentials

1. Open n8n and go to **Settings > Credentials**.
2. Click **Add Credential** and search for **RelayStack API**.
3. Enter:
   - **Base URL**: Your self-hosted RelayStack API server URL
     (e.g., `https://relaystack.example.com`)
   - **API Key**: Your API key for authentication.

## Use the Action Node

1. Create a new workflow.
2. Add a **RelayStack** node.
3. Select your credentials.
4. Choose a resource and operation:
   - **Instance**: Create, list, get, delete, connect, disconnect,
     check status, send login code, verify code, verify 2FA password
   - **Message**: Send text message
   - **Chat**: List chats, get chat messages
   - **Event**: Set webhook, get webhook, delete webhook, test webhook

### Example: Authenticate an Instance

1. Add **RelayStack** node > Resource: **Instance** > Operation: **Create** ->
   Set instance name -> Execute.
2. Change Operation to **Send Login Code** -> Enter phone number -> Execute.
3. Change Operation to **Verify Code** -> Enter OTP code -> Execute.
4. Change Operation to **Connect** -> Execute.
5. Change Operation to **Status** -> Verify connection is active.

### Example: Send a Message

1. Ensure instance is connected.
2. Add **RelayStack** node > Resource: **Message** > Operation: **Send Text**.
3. Enter chat ID and message text -> Execute.

## Use the Trigger Node

1. Create a new workflow.
2. Add a **RelayStack Trigger** node.
3. Select your credentials and instance.
4. Choose event types to listen for:
   - Message Received
   - Message Sent
   - Connection Status Changed
   - Authentication Required
   - All Events
5. The node will register an n8n webhook URL with the RelayStack API.
6. When events arrive, your workflow executes with event data.

## Local Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```
