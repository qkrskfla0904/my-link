"use client";

import { useState, useMemo, useEffect } from "react";
import { INITIAL_PROFILE } from "@/constants";
import { ProfileHeader } from "@/components/links/ProfileHeader";
import { LinkCard } from "@/components/links/LinkCard";
import { CategoryFilter } from "@/components/links/CategoryFilter";
import { AddLinkDialog } from "@/components/links/AddLinkDialog";
import { ThemePicker } from "@/components/common/ThemePicker";
import { ShareModal } from "@/components/common/ShareModal";
import { ThemeAccent, UserProfile, LinkItem } from "@/types";
import { ChevronRight, Radio as RadioIcon, Award, Search, Sparkles, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const STORAGE_PROFILE_KEY = "mylink_profile_data";
const STORAGE_THEME_KEY = "mylink_theme";

export default function HomePage() {
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [theme, setTheme] = useState<ThemeAccent>("violet");
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const [pollVote, setPollVote] = useState("option-1");
  const [pollSubmitted, setPollSubmitted] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const storedProfile = localStorage.getItem(STORAGE_PROFILE_KEY);
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      } else {
        localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(INITIAL_PROFILE));
      }

      const storedTheme = localStorage.getItem(STORAGE_THEME_KEY) as ThemeAccent;
      if (storedTheme && ["violet", "emerald", "rose", "sky", "amber"].includes(storedTheme)) {
        setTheme(storedTheme);
      } else {
        localStorage.setItem(STORAGE_THEME_KEY, "violet");
      }
    } catch (e) {
      console.error("Failed to load data from localStorage:", e);
    }
  }, []);

  // Theme change handler with persistence
  const handleThemeChange = (newTheme: ThemeAccent) => {
    setTheme(newTheme);
    try {
      localStorage.setItem(STORAGE_THEME_KEY, newTheme);
    } catch (e) {
      console.error("Failed to save theme to localStorage:", e);
    }
  };

  // Add link handler with persistence
  const handleAddLink = (newLink: LinkItem) => {
    setProfile((prev) => {
      const updatedProfile = {
        ...prev,
        links: [newLink, ...prev.links],
      };
      try {
        localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(updatedProfile));
      } catch (e) {
        console.error("Failed to save profile to localStorage:", e);
      }
      return updatedProfile;
    });

    // If currently filtered out, switch to "전체" so the new link is immediately visible
    if (selectedCategory !== "전체" && selectedCategory !== newLink.category) {
      setSelectedCategory("전체");
    }
  };

  // Link click counter handler with persistence
  const handleLinkClick = (linkId: string) => {
    setProfile((prev) => {
      const updatedLinks = prev.links.map((link) => {
        if (link.id === linkId) {
          return {
            ...link,
            clickCount: (link.clickCount ?? 0) + 1,
          };
        }
        return link;
      });

      const updatedProfile = {
        ...prev,
        links: updatedLinks,
      };

      try {
        localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(updatedProfile));
      } catch (e) {
        console.error("Failed to save profile to localStorage:", e);
      }

      return updatedProfile;
    });
  };

  // Like change handler with persistence
  const handleLikeChange = (newLikes: number) => {
    setProfile((prev) => {
      const updatedProfile = {
        ...prev,
        stats: {
          views: prev.stats?.views ?? 1280,
          likes: newLikes,
        },
      };
      try {
        localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(updatedProfile));
      } catch (e) {
        console.error("Failed to save likes to localStorage:", e);
      }
      return updatedProfile;
    });
  };

  // Extract unique categories preserving logical order
  const categories = useMemo(() => {
    const rawCategories = profile.links
      .map((l) => l.category)
      .filter(Boolean) as string[];
    const unique = Array.from(new Set(rawCategories));
    return ["전체", ...unique];
  }, [profile.links]);

  // Filter links by selected category and search query
  const filteredLinks = useMemo(() => {
    return profile.links.filter((link) => {
      // Category filter
      const matchesCategory =
        selectedCategory === "전체" || link.category === selectedCategory;

      // Search query filter
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        link.title.toLowerCase().includes(query) ||
        (link.description && link.description.toLowerCase().includes(query)) ||
        (link.category && link.category.toLowerCase().includes(query));

      return matchesCategory && matchesQuery;
    });
  }, [profile.links, selectedCategory, searchQuery]);

  return (
    <div className="w-full p-2 sm:p-3 space-y-3">
      {/* 1. Hero Field Panel (Profile Header) */}
      <ProfileHeader
        profile={profile}
        theme={theme}
        onOpenShareModal={() => setIsShareOpen(true)}
        onLikeChange={handleLikeChange}
      />

      {/* 2. Main Two-Column Modular Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
        {/* Left Column: Official News & Link Collection (2/3 width) */}
        <div className="md:col-span-2 space-y-2">
          {/* Section Label Bar */}
          <div className="w-full bg-[#8ba1d4] nintendo-plate px-2.5 py-1.5 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-[#f68d1f]" />
              <h2 className="text-xs font-bold uppercase tracking-[0.5px] text-[#21242e]">
                OFFICIAL LINKS & DIRECTORY
              </h2>
            </div>

            {/* Right controls: Add Link Button + Search Bar + Count */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Add Link Trigger Button */}
              <Button
                onClick={() => setIsAddLinkOpen(true)}
                variant="nintendoOrange"
                size="sm"
                className="h-6 px-2 text-[9px] sm:text-[10px] font-black tracking-wider"
              >
                <Plus className="w-3 h-3 stroke-[3]" />
                <span>ADD LINK</span>
              </Button>

              {/* Quick in-directory search input */}
              <div className="flex items-center gap-1 bg-white nintendo-inset px-1.5 py-0.5 rounded-[2px]">
                <Search className="w-2.5 h-2.5 text-[#3d4f97] shrink-0" />
                <input
                  type="text"
                  placeholder="Filter..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-16 sm:w-24 text-[9px] sm:text-[10px] text-[#21242e] font-medium outline-none bg-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-[9px] font-bold text-[#e60012] px-0.5"
                  >
                    ×
                  </button>
                )}
              </div>

              <span className="text-[10px] font-bold text-[#3d4f97]">
                {filteredLinks.length} ITEMS
              </span>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            theme={theme}
          />

          {/* Stacked Link Cards */}
          <div className="space-y-1.5">
            {filteredLinks.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                theme={theme}
                onLinkClick={handleLinkClick}
              />
            ))}

            {filteredLinks.length === 0 && (
              <Card variant="inset" className="p-5 text-center space-y-1">
                <p className="text-xs text-[#21242e] font-bold uppercase">
                  NO LINKS FOUND MATCHING YOUR CRITERIA.
                </p>
                <p className="text-[10px] text-[#60619c]">
                  Try selecting another category or adding a new link.
                </p>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <Button
                    onClick={() => {
                      setSelectedCategory("전체");
                      setSearchQuery("");
                    }}
                    variant="nintendoPlate"
                    size="sm"
                    className="text-[10px]"
                  >
                    RESET FILTER
                  </Button>
                  <Button
                    onClick={() => setIsAddLinkOpen(true)}
                    variant="nintendoOrange"
                    size="sm"
                    className="text-[10px]"
                  >
                    <Plus className="w-3 h-3 stroke-[3]" />
                    ADD LINK
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Right Rail: Action Modules, Player's Poll & Info Box (1/3 width) */}
        <div className="space-y-3">
          {/* Theme / Mode Switcher Box */}
          <div className="space-y-1">
            <div className="bg-[#21242e] text-[#ecab37] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#ecab37]" />
              <span>CHASSIS DISPLAY MODE</span>
            </div>
            <ThemePicker currentTheme={theme} onSelectTheme={handleThemeChange} />
          </div>

          {/* What Is Info-Box */}
          <Card variant="whitePlate" className="p-3 space-y-2">
            <div className="inline-block">
              <Badge variant="nintendoGold" className="text-[9px]">
                WHAT IS — MYLINK HUB
              </Badge>
            </div>
            <p className="text-xs leading-relaxed text-[#21242e]">
              A complete centralized console hardware interface connecting all developer repositories, technical writings, and professional social profiles.
            </p>
          </Card>

          {/* Player's Poll Module */}
          <Card variant="plate" className="p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-[#3d4f97] pb-1">
              <span className="text-[11px] font-black uppercase text-[#21242e] flex items-center gap-1">
                <RadioIcon className="w-3.5 h-3.5 text-[#f68d1f]" />
                PLAYER&apos;S POLL
              </span>
              <span className="text-[9px] font-bold text-[#3d4f97]">
                ISSUE #01
              </span>
            </div>

            <p className="text-[11px] font-bold text-[#21242e]">
              Which stack do you prefer for 2001-era hardware web UIs?
            </p>

            <RadioGroup value={pollVote} onValueChange={setPollVote} className="gap-1.5 py-1">
              {[
                { id: "option-1", text: "React 19 & Next.js" },
                { id: "option-2", text: "Tailwind CSS Metal Chassis" },
                { id: "option-3", text: "HTML Table & Beveled GIF" },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center gap-1.5 text-[11px] text-[#21242e] cursor-pointer"
                >
                  <RadioGroupItem value={opt.id} />
                  <span>{opt.text}</span>
                </label>
              ))}
            </RadioGroup>

            <Button
              onClick={() => setPollSubmitted(true)}
              variant="nintendoOrange"
              size="sm"
              className="w-full text-[10px] font-black"
            >
              {pollSubmitted ? "VOTE RECORDED! ✓" : "SUBMIT VOTE"}
              <ChevronRight className="w-3 h-3 stroke-[3]" />
            </Button>
          </Card>

          {/* Systems Badge Promo Card */}
          <Card variant="darkInset" className="p-2.5 text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-[#f68d1f] text-[10px] font-black uppercase">
              <Award className="w-3.5 h-3.5" />
              <span>NINTENDO POWER VERIFIED</span>
            </div>
            <p className="text-[9px] text-[#9fbee7] font-mono">
              COMPATIBLE WITH GAME BOY ADVANCE & N64 EXPANSION PAK
            </p>
          </Card>
        </div>
      </div>

      {/* Share Modal Popup */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        profile={profile}
      />

      {/* Add Link Dialog Popup */}
      <AddLinkDialog
        isOpen={isAddLinkOpen}
        onClose={() => setIsAddLinkOpen(false)}
        onAddLink={handleAddLink}
        existingCategories={categories}
      />
    </div>
  );
}
