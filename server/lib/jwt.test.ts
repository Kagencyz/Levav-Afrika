import { describe, it, expect } from 'vitest';
import { signToken, verifyToken } from './jwt';

const payload = {
  userId: '5d61b6a6-97a4-4f0e-8a3b-000000000001',
  email: 'test@example.com',
  accessLevel: 'standard',
};

describe('jwt', () => {
  it('round-trips a signed token', async () => {
    const token = await signToken(payload);
    const verified = await verifyToken(token);
    expect(verified).toMatchObject(payload);
  });

  it('rejects a tampered token', async () => {
    const token = await signToken(payload);
    const [h, p, s] = token.split('.');
    // Flip a character in the signature
    const tampered = `${h}.${p}.${s.slice(0, -2)}${s.endsWith('AA') ? 'BB' : 'AA'}`;
    expect(await verifyToken(tampered)).toBeNull();
  });

  it('rejects garbage input', async () => {
    expect(await verifyToken('not-a-token')).toBeNull();
    expect(await verifyToken('')).toBeNull();
  });
});
