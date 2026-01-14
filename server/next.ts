import { type Server } from "http";
import { type Express } from "express";
import next from "next";

export async function setupNext(server: Server, app: Express) {
  const dev = process.env.NODE_ENV !== "production";
  // The Next app will live under the `client` folder
  const dir = process.cwd();
  const nextApp = next({ dev, dir: `${dir}/client` });
  const handle = nextApp.getRequestHandler();

  await nextApp.prepare();

  // let Next handle all non-api requests; Express routes (registered earlier)
  // will take precedence because they were added before this call in server/index.ts
  app.all("*", (req, res) => {
    // Delegate to Next.js
    return handle(req, res);
  });
}
