# Rya Fruit Client

## Local development

```bash
npm run dev
```

Vite dev server proxies `/api` and `/auntie-photos` to `http://localhost:3001`.

## Deploy frontend to Cloudflare Pages

This project includes a Pages Function proxy at `functions/[[path]].ts`:

- `/api/*` -> your backend origin
- `/uploads/*` -> your backend origin
- `/auntie-photos/*` -> your backend origin

This keeps browser requests same-origin on Pages so session cookies continue to work.

### Cloudflare Pages settings

- **Framework preset**: `Vite`
- **Build command**: `npm ci && npm run build`
- **Build output directory**: `dist`
- **Root directory**: `client`
- **Environment variable**: `NODE_VERSION=20`
- **Deploy command**: leave empty (do not use `npx wrangler deploy`)

Stable fallback if your CI still hits npm optional-deps edge cases:

- Build command fallback: `npm ci --include=optional && npm run build`

If you prefer CLI deploy (instead of Pages Git integration), use:

- from `client`: `npx wrangler pages deploy dist --project-name rya-fruit-client`
- from repo root: `npm run cf:pages:deploy`

### Required Pages environment variable

- `API_ORIGIN`: your backend base URL  
  Example: `https://api.your-domain.com`

### Why this design

The current backend uses Node.js file system storage (JSON files and local uploads), so it cannot be moved to Cloudflare Workers directly without refactoring storage to services like D1/R2/KV.

With this setup:

1. Frontend runs on Cloudflare Pages.
2. Existing backend can stay on any Node host.
3. `/api` stays under the same browser origin (through Pages Function proxy), so admin login/session behavior remains stable.
