import { useMutation } from "@tanstack/react-query";
import { api, type UrlInput, type VideoInfo } from "@/lib/api";

export function useVideoInfo() {
  return useMutation({
    mutationFn: async (data: UrlInput) => {
      // Validate input client-side before sending
      const validatedInput = api.info.input.parse(data);

      const res = await fetch(api.info.path, {
        method: api.info.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedInput),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.info.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        if (res.status === 500) {
          const error = api.info.responses[500].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to fetch video information");
      }

      return api.info.responses[200].parse(await res.json());
    },
  });
}

export function getDownloadUrl(url: string, formatId?: string, title?: string) {
  const params = new URLSearchParams();
  params.append("url", url);
  if (formatId) params.append("format_id", formatId);
  if (title) params.append("title", title);
  return `${api.download.path}?${params.toString()}`;
}

export function getStreamFetchOptions(url: string, formatId?: string, title?: string) {
  const params = new URLSearchParams();
  params.append("url", url);
  if (formatId) params.append("format_id", formatId);
  if (title) params.append("title", title);
  return `${api.download.path}?${params.toString()}`;
}
