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

Stop everything with:

```bash
scripts/stop.sh
```

WebSocket connections can be opened at `ws://localhost:8000/ws/presence/{event_id}`.

## Kubernetes setup

The original Helm chart is still available for deployments on a local Minikube
cluster.
