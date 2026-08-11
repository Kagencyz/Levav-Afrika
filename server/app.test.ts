import { describe, expect, it } from 'vitest';
import { app } from './app.js';

describe('health routes', () => {
  it.each(['/health', '/api/health'])('serves %s', async (path) => {
    const response = await app.request(`http://localhost${path}`);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ status: 'ok' });
  });
});
