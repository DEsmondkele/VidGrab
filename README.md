# VidGrab

## Vercel deployment notes ⚠️

- This repository contains a Next.js app under `client/` and optional server code in `server/` for a self-hosted deployment.
- To deploy to Vercel: set the **Build Command** to `npm run client:build` (or set **Root Directory** to `client`). This project uses the monorepo setup where Next lives in `client/`.
- Important: the `/api/info` and `/api/download` endpoints rely on `yt-dlp` being available on the server. Vercel's serverless environment does not support spawning system binaries like `yt-dlp`. Two options:
  - Host a small server that runs `yt-dlp` and set the environment variable `YTDLP_API_URL` to point at it; the Next API routes will proxy requests to that service when `YTDLP_API_URL` is set.
  - Deploy the existing `server/` code to a self-hosted server (DigitalOcean, Render, Fly, etc.) and use that as the backend.
- If `YTDLP_API_URL` is not set and you deploy to Vercel, the API routes will return HTTP 501 with a helpful message.

