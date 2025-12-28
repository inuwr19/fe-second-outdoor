import { useAuthStore } from '@/stores/authStore';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api';
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://127.0.0.1:8000';

async function safeReadJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function authHeaders() {
  const token = useAuthStore.getState().token;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'GET',
    headers: authHeaders(),
  });

  const data = await safeReadJson(res);

  if (!res.ok) {
    const msg = (data as any)?.message || `Request failed: ${res.status}`;
    throw new Error(msg);
  }

  return data as T;
}

export async function apiPost<T>(path: string, body?: any): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = await safeReadJson(res);

  if (!res.ok) {
    const msg = (data as any)?.message || `Request failed: ${res.status}`;
    throw new Error(msg);
  }

  return data as T;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  const data = await safeReadJson(res);

  if (!res.ok) {
    const msg = (data as any)?.message || `Request failed: ${res.status}`;
    throw new Error(msg);
  }

  return data as T;
}

// path dari DB biasanya "products/xxx.jpeg"
export function storageUrl(path?: string | null) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/storage/')) return `${BACKEND_URL}${path}`;
  if (path.startsWith('storage/')) return `${BACKEND_URL}/${path}`;
  return `${BACKEND_URL}/storage/${path}`;
}
