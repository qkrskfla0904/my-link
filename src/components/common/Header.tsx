"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  LogOut,
  Loader2,
  User,
  Home,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useProfile";

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
  const { user, loading, loginWithGoogle, logout } = useAuth();
  const { data: userProfile } = useUserProfile(user?.uid);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentDisplayName =
    userProfile?.displayName || user?.displayName || (user?.email ? user.email.split("@")[0] : "사용자");

  const personalPageHref = `/${encodeURIComponent(currentDisplayName)}`;

  // Close dropdown on click outside or ESC
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch {
      // Error handled in AuthContext
    }
  };

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    try {
      await logout();
    } catch {
      // Error handled in AuthContext
    }
  };

  return (
    <header className="w-full bg-[#dedede] border-b-2 border-[#3d4f97] sticky top-0 z-50 shadow-sm">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-1.5 sm:py-2 flex items-center justify-between gap-3">
        {/* Left: Classic Nintendo Pill Logo & Service Title */}
        <div className="flex items-center gap-2">
          {/* Classic Nintendo Red Pill Logo */}
          <Link
            href="/"
            className="px-2.5 sm:px-3 py-0.5 bg-white border-2 border-[#e60012] rounded-full flex items-center justify-center hover:opacity-95 shadow-xs shrink-0"
          >
            <span className="text-[#e60012] font-black italic tracking-tighter text-xs sm:text-sm">
              Nintendo
            </span>
          </Link>

          <Link href="/" className="flex items-center gap-1 hover:opacity-90">
            <span className="font-black text-sm sm:text-base text-[#21242e] tracking-tight">
              MYLINK<span className="text-[#e60012]">.</span>
            </span>
            <span className="hidden sm:inline-block text-[9px] font-mono font-bold bg-[#21242e] text-[#00ff66] px-1 py-0.2 rounded-[2px]">
              SYSTEM
            </span>
          </Link>
        </div>

        {/* Right: Navigation & User Controls */}
        <div className="flex items-center gap-2">
          {/* Direct "My Page" Shortcut Button (only when logged in) */}
          {user && (
            <Link
              href={personalPageHref}
              title="내 개인 페이지 바로가기"
              className="h-6 sm:h-7 px-2 sm:px-2.5 text-[10px] sm:text-xs font-black bg-[#f68d1f] hover:bg-[#ff9d33] text-white border border-[#3d4f97] rounded-[2px] shadow-xs flex items-center gap-1 transition-all active:scale-95"
            >
              <User className="w-3 h-3 stroke-[2.5]" />
              <span>내 페이지</span>
            </Link>
          )}

          {/* User Auth Section */}
          <div className="relative" ref={dropdownRef}>
            {loading ? (
              <div className="h-6 sm:h-7 px-2.5 bg-white border border-[#3d4f97] rounded-[2px] flex items-center gap-1 text-[10px] text-[#3d4f97] font-bold">
                <Loader2 className="w-3 h-3 animate-spin text-[#f68d1f]" />
                <span>확인 중...</span>
              </div>
            ) : user ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="h-6 sm:h-7 px-2 bg-white hover:bg-[#dedede] border border-[#3d4f97] rounded-[2px] flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={user.photoURL || "/profile.jpg"}
                    alt={currentDisplayName}
                    referrerPolicy="no-referrer"
                    className="w-4 h-4 rounded-full object-cover shrink-0 border border-[#3d4f97]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/profile.jpg";
                    }}
                  />
                  <span className="text-[11px] sm:text-xs font-black text-[#21242e] max-w-[80px] sm:max-w-[120px] truncate">
                    {currentDisplayName}
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#60619c]" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border-2 border-[#3d4f97] shadow-lg rounded-[2px] p-1.5 z-50 text-xs">
                    <div className="p-2 border-b border-[#3d4f97]/20">
                      <p className="font-black text-[#21242e] truncate">{currentDisplayName}</p>
                      <p className="text-[9px] text-[#60619c] font-mono truncate">{user.email}</p>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <Link
                        href={personalPageHref}
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2 p-1.5 rounded hover:bg-[#dedede] font-bold text-[#21242e]"
                      >
                        <User className="w-3.5 h-3.5 text-[#f68d1f]" />
                        <span>내 페이지 방문</span>
                      </Link>

                      <Link
                        href="/"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2 p-1.5 rounded hover:bg-[#dedede] font-bold text-[#21242e]"
                      >
                        <Home className="w-3.5 h-3.5 text-[#3d4f97]" />
                        <span>대시보드 홈</span>
                      </Link>
                    </div>

                    <div className="border-t border-[#3d4f97]/20 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-[#e60012]/10 text-[#e60012] font-bold text-left cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>로그아웃</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Button
                onClick={handleLogin}
                size="sm"
                variant="nintendoOrange"
                className="h-6 sm:h-7 px-2.5 text-[10px] sm:text-xs font-black shadow-xs flex items-center gap-1.5"
              >
                <GoogleIcon className="w-3.5 h-3.5 shrink-0" />
                <span>Google 로그인</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
