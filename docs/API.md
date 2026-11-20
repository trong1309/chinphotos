# API Reference (`chinphotos`)

Interactive OpenAPI 3.0 documentation is served at **`http://localhost:5000/api/docs`** (and raw JSON spec at **`http://localhost:5000/api/docs.json`**).

## Standard Response Envelope

All endpoints return a consistent JSON structure:

```json
{
  "success": true,
  "data": {},
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 42,
    "totalPages": 4
  },
  "message": "Optional human-readable message"
}
```

---

## Endpoints Summary

### Health & SEO
- `GET /api/health` — Healthcheck (`{ status: 'ok', db: 'connected' }`)
- `GET /sitemap.xml` — Dynamic XML sitemap for published galleries, categories, services, and locations
- `GET /robots.txt` — Search crawler rules (`Disallow: /admin`, `Disallow: /api`)

### Authentication (`/api/auth`)
- `POST /api/auth/login` — Authenticate admin (`email`, `password`), sets `httpOnly` JWT cookie `token`
- `POST /api/auth/logout` — Clear `httpOnly` JWT cookie
- `GET /api/auth/me` — Get current authenticated admin profile
- `PUT /api/auth/me` — Update admin `name` and `avatar`
- `PATCH /api/auth/password` — Change admin password (`currentPassword`, `newPassword`)

### Categories (`/api/categories`)
- `GET /api/categories` — List visible categories ordered by `order`
- `POST /api/categories` *(Admin)* — Create category
- `PUT /api/categories/:id` *(Admin)* — Update category
- `DELETE /api/categories/:id` *(Admin)* — Delete category (blocked if galleries still reference it)
- `PATCH /api/categories/reorder` *(Admin)* — Reorder categories

### Galleries & Images (`/api/galleries`, `/api/images`)
- `GET /api/galleries` — Paginated list with filters (`category`, `status`, `featured`, `search`, `page`, `limit`)
- `GET /api/galleries/:slug` — Get gallery detail with populated images (supports `?preview=true` for admin)
- `POST /api/galleries` *(Admin)* — Create gallery
- `PUT /api/galleries/:id` *(Admin)* — Update gallery metadata, bilingual story, credits, and SEO
- `DELETE /api/galleries/:id` *(Admin)* — Delete gallery and associated images
- `POST /api/galleries/:id/images` *(Admin)* — Upload `multipart/form-data` images (`files`), generates WebP `thumb`/`medium`/`large`
- `PATCH /api/galleries/:id/images/reorder` *(Admin)* — Update image display order
- `PUT /api/images/:id` *(Admin)* — Update image `alt`, `altEn`, `caption`, `isFeatured`
- `DELETE /api/images/:id` *(Admin)* — Delete image and remove files from disk

### Services & Locations (`/api/services`, `/api/locations`)
- `GET /api/services` — List active photography packages
- `GET /api/services/:slug` — Get service detail with inclusions, FAQs, and related galleries
- `POST /api/services`, `PUT /api/services/:id`, `DELETE /api/services/:id`, `PATCH /api/services/reorder` *(Admin)*
- `GET /api/locations`, `GET /api/locations/:slug` — Local SEO neighborhood pages
- `POST /api/locations`, `PUT /api/locations/:id`, `DELETE /api/locations/:id` *(Admin)*

### Inquiries & Subscribers (`/api/inquiries`, `/api/subscribers`)
- `POST /api/inquiries` — Submit booking inquiry (rate-limited, honeypot protected, triggers email notification)
- `GET /api/inquiries` *(Admin)* — Filterable, paginated inquiry list
- `GET /api/inquiries/:id`, `PATCH /api/inquiries/:id`, `DELETE /api/inquiries/:id`, `POST /api/inquiries/bulk` *(Admin)*
- `POST /api/subscribers` — Subscribe email to studio updates

### Analytics & Settings (`/api/analytics`, `/api/settings`)
- `POST /api/analytics/view` — Record anonymous daily page view (`path`, `type`, `refId`, `referrer`)
- `GET /api/analytics/overview?period=7d|30d|3m|12m` *(Admin)* — Aggregated KPIs, daily charts, service breakdown, referrers, and top galleries
- `GET /api/settings` — Public studio settings
- `PUT /api/settings` *(Admin)* — Update studio settings
