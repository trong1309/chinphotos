# chinphotos — Natural Family & Childhood Photography Portfolio

Full-stack bilingual (Vietnamese / English) photography portfolio and studio management CMS for **chinphotos** (Ho Chi Minh City), built with React 18, TypeScript, Tailwind CSS, Node.js, Express, MongoDB 7, and Docker.

---

## Features

- **Public Portfolio (`client/`)**:
  - Editorial, minimalist warm-toned design (`#faf8f5` light / `#0f0e0d` dark) with `Cormorant Garamond` + `Plus Jakarta Sans`.
  - Bilingual (`vi` / `en`) via `react-i18next` with automatic language persistence.
  - Responsive Masonry gallery grid with deep-linked Lightbox (`?itemId=<id>`), keyboard navigation (`←`, `→`, `Esc`), and touch swipe.
  - Dynamic Service Packages (`/services/:slug`) in VND with inclusions & accordion FAQs.
  - Local SEO landing pages (`/locations/:slug`) for key Ho Chi Minh City neighborhoods (`Thao Dien`, `Phu My Hung`, `Binh Quoi`, `District 1`, `In-home Lifestyle`).
  - Interactive Contact & Booking Inquiry form with honeypot anti-spam, Zod validation, and automatic service pre-selection.
  - Dynamic `<SEO />` metadata, OpenGraph tags, `PhotographyBusiness` JSON-LD schema, `/sitemap.xml`, and `/robots.txt`.

- **Admin Studio CMS (`admin/`)**:
  - SaaS-grade dashboard with dark/light/system theme, collapsible sidebar, and `Ctrl+K` Command Palette.
  - Real-time Analytics & Overview with Recharts (`7d`, `30d`, `3m`, `12m`), conversion rate, service breakdown, top galleries, and accessible screen-reader data tables + CSV export.
  - Category & Gallery Editor (`VI | EN` tabs, missing-translation badge, `@dnd-kit` drag-and-drop image sorting with keyboard sensor, multi-file uploader with WebP conversion & progress bars, cover image & bulk actions).
  - Services & Local SEO Locations manager with live 2-column sanitized Markdown editor and `localStorage` draft recovery.
  - Inquiry CRM with status workflow (`new` → `read` → `replied` → `archived`), header unread bell badge, internal notes, `mailto:` quick reply, bulk actions, and UTF-8 BOM CSV export.
  - 6-tab System Settings (`General`, `Social & SEO`, `Profile`, `Security`, `Notifications`, `Appearance`).

- **Backend API (`server/`)**:
  - Express + TypeScript + Mongoose 8 + Zod validation.
  - `httpOnly` JWT cookie authentication, rate limiting, Helmet security headers, and Sharp multi-size WebP image processing (`thumb` 400w, `medium` 1200w, `large` 2000w).
  - Swagger OpenAPI 3.0 interactive documentation at `/api/docs`.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Client SPA** | React 18, Vite 5, TypeScript, Tailwind CSS, Framer Motion, React Query, React Hook Form + Zod, `react-i18next`, `yet-another-react-lightbox` |
| **Admin SPA** | React 18, Vite 5, TypeScript, Tailwind CSS, Radix UI Primitives, Recharts, `@dnd-kit`, Zustand, React Query |
| **Backend API** | Node.js 20, Express 4, TypeScript, MongoDB 7 + Mongoose 8, Sharp, Multer, Nodemailer, Zod, Jest + Supertest |
| **Infrastructure** | Docker & Docker Compose, Nginx (SPA serving), Caddy 2 (auto-HTTPS reverse proxy), GitHub Actions CI/CD, GHCR |

---

## Project Structure

```text
.
├── client/                 # Public portfolio SPA (Vite + React + TS, port 5173)
├── admin/                  # Studio Admin CMS SPA (Vite + React + TS, port 5174)
├── server/                 # REST API + Sharp upload pipeline + Swagger (port 5000)
├── deploy/                 # Production Caddyfile, Mongo init, VPS setup & backup scripts
├── docs/                   # Architecture, API, Deployment, Content & Admin guides
├── .github/workflows/      # CI & CD GitHub Actions workflows
├── docker-compose.yml      # One-command development stack
└── docker-compose.prod.yml # Production stack with Caddy 2 & internal Mongo network
```

---

## Quick Start (Docker Development — Recommended)

You only need **Docker Desktop** installed. No local Node.js or MongoDB installation is required.

```bash
# 1. Start MongoDB, Server, Client, and Admin in development mode
docker compose up --build -d

# 2. Seed sample categories, galleries, services, locations, inquiries, and 90-day analytics
docker compose exec server npm run seed
```

Once running:
- **Public Website (`client`)**: http://localhost:5173
- **Admin CMS (`admin`)**: http://localhost:5174 (Login: `admin@example.com` / `Admin@123`)
- **Backend API & Swagger (`server`)**: http://localhost:5000/api/docs

---

## Local Development (Without Docker)

1. Ensure **Node.js >= 20** and **MongoDB 7** are running locally.
2. Copy environment templates:
   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   cp admin/.env.example admin/.env
   ```
3. Install dependencies and seed data:
   ```bash
   npm ci
   npm run seed -w server
   npm run dev
   ```

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Run `client`, `admin`, and `server` concurrently |
| `npm run build` | Typecheck and build all three workspaces (`client`, `admin`, `server`) |
| `npm run lint` | Run ESLint with `--max-warnings 0` across all workspaces |
| `npm run typecheck` | Run `tsc --noEmit` across all workspaces |
| `npm run test -w server` | Run Jest + Supertest API integration suite |
| `npm run seed -w server` | Seed initial studio data (idempotent) |

---

## Pushing to GitHub

```bash
git init
git add .
git commit -m "feat: initial photographer portfolio"
git branch -M main
git remote add origin https://github.com/<username>/chinphotos.git
git push -u origin main
```

---

## Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Production Deployment Guide](docs/DEPLOYMENT.md)
- [Studio Content Guide (For Photographers)](docs/CONTENT-GUIDE.md)
- [Admin Developer Guide (Adding a New Resource)](docs/ADMIN.md)
