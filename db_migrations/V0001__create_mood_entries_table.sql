CREATE TABLE IF NOT EXISTS mood_entries (
  id SERIAL PRIMARY KEY,
  mood VARCHAR(50) NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mood_entries_created_at ON mood_entries(created_at DESC);