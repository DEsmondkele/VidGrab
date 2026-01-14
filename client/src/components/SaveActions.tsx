"use client"

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface Props {
  downloadUrl: string;
  filename: string;
}

export default function SaveActions({ downloadUrl, filename }: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const { toast } = useToast();

  async function streamToFile() {
    setStatus("downloading");
    setProgress(0);

    try {
      const res = await fetch(downloadUrl);
      if (!res.body) throw new Error("No response body from server");

      const contentLength = Number(res.headers.get("content-length") || 0) || undefined;
      const contentType = res.headers.get("content-type") || undefined;
      const contentDisposition = res.headers.get("content-disposition") || undefined;

      const extFromHeaders = () => {
        if (contentDisposition) {
          const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/.exec(contentDisposition);
          if (match && match[1]) {
            const name = decodeURIComponent(match[1]);
            const m = name.match(/\.([a-z0-9]{1,6})(?:\?.*)?$/i);
            if (m) return m[1];
          }
        }

        if (contentType) {
          const mime = contentType.split(";")[0].trim().toLowerCase();
          const map: Record<string, string> = {
            "video/mp4": "mp4",
            "video/webm": "webm",
            "audio/webm": "webm",
            "audio/mpeg": "mp3",
            "audio/mp4": "m4a",
            "video/ogg": "ogv",
            "application/x-mpegurl": "m3u8",
            "application/octet-stream": "bin",
          };
          if (map[mime]) return map[mime];
          const parts = mime.split("/");
          if (parts[1]) return parts[1].replace(/[+].*$/g, "");
        }

        return undefined;
      };

      const ensureHasExt = (name: string, ext?: string) => {
        if (!ext) return name;
        if (/\.[a-z0-9]{1,6}$/i.test(name)) return name;
        return `${name}.${ext}`;
      };

      const detectedExt = extFromHeaders();
      const finalFilename = ensureHasExt(filename, detectedExt || undefined);

      // File System Access API
      // @ts-ignore
      if ((window as any).showSaveFilePicker) {
        // @ts-ignore
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: finalFilename,
          types: [
            { description: "Video", accept: { [contentType || "video/mp4"]: [`.${detectedExt || "mp4"}`] } },
          ],
        });
        const writable = await handle.createWritable();

        const reader = res.body.getReader();
        let received = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          await writable.write(value as any);
          received += value ? (value as Uint8Array).length : 0;
          if (contentLength) setProgress(Math.round((received / contentLength) * 100));
        }

        await writable.close();
        setProgress(100);
        toast({ title: "Saved", description: "File saved to your chosen location.", variant: "default" });
      } else {
        // Fallback: collect blob and trigger browser download
        const chunks: Uint8Array[] = [];
        const reader = res.body.getReader();
        let received = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value as Uint8Array);
            received += (value as Uint8Array).length;
            if (contentLength) setProgress(Math.round((received / contentLength) * 100));
          }
        }
        const blob = new Blob(chunks as BlobPart[], { type: contentType || "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = finalFilename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        setProgress(100);
        toast({ title: "Download started", description: "Browser download initiated.", variant: "default" });
      }

      setStatus("done");
    } catch (err: any) {
      console.error(err);
      toast({ title: "Download failed", description: err?.message || "Error", variant: "destructive" });
      setStatus("error");
    }
  }



  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) { setStatus(null); setProgress(0); } }}>
      <DialogTrigger asChild>
        <Button size="sm" className="px-5 py-2.5">Download</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save "{filename.replace(/\.[^.]+$/, "")}"</DialogTitle>
          <DialogDescription>Select where to save the video.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex gap-3 items-center">
            <Button onClick={streamToFile} disabled={status === "downloading"}>Save to device</Button>
            <span className="text-sm text-muted-foreground">Use File System Access API if available</span>
          </div>



          {status && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">{status === "downloading" ? "Downloading..." : status === "done" ? "Saved" : status === "error" ? "Failed" : status}</div>
                <div className="text-sm font-medium">{progress}%</div>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
