#!/bin/sh
# On container start: ensure the DB schema is up to date (safe for SQLite
# volume-backed storage and for Postgres alike), then exec the app.
set -e

echo "[entrypoint] pushing prisma schema…"
node_modules/.bin/prisma db push --skip-generate --accept-data-loss=false || {
  echo "[entrypoint] prisma db push failed" >&2
  exit 1
}

echo "[entrypoint] starting app: $*"
exec "$@"
