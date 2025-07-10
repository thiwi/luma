# Luma Prototype

This repository contains a minimal proof-of-concept implementation of the Luma backend and a very small frontend. The service exposes a REST API and a WebSocket endpoint and serves a React-based prototype from the `public` directory.

Events created via the API start automatically at their scheduled time and broadcast `event_start`/`event_end` messages to all participants. Users can join events, exchange "energy" signals over WebSockets and search for anonymous matches.

Each event tracks the total amount of energy exchanged while it is active. Match history records the duration and how much energy was sent during the connection.

The implementation uses only Node's built‑in modules to avoid external dependencies. All data is stored in memory so the server is meant for demo purposes only.

## Running

```
node server.js
```

The server listens on `http://localhost:3000`. Open this address in the browser to access the frontend. API calls can also be made directly. Start a session with:

```
curl -X POST http://localhost:3000/api/session
```

Use the returned session cookie for subsequent requests. A WebSocket connection can be opened at `ws://localhost:3000/ws` with the session cookie.

The server exposes a simple health check at `/health` that returns `OK`.
