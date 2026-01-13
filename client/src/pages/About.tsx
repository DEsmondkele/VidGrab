import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function About() {
  return (
    <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-slate-500 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </div>

      <div className="prose prose-slate max-w-none">
        <h1 className="font-display text-4xl font-bold text-slate-900 mb-6">About VidGrab</h1>
        
        <p className="text-lg text-slate-600 leading-relaxed mb-8">
          VidGrab is a minimalist, high-performance video downloader designed for the modern web. 
          We believe that downloading content for personal archiving should be simple, fast, and 
          free of intrusive tracking.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Our Mission</h2>
        <p className="text-slate-600 mb-6">
          The internet is full of cluttered, ad-heavy downloaders that are confusing to use. 
          VidGrab strips away the noise. We focus on one thing: getting you the video file 
          you need, in the format you want, as quickly as possible.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Technology</h2>
        <p className="text-slate-600 mb-6">
          Built with the latest web technologies, VidGrab operates as a Progressive Web App (PWA). 
          This means you can install it on your device just like a native app, work offline, 
          and enjoy a responsive experience on any screen size.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Legal Disclaimer</h2>
        <p className="text-slate-600 mb-6">
          VidGrab is a tool provided "as is". We do not host any video content on our servers. 
          All videos are downloaded directly from their respective source servers. 
          Users are responsible for ensuring they have the right to download and use the content 
          in accordance with copyright laws and the terms of service of the hosting platforms.
        </p>
      </div>
    </main>
  );
}
