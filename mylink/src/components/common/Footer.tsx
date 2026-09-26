import { SITE_CONFIG } from "@/constants";

export function Footer() {
  return (
    <footer className="w-full bg-carbon-halftone border-t-2 border-[#3d4f97] p-4 text-center select-none">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-[#9fbee7]">
        {/* Left: Copyright & Notice */}
        <div className="text-left space-y-1">
          <p className="font-bold text-white tracking-wide">
            © 1997–2001 Nintendo / {SITE_CONFIG.name}. All Rights Reserved.
          </p>
          <p className="text-[#9fbee7] font-mono text-[9px]">
            {SITE_CONFIG.description}
          </p>
        </div>

        {/* Right: ESRB Privacy-Certified Mark & ESRB Rating Square */}
        <div className="flex items-center gap-2">
          {/* ESRB Rating Square */}
          <div className="w-6 h-7 bg-white border border-[#21242e] flex flex-col items-center justify-center shadow-xs">
            <span className="text-[12px] font-black text-[#21242e] leading-none">
              E
            </span>
            <span className="text-[5px] font-black text-[#21242e] tracking-tighter uppercase leading-none">
              EVERYONE
            </span>
          </div>

          {/* ESRB Privacy Certified Badge */}
          <div className="px-2 py-1 bg-[#ecab37] border border-[#21242e] rounded-[2px] text-[#21242e] text-[9px] font-black uppercase text-center shadow-xs">
            <span>ESRB — PRIVACY CERTIFIED</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
