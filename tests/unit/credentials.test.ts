import { RelayStackApi } from '../../credentials/RelayStackApi.credentials';

describe('RelayStackApi Credentials', () => {
  it('should have the correct name', () => {
    const credentials = new RelayStackApi();
    expect(credentials.name).toBe('relayStackApi');
  });

  it('should have the correct displayName', () => {
    const credentials = new RelayStackApi();
    expect(credentials.displayName).toBe('RelayStack API');
  });

  it('should have baseUrl property', () => {
    const credentials = new RelayStackApi();
    const baseUrlProp = credentials.properties.find((p) => p.name === 'baseUrl');
    expect(baseUrlProp).toBeDefined();
    expect(baseUrlProp!.type).toBe('string');
  });

  it('should have apiKey property with password typeOptions', () => {
    const credentials = new RelayStackApi();
    const apiKeyProp = credentials.properties.find((p) => p.name === 'apiKey');
    expect(apiKeyProp).toBeDefined();
    expect(apiKeyProp!.type).toBe('string');
    expect(apiKeyProp!.typeOptions).toEqual({ password: true });
  });

  it('should add Bearer token in authenticate method', async () => {
    const credentials = new RelayStackApi();
    const result = await credentials.authenticate(
      { apiKey: 'test-key-123' },
      { url: 'https://example.com/test', headers: { 'Content-Type': 'application/json' } },
    );
    expect(result.headers).toEqual({
      'Content-Type': 'application/json',
      Authorization: 'Bearer test-key-123',
    });
  });
});
