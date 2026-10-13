import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const environmentKeys = ['GEMINI_API_KEY', 'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'] as const;
const originalEnvironment = Object.fromEntries(environmentKeys.map((key) => [key, process.env[key]]));

function createRequest(body: string, ip = '198.51.100.10') {
  return new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': ip,
    },
    body,
  });
}

function validBody() {
  return JSON.stringify({ messages: [{ role: 'user', content: 'What does Ayoub do?' }] });
}

async function loadPost() {
  vi.resetModules();
  const route = await import('../route');
  return route.POST;
}

beforeEach(() => {
  for (const key of environmentKeys) delete process.env[key];
});

afterEach(() => {
  vi.unstubAllGlobals();
});

afterAll(() => {
  for (const [key, value] of Object.entries(originalEnvironment)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe('POST /api/chat', () => {
  it('rejects a body larger than 8000 characters', async () => {
    const POST = await loadPost();
    const response = await POST(createRequest('x'.repeat(8001)));

    expect(response.status).toBe(413);
    expect(await response.json()).toMatchObject({ reply: 'Message too long.' });
  });

  it('rejects malformed JSON', async () => {
    const POST = await loadPost();
    const response = await POST(createRequest('{'));

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ reply: 'Invalid request.' });
  });

  it('rejects invalid message data', async () => {
    const POST = await loadPost();
    const response = await POST(createRequest(JSON.stringify({ messages: [{ role: 'system', content: 'hello' }] })));

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ reply: 'Invalid request.' });
  });

  it('returns the fallback when the Gemini API key is missing', async () => {
    const POST = await loadPost();
    const response = await POST(createRequest(validBody()));

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ fallback: true });
  });

  it('returns Gemini text for a valid request', async () => {
    process.env.GEMINI_API_KEY = 'test-api-key';
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'Ayoub is a software engineer.' }] } }] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const POST = await loadPost();

    const response = await POST(createRequest(validBody(), '198.51.100.11'));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ reply: 'Ayoub is a software engineer.' });
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/models/'),
      expect.objectContaining({ headers: expect.objectContaining({ 'x-goog-api-key': 'test-api-key' }) }),
    );
  });

  it('returns the fallback when Gemini responds with an error', async () => {
    process.env.GEMINI_API_KEY = 'test-api-key';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Unavailable', { status: 503 })));
    const POST = await loadPost();

    const response = await POST(createRequest(validBody(), '198.51.100.12'));

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ fallback: true });
  });

  it('returns 429 after six requests from the same visitor in a minute', async () => {
    const POST = await loadPost();
    let response: Response | undefined;

    for (let requestNumber = 0; requestNumber < 7; requestNumber += 1) {
      response = await POST(createRequest(validBody(), '198.51.100.13'));
    }

    expect(response?.status).toBe(429);
  });
});