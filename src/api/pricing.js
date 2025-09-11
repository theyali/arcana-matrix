import * as client from './client';

const api = client.default || client.api || client.instance || client.http || null;
const BASE =
  (client.api?.BASE_URL ||
   client.default?.BASE_URL ||
   (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
   'http://localhost:8000').replace(/\/$/, '');
const abs = (url)=> url.startsWith('http') ? url : `${BASE}${url.startsWith('/') ? '' : '/'}${url}`;

async function request(method, url, { data, params, headers } = {}) {
  if (typeof api === 'function') {
    const res = await api(url, {
      method: method.toUpperCase(),
      body: data ? JSON.stringify(data) : undefined,
      headers: { 'Content-Type': 'application/json', ...(headers || {}) },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`);
    return res.json();
  }
  if (api && typeof api[method] === 'function') {
    const isGet = method === 'get' || method === 'delete';
    const res = isGet
      ? await api[method](url, { params, headers })
      : await api[method](url, data, { params, headers });
    return res?.data ?? res;
  }
  const res = await fetch(abs(url), {
    method: method.toUpperCase(),
    body: data ? JSON.stringify(data) : undefined,
    headers: { 'Content-Type': 'application/json', ...(headers || {}) },
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`);
  return res.json();
}

export const getPlans = ()=> request('get', '/api/pricing/plans/');
export const getPlan  = (slug)=> request('get', `/api/pricing/plans/${encodeURIComponent(slug)}/`);
