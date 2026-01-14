"use client"

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useGoogleDrive } from "@/hooks/use-google-drive";

interface Props {
  downloadUrl: string;
  filename: string;
}

export default function SaveActions({ downloadUrl, filename }: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const { toast } = useToast();
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const { requestAccessToken } = useGoogleDrive(googleClientId);

  async function streamToFile() {
    setStatus("downloading");
    setProgress(0);

    try {
      const res = await fetch(downloadUrl);
      if (!res.body) throw new Error("No response body from server");

      const contentLength = Number(res.headers.get("content-length") || 0) || undefined;

      // File System Access API
      // @ts-ignore
      if ((window as any).showSaveFilePicker) {
        // @ts-ignore
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: filename,
          types: [
            { description: "MP4 Video", accept: { "video/mp4": [".mp4"] } },
          ],
        });
        const writable = await handle.createWritable();

        const reader = res.body.getReader();
        let received = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          await writable.write(value);
          received += value ? value.length : 0;
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
            chunks.push(value);
            received += value.length;
            if (contentLength) setProgress(Math.round((received / contentLength) * 100));
          }
        }
        const blob = new Blob(chunks, { type: "video/mp4" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
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

  async function uploadToDrive() {
    if (!googleClientId) {
      toast({ title: "Missing config", description: "Set NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable Drive uploads.", variant: "destructive" });
      return;
    }

    setStatus("uploading");
    setProgress(0);

    try {
      const token = await requestAccessToken();
      // collect into blob (note: memory heavy for large files)
      const res = await fetch(downloadUrl);
      if (!res.body) throw new Error("No response body from server");
      const reader = res.body.getReader();
      const chunks: Uint8Array[] = [];
      const contentLength = Number(res.headers.get("content-length") || 0) || undefined;
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          received += value.length;
          if (contentLength) setProgress(Math.round((received / contentLength) * 100));
        }
      }

      const fileBlob = new Blob(chunks, { type: "video/mp4" });

      // Multipart upload via XHR to track progress
      await new Promise<void>((resolve, reject) => {
        const boundary = "-------314159265358979323846";
        const metadata = { name: filename, mimeType: "video/mp4" };
        const part1 = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`;
        const part2Header = `--${boundary}\r\nContent-Type: video/mp4\r\n\r\n`;
        const end = `\r\n--${boundary}--`;

        const body = new Blob([part1, part2Header, fileBlob, end]);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart");
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.setRequestHeader("Content-Type", `multipart/related; boundary=${boundary}`);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const p = Math.round((e.loaded / e.total) * 100);
            setProgress(p);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            toast({ title: "Uploaded", description: "File uploaded to Google Drive.", variant: "default" });
            resolve();
          } else {
            reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));

        xhr.send(body);
      });

      setStatus("done");
    } catch (err: any) {
      console.error(err);
      toast({ title: "Upload failed", description: err?.message || "Error", variant: "destructive" });
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
          <DialogDescription>Select where to save or upload the video.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex gap-3 items-center">
            <Button onClick={streamToFile} disabled={status === "downloading"}>Save to device</Button>
            <span className="text-sm text-muted-foreground">Use File System Access API if available</span>
          </div>

          <div className="flex gap-3 items-center">
            <Button onClick={uploadToDrive} disabled={!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || status === "uploading"}>Upload to Google Drive</Button>
            {!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
              <span className="text-sm text-red-500">Set NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable</span>
            )}
          </div>

          {status && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">{status === "downloading" ? "Downloading..." : status === "uploading" ? "Uploading..." : status}</div>
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
