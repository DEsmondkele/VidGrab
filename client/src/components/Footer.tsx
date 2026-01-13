import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-slate-50 border-t border-slate-100 py-12 mt-auto">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-display font-bold text-lg mb-4 text-slate-900">VidGrab</h3>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              The simplest way to download videos from the web. Fast, free, and secure. Built for speed and simplicity.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">DMCA</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Disclaimer</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              VidGrab is a tool for downloading personal content. We do not support piracy or downloading copyrighted material without permission. Please use responsibly.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} VidGrab. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-400 fill-red-400" />
            <span>for the web</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
