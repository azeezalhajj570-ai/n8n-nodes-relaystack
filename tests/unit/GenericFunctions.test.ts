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
    const responseData = { instances: [{ id: 'uuid-1', name: 'test-instance', status: 'created' }] };
    mock.onGet('https://relaystack.example.com/instances').reply(200, responseData);

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'GET',
      endpoint: '/instances',
    });

    expect(result).toEqual(responseData);
  });

  it('should make a POST request with body', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    const requestBody = { name: 'my-instance' };
    const responseData = { id: 'uuid-1', name: 'my-instance', status: 'pending' };
    mock.onPost('https://relaystack.example.com/instances', requestBody).reply(201, responseData);

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'POST',
      endpoint: '/instances',
      body: requestBody,
    });

    expect(result).toEqual(responseData);
  });

  it('should send query parameters', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    const responseData = { messages: [] };
    mock.onGet('https://relaystack.example.com/instances/uuid-1/chats/123/messages').reply((config: AxiosRequestConfig) => {
      expect(config.params).toEqual({ limit: 50 });
      return [200, responseData];
    });

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'GET',
      endpoint: '/instances/uuid-1/chats/123/messages',
      query: { limit: 50 },
    });

    expect(result).toEqual(responseData);
  });

  it('should make a DELETE request', async () => {
    const { relayStackApiRequest } = await import('../../nodes/RelayStack/GenericFunctions');
    mock.onDelete('https://relaystack.example.com/instances/uuid-1').reply(204);

    const result = await relayStackApiRequest.call(mockExecuteFunctions, {
      method: 'DELETE',
      endpoint: '/instances/uuid-1',
    });

    expect(result).toEqual({});
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

    mock.onGet('https://relaystack.example.com/instances').reply(200, { ok: true });
    const result = await relayStackApiRequest.call(localMock, {
      method: 'GET',
      endpoint: '/instances',
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
      { status: 401, data: { detail: 'Unauthorized' }, headers: {}, statusText: 'Unauthorized', config: {} as any } as any,
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
      { status: 404, data: { detail: 'Not found' }, headers: {}, statusText: 'Not Found', config: {} as any } as any,
    );
    const result = normalizeApiError.call(mockExecuteFunctions, axiosError);
    expect(result.message).toContain('Resource not found');
  });

  it('should return a user-friendly message for 422', async () => {
    const { normalizeApiError } = await import('../../nodes/RelayStack/GenericFunctions');
    const axiosError = new AxiosError(
      'Request failed with status code 422',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: 422,
        data: { detail: [{ loc: ['body', 'phone_number'], msg: 'field required', type: 'value_error' }] },
        headers: {},
        statusText: 'Unprocessable Entity',
        config: {} as any,
      } as any,
    );
    const result = normalizeApiError.call(mockExecuteFunctions, axiosError);
    expect(result.message).toContain('field required');
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
