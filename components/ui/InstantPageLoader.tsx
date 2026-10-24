export function InstantPageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xs text-white">
      {/* Sleek Top Infinite Progress Ribbon */}
      <div className="fixed top-0 inset-x-0 h-1 bg-neutral-900 overflow-hidden">
        <div className="h-full bg-[#FAFF00] animate-pulse w-full" />
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-white/20 border-t-[#FAFF00] rounded-full animate-spin" />
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#FAFF00]">
          Loading...
        </span>
      </div>
    </div>
  );
}
