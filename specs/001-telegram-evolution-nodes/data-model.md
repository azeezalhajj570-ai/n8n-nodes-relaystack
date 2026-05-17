# Data Model: RelayStack Nodes

## Instance

Represents a messaging account session managed through the RelayStack API.

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Unique instance name (identifier) |
| `phoneNumber` | string | Phone number in international format |
| `status` | enum | `created`, `connecting`, `connected`, `disconnected` |
| `authState` | enum | `pending`, `codeSent`, `codeVerified`, `authenticated` |

**State transitions**:

```
created -> (sendCode) -> codeSent -> (verifyCode) -> codeVerified
  -> (verifyPassword, if 2FA) -> authenticated -> (connect) -> connected
connected -> (disconnect) -> disconnected
```

## Message

A text message sent to or received from a chat.

| Field | Type | Description |
|-------|------|-------------|
| `messageId` | string | Unique message identifier |
| `chatId` | string | Chat this message belongs to |
| `sender` | string | Sender identifier |
| `content` | string | Message text content |
| `timestamp` | datetime | When the message was sent/received |
| `direction` | enum | `sent`, `received` |

## Chat

A conversation with a contact, group, or channel.

| Field | Type | Description |
|-------|------|-------------|
| `chatId` | string | Unique chat identifier |
| `name` | string | Chat display name |
| `type` | enum | `private`, `group`, `channel` |
| `unreadCount` | number | Unread message count |

## WebhookConfiguration

Defines how events are forwarded to n8n.

| Field | Type | Description |
|-------|------|-------------|
| `webhookUrl` | string | n8n-generated webhook URL |
| `events` | string[] | Enabled event types |
| `instance` | string | Associated instance name |
| `secret` | string | Webhook secret for HMAC validation |

## Credentials

| Field | Type | Storage | Description |
|-------|------|---------|-------------|
| `baseUrl` | string | Encrypted | RelayStack API server URL |
| `apiKey` | string | Encrypted (password) | API key for Bearer auth |
