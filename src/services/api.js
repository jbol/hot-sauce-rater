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
    const message =
      data.error ||
      data.errors?.[0]?.msg ||
      `Request failed with status ${res.status}`;
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

  sauces: {
    getUserData: () => request('/sauces/user-data'),

    rate: (sauceId, rating) =>
      request('/sauces/rate', { method: 'POST', body: JSON.stringify({ sauceId, rating }) }),

    toggleFavorite: (sauceId) =>
      request('/sauces/favorite', { method: 'POST', body: JSON.stringify({ sauceId }) }),
  },
};
