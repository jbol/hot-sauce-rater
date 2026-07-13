const API_BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',  // Send cookies on every request
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data.error || `Request failed with status ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  auth: {
    login: (email, password) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

    register: (email, password, name) =>
      request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) }),

    logout: () => request('/auth/logout', { method: 'POST' }),

    me: () => request('/auth/me'),
  },

  entries: {
    list: () => request('/entries'),

    create: (entry) =>
      request('/entries', { method: 'POST', body: JSON.stringify(entry) }),

    update: (id, entry) =>
      request(`/entries/${id}`, { method: 'PUT', body: JSON.stringify(entry) }),

    remove: (id) => request(`/entries/${id}`, { method: 'DELETE' }),

    toggleFavorite: (id) => request(`/entries/${id}/favorite`, { method: 'POST' }),
  },
};
