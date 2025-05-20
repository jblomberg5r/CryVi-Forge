-- Create sessions table for authentication
CREATE TABLE IF NOT EXISTS "sessions" (
  "sid" VARCHAR(255) PRIMARY KEY,
  "sess" JSONB NOT NULL,
  "expire" TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "sessions" ("expire");