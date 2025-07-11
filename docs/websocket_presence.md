# Real-time Presence

FastAPI WebSocket endpoint broadcasts the current participant count using Redis.
A simple React hook connects to the socket and updates UI.

```python
@app.websocket("/ws/presence/{event_id}")
async def presence(ws: WebSocket, event_id: int):
    await ws.accept()
    await redis.incr(f"event:{event_id}:count")
    try:
        while True:
            await ws.receive_text()
            count = int(await redis.get(f"event:{event_id}:count"))
            await ws.send_json({"count": count})
    finally:
        await redis.decr(f"event:{event_id}:count")
```

```jsx
function usePresence(eventId) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const ws = new WebSocket(`/ws/presence/${eventId}`);
    ws.onmessage = (e) => setCount(JSON.parse(e.data).count);
    return () => ws.close();
  }, [eventId]);
  return count;
}
```
