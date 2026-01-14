import { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';
import { z } from 'zod';

const urlInputSchema = z.object({ url: z.string().url({ message: 'Please enter a valid URL' }) });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // If deployed to Vercel, yt-dlp binary may not be available.
  // Support proxying to an externally hosted downloader via YTDLP_API_URL.
  const proxyUrl = process.env.YTDLP_API_URL;
  if (process.env.VERCEL && !proxyUrl) {
    return res.status(501).json({ message: 'Server-side video metadata extraction is not available on Vercel. Set YTDLP_API_URL to a hosted yt-dlp service or deploy the server side elsewhere.' });
  }

  try {
    const input = urlInputSchema.parse(req.body);

    if (proxyUrl) {
      // Forward request to external service
      const proxyRes = await fetch(proxyUrl + '/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!proxyRes.ok) {
        const json = await proxyRes.json().catch(() => ({ message: 'Proxy error' }));
        return res.status(proxyRes.status).json(json);
      }

      const body = await proxyRes.json();
      return res.status(200).json(body);
    }

    const url = input.url as string;

    const ytDlp = spawn('yt-dlp', ['--dump-json', '--no-warnings', '--no-call-home', url]);

    let stdoutData = '';
    let stderrData = '';

    ytDlp.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    ytDlp.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    ytDlp.on('close', (code) => {
      if (code !== 0) {
        console.error(`yt-dlp error: ${stderrData}`);
        return res.status(500).json({ message: 'Failed to fetch video info. URL might be invalid or unsupported.' });
      }

      try {
        const info = JSON.parse(stdoutData);
        // Minimal mapping here – client will further validate
        const formats = (info.formats || []).map((f: any) => ({
          format_id: f.format_id,
          ext: f.ext,
          resolution: f.resolution || (f.height ? `${f.height}p` : 'audio only'),
          filesize: f.filesize,
          vcodec: f.vcodec,
          acodec: f.acodec,
          note: f.format_note,
        })).filter((f: any) => f.ext === 'mp4' || f.vcodec !== 'none');

        const uniqueFormats: any[] = [];
        const seen = new Set();
        for (const f of formats.reverse()) {
          const key = `${f.resolution}-${f.ext}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueFormats.push(f);
          }
        }

        const videoInfo = {
          id: info.id,
          title: info.title,
          thumbnail: info.thumbnail,
          duration: info.duration,
          uploader: info.uploader,
          webpage_url: info.webpage_url,
          formats: uniqueFormats.sort((a, b) => (parseInt(b.resolution) || 0) - (parseInt(a.resolution) || 0)),
        };

        return res.status(200).json(videoInfo);
      } catch (e) {
        console.error('JSON parse error', e);
        return res.status(500).json({ message: 'Failed to parse video metadata' });
      }
    });

    // safety timeout in case process hangs
    const timeout = setTimeout(() => {
      try {
        ytDlp.kill('SIGKILL');
      } catch {}
      return res.status(500).json({ message: 'yt-dlp timed out' });
    }, 30_000);

    req.on('close', () => {
      clearTimeout(timeout);
      try { ytDlp.kill(); } catch {}
    });
  } catch (err: any) {
    if (err?.errors) {
      return res.status(400).json({ message: err.errors?.[0]?.message || 'Invalid input' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
