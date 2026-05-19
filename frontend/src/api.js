const API_BASE = 'http://localhost:3502/api';

export const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...options,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Request failed with status ${res.status}`);
    }
    return res.json();
  },
  get: (url) => api.request(url),
  post: (url, data) =>
    api.request(url, { method: 'POST', body: JSON.stringify(data) }),
  put: (url, data) =>
    api.request(url, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (url) => api.request(url, { method: 'DELETE' }),
};
