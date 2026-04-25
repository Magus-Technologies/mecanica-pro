/* ── api.js — cliente HTTP centralizado ─────────────────────────────────── */
const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
  ? '/api'
  : '/mecanica/api';

const Api = {
  getToken: () => localStorage.getItem('mp_token'),

  headers() {
    const h = { 'Content-Type': 'application/json' };
    const t = this.getToken();
    if (t) h['Authorization'] = `Bearer ${t}`;
    return h;
  },

  async request(method, path, body) {
    try {
      const opts = { method, headers: this.headers() };
      if (body !== undefined) opts.body = JSON.stringify(body);
      const res = await fetch(API_BASE + path, opts);
      const data = await res.json();
      if (res.status === 401) {
        localStorage.removeItem('mp_token');
        localStorage.removeItem('mp_user');
        window.location.reload();
        return;
      }
      return data;
    } catch (err) {
      console.error('API error:', err);
      return { success: false, message: 'Error de conexión con el servidor' };
    }
  },

  get:    (path)        => Api.request('GET',    path),
  post:   (path, body)  => Api.request('POST',   path, body),
  put:    (path, body)  => Api.request('PUT',    path, body),
  patch:  (path, body)  => Api.request('PATCH',  path, body),
  delete: (path)        => Api.request('DELETE', path),

  async upload(path, formData) {
    try {
      const res = await fetch(API_BASE + path, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.getToken()}` },
        body: formData,
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: 'Error al subir archivo' };
    }
  },
};
