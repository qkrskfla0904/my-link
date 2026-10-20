import { SITE_CONFIG } from "@/constants";

export function Footer() {
  return (
    <footer className="w-full bg-carbon-halftone border-t-2 border-[#3d4f97] p-3 sm:p-4 text-center select-none">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 text-[10px] text-[#9fbee7]">
        {/* Left: Copyright & Notice */}
        <div className="text-center sm:text-left space-y-0.5 sm:space-y-1">
          <p className="font-bold text-white tracking-wide text-[10px] sm:text-[11px]">
            © 1997–2001 Nintendo / {SITE_CONFIG.name}. All Rights Reserved.
          </p>
          <p className="text-[#9fbee7] font-mono text-[8px] sm:text-[9px]">
            {SITE_CONFIG.description}
          </p>
        </div>

        {/* Right: ESRB Privacy-Certified Mark & ESRB Rating Square */}
        <div className="flex items-center gap-2 shrink-0">
          {/* ESRB Rating Square */}
          <div className="w-5 h-6 sm:w-6 sm:h-7 bg-white border border-[#21242e] flex flex-col items-center justify-center shadow-xs">
            <span className="text-[10px] sm:text-[12px] font-black text-[#21242e] leading-none">
              전체
            </span>
            <span className="text-[4.5px] sm:text-[5px] font-black text-[#21242e] tracking-tighter uppercase leading-none">
              이용가
            </span>
          </div>

          {/* ESRB Privacy Certified Badge */}
          <div className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-[#ecab37] border border-[#21242e] rounded-[2px] text-[#21242e] text-[8px] sm:text-[9px] font-black uppercase text-center shadow-xs whitespace-nowrap">
            <span>개인정보보호 안심 인증</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
