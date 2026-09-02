let activeApiUrl: string | null = null;

export const getApiBaseUrl = (): string => {
  if (activeApiUrl) return activeApiUrl;
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

export const getAuthToken = (): string | null => {
  return localStorage.getItem('smartattend_jwt_token');
};

export const setAuthToken = (token: string) => {
  localStorage.setItem('smartattend_jwt_token', token);
};

export const clearAuthToken = () => {
  localStorage.removeItem('smartattend_jwt_token');
};

export const checkServerHealth = async (customTimeoutMs: number = 8000): Promise<boolean> => {
  const primaryUrl = getApiBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), primaryUrl.includes('localhost') ? 2500 : customTimeoutMs);
    const response = await fetch(`${primaryUrl}/health`, { method: 'GET', signal: controller.signal });
    clearTimeout(timeoutId);
    const data = await response.json();
    if (data.status === 'ok') {
      activeApiUrl = primaryUrl;
      return true;
    }
  } catch {
    // Primary failed or timed out
  }

  // Fallback check against the live Render cloud API if primary was local
  const cloudUrl = 'https://smartattend-api-vnoz.onrender.com/api';
  if (primaryUrl !== cloudUrl) {
    try {
      const controller = new AbortController();
      // Give cloud backend up to customTimeoutMs to wake from sleep
      const timeoutId = setTimeout(() => controller.abort(), customTimeoutMs);
      const response = await fetch(`${cloudUrl}/health`, { method: 'GET', signal: controller.signal });
      clearTimeout(timeoutId);
      const data = await response.json();
      if (data.status === 'ok') {
        activeApiUrl = cloudUrl;
        return true;
      }
    } catch {
      // Cloud also unreachable
    }
  }

  return false;
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

  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'API request failed');
  }

  return data;
};

