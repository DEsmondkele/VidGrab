import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Minimal table for logging downloads (lightweight usage)
export const downloads = pgTable("downloads", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDownloadSchema = createInsertSchema(downloads);
export type InsertDownload = z.infer<typeof insertDownloadSchema>;
export type Download = typeof downloads.$inferSelect;

// === API Schemas ===

// Input for fetching video info
export const urlInputSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL" }),
});

// Video format details
export const formatSchema = z.object({
  format_id: z.string(),
  ext: z.string(),
  resolution: z.string().optional(),
  filesize: z.number().optional().nullable(),
  vcodec: z.string().optional(),
  acodec: z.string().optional(),
  note: z.string().optional(), // e.g. "720p"
});

// Full video metadata
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
