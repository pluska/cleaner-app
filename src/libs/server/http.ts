export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function readBody(request: Request, maxBytes = 32_768): Promise<string> {
  if (Number(request.headers.get('content-length')) > maxBytes) throw new HttpError(413, 'Request too large');
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, 'Request body required');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { await reader.cancel(); throw new HttpError(413, 'Request too large'); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    return new TextDecoder().decode(bytes);
  } finally { reader.releaseLock(); }
}

export async function readJson(request: Request, maxBytes = 32_768): Promise<Record<string, unknown>> {
  const body = await readBody(request,maxBytes);
  try {
    const result: unknown = JSON.parse(body);
    if (!result || typeof result !== 'object' || Array.isArray(result)) throw new Error();
    return result as Record<string, unknown>;
  } catch { throw new HttpError(400, 'Invalid JSON body'); }
}

export function textField(value: unknown, name: string, max = 2000): string {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new HttpError(400, `Invalid ${name}`);
  return value.trim();
}

export function errorResponse(error: unknown): Response {
  if (error instanceof HttpError) return Response.json({ error: error.message }, {
    status: error.status, headers: error.status === 429 ? { 'Retry-After': '60' } : undefined,
  });
  // Never log request bodies, credentials, provider output, or SQL bound values.
  console.error(JSON.stringify({ event: 'request_failed', kind: error instanceof Error ? error.name : 'unknown' }));
  return Response.json({ error: 'Internal server error' }, { status: 500 });
}
