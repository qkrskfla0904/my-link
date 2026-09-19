"use client";

import { useState, useMemo } from "react";
import { INITIAL_PROFILE } from "@/constants";
import { ProfileHeader } from "@/components/links/ProfileHeader";
import { LinkCard } from "@/components/links/LinkCard";
import { CategoryFilter } from "@/components/links/CategoryFilter";
import { ThemePicker } from "@/components/common/ThemePicker";
import { ShareModal } from "@/components/common/ShareModal";
import { ThemeAccent } from "@/types";
import { Sparkles, Layers } from "lucide-react";

export default function HomePage() {
  const profile = INITIAL_PROFILE;
  const [theme, setTheme] = useState<ThemeAccent>("emerald");
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = Array.from(
      new Set(profile.links.map((l) => l.category).filter(Boolean) as string[])
    );
    return ["전체", ...cats];
  }, [profile.links]);

  // Filter links by selected category
  const filteredLinks = useMemo(() => {
    if (selectedCategory === "전체") return profile.links;
    return profile.links.filter((link) => link.category === selectedCategory);
  }, [profile.links, selectedCategory]);

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] py-8 px-4 overflow-hidden">
      {/* Background Ambient Glow Meshes */}
      <div className="pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-gradient-to-tr from-emerald-300/30 via-teal-200/20 to-sky-300/30 dark:from-emerald-900/20 dark:via-teal-900/10 dark:to-sky-900/20 blur-3xl animate-blob-1 rounded-full -z-10" />
      <div className="pointer-events-none absolute top-40 left-1/3 w-80 h-80 bg-gradient-to-br from-violet-300/20 via-pink-200/20 to-amber-200/20 dark:from-violet-950/20 dark:via-rose-950/10 dark:to-amber-950/20 blur-3xl animate-blob-2 rounded-full -z-10" />

      <div className="max-w-md mx-auto flex flex-col justify-between min-h-[calc(100vh-7rem)]">
        <div>
          {/* Top Bar: Theme Picker & Info */}
          <div className="flex items-center justify-between mb-6">
            <ThemePicker currentTheme={theme} onSelectTheme={setTheme} />

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md shadow-2xs text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
              <Layers className="w-3.5 h-3.5 text-zinc-400" />
              <span>{profile.links.length}개 링크</span>
            </div>
          </div>

          {/* Profile Header Component */}
          <ProfileHeader
            profile={profile}
            theme={theme}
            onOpenShareModal={() => setIsShareOpen(true)}
          />

          {/* Category Filter */}
          <div className="mb-4">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              theme={theme}
            />
          </div>

          {/* Links List */}
          <div className="space-y-3">
            {filteredLinks.map((link) => (
              <LinkCard key={link.id} link={link} theme={theme} />
            ))}

            {filteredLinks.length === 0 && (
              <div className="p-8 text-center rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  해당 카테고리의 링크가 없습니다.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info Box */}
        <div className="mt-12 p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 text-center shadow-xs">
          <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            나만의 SNS, 블로그, 포트폴리오 링크를 마이링크 하나로 연결해 보세요!
          </p>
        </div>
      </div>

      {/* Share Modal Popup */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        profile={profile}
      />
    </div>
  );
}
