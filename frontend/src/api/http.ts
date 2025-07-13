const protocol =
  window.location.protocol === 'http:' ||
  window.location.protocol === 'https:'
    ? window.location.protocol
    : 'http:';
const host = window.location.hostname || 'localhost';
const defaultHost = `${protocol}//${host}:8000`;
export const API_BASE = import.meta.env.VITE_API_URL || defaultHost;

export function apiFetch(path: string, options?: RequestInit) {
  return fetch(`${API_BASE}${path}`, options);
}
