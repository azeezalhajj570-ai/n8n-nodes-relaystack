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
    const responseData = { instance: { instanceName: 'my-instance', status: 'created' } };
    mock.onPost('https://relaystack.example.com/instance/create').reply(200, responseData);

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'POST',
      endpoint: '/instance/create',
      body: { instanceName: 'my-instance', integration: 'telegram' },
    });

    expect(result).toEqual(responseData);
  });

  it('should list instances', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    const responseData = { instances: [{ instanceName: 'my-instance', status: 'created' }] };
    mock.onGet('https://relaystack.example.com/instance/list').reply(200, responseData);

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'GET',
      endpoint: '/instance/list',
    });

    expect(Array.isArray(result.instances)).toBe(true);
  });

  it('should get a single instance', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    const responseData = { instance: { instanceName: 'my-instance', status: 'connected' } };
    mock.onGet('https://relaystack.example.com/instance/my-instance').reply(200, responseData);

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'GET',
      endpoint: '/instance/my-instance',
    });

    expect((result.instance as { instanceName: string }).instanceName).toBe('my-instance');
  });

  it('should delete an instance', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    mock.onDelete('https://relaystack.example.com/instance/my-instance').reply(200, { success: true });

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'DELETE',
      endpoint: '/instance/my-instance',
    });

    expect(result).toEqual({ success: true });
  });

  it('should connect an instance', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    const responseData = { instance: { instanceName: 'my-instance', status: 'connected' } };
    mock.onPost('https://relaystack.example.com/instance/connect/my-instance').reply(200, responseData);

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'POST',
      endpoint: '/instance/connect/my-instance',
    });

    expect((result.instance as { status: string }).status).toBe('connected');
  });

  it('should disconnect an instance', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    mock.onPost('https://relaystack.example.com/instance/disconnect/my-instance').reply(200, { success: true });

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'POST',
      endpoint: '/instance/disconnect/my-instance',
    });

    expect(result).toEqual({ success: true });
  });

  it('should get connection status', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    const responseData = { status: 'connected' };
    mock.onGet('https://relaystack.example.com/instance/connectionState/my-instance').reply(200, responseData);

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'GET',
      endpoint: '/instance/connectionState/my-instance',
    });

    expect(result).toEqual({ status: 'connected' });
  });

  it('should handle API errors gracefully', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    mock.onGet('https://relaystack.example.com/instance/nonexistent').reply(404);

    await expect(
      relayStackApiRequest.call(mockExecuteFunctions, {
        method: 'GET',
        endpoint: '/instance/nonexistent',
      }),
    ).rejects.toThrow('Resource not found');
  });
});

describe('Message Operations', () => {
  it('should send a text message', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    const responseData = { message: { id: 'msg-123', status: 'sent' } };
    const requestBody = { number: '+1234567890', text: 'Hello world', options: { delay: 0 } };
    mock.onPost('https://relaystack.example.com/message/sendText/my-instance', requestBody).reply(200, responseData);

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'POST',
      endpoint: '/message/sendText/my-instance',
      body: requestBody,
    });

    expect((result.message as { id: string }).id).toBe('msg-123');
  });
});

describe('Chat Operations', () => {
  it('should list chats', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    const responseData = { chats: [{ chatId: 'chat-1', name: 'Test Chat', type: 'private' }] };
    mock.onGet('https://relaystack.example.com/chat/find/my-instance').reply(200, responseData);

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'GET',
      endpoint: '/chat/find/my-instance',
    });

    expect(Array.isArray(result.chats)).toBe(true);
  });

  it('should get chat messages with pagination', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    const responseData = {
      messages: [
        { messageId: 'msg-1', content: 'Hello', direction: 'received' },
      ],
    };
    mock.onGet('https://relaystack.example.com/chat/messages/my-instance').reply((config) => {
      expect(config.params).toEqual({ chatId: 'chat-1', limit: 10, offset: 0 });
      return [200, responseData];
    });

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'GET',
      endpoint: '/chat/messages/my-instance',
      query: { chatId: 'chat-1', limit: 10, offset: 0 },
    });

    expect(Array.isArray(result.messages)).toBe(true);
  });
});

describe('Event Operations', () => {
  it('should set a webhook', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    const requestBody = {
      webhookUrl: 'https://n8n.example.com/webhook/relaystack',
      events: ['message_received'],
      enable: true,
    };
    const responseData = { webhook: { url: 'https://n8n.example.com/webhook/relaystack', events: ['message_received'] } };
    mock.onPost('https://relaystack.example.com/webhook/set/my-instance', requestBody).reply(200, responseData);

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'POST',
      endpoint: '/webhook/set/my-instance',
      body: requestBody,
    });

    expect((result.webhook as { url: string }).url).toBe('https://n8n.example.com/webhook/relaystack');
  });

  it('should get webhook configuration', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    const responseData = { webhook: { url: 'https://n8n.example.com/webhook', events: ['message_received'] } };
    mock.onGet('https://relaystack.example.com/webhook/find/my-instance').reply(200, responseData);

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'GET',
      endpoint: '/webhook/find/my-instance',
    });

    expect(result.webhook).toBeDefined();
  });

  it('should delete a webhook', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    mock.onDelete('https://relaystack.example.com/webhook/delete/my-instance').reply(200, { success: true });

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'DELETE',
      endpoint: '/webhook/delete/my-instance',
    });

    expect(result).toEqual({ success: true });
  });
});
