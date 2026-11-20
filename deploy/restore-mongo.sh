#!/usr/bin/env bash
# ============================================================================
# deploy/restore-mongo.sh
# Restores a MongoDB gzipped archive and (optionally) an uploads tar.gz archive.
#
# Usage:
#   ./deploy/restore-mongo.sh /opt/photographer/backups/mongo_photographer_20261114_023000.gz [/opt/photographer/backups/uploads_20261114_023000.tar.gz]
# ============================================================================
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <path-to-mongo-archive.gz> [path-to-uploads-archive.tar.gz]"
  exit 1
fi

MONGO_ARCHIVE="$1"
UPLOADS_ARCHIVE="${2:-}"

APP_DIR="${APP_DIR:-/opt/photographer}"
ENV_FILE="${ENV_FILE:-${APP_DIR}/.env.prod}"
MONGO_CONTAINER="${MONGO_CONTAINER:-photographer-mongo-prod}"
UPLOADS_VOLUME="${UPLOADS_VOLUME:-photographer_uploads_data}"

if [ ! -f "${MONGO_ARCHIVE}" ]; then
  echo "Error: Mongo archive file not found: ${MONGO_ARCHIVE}"
  exit 1
fi

if [ -f "${ENV_FILE}" ]; then
  # shellcheck disable=SC1090
  set -a && source "${ENV_FILE}" && set +a
fi

DB_NAME="${MONGO_INITDB_DATABASE:-photographer}"
APP_USER="${MONGO_APP_USER:-photographer_app}"
APP_PASS="${MONGO_APP_PASSWORD:-}"

echo "==> Restoring MongoDB database '${DB_NAME}' from ${MONGO_ARCHIVE}..."
if [ -n "${APP_PASS}" ]; then
  docker exec -i "${MONGO_CONTAINER}" mongorestore \
    --username="${APP_USER}" \
    --password="${APP_PASS}" \
    --authenticationDatabase="${DB_NAME}" \
    --nsInclude="${DB_NAME}.*" \
    --drop \
    --archive \
    --gzip < "${MONGO_ARCHIVE}"
else
  docker exec -i "${MONGO_CONTAINER}" mongorestore \
    --nsInclude="${DB_NAME}.*" \
    --drop \
    --archive \
    --gzip < "${MONGO_ARCHIVE}"
fi

if [ -n "${UPLOADS_ARCHIVE}" ] && [ -f "${UPLOADS_ARCHIVE}" ]; then
  echo "==> Restoring uploads volume '${UPLOADS_VOLUME}' from ${UPLOADS_ARCHIVE}..."
  ABS_UPLOADS_DIR="$(cd "$(dirname "${UPLOADS_ARCHIVE}")" && pwd)"
  UPLOADS_FILENAME="$(basename "${UPLOADS_ARCHIVE}")"
  docker run --rm \
    -v "${UPLOADS_VOLUME}:/uploads" \
    -v "${ABS_UPLOADS_DIR}:/backup:ro" \
    alpine:3.19 \
    sh -c "rm -rf /uploads/* && tar -xzf \"/backup/${UPLOADS_FILENAME}\" -C /uploads"
fi

echo "==> Restore completed successfully!"
