import { describe, expect, it } from 'vitest';
import { restoreVercelRawBody } from './vercelRequest.js';

describe('restoreVercelRawBody', () => {
  it('buffers a JSON body already parsed by Vercel', () => {
    const request = { method: 'POST', body: { json: { email: 'person@example.com' } } };

    restoreVercelRawBody(request);

    expect(request).toHaveProperty('rawBody');
    expect((request as { rawBody: Buffer }).rawBody.toString()).toBe(
      '{"json":{"email":"person@example.com"}}'
    );
  });

  it('preserves a raw body supplied by Vercel', () => {
    const rawBody = Buffer.from('{"json":null}');
    const request = { method: 'POST', body: { json: null }, rawBody };

    restoreVercelRawBody(request);

    expect(request.rawBody).toBe(rawBody);
  });
});
