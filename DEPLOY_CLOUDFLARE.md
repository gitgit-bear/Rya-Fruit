# Rya Fruit Cloudflare Deployment

## Recommended architecture

- Frontend: Cloudflare Pages (`client`)
- API backend: Existing Node/Express server (`server`) on any Node host
- Browser traffic:
  - `https://your-pages-domain/*` -> static frontend
  - `https://your-pages-domain/api/*` -> proxied by Pages Function to backend
  - `https://your-pages-domain/uploads/*` -> proxied to backend
  - `https://your-pages-domain/auntie-photos/*` -> proxied to backend

This avoids cross-site cookie issues and keeps the current auth flow working.

## 1) Deploy backend first

Deploy `server` to a Node platform (for example: Railway, Render, Fly.io, VPS).

Required backend environment variables:

- `NODE_ENV=production`
- `ADMIN_TOKEN=<strong password>`
- `SESSION_SECRET=<long random secret>`
- `ADMIN_COOKIE_NAME=rya_admin_session` (optional)

Important:

- Keep persistent storage for:
  - `server/data/*.json`
  - `server/uploads`
  - `fruity_auntie_pages_1_to_4_all_jpg`
- If your host has ephemeral disk, move data/images to managed storage before production.

## 2) Deploy frontend to Cloudflare Pages

Pages project configuration:

- Root directory: `client`
- Build command: `npm ci && npm run build`
- Build output directory: `dist`
- Environment variable: `NODE_VERSION=20`

Pages environment variables:

- `API_ORIGIN=https://<your-backend-domain>`

Fallback build command (only if npm optional-dependency issue appears in CI):

- `npm ci --include=optional && npm run build`

The Pages Function in `client/functions/[[path]].ts` reads `API_ORIGIN` and proxies:

- `/api/*`
- `/uploads/*`
- `/auntie-photos/*`

## 3) Domain and SSL

- Connect custom domain to Pages (e.g. `fruit.example.com`)
- Ensure backend API domain also has HTTPS enabled
- Set `API_ORIGIN` to HTTPS URL only

## 4) Validation checklist

- Open homepage and product list loads
- Open gallery and images load
- Login admin works
- Add/edit/delete product works
- Upload image works and returned URL is under Pages domain
- Submit order and contact message works

## Optional next step (full Cloudflare-native)

To move backend into Cloudflare Workers later, refactor these first:

- JSON file storage -> D1 or KV
- Uploaded images -> R2
- Session storage -> stateless token or KV/D1-backed session
- Multer/local disk usage -> direct upload flow to R2
