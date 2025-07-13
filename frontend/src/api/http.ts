const defaultHost = `${window.location.protocol}//${window.location.hostname}:8000`;
export const API_BASE =
  import.meta.env.VITE_API_URL || defaultHost;

export function apiFetch(path: string, options?: RequestInit) {
  return fetch(`${API_BASE}${path}`, options);
}
