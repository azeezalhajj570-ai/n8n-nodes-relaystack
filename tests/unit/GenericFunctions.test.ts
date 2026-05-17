import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import axios, { AxiosError } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import type { AxiosRequestConfig } from 'axios';

const mock = new MockAdapter(axios);

const mockExecuteFunctions = {
  getCredentials: jest.fn().mockResolvedValue({
    baseUrl: 'https://relaystack.example.com',
    apiKey: 'test-api-key',
  }),
  getNode: jest.fn().mockReturnValue({ name: 'TestNode', type: 'test' }),
  continueOnFail: jest.fn().mockReturnValue(false),
} as unknown as IExecuteFunctions;

beforeEach(() => {
  mock.reset();
  jest.clearAllMocks();
});

describe('relayStackApiRequest', () => {
  it('should make a GET request and return data', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    const responseData = { instances: [{ name: 'test-instance', status: 'created' }] };
    mock.onGet('https://relaystack.example.com/instance/list').reply(200, responseData);

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'GET',
      endpoint: '/instance/list',
    });

    expect(result).toEqual(responseData);
  });

  it('should make a POST request with body', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    const requestBody = { instanceName: 'my-instance', integration: 'telegram' };
    const responseData = { instance: { instanceName: 'my-instance', status: 'created' } };
    mock.onPost('https://relaystack.example.com/instance/create', requestBody).reply(200, responseData);

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'POST',
      endpoint: '/instance/create',
      body: requestBody,
    });

    expect(result).toEqual(responseData);
  });

  it('should send query parameters', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    const responseData = { messages: [] };
    mock.onGet('https://relaystack.example.com/chat/messages').reply((config: AxiosRequestConfig) => {
      expect(config.params).toEqual({ limit: 10, offset: 0 });
      return [200, responseData];
    });

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'GET',
      endpoint: '/chat/messages',
      query: { limit: 10, offset: 0 },
    });

    expect(result).toEqual(responseData);
  });

  it('should make a DELETE request', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    mock.onDelete('https://relaystack.example.com/instance/my-instance').reply(200, { success: true });

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'DELETE',
      endpoint: '/instance/my-instance',
    });

    expect(result).toEqual({ success: true });
  });

  it('should strip trailing slash from baseUrl', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    const localMock = {
      ...mockExecuteFunctions,
      getCredentials: jest.fn().mockResolvedValue({
        baseUrl: 'https://relaystack.example.com/',
        apiKey: 'test-api-key',
      }),
    } as unknown as IExecuteFunctions;

    mock.onGet('https://relaystack.example.com/instance/list').reply(200, { ok: true });
    const result = await relayStackApiRequest.call(localMock, {
      method: 'GET',
      endpoint: '/instance/list',
    });
    expect(result).toEqual({ ok: true });
  });
});

describe('normalizeApiError', () => {
  it('should pass through NodeOperationError unchanged', async () => {
    const { normalizeApiError } = await import('../../nodes/RelayStack/GenericFunctions');
    const original = new NodeOperationError(mockExecuteFunctions.getNode(), 'test error');
    const result = normalizeApiError.call(mockExecuteFunctions, original);
    expect(result).toBe(original);
  });

  it('should return a user-friendly message for 401', async () => {
    const { normalizeApiError } = await import('../../nodes/RelayStack/GenericFunctions');
    const axiosError = new AxiosError(
      'Request failed with status code 401',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      { status: 401, data: { message: 'Unauthorized' }, headers: {}, statusText: 'Unauthorized', config: {} as any } as any,
    );
    const result = normalizeApiError.call(mockExecuteFunctions, axiosError);
    expect(result.message).toContain('Invalid API key');
  });

  it('should return a user-friendly message for 404', async () => {
    const { normalizeApiError } = await import('../../nodes/RelayStack/GenericFunctions');
    const axiosError = new AxiosError(
      'Request failed with status code 404',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      { status: 404, data: { message: 'Not found' }, headers: {}, statusText: 'Not Found', config: {} as any } as any,
    );
    const result = normalizeApiError.call(mockExecuteFunctions, axiosError);
    expect(result.message).toContain('Resource not found');
  });

  it('should return a user-friendly message for connection refused', async () => {
    const { normalizeApiError } = await import('../../nodes/RelayStack/GenericFunctions');
    const axiosError = new AxiosError(
      'connect ECONNREFUSED',
      'ECONNREFUSED',
    );
    const result = normalizeApiError.call(mockExecuteFunctions, axiosError);
    expect(result.message).toContain('Could not connect');
  });

  it('should handle unknown errors gracefully', async () => {
    const { normalizeApiError } = await import('../../nodes/RelayStack/GenericFunctions');
    const result = normalizeApiError.call(mockExecuteFunctions, 'some string error');
    expect(result.message).toContain('unexpected');
  });
});
