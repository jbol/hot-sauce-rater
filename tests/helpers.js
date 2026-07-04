// Shared test scaffolding. Not named *.test.js on purpose — the runner skips it.
//
// Each test FILE runs in its own process (node --test default), so each file
// gets a fresh server instance and its own throwaway SQLite database.

import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Points DB_PATH at a temp dir, then imports the real server (db.js reads the
// env var at import time). Listens on an ephemeral port.
export async function startTestServer() {
  process.env.DB_PATH ??= join(mkdtempSync(join(tmpdir(), 'hsp-test-')), 'test.db');
  const { server } = await import('../server/index.js');
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  return { server, base };
}

// Minimal fetch client with a one-slot cookie jar (mirrors browser behavior
// closely enough for the HttpOnly token cookie).
export function makeClient(base) {
  let cookie = '';
  return {
    async request(method, path, body) {
      const res = await fetch(base + path, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(cookie ? { Cookie: cookie } : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const setCookie = res.headers.get('set-cookie');
      if (setCookie) cookie = setCookie.split(';')[0];
      let json = null;
      try {
        json = await res.json();
      } catch {
        // non-JSON response (e.g. static files) — callers use .status
      }
      return { status: res.status, json, headers: res.headers };
    },
    get(path) { return this.request('GET', path); },
    post(path, body) { return this.request('POST', path, body); },
    put(path, body) { return this.request('PUT', path, body); },
    del(path) { return this.request('DELETE', path); },
    dropCookie() { cookie = ''; },
  };
}
