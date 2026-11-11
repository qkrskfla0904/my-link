"use client";

import { useState } from "react";
import { UserProfile, ThemeAccent } from "@/types";
import { useAuth } from "@/context/AuthContext";
import {
  Heart,
  Share2,
  Globe,
  Mail,
  BookOpen,
  UserCog,
  Check,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const THEME_PALETTES: Record<
  ThemeAccent,
  {
    name: string;
    bg: string;
    gradient: string;
    border: string;
    accent: string;
    chipBg: string;
    textColor: string;
  }
> = {
  violet: {
    name: "라벤더",
    bg: "#8ba1d4",
    gradient: "linear-gradient(135deg, #9bb2e5 0%, #7d94c9 100%)",
    border: "#3d4f97",
    accent: "#f68d1f",
    chipBg: "#21242e",
    textColor: "#21242e",
  },
  emerald: {
    name: "에메랄드",
    bg: "#247185",
    gradient: "linear-gradient(135deg, #2b849c 0%, #1c5d6e 100%)",
    border: "#12424f",
    accent: "#00ff66",
    chipBg: "#0f313a",
    textColor: "#ffffff",
  },
  rose: {
    name: "게임레드",
    bg: "#b53034",
    gradient: "linear-gradient(135deg, #c7373b 0%, #9e2528 100%)",
    border: "#5c1315",
    accent: "#ecab37",
    chipBg: "#3b0c0d",
    textColor: "#ffffff",
  },
  sky: {
    name: "아이스블루",
    bg: "#9cbfe3",
    gradient: "linear-gradient(135deg, #add0f2 0%, #89add4 100%)",
    border: "#4b7ab0",
    accent: "#1e40af",
    chipBg: "#1e3a5f",
    textColor: "#21242e",
  },
  amber: {
    name: "골드",
    bg: "#efa938",
    gradient: "linear-gradient(135deg, #f7b74f 0%, #e09622 100%)",
    border: "#8c6014",
    accent: "#e60012",
    chipBg: "#4a330a",
    textColor: "#21242e",
  },
};

interface ProfileHeaderProps {
  profile: UserProfile;
  theme: ThemeAccent;
  onOpenShareModal: () => void;
  onLikeChange?: (newLikes: number) => void;
  onOpenEditProfile?: () => void;
  onSelectTheme?: (newTheme: ThemeAccent) => void;
}

function GithubSmallIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinSmallIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export function ProfileHeader({
  profile,
  theme,
  onOpenShareModal,
  onLikeChange,
  onOpenEditProfile,
  onSelectTheme,
}: ProfileHeaderProps) {
  const { user } = useAuth();
  const [likesCount, setLikesCount] = useState(profile.stats?.likes ?? 0);
  const [hasLiked, setHasLiked] = useState(false);

  const currentThemeInfo = THEME_PALETTES[theme] || THEME_PALETTES.violet;

  const handleLike = () => {
    const updated = hasLiked ? likesCount - 1 : likesCount + 1;
    setLikesCount(updated);
    setHasLiked(!hasLiked);
    if (onLikeChange) {
      onLikeChange(updated);
    }
  };

  const displayName = profile.displayName || user?.displayName || "마이링크 사용자";
  const avatarSrc = profile.avatarUrl || user?.photoURL || "/profile.jpg";
  const bioText = profile.bio;

  // Filter SNS links
  const snsLinks = (profile.links || [])
    .filter(
      (l) =>
        ["github", "blog", "linkedin", "mail", "globe", "youtube", "twitter"].includes(
          l.icon || ""
        ) || l.category === "SNS"
    )
    .slice(0, 5);

  return (
    <div
      className="w-full rounded-[4px] border-2 shadow-lg transition-all duration-300 overflow-hidden relative"
      style={{
        background: currentThemeInfo.gradient,
        borderColor: currentThemeInfo.border,
      }}
    >
      {/* Top Subtle Nintendo Cartridge Vent Lines */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-black/15 flex justify-center gap-1.5 pt-0.5 pointer-events-none">
        <span className="w-8 h-0.5 bg-white/40 rounded-full" />
        <span className="w-8 h-0.5 bg-white/40 rounded-full" />
        <span className="w-8 h-0.5 bg-white/40 rounded-full" />
      </div>

      {/* 1. Header Utility Bar: Theme Color Selector & Quick Actions */}
      <div className="px-3 sm:px-4 py-2 bg-[#21242e] flex items-center justify-between flex-wrap gap-2 text-white border-b-2 border-black/20">
        {/* Color Palette Buttons */}
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-black uppercase tracking-wider text-[#ecab37] flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-[#ecab37]" />
            THEME:
          </span>
          {(Object.keys(THEME_PALETTES) as ThemeAccent[]).map((themeKey) => {
            const p = THEME_PALETTES[themeKey];
            const isSelected = theme === themeKey;
            return (
              <button
                key={themeKey}
                type="button"
                onClick={() => onSelectTheme?.(themeKey)}
                title={p.name}
                className={`w-5 h-5 rounded-[2px] transition-all duration-150 cursor-pointer flex items-center justify-center border ${
                  isSelected
                    ? "border-white ring-2 ring-[#f68d1f] scale-110 shadow-sm"
                    : "border-black/50 opacity-75 hover:opacity-100 hover:scale-105"
                }`}
                style={{ backgroundColor: p.bg }}
              >
                {isSelected && <Check className="w-3 h-3 text-white drop-shadow stroke-[3]" />}
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 ml-auto">
          {onOpenEditProfile && (
            <Button
              onClick={onOpenEditProfile}
              size="sm"
              variant="nintendoPlate"
              className="h-6 px-2.5 text-[10px] font-black bg-white hover:bg-[#dedede] text-[#21242e] flex items-center gap-1 shadow-xs cursor-pointer border border-[#3d4f97]"
            >
              <UserCog className="w-3 h-3 text-[#f68d1f]" />
              <span>프로필 수정</span>
            </Button>
          )}

          <Button
            onClick={handleLike}
            size="sm"
            variant="nintendoPlate"
            className="h-6 px-2 text-[10px] font-black bg-white hover:bg-[#dedede] text-[#21242e] shadow-xs flex items-center gap-1 cursor-pointer border border-[#3d4f97]"
          >
            <Heart className={`w-3 h-3 ${hasLiked ? "fill-[#e60012] text-[#e60012]" : "text-[#e60012]"}`} />
            <span>{likesCount}</span>
          </Button>

          <Button
            onClick={onOpenShareModal}
            size="sm"
            variant="nintendoCarbon"
            className="h-6 px-2.5 text-[10px] font-black text-white shadow-xs flex items-center gap-1 cursor-pointer border border-white/20"
          >
            <Share2 className="w-3 h-3 text-[#f68d1f]" />
            <span>공유</span>
          </Button>
        </div>
      </div>

      {/* 2. Main Profile Content Body */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6">
        {/* Retro Beveled Game Screen Frame for Avatar */}
        <div className="relative shrink-0">
          <div className="w-22 h-22 sm:w-26 sm:h-26 nintendo-plate p-1 bg-[#21242e] border-2 border-white shadow-lg rounded-[3px] flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarSrc}
              alt={displayName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-[2px]"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.endsWith("/profile.jpg")) {
                  target.src = "/profile.jpg";
                }
              }}
            />
          </div>

          {/* Glowing Green Power LED Badge */}
          <div className="absolute -bottom-1 -right-1">
            <span className="inline-flex items-center gap-1 text-[8px] font-mono font-black bg-[#21242e] text-[#00ff66] px-1.5 py-0.5 rounded-[2px] border border-[#00ff66] shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-ping" />
              PLAYER 1
            </span>
          </div>
        </div>

        {/* Profile Info & RPG Dialog Bubble */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Display Name with Retro Boxart Styling */}
          <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black nintendo-boxart-text tracking-tight break-keep">
              {displayName}
            </h1>
            <span className="text-[9px] font-mono font-bold bg-[#21242e] text-[#ecab37] px-2 py-0.5 rounded-[2px] shadow-xs border border-white/20">
              LV.99
            </span>
          </div>

          {/* RPG Style Dialog Box for Bio */}
          {bioText && (
            <div className="relative bg-white/90 border-2 border-[#21242e] p-2.5 sm:p-3 rounded-[3px] shadow-sm max-w-xl text-left">
              <p className="text-xs sm:text-[13px] font-bold text-[#21242e] leading-relaxed break-keep">
                {bioText}
              </p>
              {/* Little retro bubble triangle pointing towards avatar */}
              <div className="hidden sm:block absolute top-3 -left-2 w-0 h-0 border-t-[6px] border-t-transparent border-r-[8px] border-r-[#21242e] border-b-[6px] border-b-transparent" />
            </div>
          )}

          {/* Specialty Stickers / Tags */}
          {profile.tags && profile.tags.length > 0 && (
            <div className="flex items-center justify-center sm:justify-start gap-1.5 pt-0.5 flex-wrap">
              {profile.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-[2px] bg-[#21242e] text-[#00ff66] text-[9px] sm:text-[10px] font-mono font-bold shadow-xs border border-white/10"
                >
                  #{tag.replace(/^#/, "")}
                </span>
              ))}
            </div>
          )}

          {/* Social Icons Bar (D-Pad Style) */}
          {snsLinks.length > 0 && (
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1.5">
              <span className="text-[9px] font-black uppercase text-white/90 drop-shadow-sm mr-0.5">
                CONNECT:
              </span>
              {snsLinks.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={item.title}
                  className="w-7 h-7 rounded-[3px] bg-white hover:bg-[#dedede] text-[#21242e] border-2 border-[#21242e] flex items-center justify-center shadow-xs transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  {item.icon === "github" ? (
                    <GithubSmallIcon />
                  ) : item.icon === "linkedin" ? (
                    <LinkedinSmallIcon />
                  ) : item.icon === "mail" || item.icon === "send" ? (
                    <Mail className="w-3.5 h-3.5 text-[#3d4f97]" />
                  ) : item.icon === "blog" ? (
                    <BookOpen className="w-3.5 h-3.5 text-[#3d4f97]" />
                  ) : (
                    <Globe className="w-3.5 h-3.5 text-[#3d4f97]" />
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
