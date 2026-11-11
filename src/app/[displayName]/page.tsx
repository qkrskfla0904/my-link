"use client";

import { useMemo, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useUserByDisplayName } from "@/hooks/useProfile";
import { useAuth } from "@/context/AuthContext";
import { incrementFirestoreLinkClick } from "@/lib/links";
import { ProfileHeader } from "@/components/links/ProfileHeader";
import { LinkCard } from "@/components/links/LinkCard";
import { CategoryFilter } from "@/components/links/CategoryFilter";
import { ShareModal } from "@/components/common/ShareModal";
import { ThemeAccent } from "@/types";
import {
  Database,
  Home,
  Search,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const STORAGE_THEME_KEY = "mylink_theme";

export default function UserPublicPage() {
  const routeParams = useParams();
  const rawDisplayName = typeof routeParams?.displayName === "string"
    ? routeParams.displayName
    : Array.isArray(routeParams?.displayName)
    ? routeParams.displayName[0]
    : "";

  let decodedDisplayName = rawDisplayName;
  try {
    decodedDisplayName = rawDisplayName ? decodeURIComponent(rawDisplayName) : "";
  } catch {
    decodedDisplayName = rawDisplayName;
  }

  const { user: currentUser } = useAuth();
  const { data, isLoading, isFetched } = useUserByDisplayName(decodedDisplayName);

  // Check if current user is viewing their own page
  const isViewingSelf = Boolean(
    currentUser &&
      (currentUser.displayName === decodedDisplayName ||
        currentUser.uid === decodedDisplayName ||
        currentUser.email?.split("@")[0] === decodedDisplayName ||
        (currentUser.displayName && encodeURIComponent(currentUser.displayName) === rawDisplayName))
  );

  // Fallback profile if current user is viewing self but Firestore record not yet indexed
  const selfProfile = useMemo(() => {
    if (!isViewingSelf || !currentUser) return null;
    return {
      userId: currentUser.uid,
      profile: {
        id: currentUser.uid,
        username: currentUser.email ? currentUser.email.split("@")[0] : decodedDisplayName,
        displayName: currentUser.displayName || decodedDisplayName,
        bio: "나만의 맞춤형 링크 모음입니다. 🚀",
        avatarUrl: currentUser.photoURL || undefined,
        tags: ["💻 개발자", "🔗 마이링크"],
        statusMessage: "환영합니다!",
        isAvailableForHire: true,
        stats: {
          views: 1,
          likes: 0,
        },
        links: [],
      },
    };
  }, [isViewingSelf, currentUser, decodedDisplayName]);

  const activeData = data || selfProfile;

  const [theme, setTheme] = useState<ThemeAccent>("violet");
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [likesCount, setLikesCount] = useState<number>(0);

  // Initialize theme from localStorage
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem(STORAGE_THEME_KEY) as ThemeAccent;
      if (storedTheme && ["violet", "emerald", "rose", "sky", "amber"].includes(storedTheme)) {
        setTheme(storedTheme);
      }
    } catch (e) {
      console.error("Failed to load theme from localStorage:", e);
    }
  }, []);

  const handleThemeChange = (newTheme: ThemeAccent) => {
    setTheme(newTheme);
    try {
      localStorage.setItem(STORAGE_THEME_KEY, newTheme);
    } catch (e) {
      console.error("Failed to save theme to localStorage:", e);
    }
  };

  // Sync likes count with fetched profile
  useEffect(() => {
    if (activeData?.profile?.stats?.likes !== undefined) {
      setLikesCount(activeData.profile.stats.likes);
    }
  }, [activeData?.profile?.stats?.likes]);

  // Handle link click count increment
  const handleLinkClick = (linkId: string) => {
    if (activeData?.userId) {
      incrementFirestoreLinkClick(activeData.userId, linkId);
    }
  };

  // Derive categories from user's links
  const categories = useMemo(() => {
    if (!activeData?.profile?.links) return ["전체"];
    const rawCategories = activeData.profile.links
      .map((l) => l.category)
      .filter(Boolean) as string[];
    const unique = Array.from(new Set(rawCategories));
    return ["전체", ...unique];
  }, [activeData?.profile?.links]);

  // Filter links by category, search query, and active state (for public visitors)
  const isOwner = Boolean(
    currentUser &&
      activeData &&
      (currentUser.uid === activeData.userId || isViewingSelf)
  );

  const filteredLinks = useMemo(() => {
    if (!activeData?.profile?.links) return [];
    return activeData.profile.links.filter((link) => {
      if (!isOwner && link.isActive === false) {
        return false;
      }

      const matchesCategory =
        selectedCategory === "전체" || link.category === selectedCategory;

      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        link.title.toLowerCase().includes(query) ||
        (link.category && link.category.toLowerCase().includes(query));

      return matchesCategory && matchesQuery;
    });
  }, [activeData?.profile?.links, selectedCategory, searchQuery, isOwner]);

  // 1. Loading State
  if ((isLoading || !isFetched) && !activeData) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 space-y-4">
        <div className="w-full h-36 bg-[#dedede] animate-pulse rounded-[4px]" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-full h-16 bg-[#dedede] animate-pulse rounded-[3px]" />
          ))}
        </div>
      </div>
    );
  }

  // 2. User Not Found Page
  if (!activeData) {
    return (
      <div className="w-full p-4 sm:p-8 max-w-lg mx-auto">
        <Card variant="plate" className="p-6 text-center space-y-4 bg-[#dedede]">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#8ba1d4] flex items-center justify-center text-[#21242e] border-2 border-[#3d4f97]">
            <Database className="w-6 h-6 text-[#e60012]" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-sm sm:text-base font-black uppercase text-[#21242e]">
              사용자를 찾을 수 없습니다
            </h2>
            <p className="text-xs text-[#3d4f97] font-medium">
              ‘<span className="font-bold text-[#e60012]">{decodedDisplayName}</span>’ 사용자의 공개 프로필이 아직 생성되지 않았거나 주소가 잘못되었습니다.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-2">
            <Button
              asChild
              variant="nintendoPlate"
              size="sm"
              className="font-bold text-xs"
            >
              <Link href="/" className="flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-[#3d4f97]" />
                <span>메인 홈으로 이동</span>
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const { profile } = activeData;

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
      {/* Owner Guidance Banner */}
      {isOwner && (
        <div className="w-full bg-[#10b981]/15 border-2 border-[#10b981] text-[#21242e] px-3 py-1.5 rounded-[3px] flex items-center justify-between text-xs font-bold shadow-xs">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" />
            <span>회원님의 공개 프로필 페이지(방문자 뷰)입니다.</span>
          </div>
          <Button
            asChild
            variant="nintendoPlate"
            size="sm"
            className="h-6 px-2 text-[10px] font-bold"
          >
            <Link href="/" className="flex items-center gap-1">
              <Home className="w-3 h-3 text-[#3d4f97]" />
              <span>대시보드로 이동</span>
            </Link>
          </Button>
        </div>
      )}

      {/* 1. Profile Header with Theme Selector */}
      <ProfileHeader
        profile={{
          ...profile,
          stats: {
            views: profile.stats?.views ?? 1,
            likes: likesCount,
          },
        }}
        theme={theme}
        onOpenShareModal={() => setIsShareOpen(true)}
        onLikeChange={(count) => setLikesCount(count)}
        onSelectTheme={handleThemeChange}
      />

      {/* 2. Public Links Directory */}
      <div className="space-y-3">
        {/* Search & Count Bar */}
        <div className="flex items-center justify-between gap-2 flex-wrap bg-[#dedede] border border-[#3d4f97] p-2 rounded-[3px]">
          <span className="text-xs font-black text-[#21242e]">
            {profile.displayName}의 링크 목록
          </span>

          {/* Search Box */}
          <div className="flex items-center gap-1 bg-white border border-[#3d4f97] px-2 py-0.5 rounded-[2px] flex-1 max-w-xs">
            <Search className="w-3 h-3 text-[#3d4f97] shrink-0" />
            <input
              type="text"
              placeholder="검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs text-[#21242e] font-medium outline-none bg-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs font-bold text-[#e60012] px-1 cursor-pointer"
              >
                ×
              </button>
            )}
          </div>

          <span className="text-xs font-bold text-[#3d4f97]">
            {filteredLinks.length}개 링크
          </span>
        </div>

        {/* Category Filter Tabs */}
        {categories.length > 1 && (
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            theme={theme}
          />
        )}

        {/* Stacked Link Cards */}
        <div className="space-y-2">
          {filteredLinks.map((link) => (
            <LinkCard
              key={link.id}
              link={link}
              theme={theme}
              onLinkClick={handleLinkClick}
              existingCategories={categories}
            />
          ))}

          {/* Empty State */}
          {filteredLinks.length === 0 && (
            <Card variant="inset" className="p-8 text-center space-y-2 bg-white border border-[#3d4f97]">
              <div className="w-10 h-10 mx-auto rounded-full bg-[#8ba1d4] flex items-center justify-center text-[#21242e]">
                <Database className="w-5 h-5 text-[#f68d1f]" />
              </div>
              <p className="text-xs text-[#21242e] font-black uppercase">
                {profile.links.length === 0
                  ? "등록된 공개 링크가 없습니다."
                  : "검색 및 카테고리 조건에 일치하는 링크가 없습니다."}
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        profile={profile}
      />
    </div>
  );
}
