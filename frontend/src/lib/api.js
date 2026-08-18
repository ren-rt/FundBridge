// frontend/src/lib/api.js
//
// Small shared fetch helper. Nothing else in the frontend calls the backend
// yet (everything else is still on mock data), so this is the first real
// wiring -- keep it boring and centralized rather than repeating
// fetch/headers/error-handling in every component.
const API_BASE = 'http://localhost:3000';

async function request(path, { method = 'GET', token, body, isForm } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !isForm) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await res.json().catch(() => null) : await res.blob();

  if (!res.ok) {
    const message = (isJson && payload?.error) || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return payload;
}

export const api = {
  get: (path, token) => request(path, { token }),
  post: (path, token, body) => request(path, { method: 'POST', token, body }),
  postForm: (path, token, formData) => request(path, { method: 'POST', token, body: formData, isForm: true }),
  downloadBlob: (path, token) => request(path, { token }), // returns a Blob when response isn't JSON
};

export const SOCKET_URL = API_BASE;