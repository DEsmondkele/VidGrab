import { z } from 'zod';
import { urlInputSchema, videoInfoSchema } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string() }),
  serverError: z.object({ message: z.string() }),
  notFound: z.object({ message: z.string() }),
};

export const api = {
  info: {
    method: 'POST' as const,
    path: '/api/info',
    input: urlInputSchema,
    responses: {
      200: videoInfoSchema,
      400: errorSchemas.validation,
      500: errorSchemas.serverError,
    },
  },
  download: {
    method: 'GET' as const,
    path: '/api/download', // URL params: url, format_id, title
    input: z.object({
      url: z.string(),
      format_id: z.string().optional(),
      title: z.string().optional()
    }).optional(),
    responses: {
      200: z.any(), // Stream
    },
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
