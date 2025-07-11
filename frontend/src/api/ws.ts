export function connect(url: string): WebSocket {
  return new WebSocket(url);
}
