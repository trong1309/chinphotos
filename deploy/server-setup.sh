#!/usr/bin/env bash
# ============================================================================
# deploy/server-setup.sh
# Bootstrap Ubuntu 22.04 / 24.04 VPS for chinphotos Production Deployment
# Run as root: sudo bash deploy/server-setup.sh
# ============================================================================
set -euo pipefail

DEPLOY_USER="deploy"
APP_DIR="/opt/photographer"

echo "==> [1/5] Updating system packages..."
apt-get update -y
apt-get upgrade -y
apt-get install -y ca-certificates curl gnupg ufw git

echo "==> [2/5] Installing Docker Engine & Docker Compose plugin..."
if ! command -v docker >/dev/null 2>&1; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    tee /etc/apt/sources.list.d/docker.list > /dev/null
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
fi

echo "==> [3/5] Creating non-root '${DEPLOY_USER}' user..."
if ! id "${DEPLOY_USER}" >/dev/null 2>&1; then
  useradd -m -s /bin/bash "${DEPLOY_USER}"
fi
usermod -aG docker "${DEPLOY_USER}"

echo "==> [4/5] Configuring UFW firewall (allowing 22/tcp, 80/tcp, 443/tcp, 443/udp)..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp
ufw --force enable

echo "==> [5/5] Creating application directory ${APP_DIR}..."
mkdir -p "${APP_DIR}/deploy" "${APP_DIR}/backups"
chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "${APP_DIR}"

echo "============================================================================"
echo "VPS setup complete!"
echo "Next steps:"
echo "  1. Copy docker-compose.prod.yml, deploy/*, and .env.prod to ${APP_DIR}"
echo "  2. Point your domain DNS A/AAAA record to this server's IP"
echo "  3. Run: cd ${APP_DIR} && docker compose --env-file .env.prod -f docker-compose.prod.yml up -d"
echo "============================================================================"
