interface AdPlaceholderProps {
  className?: string;
  size?: "banner" | "rectangle";
}

export function AdPlaceholder({ className = "", size = "banner" }: AdPlaceholderProps) {
  const heightClass = size === "banner" ? "h-24 md:h-32" : "h-64";

  return (
    <div className={`w-full ${heightClass} bg-slate-50 border border-slate-100 rounded-xl overflow-hidden relative ${className}`}>
      <div className="absolute inset-0 bg-grid-pattern opacity-50" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
        <span className="text-xs font-mono uppercase tracking-widest mb-1">Advertisement</span>
        <span className="text-[10px] text-slate-200">Ad Space Available</span>
      </div>
    </div>
  );
}
