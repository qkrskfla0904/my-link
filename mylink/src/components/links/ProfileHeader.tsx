"use client";

import Image from "next/image";
import { useState } from "react";
import { UserProfile, ThemeAccent } from "@/types";
import { Heart, ChevronRight, Share2, Sparkles, Activity } from "lucide-react";

interface ProfileHeaderProps {
  profile: UserProfile;
  theme: ThemeAccent;
  onOpenShareModal: () => void;
}

const themeBackgrounds: Record<ThemeAccent, string> = {
  violet: "bg-[#acace7]", // Home Lavender
  emerald: "bg-[#206479]", // Systems Teal
  rose: "bg-[#a7282b]", // Games Red
  sky: "bg-[#c0d5e6]", // News Ice
  amber: "bg-[#ecab37]", // Classic Gold
};

export function ProfileHeader({
  profile,
  theme,
  onOpenShareModal,
}: ProfileHeaderProps) {
  const [likesCount, setLikesCount] = useState(profile.stats?.likes ?? 245);
  const [hasLiked, setHasLiked] = useState(false);
  const heroBg = themeBackgrounds[theme] || themeBackgrounds.violet;

  const handleLike = () => {
    if (!hasLiked) {
      setLikesCount((prev) => prev + 1);
      setHasLiked(true);
    } else {
      setLikesCount((prev) => prev - 1);
      setHasLiked(false);
    }
  };

  return (
    <div className="w-full mb-4">
      {/* 1. Hero Field Panel: Beveled Hardware Frame with Theme Tint */}
      <div className={`w-full ${heroBg} nintendo-plate p-4 sm:p-5 relative overflow-hidden transition-colors duration-300`}>
        {/* Background Subtle Circuit / Grid overlay */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:16px_16px]" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          {/* Hardware Frame Avatar */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-[#21242e] nintendo-inset p-1 relative shadow-md">
              <div className="relative w-full h-full overflow-hidden bg-[#7a8aba]">
                {profile.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt={profile.displayName}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-2xl font-black">
                    {profile.displayName.slice(0, 1)}
                  </div>
                )}
              </div>
            </div>

            {/* LED Status Indicator */}
            {profile.isAvailableForHire && (
              <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-[#21242e] border border-white text-[8px] font-bold text-[#00ff66] flex items-center gap-1 shadow-xs uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-ping shrink-0" />
                ONLINE
              </div>
            )}
          </div>

          {/* Profile Details & Box-Art Wordmark */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            {/* System Category Tag */}
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#21242e] text-[#f68d1f] text-[9px] font-black uppercase tracking-wider mb-1">
              <Activity className="w-3 h-3 text-[#f68d1f]" />
              <span>NINTENDO OFF-LINE DEV HUB</span>
            </div>

            {/* Chunky Box-Art Display Title */}
            <h1 className="text-2xl sm:text-3xl font-black nintendo-boxart-text tracking-tight break-keep">
              {profile.displayName}
            </h1>

            {/* Handle & Subtitle */}
            <p className="text-xs font-bold text-white/95 font-mono drop-shadow-sm mt-0.5">
              @{profile.username}
            </p>

            {/* Bio */}
            {profile.bio && (
              <p className="text-xs text-white/90 font-medium mt-2 leading-relaxed bg-[#21242e]/40 p-2 border-l-2 border-[#f68d1f] break-keep">
                {profile.bio}
              </p>
            )}

            {/* Specialty Tags */}
            <div className="flex items-center justify-center sm:justify-start gap-1 mt-2.5 flex-wrap">
              {(profile.tags && profile.tags.length > 0
                ? profile.tags
                : ["💻 FRONTEND", "🚀 NEXT.JS & REACT"]
              ).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-[#dedede] text-[#21242e] border border-[#3d4f97] text-[10px] font-bold uppercase"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Control Strip: Signal Orange Arrow Buttons & Amber Info Chips */}
      <div className="w-full bg-[#9fbee7] border-x-2 border-b-2 border-[#3d4f97] px-3 py-2 flex items-center justify-between gap-2 flex-wrap text-xs">
        {/* Left: Player's Poll Stats */}
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-[#ecab37] border border-[#3d4f97] text-[#21242e] text-[10px] font-black uppercase">
            VIEWS
          </span>
          <span className="font-mono text-xs font-bold text-[#21242e]">
            {profile.stats?.views ?? 1280}
          </span>
        </div>

        {/* Right: Signal Orange Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Like / Cheer Button */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase transition-all nintendo-chip rounded-[2px] cursor-pointer ${
              hasLiked
                ? "bg-[#e60012] text-white"
                : "bg-[#f68d1f] hover:bg-[#e48600] text-white"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${hasLiked ? "fill-white" : ""}`} />
            <span>CHEER ({likesCount})</span>
          </button>

          {/* Share Button */}
          <button
            onClick={onOpenShareModal}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#21242e] hover:bg-[#3d4f97] text-[#f68d1f] text-[11px] font-bold uppercase nintendo-chip rounded-[2px] cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>SHARE</span>
            <div className="w-4 h-4 rounded-full bg-[#f68d1f] text-white flex items-center justify-center">
              <ChevronRight className="w-3 h-3 stroke-[3]" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
