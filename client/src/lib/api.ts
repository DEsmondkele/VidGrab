import { urlInputSchema, videoInfoSchema } from './schemas';
import { z } from 'zod';
import type { UrlInput, VideoInfo } from './schemas';

const errorValidationSchema = z.object({ message: z.string() });
// Allow an optional `details` field for development-only debugging information
const errorServerSchema = z.object({ message: z.string(), details: z.string().optional() });

export const api = {
  info: {
    method: 'POST',
    path: '/api/info',
    input: urlInputSchema,
    responses: {
      200: videoInfoSchema,
      400: errorValidationSchema,
      500: errorServerSchema,
    },
  },
  download: {
    method: 'GET',
    path: '/api/download',
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type { UrlInput, VideoInfo };
