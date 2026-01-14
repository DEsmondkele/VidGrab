import { z } from 'zod';

export const urlInputSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL' }),
});

export const formatSchema = z.object({
  format_id: z.string(),
  ext: z.string(),
  resolution: z.string().optional(),
  filesize: z.number().optional().nullable(),
  vcodec: z.string().optional(),
  acodec: z.string().optional(),
  note: z.string().optional(),
});

export const videoInfoSchema = z.object({
  id: z.string(),
  title: z.string(),
  thumbnail: z.string().optional(),
  duration: z.number().optional(),
  uploader: z.string().optional(),
  webpage_url: z.string().optional(),
  formats: z.array(formatSchema),
});

export type UrlInput = z.infer<typeof urlInputSchema>;
export type VideoFormat = z.infer<typeof formatSchema>;
export type VideoInfo = z.infer<typeof videoInfoSchema>;
