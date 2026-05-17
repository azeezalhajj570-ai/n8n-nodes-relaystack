# RelayStack API Contracts

## Authentication

```
Authorization: Bearer <apiKey>
Content-Type: application/json
```

## Endpoints

### Instance

| Operation | Method | Path |
|-----------|--------|------|
| Create instance | POST | `/instance/create` |
| List instances | GET | `/instance/list` |
| Get instance | GET | `/instance/{name}` |
| Delete instance | DELETE | `/instance/{name}` |
| Connect instance | POST | `/instance/connect/{name}` |
| Disconnect instance | POST | `/instance/disconnect/{name}` |
| Get connection status | GET | `/instance/connectionState/{name}` |
| Send login code | POST | `/instance/sendCode/{name}` |
| Verify login code | POST | `/instance/verifyCode/{name}` |
| Verify 2FA password | POST | `/instance/verifyPassword/{name}` |

**Create instance request body**:

```json
{
  "instanceName": "string",
  "integration": "telegram"
}
```

**Send login code request body**:

```json
{
  "phoneNumber": "+1234567890"
}
```

**Verify login code request body**:

```json
{
  "code": "12345"
}
```

**Verify 2FA request body**:

```json
{
  "password": "secret"
}
```

**Instance response shape**:

```json
{
  "instance": {
    "instanceName": "string",
    "status": "created|connected|disconnected",
    "integration": "telegram"
  }
}
```

### Message (MVP)

| Operation | Method | Path |
|-----------|--------|------|
| Send text message | POST | `/message/sendText/{instance}` |

**Send text request body**:

```json
{
  "number": "chatId",
  "text": "message content",
  "options": {
    "delay": 0
  }
}
```

### Chat

| Operation | Method | Path |
|-----------|--------|------|
| List chats | GET | `/chat/find/{instance}` |
| Get chat messages | GET | `/chat/messages/{instance}` |

**Get messages query parameters**: `limit`, `offset`

### Event (Webhook)

| Operation | Method | Path |
|-----------|--------|------|
| Set webhook | POST | `/webhook/set/{instance}` |
| Get webhook | GET | `/webhook/find/{instance}` |
| Delete webhook | DELETE | `/webhook/delete/{instance}` |
| Test webhook | POST | `/webhook/test/{instance}` |

**Set webhook request body**:

```json
{
  "webhookUrl": "https://n8n-host/webhook/uuid",
  "events": ["message_received", "message_sent", "connection_state", "auth_request"],
  "enable": true
}
```

## Common Error Response

```json
{
  "error": true,
  "message": "Human-readable error description",
  "status": 400
}
```
