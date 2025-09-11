// src/api/forum.js
import * as client from './client';

const BASE =
  (client.api?.BASE_URL ||
   client.default?.BASE_URL ||
   (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
   'http://localhost:8000').replace(/\/$/, '');

const abs = (url)=> url.startsWith('http') ? url : `${BASE}${url.startsWith('/') ? '' : '/'}${url}`;

// -- токены из localStorage
const ACCESS_KEY = 'amx_access';
const REFRESH_KEY = 'amx_refresh';
const getAccess  = () => { try { return localStorage.getItem(ACCESS_KEY) || ''; } catch { return ''; } };
const getRefresh = () => { try { return localStorage.getItem(REFRESH_KEY) || ''; } catch { return ''; } };
const setAccess  = (t) => { try { if (t) localStorage.setItem(ACCESS_KEY, t); } catch{} };
const clearTokens = () => { try { localStorage.removeItem(ACCESS_KEY); localStorage.removeItem(REFRESH_KEY); } catch{} };

// -- рефреш access по refresh
async function refreshAccess(){
  const refresh = getRefresh();
  if (!refresh) throw new Error('no-refresh');
  const r = await fetch(`${BASE}/api/auth/refresh/`, {
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify({ refresh }),
  });
  if (!r.ok) throw new Error('refresh-failed');
  const data = await r.json();
  setAccess(data.access);
  return data.access;
}

// универсальный запрос с авторизацией, рефрешем и анонимным фолбэком для GET
async function request(method, url, body){
  const m = method.toUpperCase();
  const make = async (auth = true) => {
    const headers = { };
    if (m !== 'GET' && m !== 'HEAD') headers['Content-Type'] = 'application/json';
    const token = auth ? getAccess() : '';
    if (auth && token) headers.Authorization = `Bearer ${token}`;
    return fetch(abs(url), {
      method: m,
      headers,
      credentials: 'include',
      body: (m === 'GET' || m === 'HEAD') ? undefined : JSON.stringify(body || {}),
    });
  };

  // 1) пробуем с токеном (если есть)
  let res = await make(true);

  // 2) если 401 — попробуем рефрешнуться
  if (res.status === 401 && getRefresh()) {
    try {
      await refreshAccess();
      res = await make(true); // повтор с новым access
    } catch {
      clearTokens(); // refresh не сработал — чистим токены
    }
  }

  // 3) если всё ещё 401 и это GET — пробуем анонимно
  if (res.status === 401 && m === 'GET') {
    res = await make(false);
  }

  if (!res.ok) {
    // при явной «token_not_valid» лучше очистить, чтобы не залипало
    try {
      const err = await res.clone().json();
      if (err?.code === 'token_not_valid') clearTokens();
    } catch {}
    throw new Error(`http error ${res.status}`);
  }
  return res.json();
}

// публичные функции
export async function listThreads({ page=1, page_size=10, search='', category='' } = {}){
  const u = new URL(abs('/api/forum/threads/'));
  u.searchParams.set('page', page);
  u.searchParams.set('page_size', page_size);
  if (search) u.searchParams.set('search', search);
  if (category && category !== 'Все') u.searchParams.set('category', category);
  return request('GET', u.toString());
}

export async function getRecentThreads(){
  return request('GET', '/api/forum/threads/recent/');
}

export async function getThread(slug){
  return request('GET', `/api/forum/threads/${slug}/`);
}

export async function createThread({ title, category, content }){
  return request('POST', '/api/forum/threads/', { title, category, content });
}

export async function createPost({ threadSlug, content, reply_to=null }){
  return request('POST', '/api/forum/posts/', { thread: threadSlug, content, reply_to });
}
