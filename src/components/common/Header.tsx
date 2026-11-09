"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, LogIn, LogOut, Loader2, UserCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

function GoogleIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export function Header() {
  const { user, loading, loginWithGoogle, logout, error, clearError } = useAuth();

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch {
      // Handled in context
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Handled in context
    }
  };

  return (
    <header className="w-full bg-[#7a8aba] select-none">
      {/* Auth Error Banner if login fails */}
      {error && (
        <div className="w-full bg-[#e60012] text-white px-3 py-1 text-[10px] font-bold flex items-center justify-between border-b border-[#3d4f97]">
          <span>로그인 오류: {error}</span>
          <button
            onClick={clearError}
            className="text-white hover:text-black font-black px-1.5 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Masthead Row: Mascot, Logo, Search Module, and Google Auth Module */}
      <div className="px-2.5 sm:px-3 py-2 flex items-center justify-between gap-2 flex-wrap border-b border-[#3d4f97]">
        {/* Left: Mascot & Logo Pill */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Mario Mascot Sprite & Speech Bubble */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#e60012] border-2 border-white flex items-center justify-center text-white text-[11px] sm:text-xs font-black shadow-xs shrink-0">
              M
            </div>
            <div className="relative px-1.5 sm:px-2 py-0.5 bg-white border border-[#3d4f97] rounded-[4px] text-[9px] sm:text-[10px] font-bold text-[#21242e] shadow-xs whitespace-nowrap">
              {user
                ? `${user.displayName || "회원"}님 환영합니다!`
                : "마이링크에 오신 것을 환영합니다!"}
              {/* Bubble tail */}
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-0 h-0 border-t-[3px] border-t-transparent border-r-[4px] border-r-white border-b-[3px] border-b-transparent" />
            </div>
          </div>

          {/* Nintendo Red Racetrack Logo Pill */}
          <Link
            href="/"
            className="px-2.5 sm:px-3 py-0.5 bg-white border-2 border-[#e60012] rounded-full flex items-center justify-center hover:opacity-95 shadow-xs shrink-0"
          >
            <span className="text-[#e60012] font-black italic tracking-tighter text-xs sm:text-sm">
              Nintendo
            </span>
          </Link>
        </div>

        {/* Right: Google Social Login & Search Module */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          {/* Search Box */}
          <div className="hidden lg:flex items-center bg-white border border-[#3d4f97] nintendo-inset px-1.5 py-0.5 rounded-[2px]">
            <Search className="w-3 h-3 text-[#3d4f97] mr-1 shrink-0" />
            <input
              type="text"
              placeholder="검색..."
              className="w-20 text-[10px] font-medium text-[#21242e] outline-none bg-transparent"
            />
          </div>

          {/* Google Auth Status & Action Module */}
          <div className="flex items-center gap-1.5">
            {loading ? (
              <div className="flex items-center gap-1 px-2 py-1 bg-white/70 border border-[#3d4f97] rounded-[2px] text-[10px] font-bold text-[#3d4f97]">
                <Loader2 className="w-3 h-3 animate-spin text-[#f68d1f]" />
                <span>인증 확인 중...</span>
              </div>
            ) : user ? (
              /* Logged In State: User Pill with photo, display name, and Logout button */
              <div className="flex items-center gap-1.5 bg-white border-2 border-[#3d4f97] nintendo-plate px-2 py-0.5 rounded-[3px] shadow-xs">
                {/* User Avatar */}
                <div className="relative w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden border border-[#3d4f97] shrink-0 bg-[#e60012] text-white flex items-center justify-center text-[10px] font-bold">
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      fill
                      sizes="24px"
                      className="object-cover"
                    />
                  ) : (
                    <span>{(user.displayName || user.email || "U").slice(0, 1)}</span>
                  )}
                  <span className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-[#00ff66] rounded-full border border-white" />
                </div>

                {/* User Info Name & Firestore Path Pill */}
                <div className="flex flex-col text-left leading-tight max-w-[120px] sm:max-w-[150px]">
                  <span className="text-[10px] sm:text-[11px] font-black text-[#21242e] truncate">
                    {user.displayName || user.email?.split("@")[0] || "사용자"}
                  </span>
                  <span
                    className="text-[8px] font-mono text-[#10b981] font-bold truncate"
                    title={`users/${user.uid}/links`}
                  >
                    users/{user.uid.slice(0, 5)}...
                  </span>
                </div>

                {/* Logout Button */}
                <Button
                  onClick={handleLogout}
                  variant="nintendoGold"
                  size="sm"
                  title="로그아웃"
                  className="h-6 px-1.5 text-[9px] sm:text-[10px] font-black ml-1 flex items-center gap-1 bg-[#dedede] hover:bg-white text-[#21242e] border border-[#3d4f97]"
                >
                  <LogOut className="w-2.5 h-2.5 text-[#e60012]" />
                  <span>로그아웃</span>
                </Button>
              </div>
            ) : (
              /* Logged Out State: Google Social Login Button */
              <Button
                onClick={handleLogin}
                variant="nintendoPlate"
                size="sm"
                title="Google 소셜 로그인으로 나만의 링크 보관함 생성"
                className="h-7 px-2.5 text-[10px] sm:text-[11px] font-black tracking-tight bg-white hover:bg-[#fff9e6] border-2 border-[#3d4f97] shadow-sm flex items-center gap-1.5 text-[#21242e] active:scale-95 transition-all"
              >
                <GoogleIcon className="w-3.5 h-3.5 shrink-0" />
                <span>Google 로그인</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Primary Navigation: Carbon-Navy Command Bar (Matches WIREFRAME.md line 90) */}
      <div className="w-full bg-carbon-halftone border-y border-[#3d4f97] px-2.5 sm:px-3 py-1 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        {/* Nav Words glowing in Nav-Gold */}
        <nav className="flex items-center gap-3 sm:gap-5 shrink-0">
          {[
            { label: "GAMES", href: "#" },
            { label: "SYSTEMS", href: "#" },
            { label: "NEWS", href: "#" },
            { label: "NSIDER", href: "#" },
            { label: "DOWNLOADS", href: "#" },
          ].map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="text-[#e48600] hover:text-[#f68d1f] text-[11px] sm:text-xs font-bold uppercase tracking-[0.5px] whitespace-nowrap transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Status Indicator: [● LIVE HARDWARE HUB] */}
        <div className="flex items-center gap-1.5 shrink-0">
          {user ? (
            <div
              title={`개인화 저장소: users/${user.uid}/links`}
              className="flex items-center gap-1 bg-[#21242e] border border-[#10b981] px-2 py-0.5 rounded-[2px] text-[9px] font-mono font-bold text-[#10b981]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
              <span>LIVE HUB (users/{user.uid.slice(0, 4)}...)</span>
            </div>
          ) : (
            <div
              title="로그인 시 나만의 클라우드 허브가 활성화됩니다"
              className="flex items-center gap-1 bg-[#21242e] border border-[#f68d1f] px-2 py-0.5 rounded-[2px] text-[9px] font-mono font-bold text-[#f68d1f]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#f68d1f]" />
              <span>GUEST HUB (로그인 대기)</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Secondary Subnav Strip: Pale Sky with User Storage Path Info */}
      <div className="w-full bg-[#9fbee7] border-b-2 border-[#3d4f97] px-2.5 sm:px-3 py-1 flex items-center justify-between text-[9px] sm:text-[10px] font-bold text-[#21242e] uppercase tracking-wider whitespace-nowrap overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 shrink-0">
          <span>학부모 안내</span>
          <span className="text-[#60619c]">|</span>
          <span>고객지원</span>
          <span className="text-[#60619c]">|</span>
          <span>개인정보처리방침</span>
          <span className="text-[#60619c]">|</span>
          <span>문의하기</span>
        </div>

        {/* Path Display in Subnav */}
        <div className="flex items-center gap-1 font-mono text-[9px] text-[#3d4f97] shrink-0 ml-2">
          <ShieldCheck className="w-3 h-3 text-[#3d4f97]" />
          <span>경로:</span>
          <span className="bg-white/80 px-1 py-0.2 rounded border border-[#3d4f97]">
            {user ? `users/${user.uid}/links` : "users/{user.uid}/links (로그인 시 연동)"}
          </span>
        </div>
      </div>
    </header>
  );
}
