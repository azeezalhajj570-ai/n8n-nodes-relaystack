import * as crypto from 'crypto';

describe('HMAC Signature Validation', () => {
  const secret = 'test-webhook-secret';

  function generateSignature(payload: string, secretKey: string): string {
    return crypto.createHmac('sha256', secretKey).update(payload).digest('hex');
  }

  function validateSignature(
    payload: string,
    signature: string,
    secretKey: string,
  ): boolean {
    if (!signature || !secretKey) return false;
    const expected = generateSignature(payload, secretKey);
    try {
      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch {
      return false;
    }
  }

  it('should validate a correct HMAC-SHA256 signature', () => {
    const payload = JSON.stringify({ eventType: 'message_received', data: { text: 'hello' } });
    const signature = generateSignature(payload, secret);
    expect(validateSignature(payload, signature, secret)).toBe(true);
  });

  it('should reject an incorrect HMAC-SHA256 signature', () => {
    const payload = JSON.stringify({ eventType: 'message_received' });
    const signature = generateSignature(payload, 'wrong-secret');
    expect(validateSignature(payload, signature, secret)).toBe(false);
  });

  it('should return false for empty signature', () => {
    const payload = JSON.stringify({ eventType: 'message_received' });
    expect(validateSignature(payload, '', secret)).toBe(false);
  });

  it('should return false for empty secret', () => {
    const payload = JSON.stringify({ eventType: 'message_received' });
    const signature = generateSignature(payload, secret);
    expect(validateSignature(payload, signature, '')).toBe(false);
  });

  it('should handle different payloads correctly', () => {
    const payload1 = JSON.stringify({ a: 1 });
    const payload2 = JSON.stringify({ a: 2 });
    const sig1 = generateSignature(payload1, secret);
    expect(validateSignature(payload1, sig1, secret)).toBe(true);
    expect(validateSignature(payload2, sig1, secret)).toBe(false);
  });
});
