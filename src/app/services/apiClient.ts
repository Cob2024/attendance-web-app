const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
  }
  return 'https://smartattend-api-vnoz.onrender.com/api';
};

const API_BASE_URL = getApiBaseUrl();

export const getAuthToken = (): string | null => {
  return localStorage.getItem('smartattend_jwt_token');
};

export const setAuthToken = (token: string) => {
  localStorage.setItem('smartattend_jwt_token', token);
};

export const clearAuthToken = () => {
  localStorage.removeItem('smartattend_jwt_token');
};

export const checkServerHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
    const data = await response.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'API request failed');
  }

  return data;
};
