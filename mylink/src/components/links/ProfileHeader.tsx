"use client";

import Image from "next/image";
import { useState } from "react";
import { UserProfile, ThemeAccent } from "@/types";
import { Heart, Eye, Share2, Sparkles, CheckCircle2 } from "lucide-react";

interface ProfileHeaderProps {
  profile: UserProfile;
  theme: ThemeAccent;
  onOpenShareModal: () => void;
}

const themeRingStyles: Record<
  ThemeAccent,
  {
    ringGradient: string;
    badgeBg: string;
    likeBg: string;
    likeActive: string;
  }
> = {
  emerald: {
    ringGradient: "from-emerald-400 via-teal-500 to-emerald-600",
    badgeBg:
      "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/80",
    likeBg:
      "bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/60",
    likeActive:
      "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20",
  },
  violet: {
    ringGradient: "from-violet-400 via-purple-500 to-indigo-600",
    badgeBg:
      "bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border-violet-200/80 dark:border-violet-800/80",
    likeBg:
      "bg-violet-50/80 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 border-violet-200/80 dark:border-violet-800/80 hover:bg-violet-100 dark:hover:bg-violet-900/60",
    likeActive:
      "bg-violet-500 text-white border-violet-500 shadow-md shadow-violet-500/20",
  },
  sky: {
    ringGradient: "from-sky-400 via-blue-500 to-cyan-600",
    badgeBg:
      "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/80",
    likeBg:
      "bg-sky-50/80 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border-sky-200/80 dark:border-sky-800/80 hover:bg-sky-100 dark:hover:bg-sky-900/60",
    likeActive:
      "bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-500/20",
  },
  rose: {
    ringGradient: "from-rose-400 via-pink-500 to-rose-600",
    badgeBg:
      "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/80",
    likeBg:
      "bg-rose-50/80 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200/80 dark:border-rose-800/80 hover:bg-rose-100 dark:hover:bg-rose-900/60",
    likeActive:
      "bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20",
  },
  amber: {
    ringGradient: "from-amber-400 via-orange-500 to-amber-600",
    badgeBg:
      "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/80",
    likeBg:
      "bg-amber-50/80 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200/80 dark:border-amber-800/80 hover:bg-amber-100 dark:hover:bg-amber-900/60",
    likeActive:
      "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20",
  },
};

export function ProfileHeader({
  profile,
  theme,
  onOpenShareModal,
}: ProfileHeaderProps) {
  const [likesCount, setLikesCount] = useState(profile.stats?.likes ?? 245);
  const [hasLiked, setHasLiked] = useState(false);
  const styles = themeRingStyles[theme] || themeRingStyles.emerald;

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
    <div className="flex flex-col items-center text-center mb-8 relative">
      {/* Avatar Container with Gradient Glow Ring */}
      <div className="relative group mb-4">
        <div
          className={`absolute -inset-1 rounded-full bg-gradient-to-r ${styles.ringGradient} blur-md opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse`}
        />
        <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-zinc-900 shadow-xl bg-zinc-100 dark:bg-zinc-800">
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt={profile.displayName}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-700 dark:text-zinc-200 text-3xl font-bold">
              {profile.displayName.slice(0, 1)}
            </div>
          )}
        </div>

        {/* Online / Available Status Badge */}
        {profile.isAvailableForHire && (
          <div
            className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900 shadow-xs flex items-center justify-center"
            title="연락 및 커피챗 가능"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          </div>
        )}
      </div>

      {/* Display Name & Handle */}
      <div className="flex items-center gap-1.5 justify-center">
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
          {profile.displayName}
        </h1>
        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20 shrink-0" />
      </div>

      <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-0.5">
        @{profile.username}
      </p>

      {/* Status Message / Availability pill */}
      {profile.statusMessage && (
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 mt-2.5 border border-zinc-200/80 dark:border-zinc-700/80 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>{profile.statusMessage}</span>
        </div>
      )}

      {/* Tags */}
      <div className="flex items-center justify-center gap-1.5 mt-3 flex-wrap">
        {(profile.tags && profile.tags.length > 0
          ? profile.tags
          : ["💻 프론트엔드 개발자", "🚀 Next.js & React"]
        ).map((tag, idx) => (
          <span
            key={idx}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles.badgeBg}`}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Bio */}
      {profile.bio && (
        <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-3 max-w-sm leading-relaxed font-normal">
          {profile.bio}
        </p>
      )}

      {/* Interactive Stats & Actions Bar */}
      <div className="flex items-center justify-center gap-2 mt-5">
        {/* Views */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 shadow-2xs">
          <Eye className="w-3.5 h-3.5 text-zinc-400" />
          <span>조회수 {profile.stats?.views ?? 1280}</span>
        </div>

        {/* Like Button */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 active:scale-95 ${
            hasLiked ? styles.likeActive : styles.likeBg
          }`}
          title="응원하기"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-transform ${
              hasLiked ? "fill-white scale-110" : ""
            }`}
          />
          <span>응원 {likesCount}</span>
        </button>

        {/* Share Button */}
        <button
          onClick={onOpenShareModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/70 dark:bg-zinc-900/70 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-all duration-200 shadow-2xs active:scale-95"
          title="공유하기"
        >
          <Share2 className="w-3.5 h-3.5 text-zinc-400" />
          <span>공유</span>
        </button>
      </div>
    </div>
  );
}
