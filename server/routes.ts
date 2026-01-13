import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { spawn } from "child_process";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post(api.info.path, async (req, res) => {
    try {
      const input = api.info.input.parse(req.body);
      const url = input.url;

      console.log(`Fetching info for: ${url}`);

      const ytDlp = spawn('yt-dlp', [
        '--dump-json',
        '--no-warnings',
        '--no-call-home',
        url
      ]);

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
          
          // Map to our schema
          const formats = (info.formats || []).map((f: any) => ({
            format_id: f.format_id,
            ext: f.ext,
            resolution: f.resolution || (f.height ? `${f.height}p` : 'audio only'),
            filesize: f.filesize,
            vcodec: f.vcodec,
            acodec: f.acodec,
            note: f.format_note,
          })).filter((f: any) => f.ext === 'mp4' || f.vcodec !== 'none'); // Filter for useful formats

          // Deduplicate formats based on resolution/note to clean up UI
          const uniqueFormats = [];
          const seen = new Set();
          for (const f of formats.reverse()) { // Prefer higher quality usually at end
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

          res.json(videoInfo);
        } catch (e) {
          console.error('JSON parse error', e);
          res.status(500).json({ message: 'Failed to parse video metadata' });
        }
      });

    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  app.get(api.download.path, async (req, res) => {
    try {
      const url = req.query.url as string;
      const format_id = req.query.format_id as string;
      const title = req.query.title as string || 'video';

      if (!url) {
        return res.status(400).send("Missing URL");
      }

      console.log(`Downloading: ${url} (format: ${format_id})`);

      // sanitize filename
      const safeTitle = title.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
      const filename = `${safeTitle}.mp4`;

      res.header('Content-Disposition', `attachment; filename="${filename}"`);
      res.header('Content-Type', 'video/mp4');

      const args = [
        '-o', '-', // output to stdout
        '--no-warnings',
        '--no-call-home',
      ];
      
      if (format_id) {
        args.push('-f', format_id);
      } else {
        // Default to best mp4 video+audio
        args.push('-f', 'best[ext=mp4]/best'); 
      }
      
      args.push(url);

      const ytDlp = spawn('yt-dlp', args);

      ytDlp.stdout.pipe(res);

      ytDlp.stderr.on('data', (data) => {
        console.error(`yt-dlp stderr: ${data}`);
      });

      ytDlp.on('close', (code) => {
        if (code !== 0) {
          console.error(`yt-dlp download process exited with code ${code}`);
          // Can't send JSON error if headers already sent, but stream will end.
          res.end(); 
        }
      });
      
      req.on('close', () => {
        ytDlp.kill(); // Kill process if client disconnects
      });

    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  });

  return httpServer;
}
