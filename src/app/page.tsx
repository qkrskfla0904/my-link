"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { INITIAL_PROFILE } from "@/constants";
import { ProfileHeader } from "@/components/links/ProfileHeader";
import { LinkCard } from "@/components/links/LinkCard";
import { CategoryFilter } from "@/components/links/CategoryFilter";
import { AddLinkDialog } from "@/components/links/AddLinkDialog";
import { ThemePicker } from "@/components/common/ThemePicker";
import { ShareModal } from "@/components/common/ShareModal";
import { ThemeAccent, UserProfile, LinkItem } from "@/types";
import {
  addLinkToFirestore,
  getLinksFromFirestore,
  updateLinkInFirestore,
  incrementFirestoreLinkClick,
  deleteLinkFromFirestore,
  seedSampleLinksToFirestore,
} from "@/lib/links";
import {
  ChevronRight,
  Radio as RadioIcon,
  Award,
  Search,
  Sparkles,
  Plus,
  Loader2,
  Database,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const STORAGE_PROFILE_KEY = "mylink_profile_data";
const STORAGE_THEME_KEY = "mylink_theme";

export default function HomePage() {
  const [profile, setProfile] = useState<UserProfile>(() => ({
    ...INITIAL_PROFILE,
    links: [], // Start empty; populated directly from Firestore on load
  }));
  const [theme, setTheme] = useState<ThemeAccent>("violet");
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const [pollVote, setPollVote] = useState("option-1");
  const [pollSubmitted, setPollSubmitted] = useState(false);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState(false);
  
  // Loading indicators: initial load vs. ongoing background update/refresh
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string>("링크 목록 갱신 중...");
  const [isSeeding, setIsSeeding] = useState(false);

  // Function to load links from Firestore (path: users/anonymous/links, orderBy createdAt desc)
  const fetchLinks = useCallback(async (isInitial = false, customMsg?: string) => {
    if (isInitial) {
      setIsInitialLoading(true);
    } else {
      setIsUpdating(true);
      if (customMsg) setUpdateMessage(customMsg);
    }

    try {
      const firestoreLinks = await getLinksFromFirestore();
      setIsFirestoreConnected(true);
      setProfile((prev) => {
        const updated = {
          ...prev,
          links: firestoreLinks,
        };
        try {
          localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to sync profile to localStorage:", e);
        }
        return updated;
      });
    } catch (error) {
      console.error("Failed to load links from Firestore:", error);
    } finally {
      if (isInitial) {
        setIsInitialLoading(false);
      } else {
        setIsUpdating(false);
      }
    }
  }, []);

  // Page load: load local metadata and fetch links once from Firestore
  useEffect(() => {
    // 1. Initial load for theme & profile metadata (bio, name, etc.)
    try {
      const storedTheme = localStorage.getItem(STORAGE_THEME_KEY) as ThemeAccent;
      if (storedTheme && ["violet", "emerald", "rose", "sky", "amber"].includes(storedTheme)) {
        setTheme(storedTheme);
      } else {
        localStorage.setItem(STORAGE_THEME_KEY, "violet");
      }

      const storedProfile = localStorage.getItem(STORAGE_PROFILE_KEY);
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        setProfile((prev) => ({
          ...prev,
          displayName: parsed.displayName || prev.displayName,
          bio: parsed.bio || prev.bio,
          stats: parsed.stats || prev.stats,
        }));
      }
    } catch (e) {
      console.error("Failed to load metadata from localStorage:", e);
    }

    // 2. Load links from Firestore on initial page load
    fetchLinks(true);
  }, [fetchLinks]);

  // Theme change handler with persistence
  const handleThemeChange = (newTheme: ThemeAccent) => {
    setTheme(newTheme);
    try {
      localStorage.setItem(STORAGE_THEME_KEY, newTheme);
    } catch (e) {
      console.error("Failed to save theme to localStorage:", e);
    }
  };

  // Add link handler: saves to Firestore, then refreshes the link list with visual feedback
  const handleAddLink = async (newLink: LinkItem) => {
    try {
      setIsUpdating(true);
      setUpdateMessage("새 링크를 Firestore에 저장하고 목록을 갱신하는 중...");

      // 1. Save directly to Firestore collection: users/anonymous/links (with serverTimestamp)
      await addLinkToFirestore(newLink);

      // 2. Refresh the link list from Firestore so the newly added link appears in order
      await fetchLinks(false, "최신 목록 불러오는 중...");

      // 3. If currently filtered out, switch to "전체" so the newly inserted link is visible
      if (selectedCategory !== "전체" && selectedCategory !== newLink.category) {
        setSelectedCategory("전체");
      }
    } catch (error) {
      console.error("Error saving link to Firestore:", error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete link handler: deletes from Firestore, then refreshes the list with loading indicator
  const handleDeleteLink = async (linkId: string) => {
    try {
      setIsUpdating(true);
      setUpdateMessage("링크 삭제 후 목록을 갱신하는 중...");
      await deleteLinkFromFirestore(linkId);
      await fetchLinks(false, "목록 갱신 완료 중...");
    } catch (error) {
      console.error("Failed to delete link from Firestore:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Update link handler: updates in Firestore (users/anonymous/links), then refreshes the list (갱신형)
  const handleUpdateLink = async (linkId: string, updatedData: Partial<LinkItem>) => {
    try {
      setIsUpdating(true);
      setUpdateMessage("링크 수정 사항을 Firestore에 저장하고 목록을 갱신하는 중...");

      // 1. Update document in Firestore at users/anonymous/links
      await updateLinkInFirestore(linkId, updatedData);

      // 2. Refresh the link list from Firestore ("실시간은 아니고, 갱신형이야")
      await fetchLinks(false, "수정된 최신 링크 목록 불러오는 중...");

      // 3. If category changed and is currently filtered out, switch to "전체" so the updated link is visible
      if (
        updatedData.category &&
        selectedCategory !== "전체" &&
        selectedCategory !== updatedData.category
      ) {
        setSelectedCategory("전체");
      }
    } catch (error) {
      console.error("Error updating link in Firestore:", error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  // Link click counter handler with Firestore persistence
  const handleLinkClick = (linkId: string) => {
    // Increment in Firestore asynchronously
    incrementFirestoreLinkClick(linkId);

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

  // Seed sample links into Firestore if collection is empty, then refresh
  const handleSeedSampleLinks = async () => {
    try {
      setIsSeeding(true);
      setIsUpdating(true);
      setUpdateMessage("샘플 링크를 등록하고 목록을 불러오는 중...");
      const starters = INITIAL_PROFILE.links.slice(0, 4);
      await seedSampleLinksToFirestore(starters);
      await fetchLinks(false, "샘플 데이터 반영 중...");
    } catch (error) {
      console.error("Error seeding starter links to Firestore:", error);
      alert("Firestore 샘플 등록 중 오류가 발생했습니다. Firebase 설정을 확인해주세요.");
    } finally {
      setIsSeeding(false);
      setIsUpdating(false);
    }
  };

  // Extract unique categories from current links
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
            <div className="flex items-center gap-1.5 flex-wrap">
              <div className="w-2 h-2 bg-[#f68d1f]" />
              <h2 className="text-xs font-bold uppercase tracking-[0.5px] text-[#21242e]">
                공식 링크 목록 & 디렉토리
              </h2>

              {/* Status Badge: Active / Updating / Connecting */}
              {isUpdating ? (
                <span className="inline-flex items-center gap-1 text-[8px] font-mono font-bold bg-[#21242e] text-[#f68d1f] px-1.5 py-0.5 rounded-[2px] animate-pulse">
                  <Loader2 className="w-2.5 h-2.5 animate-spin text-[#f68d1f]" />
                  갱신 중...
                </span>
              ) : isFirestoreConnected ? (
                <span
                  title="Firestore 경로: users/anonymous/links (createdAt 최신순)"
                  className="inline-flex items-center gap-1 text-[8px] font-mono font-bold bg-[#21242e] text-[#10b981] px-1.5 py-0.5 rounded-[2px]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                  FIRESTORE (연결됨)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[8px] font-mono font-bold bg-[#21242e] text-[#ecab37] px-1.5 py-0.5 rounded-[2px]">
                  <Database className="w-2.5 h-2.5 animate-spin" />
                  연결 중...
                </span>
              )}
            </div>

            {/* Right controls: Refresh + Add Link Button + Search Bar + Count */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Manual Refresh Button with active spinning feedback */}
              <Button
                onClick={() => fetchLinks(false, "Firestore 링크 목록 다시 불러오는 중...")}
                disabled={isInitialLoading || isUpdating}
                variant="nintendoPlate"
                size="sm"
                title="Firestore에서 링크 다시 불러오기"
                className="h-6 px-1.5 text-[9px] font-bold"
              >
                <RefreshCw
                  className={`w-3 h-3 ${isUpdating ? "animate-spin text-[#f68d1f]" : ""}`}
                />
                <span className="hidden sm:inline">
                  {isUpdating ? "갱신 중..." : "새로고침"}
                </span>
              </Button>

              {/* Add Link Trigger Button */}
              <Button
                onClick={() => setIsAddLinkOpen(true)}
                disabled={isUpdating}
                variant="nintendoOrange"
                size="sm"
                className="h-6 px-2 text-[9px] sm:text-[10px] font-black tracking-wider"
              >
                <Plus className="w-3 h-3 stroke-[3]" />
                <span>링크 추가</span>
              </Button>

              {/* Quick in-directory search input */}
              <div className="flex items-center gap-1 bg-white nintendo-inset px-1.5 py-0.5 rounded-[2px]">
                <Search className="w-2.5 h-2.5 text-[#3d4f97] shrink-0" />
                <input
                  type="text"
                  placeholder="검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-16 sm:w-24 text-[9px] sm:text-[10px] text-[#21242e] font-medium outline-none bg-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-[9px] font-bold text-[#e60012] px-0.5 cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>

              <span className="text-[10px] font-bold text-[#3d4f97]">
                {filteredLinks.length}개 링크
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

          {/* Ongoing Update / Refresh Notification Banner */}
          {isUpdating && (
            <div className="w-full bg-[#f68d1f]/15 border-2 border-[#f68d1f] text-[#21242e] px-2.5 py-1.5 rounded-[2px] flex items-center justify-between text-[10px] font-bold shadow-xs animate-in fade-in-50 duration-150">
              <div className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#f68d1f] shrink-0" />
                <span>{updateMessage}</span>
              </div>
              <span className="text-[9px] font-mono text-[#f68d1f] font-black uppercase tracking-wider">
                새로고침 중...
              </span>
            </div>
          )}

          {/* Stacked Link Cards */}
          <div
            className={`space-y-1.5 transition-opacity duration-200 ${
              isUpdating ? "opacity-75 pointer-events-none" : "opacity-100"
            }`}
          >
            {/* Initial loading state skeleton */}
            {isInitialLoading && (
              <div className="space-y-2 py-4">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#3d4f97] py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#f68d1f]" />
                  <span>FIRESTORE에서 링크 목록을 불러오는 중... (users/anonymous/links)</span>
                </div>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-full h-14 bg-[#dedede] nintendo-inset animate-pulse rounded-[2px] flex items-center px-3 gap-3"
                  >
                    <div className="w-8 h-8 bg-[#8ba1d4]/50 rounded-[2px]" />
                    <div className="flex-1 space-y-1.5">
                      <div className="w-1/3 h-3 bg-[#8ba1d4]/40 rounded-[1px]" />
                      <div className="w-2/3 h-2.5 bg-[#8ba1d4]/20 rounded-[1px]" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Loaded links */}
            {!isInitialLoading &&
              filteredLinks.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  theme={theme}
                  onLinkClick={handleLinkClick}
                  onDelete={handleDeleteLink}
                  onUpdate={handleUpdateLink}
                  existingCategories={categories}
                />
              ))}

            {/* Empty state when no links in Firestore */}
            {!isInitialLoading && filteredLinks.length === 0 && (
              <Card variant="inset" className="p-6 text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-[#8ba1d4] flex items-center justify-center text-[#21242e] mb-1">
                  <Database className="w-5 h-5 text-[#f68d1f]" />
                </div>
                <p className="text-xs text-[#21242e] font-black uppercase tracking-wider">
                  {profile.links.length === 0
                    ? "FIRESTORE 컬렉션에 등록된 링크가 없습니다."
                    : "검색 및 카테고리 조건에 일치하는 링크가 없습니다."}
                </p>
                <p className="text-[10px] text-[#60619c] max-w-sm mx-auto">
                  {profile.links.length === 0
                    ? "경로 'users/anonymous/links'에서 createdAt 최신순으로 불러옵니다. 새 링크를 추가해보세요!"
                    : "다른 카테고리를 선택하거나 필터를 초기화해보세요."}
                </p>
                <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
                  {profile.links.length > 0 && (
                    <Button
                      onClick={() => {
                        setSelectedCategory("전체");
                        setSearchQuery("");
                      }}
                      variant="nintendoPlate"
                      size="sm"
                      className="text-[10px] font-bold"
                    >
                      필터 초기화
                    </Button>
                  )}
                  <Button
                    onClick={() => setIsAddLinkOpen(true)}
                    variant="nintendoOrange"
                    size="sm"
                    className="text-[10px] font-black"
                  >
                    <Plus className="w-3 h-3 stroke-[3]" />
                    새 링크 추가
                  </Button>
                  {profile.links.length === 0 && (
                    <Button
                      onClick={handleSeedSampleLinks}
                      variant="nintendoPlate"
                      size="sm"
                      disabled={isSeeding || isUpdating}
                      className="text-[10px] font-bold"
                    >
                      {isSeeding ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>등록 중...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3 h-3" />
                          <span>샘플 링크 4개 등록</span>
                        </>
                      )}
                    </Button>
                  )}
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
              <span>테마 모드 설정</span>
            </div>
            <ThemePicker currentTheme={theme} onSelectTheme={handleThemeChange} />
          </div>

          {/* Firestore Connection Info Card */}
          <Card variant="whitePlate" className="p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <Badge variant="nintendoCarbon" className="text-[9px]">
                FIRESTORE 디렉토리
              </Badge>
              <span className="text-[9px] font-mono text-[#10b981] font-bold">연결됨</span>
            </div>
            <p className="text-[10px] text-[#21242e] font-medium leading-relaxed">
              • 컬렉션: <code className="bg-[#dedede] px-1 py-0.5 rounded-[2px] font-mono text-[9px] text-[#3d4f97]">users/anonymous/links</code>
              <br />
              • 정렬: <code className="bg-[#dedede] px-1 py-0.5 rounded-[2px] font-mono text-[9px] text-[#3d4f97]">createdAt (최신순 내림차순)</code>
              <br />
              • 동작: 페이지 로드 시 1회 조회 및 링크 추가 시 목록 갱신
            </p>
          </Card>

          {/* What Is Info-Box */}
          <Card variant="whitePlate" className="p-3 space-y-2">
            <div className="inline-block">
              <Badge variant="nintendoGold" className="text-[9px]">
                마이링크(MYLINK) 안내
              </Badge>
            </div>
            <p className="text-xs leading-relaxed text-[#21242e]">
              개발 프로젝트 저장소, 기술 블로그 및 소셜 프로필을 한곳에서 모아볼 수 있는 올인원 링크 허브입니다.
            </p>
          </Card>

          {/* Player's Poll Module */}
          <Card variant="plate" className="p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-[#3d4f97] pb-1">
              <span className="text-[11px] font-black uppercase text-[#21242e] flex items-center gap-1">
                <RadioIcon className="w-3.5 h-3.5 text-[#f68d1f]" />
                방문자 미니 투표
              </span>
              <span className="text-[9px] font-bold text-[#3d4f97]">
                ISSUE #01
              </span>
            </div>

            <p className="text-[11px] font-bold text-[#21242e]">
              2000년대 레트로 웹 감성 UI를 구현할 때 가장 선호하는 스택은?
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
              {pollSubmitted ? "투표 완료! ✓" : "투표하기"}
              <ChevronRight className="w-3 h-3 stroke-[3]" />
            </Button>
          </Card>

          {/* Systems Badge Promo Card */}
          <Card variant="darkInset" className="p-2.5 text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-[#f68d1f] text-[10px] font-black uppercase">
              <Award className="w-3.5 h-3.5" />
              <span>닌텐도 스타일 인증</span>
            </div>
            <p className="text-[9px] text-[#9fbee7] font-mono">
              반응형 모바일 및 모든 데스크톱 브라우저 최적화 지원
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
