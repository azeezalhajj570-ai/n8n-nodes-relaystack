import type { ICredentialType, INodeProperties, IHttpRequestOptions, ICredentialDataDecryptedObject } from 'n8n-workflow';

export class RelayStackApi implements ICredentialType {
  name = 'relayStackApi';

  displayName = 'RelayStack API';

  documentationUrl = '';

  properties: INodeProperties[] = [
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: '',
      placeholder: 'https://relaystack.example.com',
      description: 'The URL of your self-hosted RelayStack API server',
    },
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'API key for Bearer token authentication',
    },
  ];

  async authenticate(
    credentials: ICredentialDataDecryptedObject,
    requestOptions: IHttpRequestOptions,
  ): Promise<IHttpRequestOptions> {
    return {
      ...requestOptions,
      headers: {
        ...requestOptions.headers,
        Authorization: `Bearer ${credentials.apiKey as string}`,
      },
    };
  }
}
