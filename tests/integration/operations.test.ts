import type { IExecuteFunctions } from 'n8n-workflow';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

const mock = new MockAdapter(axios);

const mockExecuteFunctions = {
  getCredentials: jest.fn().mockResolvedValue({
    baseUrl: 'https://relaystack.example.com',
    apiKey: 'test-api-key',
  }),
  getNode: jest.fn().mockReturnValue({ name: 'TestNode', type: 'test' }),
  getNodeParameter: jest.fn(),
  continueOnFail: jest.fn().mockReturnValue(false),
  getInputData: jest.fn().mockReturnValue([{ json: {} }]),
} as unknown as IExecuteFunctions;

beforeEach(() => {
  mock.reset();
  jest.clearAllMocks();
});

describe('Instance Operations', () => {
  it('should create an instance', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    const responseData = { id: 'uuid-1', name: 'my-instance', status: 'pending' };
    mock.onPost('https://relaystack.example.com/instances').reply(201, responseData);

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'POST',
      endpoint: '/instances',
      body: { name: 'my-instance' },
    });

    expect(result).toEqual(responseData);
  });

  it('should list instances', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    const responseData = { instances: [{ id: 'uuid-1', name: 'my-instance', status: 'pending' }] };
    mock.onGet('https://relaystack.example.com/instances').reply(200, responseData);

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'GET',
      endpoint: '/instances',
    });

    expect(Array.isArray(result.instances)).toBe(true);
  });

  it('should get a single instance', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    const responseData = { id: 'uuid-1', name: 'my-instance', status: 'connected' };
    mock.onGet('https://relaystack.example.com/instances/uuid-1').reply(200, responseData);

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'GET',
      endpoint: '/instances/uuid-1',
    });

    expect((result as { id: string }).id).toBe('uuid-1');
  });

  it('should delete an instance', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    mock.onDelete('https://relaystack.example.com/instances/uuid-1').reply(204);

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'DELETE',
      endpoint: '/instances/uuid-1',
    });

    expect(result).toEqual({});
  });

  it('should connect an instance', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    const responseData = { status: 'connected' };
    mock.onPost('https://relaystack.example.com/instances/uuid-1/auth/connect').reply(200, responseData);

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'POST',
      endpoint: '/instances/uuid-1/auth/connect',
    });

    expect((result as { status: string }).status).toBe('connected');
  });

  it('should disconnect an instance', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    const responseData = { status: 'disconnected' };
    mock.onPost('https://relaystack.example.com/instances/uuid-1/auth/disconnect').reply(200, responseData);

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'POST',
      endpoint: '/instances/uuid-1/auth/disconnect',
    });

    expect(result).toEqual(responseData);
  });

  it('should get connection status', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    const responseData = { id: 'uuid-1', name: 'my-instance', status: 'connected' };
    mock.onGet('https://relaystack.example.com/instances/uuid-1/status').reply(200, responseData);

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'GET',
      endpoint: '/instances/uuid-1/status',
    });

    expect(result).toEqual(responseData);
  });

  it('should send a login code', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    const responseData = { status: 'code_sent' };
    mock.onPost('https://relaystack.example.com/instances/uuid-1/auth/send-code').reply(200, responseData);

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'POST',
      endpoint: '/instances/uuid-1/auth/send-code',
      body: { phone_number: '+1234567890' },
    });

    expect(result).toEqual(responseData);
  });

  it('should verify a login code', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    const responseData = { status: 'authenticated' };
    mock.onPost('https://relaystack.example.com/instances/uuid-1/auth/verify-code').reply(200, responseData);

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'POST',
      endpoint: '/instances/uuid-1/auth/verify-code',
      body: { code: '12345' },
    });

    expect(result).toEqual(responseData);
  });

  it('should verify 2FA password', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    const responseData = { status: 'authenticated' };
    mock.onPost('https://relaystack.example.com/instances/uuid-1/auth/2fa').reply(200, responseData);

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'POST',
      endpoint: '/instances/uuid-1/auth/2fa',
      body: { password: 'secret' },
    });

    expect(result).toEqual(responseData);
  });

  it('should handle API errors gracefully', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    mock.onGet('https://relaystack.example.com/instances/nonexistent').reply(404);

    await expect(
      relayStackApiRequest.call(mockExecuteFunctions, {
        method: 'GET',
        endpoint: '/instances/nonexistent',
      }),
    ).rejects.toThrow('Resource not found');
  });
});

