import type { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).send('Method Not Allowed');
  }

  const proxyUrl = process.env.YTDLP_API_URL;
  if (process.env.VERCEL && !proxyUrl) {
    return res.status(501).json({ message: 'Download streaming is not supported on Vercel. Set YTDLP_API_URL to a hosted downloader service or deploy the server elsewhere.' });
  }

  try {
    const query = req.query || {};

    if (proxyUrl) {
      const params = new URLSearchParams();
      if (query.url) params.append('url', String(query.url));
      if (query.format_id) params.append('format_id', String(query.format_id));
      if (query.title) params.append('title', String(query.title));

      const proxyRes = await fetch(`${proxyUrl}/download?${params.toString()}`);
      if (!proxyRes.ok) {
        const json = await proxyRes.json().catch(() => ({ message: 'Proxy error' }));
        return res.status(proxyRes.status).json(json);
      }

      // Pipe proxy response through (fallback to buffered response for environments
      // where ReadableStream doesn't implement pipe)
      res.status(proxyRes.status);
      const body = proxyRes.body as any;
      if (body && typeof body.pipe === 'function') {
        body.pipe(res as any);
        return;
      }

      const buf = Buffer.from(await proxyRes.arrayBuffer());
      res.setHeader('Content-Length', String(buf.length));
      res.end(buf);
      return;
    }

    const url = String(query.url || '');
    const format_id = String(query.format_id || '');
    const title = String(query.title || 'video');

    if (!url) return res.status(400).send('Missing url');

    const safeTitle = title.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
    const filename = `${safeTitle}.mp4`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'video/mp4');

    const args: string[] = ['-o', '-', '--no-warnings', '--no-call-home'];
    if (format_id) {
      args.push('-f', format_id);
    } else {
      args.push('-f', 'best[ext=mp4]/best');
    }
    args.push(url);

    const ytDlp = spawn('yt-dlp', args);

    ytDlp.stdout.pipe(res as any);

    ytDlp.stderr.on('data', (data) => {
      console.error(`yt-dlp stderr: ${data}`);
    });

    ytDlp.on('close', (code) => {
      if (code !== 0) {
        console.error(`yt-dlp download process exited with code ${code}`);
      }
      res.end();
    });

    req.on('close', () => {
      try { ytDlp.kill(); } catch {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}
