# Luma Prototype

This repository contains a minimal proof-of-concept implementation of the Luma backend and a lightweight frontend. A FastAPI service exposes a REST API and WebSocket endpoint, while the React prototype lives in the `public` directory.

Events created via the API automatically broadcast start/end messages to participants. Users can join events, exchange "energy" signals over WebSockets and search for anonymous matches.

Premium prototype features include:

* **Resonance links** – create persistent silent connections to other sessions via `/api/resonance/link` and `/api/resonance/links`.
* **Group rooms** – time bound "silent circles" that multiple participants can join.
* **Mood customization** – premium users select a mood when creating an event.

## Running

Install the Python dependencies and start the backend:

```bash
pip install -r requirements.txt
uvicorn backend.main:app --reload
```

The API is then available at `http://localhost:8000/api`. Create a session with:

```bash
curl -X POST http://localhost:8000/api/session
```

Serve the frontend from the `public` folder using any static file server, e.g.:

```bash
python3 -m http.server 8080 -d public
```

WebSocket connections can be opened at `ws://localhost:8000/ws/presence/{event_id}`.

## Kubernetes setup

Run `scripts/start.sh` to launch PostgreSQL, Redis and the FastAPI backend in Minikube using Helm. Use `scripts/stop.sh` to tear it down.
