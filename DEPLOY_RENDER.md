# Deploying VidGrab (server) to Render

This project contains both the client (Next.js in `client/`) and the server (Express in `server/`). The server bundles the Next client during the `npm run build` step and serves it by default.

If you'd like to deploy backend to Render (and keep frontend on Vercel), follow these steps:

1. Optional: Add a Postgres database on Render (Managed Database) and copy the connection string.
2. In the Render dashboard, click "New Web Service" → Link to GitHub → choose the `VidGrab` repo and the `kele` branch.
3. Set the **Build Command** to:

   npm ci && npm run build

4. Set the **Start Command** to:

   npm run start

5. Set environment variables in the Render dashboard (you MUST set these):

   - DATABASE_URL (Postgres connection string)
   - NODE_ENV = production

6. (Optional) Expose a health check path (e.g., `/api/info`), enable automatic deploys on push.

Notes / Tips
- The repo is a monorepo containing both client and server. By default the server build will also build the client; if you prefer deploying the client to Vercel separately, it is okay — the Render step will still build Next but it's harmless if you keep both builds.
- If you want to avoid building the client in Render, you can modify the build step to only build server artifacts, but the default workflow keeps things simple.
- We included `render.yaml` and a `Dockerfile` in the repo. If you prefer Docker-based deployments, use the `Dockerfile` and set Render to deploy via Docker.

If you'd like, I can (with your permission) connect to Render via an API key and create the service for you; otherwise, connect the repo in your Render dashboard and paste any required secrets.
