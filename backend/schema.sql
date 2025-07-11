CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    creator_id INTEGER REFERENCES sessions(id),
    mood VARCHAR(50),
    symbol VARCHAR(50),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE premium_features (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES sessions(id),
    feature_name VARCHAR(50)
);

CREATE TABLE silent_links (
    id SERIAL PRIMARY KEY,
    session_a INTEGER REFERENCES sessions(id),
    session_b INTEGER REFERENCES sessions(id)
);

CREATE TABLE moods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE,
    lottie_file VARCHAR(255)
);

CREATE INDEX idx_events_mood ON events(mood);
CREATE INDEX idx_events_created ON events(created_at);
