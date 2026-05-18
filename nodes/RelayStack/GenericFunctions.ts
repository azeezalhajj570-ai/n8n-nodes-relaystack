import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import axios, { AxiosError, type AxiosRequestConfig } from 'axios';

export interface IRelayStackApiRequestOptions {
  method: 'GET' | 'POST' | 'DELETE';
  endpoint: string;
  body?: IDataObject;
  query?: IDataObject;
}

export async function relayStackApiRequest(
  this: IExecuteFunctions,
  options: IRelayStackApiRequestOptions,
): Promise<IDataObject> {
  const credentials = await this.getCredentials('relayStackApi') as {
    baseUrl: string;
    apiKey: string;
  };

  const baseUrl = credentials.baseUrl.replace(/\/$/, '');
  const url = `${baseUrl}${options.endpoint}`;

  const config: AxiosRequestConfig = {
    method: options.method,
    url,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${credentials.apiKey}`,
    },
    data: options.body,
    params: options.query,
  };

  try {
    const response = await axios(config);
    return (response.data || {}) as IDataObject;
  } catch (error) {
    throw normalizeApiError.call(this, error);
  }
}

export function normalizeApiError(this: IExecuteFunctions, error: unknown): NodeOperationError {
  if (error instanceof NodeOperationError) {
    return error;
  }

  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const serverMessage = error.response?.data?.detail || error.response?.data?.message || error.response?.data?.error?.message;

    let message = `Telegram API Gateway error: ${error.message}`;
    if (status === 401) {
      message = 'Invalid API key. Please check your credentials.';
    } else if (status === 404) {
      message = 'Resource not found. The requested instance or endpoint does not exist.';
    } else if (status === 422) {
      const detail = error.response?.data?.detail;
      if (Array.isArray(detail)) {
        message = `Validation error: ${detail.map((d: { msg: string }) => d.msg).join('; ')}`;
      } else if (typeof detail === 'string') {
        message = `Validation error: ${detail}`;
      } else {
        message = 'Validation error. Please check your input values.';
      }
    } else if (status === 429) {
      message = 'Rate limit exceeded. Please wait before making more requests.';
    } else if (serverMessage) {
      message = `Telegram API Gateway error: ${serverMessage}`;
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ECONNABORTED') {
      message = 'Could not connect to the API server. Please verify the Base URL.';
    } else if (error.code === 'ETIMEDOUT') {
      message = 'Connection to the API server timed out. Please check network connectivity.';
    }

    return new NodeOperationError(this.getNode(), message);
  }

  return new NodeOperationError(this.getNode(), 'An unexpected error occurred');
}
