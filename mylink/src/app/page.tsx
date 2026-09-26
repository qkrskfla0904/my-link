"use client";

import { useState, useMemo } from "react";
import { INITIAL_PROFILE } from "@/constants";
import { ProfileHeader } from "@/components/links/ProfileHeader";
import { LinkCard } from "@/components/links/LinkCard";
import { CategoryFilter } from "@/components/links/CategoryFilter";
import { ThemePicker } from "@/components/common/ThemePicker";
import { ShareModal } from "@/components/common/ShareModal";
import { ThemeAccent } from "@/types";
import { ChevronRight, Radio, Award } from "lucide-react";

export default function HomePage() {
  const profile = INITIAL_PROFILE;
  const [theme, setTheme] = useState<ThemeAccent>("violet");
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [pollVote, setPollVote] = useState("option-1");
  const [pollSubmitted, setPollSubmitted] = useState(false);

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
    <div className="w-full p-2 sm:p-3 space-y-3">
      {/* 1. Hero Field Panel (Profile Header) */}
      <ProfileHeader
        profile={profile}
        theme={theme}
        onOpenShareModal={() => setIsShareOpen(true)}
      />

      {/* 2. Main Two-Column Modular Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
        {/* Left Column: Official News & Link Collection (2/3 width) */}
        <div className="md:col-span-2 space-y-2">
          {/* Section Label Bar */}
          <div className="w-full bg-[#8ba1d4] nintendo-plate px-2.5 py-1 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-[#f68d1f]" />
              <h2 className="text-xs font-bold uppercase tracking-[0.5px] text-[#21242e]">
                OFFICIAL LINKS & DIRECTORY
              </h2>
            </div>
            <span className="text-[10px] font-bold text-[#3d4f97]">
              {filteredLinks.length} ITEMS READY
            </span>
          </div>

          {/* Category Filter Tabs */}
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            theme={theme}
          />

          {/* Stacked Link Cards (News-Row Style) */}
          <div className="space-y-1.5">
            {filteredLinks.map((link) => (
              <LinkCard key={link.id} link={link} theme={theme} />
            ))}

            {filteredLinks.length === 0 && (
              <div className="p-4 text-center bg-[#dedede] nintendo-inset">
                <p className="text-xs text-[#21242e] font-bold uppercase">
                  NO LINKS FOUND IN THIS SECTION.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Rail: Action Modules, Player's Poll & Info Box (1/3 width) */}
        <div className="space-y-3">
          {/* Theme / Mode Switcher Box */}
          <div className="space-y-1">
            <div className="bg-[#21242e] text-[#ecab37] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <span>≡ CHASSIS DISPLAY MODE</span>
            </div>
            <ThemePicker currentTheme={theme} onSelectTheme={setTheme} />
          </div>

          {/* What Is Info-Box */}
          <div className="bg-white nintendo-plate p-3 space-y-2 text-[#21242e]">
            <div className="inline-block px-2 py-0.5 bg-[#ecab37] text-[#21242e] text-[9px] font-black uppercase">
              WHAT IS — MYLINK HUB
            </div>
            <p className="text-xs leading-relaxed text-[#21242e]">
              A complete centralized console hardware interface connecting all developer repositories, technical writings, and professional social profiles.
            </p>
          </div>

          {/* Player's Poll Module */}
          <div className="bg-[#8ba1d4] nintendo-plate p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-[#3d4f97] pb-1">
              <span className="text-[11px] font-black uppercase text-[#21242e] flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-[#f68d1f]" />
                PLAYER&apos;S POLL
              </span>
              <span className="text-[9px] font-bold text-[#3d4f97]">
                ISSUE #01
              </span>
            </div>

            <p className="text-[11px] font-bold text-[#21242e]">
              Which stack do you prefer for 2001-era hardware web UIs?
            </p>

            <div className="space-y-1 text-xs">
              {[
                { id: "option-1", text: "React 19 & Next.js" },
                { id: "option-2", text: "Tailwind CSS Metal Chassis" },
                { id: "option-3", text: "HTML Table & Beveled GIF" },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center gap-1.5 text-[11px] text-[#21242e] cursor-pointer"
                >
                  <input
                    type="radio"
                    name="poll"
                    value={opt.id}
                    checked={pollVote === opt.id}
                    onChange={() => setPollVote(opt.id)}
                    className="accent-[#f68d1f]"
                  />
                  <span>{opt.text}</span>
                </label>
              ))}
            </div>

            <button
              onClick={() => setPollSubmitted(true)}
              className="w-full py-1 bg-[#f68d1f] hover:bg-[#e48600] text-white text-[10px] font-black uppercase nintendo-chip flex items-center justify-center gap-1 cursor-pointer"
            >
              {pollSubmitted ? "VOTE RECORDED! ✓" : "SUBMIT VOTE"}
              <ChevronRight className="w-3 h-3 stroke-[3]" />
            </button>
          </div>

          {/* Systems Badge Promo Card */}
          <div className="bg-[#21242e] nintendo-inset p-2.5 text-center text-white space-y-1">
            <div className="flex items-center justify-center gap-1 text-[#f68d1f] text-[10px] font-black uppercase">
              <Award className="w-3.5 h-3.5" />
              <span>NINTENDO POWER VERIFIED</span>
            </div>
            <p className="text-[9px] text-[#9fbee7] font-mono">
              COMPATIBLE WITH GAME BOY ADVANCE & N64 EXPANSION PAK
            </p>
          </div>
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
