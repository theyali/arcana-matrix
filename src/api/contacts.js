import * as client from './client';

const DEBUG =
  (typeof import.meta !== 'undefined' && import.meta.env?.DEV) ||
  process.env.NODE_ENV !== 'production';
const log = (...a)=>{ if (DEBUG) console.log('[api/contacts]', ...a); };

const api = client.default || client.api || client.instance || client.http || null;

// берём BASE_URL из твоего client.api, либо из env, либо дефолт
const BASE =
  (client.api?.BASE_URL ||
   client.default?.BASE_URL ||
   (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
   'http://localhost:8000').replace(/\/$/, '');

const abs = (url)=> url.startsWith('http') ? url : `${BASE}${url.startsWith('/') ? '' : '/'}${url}`;

async function request(method, url, { data, params, headers } = {}) {
  const m = method.toUpperCase();
  log('request →', m, url, { params, hasBody: !!data });

  try {
    // 1) функциональный клиент (если когда-то появится)
    if (typeof api === 'function') {
      log('using functional client');
      const res = await api(url, {
        method: m,
        body: data ? JSON.stringify(data) : undefined,
        headers: { 'Content-Type': 'application/json', ...(headers || {}) },
      });
      const out = await res.json().catch(()=>null);
      log('response ←', m, url, { status: res.status, ok: res.ok, out });
      if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`);
      return out;
    }

    // 2) axios-подобный (если будет)
    if (api && typeof api[method] === 'function') {
      log('using axios-like client');
      let res;
      if (method === 'get' || method === 'delete') {
        res = await api[method](url, { params, headers });
      } else {
        res = await api[method](url, data, { params, headers });
      }
      const out = res?.data ?? res;
      log('response ←', m, url, { status: res?.status, out });
      return out;
    }

    // 3) fallback: всегда бьём на BASE
    log('using fetch fallback →', abs(url));
    const res = await fetch(abs(url), {
      method: m,
      body: data ? JSON.stringify(data) : undefined,
      headers: { 'Content-Type': 'application/json', ...(headers || {}) },
      credentials: 'include',
    });
    const out = await res.json().catch(()=>null);
    log('response ←', m, url, { status: res.status, ok: res.ok, out });
    if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`);
    return out;
  } catch (err) {
    log('ERROR ✖', m, url, err);
    throw err;
  }
}

export function getSiteContacts() {
  log('getSiteContacts()');
  // если в DRF включён APPEND_SLASH, можно сделать '/api/site/contacts/'
  return request('get', '/api/site/contacts');
}
