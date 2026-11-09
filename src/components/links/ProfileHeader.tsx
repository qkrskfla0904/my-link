"use client";

import { useState } from "react";
import Image from "next/image";
import { UserProfile, ThemeAccent } from "@/types";
import { useAuth } from "@/context/AuthContext";
import {
  Heart,
  ChevronRight,
  Share2,
  Activity,
  Coffee,
  Globe,
  Mail,
  BookOpen,
  Database,
  LogIn,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ProfileHeaderProps {
  profile: UserProfile;
  theme: ThemeAccent;
  onOpenShareModal: () => void;
  onLikeChange?: (newLikes: number) => void;
  onOpenEditProfile?: () => void;
}

const themeBackgrounds: Record<ThemeAccent, string> = {
  violet: "bg-[#acace7]", // Home Lavender
  emerald: "bg-[#206479]", // Systems Teal
  rose: "bg-[#a7282b]", // Games Red
  sky: "bg-[#c0d5e6]", // News Ice
  amber: "bg-[#ecab37]", // Classic Gold
};

function GoogleIcon({ className = "w-3 h-3" }: { className?: string }) {
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

function GithubSmallIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinSmallIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
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
}: ProfileHeaderProps) {
  const { user, loginWithGoogle } = useAuth();
  const [likesCount, setLikesCount] = useState(profile.stats?.likes ?? 245);
  const [hasLiked, setHasLiked] = useState(false);
  const heroBg = themeBackgrounds[theme] || themeBackgrounds.violet;

  const handleLike = () => {
    const updated = hasLiked ? likesCount - 1 : likesCount + 1;
    setLikesCount(updated);
    setHasLiked(!hasLiked);
    if (onLikeChange) {
      onLikeChange(updated);
    }
  };

  // Quick SNS Links from profile links
  const snsLinks = profile.links.filter(
    (l) => ["github", "blog", "linkedin", "mail", "globe", "youtube", "twitter"].includes(l.icon || "") || l.category === "SNS"
  ).slice(0, 5);

  // Dynamic user data: profile fields take precedence (custom profile updates), then user fallback
  const displayName = profile.displayName || (user ? user.displayName : "사용자") || "사용자";
  const username = user
    ? (user.email ? user.email.split("@")[0] : `user_${user.uid.slice(0, 6)}`)
    : profile.username;
  const avatarSrc = profile.avatarUrl || (user ? user.photoURL : undefined);
  const bioText = profile.bio;

  return (
    <div className="w-full mb-3 sm:mb-4">
      {/* 1. Hero Field Panel: Beveled Hardware Frame with Theme Tint */}
      <div className={`w-full ${heroBg} nintendo-plate p-3 sm:p-5 relative overflow-hidden transition-colors duration-300`}>
        {/* Background Subtle Circuit / Grid overlay */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:16px_16px]" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
          {/* shadcn/ui Avatar Component */}
          <div className="relative shrink-0">
            <Avatar className="w-20 h-20 sm:w-28 sm:h-28 shadow-md rounded-none border-2 border-white bg-[#dedede]">
              {avatarSrc && (
                <AvatarImage
                  src={avatarSrc}
                  alt={displayName}
                  className="object-cover"
                />
              )}
              <AvatarFallback className="rounded-none font-black text-xl sm:text-2xl bg-[#e60012] text-white">
                {displayName.slice(0, 1)}
              </AvatarFallback>
            </Avatar>

            {/* LED Status Indicator */}
            {user ? (
              <div className="absolute -bottom-1 -right-1">
                <Badge variant="nintendoOnline" className="text-[7px] sm:text-[8px] px-1 sm:px-1.5 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-ping shrink-0" />
                  온라인
                </Badge>
              </div>
            ) : (
              <div className="absolute -bottom-1 -right-1">
                <Badge variant="nintendoGold" className="text-[7px] sm:text-[8px] px-1 sm:px-1.5 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f68d1f] shrink-0" />
                  게스트
                </Badge>
              </div>
            )}
          </div>

          {/* Profile Details & Box-Art Wordmark */}
          <div className="flex-1 text-center sm:text-left min-w-0 w-full">
            {/* Status & Personalized Path Badges */}
            <div className="mb-1 flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
              <Badge variant="nintendoCarbon" className="text-[8px] sm:text-[9px]">
                <Activity className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#f68d1f] shrink-0" />
                <span>{profile.statusMessage || "개발자 프로필 허브"}</span>
              </Badge>

              {profile.isAvailableForHire && (
                <Badge variant="nintendoOnline" className="text-[8px] sm:text-[9px] flex items-center gap-1 font-mono">
                  <Coffee className="w-2.5 h-2.5 text-[#00ff66]" />
                  <span>커피챗/제안 환영</span>
                </Badge>
              )}

              {user ? (
                <Badge
                  variant="nintendoOnline"
                  className="text-[8px] sm:text-[9px] flex items-center gap-1 font-mono"
                  title={`Firestore: users/${user.uid}/links`}
                >
                  <Database className="w-2.5 h-2.5 text-[#00ff66]" />
                  <span>users/{user.uid.slice(0, 6)}.../links</span>
                </Badge>
              ) : (
                <Badge variant="nintendoGold" className="text-[8px] sm:text-[9px] flex items-center gap-1">
                  <Coffee className="w-2.5 h-2.5" />
                  <span>게스트 모드 (로그인 시 개인화)</span>
                </Badge>
              )}
            </div>

            {/* Chunky Box-Art Display Title & Quick Edit Button */}
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h1 className="text-xl sm:text-3xl font-black nintendo-boxart-text tracking-tight break-keep">
                {displayName}
              </h1>
              {onOpenEditProfile && (
                <Button
                  onClick={onOpenEditProfile}
                  variant="nintendoOrange"
                  size="sm"
                  className="h-6 px-2 text-[9px] sm:text-[10px] font-black tracking-tight bg-[#f68d1f] hover:bg-[#ff9d33] flex items-center gap-1 shadow-xs cursor-pointer"
                  title="프로필 수정 (닉네임 중복 확인 지원)"
                >
                  <UserCog className="w-3 h-3" />
                  <span>프로필 수정</span>
                </Button>
              )}
            </div>

            {/* Handle & User Email / Firestore Info */}
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <p className="text-[11px] sm:text-xs font-bold text-white/95 font-mono drop-shadow-sm mt-0.5">
                @{username}
              </p>
              {user && (
                <span className="text-[10px] text-white/80 font-mono bg-black/30 px-1.5 py-0.2 rounded">
                  {user.email}
                </span>
              )}
            </div>

            {/* Bio */}
            {bioText && (
              <p className="text-[11px] sm:text-xs text-white/90 font-medium mt-1.5 sm:mt-2 leading-relaxed bg-[#21242e]/40 p-1.5 sm:p-2 border-l-2 border-[#f68d1f] break-keep text-left">
                {bioText}
              </p>
            )}

            {/* Specialty Tags */}
            <div className="flex items-center justify-center sm:justify-start gap-1 mt-2 flex-wrap">
              {(profile.tags && profile.tags.length > 0
                ? profile.tags
                : ["💻 프론트엔드", "🚀 NEXT.JS & REACT"]
              ).map((tag, idx) => (
                <Badge
                  key={idx}
                  variant="default"
                  className="text-[9px] sm:text-[10px] bg-[#dedede] text-[#21242e] border-[#3d4f97]"
                >
                  {tag}
                </Badge>
              ))}

              {!user && (
                <Button
                  onClick={() => loginWithGoogle()}
                  size="sm"
                  variant="nintendoOrange"
                  className="h-5 px-2 text-[9px] font-black tracking-tight"
                >
                  <GoogleIcon className="w-2.5 h-2.5 mr-1" />
                  로그인하여 내 프로필 만들기
                </Button>
              )}
            </div>

            {/* SNS Quick Icon Bar */}
            {snsLinks.length > 0 && (
              <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-2.5">
                <span className="text-[9px] font-bold text-white/90 uppercase tracking-wider mr-0.5">
                  소셜 링크:
                </span>
                {snsLinks.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={item.title}
                    className="w-5 h-5 sm:w-6 sm:h-6 bg-[#dedede] hover:bg-[#ffffff] text-[#21242e] border border-[#3d4f97] rounded-[2px] flex items-center justify-center shadow-xs transition-transform hover:-translate-y-0.5"
                  >
                    {item.icon === "github" ? (
                      <GithubSmallIcon />
                    ) : item.icon === "linkedin" ? (
                      <LinkedinSmallIcon />
                    ) : item.icon === "mail" || item.icon === "send" ? (
                      <Mail className="w-3 h-3 text-[#3d4f97]" />
                    ) : item.icon === "blog" ? (
                      <BookOpen className="w-3 h-3 text-[#3d4f97]" />
                    ) : (
                      <Globe className="w-3 h-3 text-[#3d4f97]" />
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Control Strip: Signal Orange Arrow Buttons & Amber Info Chips */}
      <div className="w-full bg-[#9fbee7] border-x-2 border-b-2 border-[#3d4f97] px-2.5 sm:px-3 py-1.5 flex items-center justify-between gap-1.5 sm:gap-2 flex-wrap text-xs">
        {/* Left: Player's Poll Stats & Status */}
        <div className="flex items-center gap-1.5">
          <Badge variant="nintendoGold" className="text-[9px] sm:text-[10px]">
            조회수
          </Badge>
          <span className="font-mono text-[11px] sm:text-xs font-bold text-[#21242e]">
            {(profile.stats?.views ?? 1280).toLocaleString()}
          </span>

          <span className="hidden sm:inline-block text-[10px] text-[#21242e] font-bold ml-2">
            • {user ? `인증 완료 (${user.email})` : "로그인 시 나만의 클라우드 보관함이 생성됩니다."}
          </span>
        </div>

        {/* Right: Signal Orange Action Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Edit Profile Button in Control Strip */}
          {onOpenEditProfile && (
            <Button
              onClick={onOpenEditProfile}
              variant="nintendoPlate"
              size="sm"
              className="text-[10px] sm:text-[11px] font-bold bg-white text-[#21242e] border border-[#3d4f97] hover:bg-[#dedede] flex items-center gap-1 cursor-pointer"
            >
              <UserCog className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#f68d1f]" />
              <span className="hidden xs:inline">프로필 수정</span>
            </Button>
          )}

          {/* Like / Cheer Button */}
          <Button
            onClick={handleLike}
            variant={hasLiked ? "nintendoRed" : "nintendoOrange"}
            size="sm"
            className="text-[10px] sm:text-[11px] font-bold"
          >
            <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${hasLiked ? "fill-white" : ""}`} />
            <span>응원하기 ({likesCount})</span>
          </Button>

          {/* Share Button */}
          <Button
            onClick={onOpenShareModal}
            variant="nintendoCarbon"
            size="sm"
            className="text-[10px] sm:text-[11px] font-bold"
          >
            <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden xs:inline">공유</span>
            <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#f68d1f] text-white flex items-center justify-center shrink-0 ml-0.5">
              <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
