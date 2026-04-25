# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

- **Backend**: Node.js ≥ 18 + Express, `mysql2/promise`, JWT auth, served by PM2 on port 3001.
- **Frontend**: Vanilla JS SPA (no build step, no framework, no bundler). Plain `<script>` tags in [frontend/index.html](frontend/index.html).
- **Database**: MariaDB 10.6+ / MySQL 8+, schema in [backend/database.sql](backend/database.sql) (~25 tables, Spanish names, timezone `America/Lima` UTC-5).
- **Reverse proxy**: Apache (`httpd` on AlmaLinux per `scripts/setup.sh`; `apache2` per README.md) — terminates SSL, serves `/mecanica/` static, `ProxyPass /mecanica/api → :3001`.

There is **no test suite, linter, type-checker, or front-end build pipeline**. Don't invent commands for tools that aren't here.

## Commands

From `backend/`:
- `npm install` — install deps.
- `npm run dev` — nodemon on `src/app.js`.
- `npm start` — production-style run (PM2 uses this in deploy).
- `npm run seed` / `npm run migrate` — **scripts referenced in [backend/package.json](backend/package.json) but the target files `src/utils/seed.js` and `src/utils/migrate.js` do not exist in the repo.** Treat them as TODO; the real schema + seed flow goes through `database.sql`.

Frontend: open the served URL — there is nothing to build. When iterating locally, restart the backend (`npm run dev`) and hard-refresh the browser; the backend serves `frontend/` as static files (see [backend/src/app.js:38](backend/src/app.js#L38)).

Production ops (on the VPS):
```
pm2 logs mecanica_pro
pm2 restart mecanica_pro
tail -f backend/logs/error.log
systemctl restart httpd        # AlmaLinux (setup.sh)
systemctl reload apache2       # Ubuntu (README)
```

## Deployment paths — note the README/setup mismatch

The two deploy docs disagree; the **`scripts/setup.sh` is the source of truth** (matches what the frontend expects):

| | README.md | scripts/setup.sh (authoritative) |
|---|---|---|
| OS | Ubuntu (`apache2`) | AlmaLinux (`httpd`, SELinux) |
| App dir | `/var/www/mecanica_pro` | `/var/www/html/mecanica` |
| URL path | site root (`/`) | **`/mecanica/`** subpath |

The frontend hard-codes `API_BASE = '/mecanica/api'` in [frontend/js/api.js:2](frontend/js/api.js#L2). If you change the deployment subpath, update that constant **and** the Apache `ProxyPass` together.

`scripts/setup.sh` copies `$APP_DIR/apache/mecanica_proxy.conf` into `/etc/httpd/conf.d/`, but **that vhost file is not in the repo** — it must be supplied out-of-band on the server (or added). Flag this if a fresh deploy fails.

## Architecture

### Backend (`backend/src/`)

[app.js](backend/src/app.js) wires helmet → rate-limit (500/15min) → CORS → JSON parser → static (`/uploads`, `/`) → 14 route modules under `/api/*` → SPA fallback (`*` → `frontend/index.html`) → error handler. All routes mount at `/api/<resource>`; the Apache layer prepends `/mecanica`.

- **DB helper** ([config/database.js](backend/src/config/database.js)) wraps `mysql2` with a pg-style shim: `db.query(sql, params)` returns `{ rows }`. Every route uses this shape — preserve it when adding queries. Use parameterized `?` placeholders, never string-concat.
- **Auth** ([middleware/auth.js](backend/src/middleware/auth.js)) exports `authMiddleware` (verifies JWT from `Authorization: Bearer …`, sets `req.user = { id, username, role, nombre }`) and `requireRole('admin', …)`. Most route files apply `router.use(authMiddleware)` once at the top — `auth.js` is the only public-facing module.
- **Routes** are flat: one file per business resource (clientes, vehículos, OTs, servicios, repuestos/inventario, técnicos, ventas, caja, compras, reportes, configuración, uploads, dashboard, auth). There is no service / controller / model layer — SQL lives directly inside the route handler. When adding endpoints, follow that pattern; don't introduce an ORM or extra layers.
- All API responses use the `{ success: bool, message?, …data }` envelope. Errors `console.error` and return 4xx/5xx with `success: false`.

### Frontend (`frontend/`)

Single-page app, no router library. [js/app.js](frontend/js/app.js) holds a `PAGES` map (`dashboard`, `ots`, `clientes`, `vehiculos`, `inventario`, `servicios`, `tecnicos`, `ventas`, `caja`, `compras`, `reportes`, `config`) → render functions loaded from `frontend/js/pages/<name>.js`. `navigateTo(key)` clears `#pageContainer` and calls the render function; each page does its own fetch + DOM build.

- **HTTP client**: the `Api` object in [js/api.js](frontend/js/api.js) — always use `Api.get/post/put/patch/delete/upload`, never raw `fetch`. It auto-attaches the bearer token and on 401 wipes localStorage + reloads.
- **Auth state**: stored in `localStorage` as `mp_token` (JWT) and `mp_user` (JSON). Login/logout wiring lives in `app.js`; do not duplicate.
- **Shared helpers** in [js/utils.js](frontend/js/utils.js): `toast()`, `openModal()/closeModal()`, `fmtCurrency` (`S/ X.XX` — Peruvian Soles), `fmtDate/fmtDatetime` (`es-PE`), `badgeEstado()`. New pages should reuse these.
- New page = (1) add route file under `backend/src/routes/`, (2) `app.use('/api/x', …)` in `app.js`, (3) add `frontend/js/pages/x.js` with a `renderX(container)` function, (4) register in `PAGES` and add a `data-page="x"` nav item.

### Data model conventions

Tables and columns are in **Spanish** (e.g. `ordenes_trabajo`, `comprobantes`, `caja_sesiones`, `precio_venta`). Money is `DECIMAL(10,2)` in PEN. Soft delete via `activo TINYINT(1)` is widespread — most list queries filter `WHERE activo=1`. Correlatives for OTs and comprobantes (boleta/factura) live in the singleton `taller_config` row.

Default seeded login: `admin` / `admin123` (bcrypt hash in `database.sql`).

## Conventions to keep

- Comments and user-facing strings are in Spanish; match that tone in new code and toasts.
- Route files start with the section banner comment style (`/* ── … ──── */`) used throughout — match it for consistency, but don't add it to files that don't already use it.
- Don't introduce TypeScript, a bundler, an ORM, or a frontend framework — the project deliberately runs as plain JS + raw SQL.
