export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getAuthToken = () => localStorage.getItem('public_poll_token');

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('public_poll_token', token);
    return;
  }

  localStorage.removeItem('public_poll_token');
};

export const clearAuthToken = () => {
  localStorage.removeItem('public_poll_token');
};

export const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (options.auth || token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || 'Something went wrong.');
  }

  return payload;
};
