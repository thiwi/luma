import asyncio
from collections import defaultdict

class FakeRedis:
    def __init__(self):
        self.store = defaultdict(int)
        self.lock = asyncio.Lock()

    async def incr(self, key: str):
        async with self.lock:
            self.store[key] += 1
            return self.store[key]

    async def decr(self, key: str):
        async with self.lock:
            self.store[key] -= 1
            return self.store[key]

    async def get(self, key: str):
        async with self.lock:
            value = self.store.get(key)
            return value if value is not None else 0
