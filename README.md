# Rya-Fruit

## Deploy backend API (Render)

This repository includes `render.yaml` for quick backend setup.

### Steps

1. In Render, choose **New +** -> **Blueprint**.
2. Connect this GitHub repository.
3. Render reads `render.yaml` and creates `rya-fruit-api`.
4. Set required secrets in Render:
   - `ADMIN_TOKEN`
   - `SESSION_SECRET`
5. Deploy and open:
   - `https://<your-render-domain>/api/health`
   - `https://<your-render-domain>/api/products`

If both endpoints return JSON, this is your backend API domain.

## Connect frontend Worker to backend API

After backend is live, redeploy frontend with API base:

```powershell
$env:VITE_API_BASE="https://<your-render-domain>"
npm run cf:workers:deploy
```
