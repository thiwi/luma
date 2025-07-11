# Privacy and Anonymity

Luma avoids storing personal data. Sessions are tracked only by random tokens.
Premium features are linked to sessions, not identities.

```python
# secure session creation example
from uuid import uuid4
from fastapi import Response

def create_session(response: Response, db):
    token = str(uuid4())
    db.add(Session(token=token))
    db.commit()
    response.set_cookie("session_token", token, httponly=True, secure=True)
    return {"token": token}
```

Events expire automatically using PostgreSQL's `ttl`/cron jobs.
A scheduled task deletes events older than 30 days.
