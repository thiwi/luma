# Luma Prototype

This repository contains a minimal proof-of-concept implementation of the Luma backend and a lightweight frontend. A FastAPI service exposes a REST API and WebSocket endpoint, while the React prototype lives in the `public` directory.

Events created via the API automatically broadcast start/end messages to participants. Users can join events, exchange "energy" signals over WebSockets and search for anonymous matches.

Premium prototype features include:

* **Resonance links** – create persistent silent connections to other sessions via `/api/resonance/link` and `/api/resonance/links`.
* **Group rooms** – time bound "silent circles" that multiple participants can join.
* **Mood customization** – premium users select a mood when creating an event.

## Running

Start all services with Docker Compose:

```bash
scripts/start.sh
```

This launches the backend on port `8000`, the frontend on port `8080` and also
starts PostgreSQL and Redis containers. The API is available at
`http://backend:8000/api` and the web interface at
`http://localhost:8080`.

The frontend uses the `VITE_API_URL` environment variable to locate the backend.
If this variable is not set the application falls back to the same hostname on
port `8000`. When running with Docker Compose the variable is automatically set
to `http://backend:8000`. For a local setup outside of Docker create a `.env`
file inside `frontend` with `VITE_API_URL=http://localhost:8000`.

Stop everything with:

```bash
scripts/stop.sh
```

WebSocket connections can be opened at `ws://backend:8000/ws/presence/{event_id}`.

## Kubernetes setup

The original Helm chart is still available for deployments on a local Minikube
cluster.
