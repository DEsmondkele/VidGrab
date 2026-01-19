'use client';

import { useState } from "react";
import { useVideoInfo, getDownloadUrl, getStreamFetchOptions } from "@/hooks/use-video";
import { AdPlaceholder } from "@/components/AdPlaceholder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  Link2, 
  Download, 
  Clock, 
  User, 
  FileVideo, 
  CheckCircle, 
  AlertCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const ImportLoadSaveActions = dynamic(() => import('@/components/SaveActions').then((m) => m.default), { ssr: false });

export default function Home() {
  const [url, setUrl] = useState("");
  const { mutate: fetchInfo, data: videoInfo, isPending, error, reset } = useVideoInfo();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    // Simple reset if needed
    if (videoInfo) reset();

    fetchInfo({ url }, {
      onError: (err) => {
        toast({
          title: "Error fetching video",
          description: err.message,
          variant: "destructive",
        });
      }
    });
  };

  // Helper to format duration
  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  // Helper to format filesize
  const formatSize = (bytes?: number | null) => {
    if (!bytes) return "Unknown size";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 md:py-16 flex flex-col items-center gap-12">
      
      {/* Hero Section */}
      <section className="text-center space-y-6 w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight">
          Download Videos <br />
          <span className="text-primary">In Seconds</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-xl mx-auto">
          Paste a link from your favorite video platform and get high-quality video files instantly. No registration required.
        </p>

        {/* Top Ad */}
        <div className="py-4">
          <AdPlaceholder size="banner" className="max-w-2xl mx-auto" />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto mt-8 group">
          <div className="relative flex items-center">
            <Link2 className="absolute left-4 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste video URL here..."
              className="pl-12 pr-32 py-8 rounded-2xl border-2 text-lg shadow-sm hover:border-primary/50 focus-visible:ring-0 focus-visible:border-primary transition-all"
              disabled={isPending}
            />
            <div className="absolute right-2 top-2 bottom-2">
              <Button 
                type="submit" 
                size="lg" 
                className="h-full px-8 rounded-xl text-base font-semibold shadow-md shadow-primary/20"
                disabled={isPending || !url}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  "Download"
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Supported Platforms (Visual only) */}
        <div className="pt-8 flex flex-wrap justify-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          {["YouTube", "Vimeo", "TikTok", "Twitter", "Facebook"].map((platform) => (
            <span key={platform} className="text-sm font-semibold text-slate-400">
              {platform}
            </span>
          ))}
        </div>
      </section>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600"
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold">Failed to fetch video</h3>
              <p className="text-sm opacity-90">{error.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Section */}
      <AnimatePresence>
        {videoInfo && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl space-y-8"
          >
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              {/* Video Header Info */}
              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 border-b border-slate-100">
                <div className="relative w-full md:w-72 aspect-video bg-slate-100 rounded-xl overflow-hidden shrink-0 group shadow-md">
                  {videoInfo.thumbnail ? (
                    <img 
                      src={videoInfo.thumbnail} 
                      alt={videoInfo.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <FileVideo className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>

                <div className="flex-1 space-y-4">
                  <h2 className="text-2xl font-bold text-slate-900 line-clamp-2 leading-tight">
                    {videoInfo.title}
                  </h2>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    {videoInfo.duration && (
                      <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>{formatDuration(videoInfo.duration)}</span>
                      </div>
                    )}
                    {videoInfo.uploader && (
                      <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg">
                        <User className="w-4 h-4 text-primary" />
                        <span>{videoInfo.uploader}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-green-600 text-sm font-medium pt-2">
                    <CheckCircle className="w-4 h-4" />
                    Video ready for download
                  </div>
                </div>
              </div>

              {/* Interstitial Ad */}
              <div className="bg-slate-50/50 p-4 border-b border-slate-100">
                <AdPlaceholder size="banner" className="h-20" />
              </div>

              {/* Formats List */}
              <div className="p-6 md:p-8 bg-slate-50/30">
                <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
                  <Download className="w-5 h-5 text-primary" />
                  Available Formats
                </h3>
                
                <div className="grid gap-3">
                  {videoInfo.formats
                    .filter(f => f.vcodec !== 'none' && f.acodec !== 'none') // Filter simple formats
                    .slice(0, 5) // Limit to top 5 for cleaner UI
                    .map((format, idx) => {
                      const sanitize = (name?: string) => (name || "video").replace(/[\\/:*?"<>|]/g, "_").trim().slice(0, 200);
                      const filename = `${sanitize(videoInfo.title)}.${format.ext || 'mp4'}`;
                      const downloadUrl = getStreamFetchOptions(url, format.format_id, videoInfo.title);
                      return (
                      <div 
                        key={`${format.format_id}-${idx}`}
                        className="group flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-primary/50 hover:shadow-md transition-all duration-200"
                      >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                          {format.ext.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {format.note || format.resolution || "Standard Quality"}
                          </p>
                          <p className="text-sm text-slate-500">
                            {formatSize(format.filesize)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* SaveActions modal with stream download URL & filename */}
                        <ImportLoadSaveActions downloadUrl={downloadUrl} filename={filename} />
                      </div>
                    </div>
                      );
                    })
                  }
                  
                  {videoInfo.formats.length === 0 && (
                     <div className="text-center py-8 text-slate-500">
                        No direct download formats found. 
                        <a href={videoInfo.webpage_url} target="_blank" rel="noreferrer" className="text-primary hover:underline ml-1">
                          Open Original Link
                        </a>
                     </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="text-center text-xs text-slate-400 px-4">
              By downloading, you agree to our Terms of Service. Please respect copyright laws.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Features Grid (SEO/Trust) */}
      {!videoInfo && (
        <section className="grid md:grid-cols-3 gap-8 w-full py-12 border-t border-slate-100">
          {[
            { title: "Fast Downloads", desc: "Our optimized servers ensure you get your files at maximum speed." },
            { title: "No Registration", desc: "Start downloading immediately. No sign-up or personal info needed." },
            { title: "Secure & Free", desc: "We don't store your history. 100% free for personal use." }
          ].map((feature, i) => (
            <div key={i} className="text-center space-y-3 p-4">
              <div className="w-12 h-12 mx-auto bg-blue-50 text-primary rounded-xl flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900">{feature.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
