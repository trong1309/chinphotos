#!/usr/bin/env bash
# ============================================================================
# deploy/backup-mongo.sh
# Dumps MongoDB database (gzip) and archives uploaded images volume.
# Retains the 14 most recent backups.
#
# Cron example (runs daily at 02:30 AM):
#   30 2 * * * /opt/photographer/deploy/backup-mongo.sh >> /var/log/photographer-backup.log 2>&1
# ============================================================================
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/photographer}"
ENV_FILE="${ENV_FILE:-${APP_DIR}/.env.prod}"
BACKUP_DIR="${BACKUP_DIR:-${APP_DIR}/backups}"
MONGO_CONTAINER="${MONGO_CONTAINER:-photographer-mongo-prod}"
UPLOADS_VOLUME="${UPLOADS_VOLUME:-photographer_uploads_data}"
RETENTION_COUNT=14
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"

if [ -f "${ENV_FILE}" ]; then
  # shellcheck disable=SC1090
  set -a && source "${ENV_FILE}" && set +a
fi

DB_NAME="${MONGO_INITDB_DATABASE:-photographer}"
APP_USER="${MONGO_APP_USER:-photographer_app}"
APP_PASS="${MONGO_APP_PASSWORD:-}"

mkdir -p "${BACKUP_DIR}"

MONGO_ARCHIVE="${BACKUP_DIR}/mongo_${DB_NAME}_${TIMESTAMP}.gz"
UPLOADS_ARCHIVE="${BACKUP_DIR}/uploads_${TIMESTAMP}.tar.gz"

echo "[$(date -Iseconds)] Starting MongoDB backup to ${MONGO_ARCHIVE}..."
if [ -n "${APP_PASS}" ]; then
  docker exec "${MONGO_CONTAINER}" mongodump \
    --username="${APP_USER}" \
    --password="${APP_PASS}" \
    --authenticationDatabase="${DB_NAME}" \
    --db="${DB_NAME}" \
    --archive \
    --gzip > "${MONGO_ARCHIVE}"
else
  docker exec "${MONGO_CONTAINER}" mongodump \
    --db="${DB_NAME}" \
    --archive \
    --gzip > "${MONGO_ARCHIVE}"
fi

echo "[$(date -Iseconds)] Starting uploads volume backup to ${UPLOADS_ARCHIVE}..."
docker run --rm \
  -v "${UPLOADS_VOLUME}:/uploads:ro" \
  -v "${BACKUP_DIR}:/backup" \
  alpine:3.19 \
  tar -czf "/backup/uploads_${TIMESTAMP}.tar.gz" -C /uploads .

echo "[$(date -Iseconds)] Pruning backups older than the ${RETENTION_COUNT} most recent..."
ls -1t "${BACKUP_DIR}"/mongo_*.gz 2>/dev/null | tail -n +$((RETENTION_COUNT + 1)) | xargs -r rm -f
ls -1t "${BACKUP_DIR}"/uploads_*.tar.gz 2>/dev/null | tail -n +$((RETENTION_COUNT + 1)) | xargs -r rm -f

echo "[$(date -Iseconds)] Backup completed successfully."