describe('Message Operations', () => {
  it('should send a text message', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    const responseData = { message_id: 123, chat_id: 456, status: 'sent' };
    const requestBody = { chat_id: 456, text: 'Hello world' };
    mock.onPost('https://relaystack.example.com/instances/uuid-1/send-message', requestBody).reply(200, responseData);

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'POST',
      endpoint: '/instances/uuid-1/send-message',
      body: requestBody,
    });

    expect((result as { message_id: number }).message_id).toBe(123);
  });
});

describe('Chat Operations', () => {
  it('should list chats', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    const responseData = { chats: [{ chat_id: 123, title: 'Test Chat', type: 'private' }] };
    mock.onGet('https://relaystack.example.com/instances/uuid-1/chats').reply(200, responseData);

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'GET',
      endpoint: '/instances/uuid-1/chats',
    });

    expect(Array.isArray(result.chats)).toBe(true);
  });

  it('should get chat messages with pagination', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    const responseData = {
      messages: [
        { message_id: 1, chat_id: 123, sender_id: 456, text: 'Hello', date: '2026-01-01T00:00:00Z' },
      ],
    };
    mock.onGet('https://relaystack.example.com/instances/uuid-1/chats/123/messages').reply((config) => {
      expect(config.params).toEqual({ limit: 50 });
      return [200, responseData];
    });

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'GET',
      endpoint: '/instances/uuid-1/chats/123/messages',
      query: { limit: 50 },
    });

    expect(Array.isArray(result.messages)).toBe(true);
  });

  it('should get chat messages with offset_id', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    const responseData = { messages: [] };
    mock.onGet('https://relaystack.example.com/instances/uuid-1/chats/123/messages').reply((config) => {
      expect(config.params).toEqual({ limit: 20, offset_id: 100 });
      return [200, responseData];
    });

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'GET',
      endpoint: '/instances/uuid-1/chats/123/messages',
      query: { limit: 20, offset_id: 100 },
    });

    expect(result).toEqual(responseData);
  });
});

describe('Event Operations', () => {
  it('should set a webhook', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    const requestBody = { url: 'https://n8n.example.com/webhook/relaystack' };
    const responseData = { id: 'wh-uuid', url: 'https://n8n.example.com/webhook/relaystack', is_active: true };
    mock.onPost('https://relaystack.example.com/instances/uuid-1/webhook', requestBody).reply(201, responseData);

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'POST',
      endpoint: '/instances/uuid-1/webhook',
      body: requestBody,
    });

    expect((result as { url: string }).url).toBe('https://n8n.example.com/webhook/relaystack');
  });

  it('should get webhook configuration', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    const responseData = { id: 'wh-uuid', url: 'https://n8n.example.com/webhook', is_active: true };
    mock.onGet('https://relaystack.example.com/instances/uuid-1/webhook').reply(200, responseData);

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'GET',
      endpoint: '/instances/uuid-1/webhook',
    });

    expect(result).toBeDefined();
  });

  it('should delete a webhook', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    mock.onDelete('https://relaystack.example.com/instances/uuid-1/webhook').reply(204);

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'DELETE',
      endpoint: '/instances/uuid-1/webhook',
    });

    expect(result).toEqual({});
  });

  it('should test a webhook', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    const responseData = { status: 'sent', status_code: 200 };
    mock.onPost('https://relaystack.example.com/instances/uuid-1/webhook/test').reply(200, responseData);

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'POST',
      endpoint: '/instances/uuid-1/webhook/test',
    });

    expect(result).toEqual(responseData);
  });
});
