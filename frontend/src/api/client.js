const API_URL = import.meta.env.VITE_API_URL;

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const json = await res.json();
  if (!res.ok) {
    const err = new Error(json.message || 'Terjadi kesalahan');
    err.data = json.data;
    throw err;
  }
  return json;
}

export const authApi = {
  register: (email, password) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  verifyEmail: (email, code) =>
    request('/auth/verify-email', { method: 'POST', body: JSON.stringify({ email, code }) }),
  resendOtp: (email) =>
    request('/auth/resend-otp', { method: 'POST', body: JSON.stringify({ email }) }),
  forgotPassword: (email) =>
    request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (email, code, newPassword) =>
    request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, code, newPassword }) }),
  me: () => request('/auth/me'),
};

export const quotaApi = {
  get: () => request('/quota'),
};

export const generateApi = {
  create: (payload) => request('/generate', { method: 'POST', body: JSON.stringify(payload) }),
};

export const historyApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/history${qs ? `?${qs}` : ''}`);
  },
};

export const dashboardApi = {
  get: () => request('/dashboard'),
};

export const subscriptionApi = {
  plans: () => request('/subscription/plans'),
  checkout: (planId) => request('/subscription/checkout', { method: 'POST', body: JSON.stringify({ planId }) }),
};