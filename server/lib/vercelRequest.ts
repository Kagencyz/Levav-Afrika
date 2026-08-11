type VercelIncomingRequest = {
  method?: string;
  body?: unknown;
  rawBody?: unknown;
};

/**
 * Vercel may parse a JSON request before invoking a Node function. Hono's
 * Node adapter expects either an unread stream or a Buffer in `rawBody`; when
 * the stream has already been consumed it otherwise waits forever for bytes
 * that will never arrive.
 */
export function restoreVercelRawBody(request: VercelIncomingRequest) {
  if (request.method === 'GET' || request.method === 'HEAD') return;
  if (request.rawBody instanceof Buffer || request.body === undefined) return;

  const body = request.body;
  request.rawBody = Buffer.isBuffer(body)
    ? body
    : Buffer.from(typeof body === 'string' ? body : JSON.stringify(body));
}
