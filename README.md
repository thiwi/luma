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
`http://localhost:8000/api` and the web interface at
`http://localhost:8080`.

The frontend uses the `VITE_API_URL` environment variable to locate the backend.
If this variable is not set the application falls back to the same hostname on
port `8000`. When running with Docker Compose the variable is automatically set
to `/api`. For a local setup outside of Docker create a `.env`
file inside `frontend` with `VITE_API_URL=http://localhost:8000`.

Stop everything with:

```bash
scripts/stop.sh
```

WebSocket connections can be opened at `ws://localhost:8080/ws/presence/{event_id}`.

## Kubernetes setup

Build the container images and deploy the chart to a local cluster. When used
with Docker Compose the frontend image is built automatically with
`API_URL=/api`. For Kubernetes the API is reachable through the
Ingress on the same host, so build the frontend with a relative `/api` base
path:

```bash
docker build -t luma-backend:latest -f backend/Dockerfile .
docker build -t luma-frontend:latest \
  --build-arg API_URL=/api -f frontend/Dockerfile .

helm install luma helm/luma
```

Add `127.0.0.1 luma.local` to your `/etc/hosts` and run `kubectl port-forward
svc/luma-frontend 8080:80` to open the web interface at
`http://luma.local:8080` on macOS.
