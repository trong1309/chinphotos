# Production Deployment Guide (`chinphotos`)

This guide covers deploying the full **chinphotos** stack (`mongo`, `server`, `client`, `admin`, `caddy`) to an Ubuntu 22.04/24.04 VPS with automatic Let's Encrypt HTTPS via Caddy 2 and automated GitHub Actions CI/CD.

---

## 1. Deployment Checklist

1. **Provision a Linux VPS**: Ubuntu 22.04 LTS or 24.04 LTS with at least **1 vCPU, 1–2 GB RAM, 25 GB SSD**.
2. **Bootstrap the VPS**: Run `deploy/server-setup.sh` as `root`:
   ```bash
   scp deploy/server-setup.sh root@<VPS_IP>:/root/
   ssh root@<VPS_IP> "bash /root/server-setup.sh"
   ```
   This installs Docker & Compose, creates the `deploy` user, restricts UFW firewall to ports `22`, `80`, and `443`, and prepares `/opt/photographer`.
3. **Configure DNS**:
   - Point `A` record for `@` (`chinphotos.vn`) → `<VPS_IP>`
   - Point `CNAME` record for `www` → `chinphotos.vn`
4. **Copy Production Files to `/opt/photographer`**:
   ```bash
   scp docker-compose.prod.yml .env.prod.example deploy@<VPS_IP>:/opt/photographer/
   scp -r deploy/ deploy@<VPS_IP>:/opt/photographer/
   ```
5. **Create `/opt/photographer/.env.prod`**:
   ```bash
   ssh deploy@<VPS_IP>
   cd /opt/photographer
   cp .env.prod.example .env.prod
   nano .env.prod
   ```
   Set strong passwords for `MONGO_INITDB_ROOT_PASSWORD`, `MONGO_APP_PASSWORD`, and `JWT_SECRET` (e.g. `openssl rand -hex 32`).
6. **Configure GitHub Secrets** (in your GitHub repo → `Settings` → `Secrets and variables` → `Actions`):
   - `VPS_HOST`: Public IP or domain of your VPS
   - `VPS_USER`: `deploy`
   - `VPS_SSH_KEY`: Private SSH key authorized for `deploy@<VPS_HOST>`
   - `VPS_PORT`: `22` (optional)
7. **Push to `main` branch**:
   - GitHub Actions runs `.github/workflows/ci.yml` (`lint` → `typecheck` → `test` → `build`).
   - On success, `.github/workflows/deploy-server.yml` builds and pushes `server`, `client`, and `admin` Docker images to GHCR (`ghcr.io/<owner>/<repo>/*`), SSHes into the VPS, pulls the new images, and restarts the containers.

---

## 2. First-Time Seed & Admin Password Rotation

After the containers are running on the VPS:

```bash
cd /opt/photographer

# Seed initial categories, services, locations, and admin account
docker compose --env-file .env.prod -f docker-compose.prod.yml exec server node dist/seed/seed.js
```

**Important**: Immediately sign in at `https://<your-domain>/admin` and go to **Settings → Security (Bảo mật)** to change the default admin password.

---

## 3. Automated Backups & Restore

### Schedule Daily Backups via Cron
Run `crontab -e` as the `deploy` user on the VPS and add:

```cron
30 2 * * * /opt/photographer/deploy/backup-mongo.sh >> /var/log/photographer-backup.log 2>&1
```

This creates daily gzipped MongoDB dumps (`mongo_photographer_YYYYMMDD_HHMMSS.gz`) and tar archives of uploaded images (`uploads_YYYYMMDD_HHMMSS.tar.gz`) in `/opt/photographer/backups/`, keeping the 14 most recent snapshots.

### Restoring from Backup

```bash
cd /opt/photographer
chmod +x deploy/restore-mongo.sh
./deploy/restore-mongo.sh \
  /opt/photographer/backups/mongo_photographer_20261114_023000.gz \
  /opt/photographer/backups/uploads_20261114_023000.tar.gz
```

---

## 4. Alternative Option: Client on GitHub Pages + API on Subdomain

If you prefer hosting the public static site on **GitHub Pages** while keeping the API on `https://api.chinphotos.vn`:
1. Trigger `.github/workflows/deploy-client.yml` (`Actions` → `Deploy Client to GitHub Pages`) with `api_url=https://api.chinphotos.vn/api`.
2. Set `CLIENT_URL=https://chinphotos.vn` in `.env.prod` on the backend server so CORS allows credentials from your GitHub Pages custom domain.
