const protocol =
  window.location.protocol === 'http:' ||
  window.location.protocol === 'https:'
    ? window.location.protocol
    : 'http:';
const host = window.location.hostname || 'localhost';
const defaultHost = `${protocol}//${host}:8000`;
const base = import.meta.env.VITE_API_URL || defaultHost;
export const API_BASE = base.endsWith('/api') ? base : `${base}/api`;

export function apiFetch(path: string, options?: RequestInit) {
  return fetch(`${API_BASE}${path}`, options);
}
