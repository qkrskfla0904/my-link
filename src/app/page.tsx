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
import { useAuth } from "@/context/AuthContext";
import {
  addLinkToFirestore,
  getLinksFromFirestore,
  updateLinkInFirestore,
  incrementFirestoreLinkClick,
  deleteLinkFromFirestore,
  seedSampleLinksToFirestore,
  syncUserProfileToFirestore,
  getUserProfileFromFirestore,
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
  LogIn,
  ShieldCheck,
  FolderGit2,
  Lock,
  ExternalLink,
  CheckCircle2,
  UserCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const STORAGE_THEME_KEY = "mylink_theme";

function GoogleIcon({ className = "w-4 h-4" }: { className?: string }) {
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

export default function HomePage() {
  const { user, loading: isAuthLoading, loginWithGoogle } = useAuth();

  const [profile, setProfile] = useState<UserProfile>(() => ({
    ...INITIAL_PROFILE,
    links: [], // Populated from Firestore based on user.uid
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
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string>("링크 목록 갱신 중...");
  const [isSeeding, setIsSeeding] = useState(false);

  // Function to load links from Firestore for a specific user: users/{userId}/links
  const fetchLinks = useCallback(
    async (userId: string, isInitial = false, customMsg?: string) => {
      if (isInitial) {
        setIsInitialLoading(true);
      } else {
        setIsUpdating(true);
        if (customMsg) setUpdateMessage(customMsg);
      }

      try {
        const firestoreLinks = await getLinksFromFirestore(userId);
        setIsFirestoreConnected(true);
        setProfile((prev) => ({
          ...prev,
          links: firestoreLinks,
        }));
      } catch (error) {
        console.error("Failed to load links from Firestore:", error);
      } finally {
        if (isInitial) {
          setIsInitialLoading(false);
        } else {
          setIsUpdating(false);
        }
      }
    },
    []
  );

  // Initialize theme from localStorage
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem(STORAGE_THEME_KEY) as ThemeAccent;
      if (storedTheme && ["violet", "emerald", "rose", "sky", "amber"].includes(storedTheme)) {
        setTheme(storedTheme);
      } else {
        localStorage.setItem(STORAGE_THEME_KEY, "violet");
      }
    } catch (e) {
      console.error("Failed to load theme from localStorage:", e);
    }
  }, []);

  // When user auth state changes:
  useEffect(() => {
    if (user) {
      // 1. Sync auth user info to Firestore users/{user.uid}
      syncUserProfileToFirestore(user.uid, {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      }).then(async () => {
        // Fetch any existing custom user profile from Firestore users/{user.uid}
        const userDoc = await getUserProfileFromFirestore(user.uid);
        if (userDoc) {
          setProfile((prev) => ({
            ...prev,
            displayName: userDoc.displayName || user.displayName || prev.displayName,
            bio: userDoc.bio || prev.bio,
            stats: userDoc.stats || prev.stats,
          }));
        } else {
          setProfile((prev) => ({
            ...prev,
            displayName: user.displayName || prev.displayName,
          }));
        }
      });

      // 2. Fetch personalized links from users/{user.uid}/links
      fetchLinks(user.uid, true);
    } else {
      // When logged out, reset personalized links
      setProfile((prev) => ({
        ...prev,
        links: [],
      }));
      setIsFirestoreConnected(false);
    }
  }, [user, fetchLinks]);

  // Theme change handler with persistence
  const handleThemeChange = (newTheme: ThemeAccent) => {
    setTheme(newTheme);
    try {
      localStorage.setItem(STORAGE_THEME_KEY, newTheme);
    } catch (e) {
      console.error("Failed to save theme to localStorage:", e);
    }
  };

  // Add link handler: saves to Firestore users/{user.uid}/links
  const handleAddLink = async (newLink: LinkItem) => {
    if (!user) {
      alert("로그인 후 링크를 추가할 수 있습니다.");
      return;
    }

    try {
      setIsUpdating(true);
      setUpdateMessage("새 링크를 Firestore에 저장하고 목록을 갱신하는 중...");

      // 1. Save directly to Firestore collection: users/{user.uid}/links (with serverTimestamp)
      await addLinkToFirestore(user.uid, newLink);

      // 2. Refresh the link list from Firestore so the newly added link appears in order
      await fetchLinks(user.uid, false, "최신 목록 불러오는 중...");

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

  // Delete link handler: deletes from Firestore users/{user.uid}/links
  const handleDeleteLink = async (linkId: string) => {
    if (!user) return;
    try {
      setIsUpdating(true);
      setUpdateMessage("링크 삭제 후 목록을 갱신하는 중...");
      await deleteLinkFromFirestore(user.uid, linkId);
      await fetchLinks(user.uid, false, "목록 갱신 완료 중...");
    } catch (error) {
      console.error("Failed to delete link from Firestore:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Update link handler: updates in Firestore users/{user.uid}/links/{linkId}
  const handleUpdateLink = async (linkId: string, updatedData: Partial<LinkItem>) => {
    if (!user) return;
    try {
      setIsUpdating(true);
      setUpdateMessage("링크 수정 사항을 Firestore에 저장하고 목록을 갱신하는 중...");

      await updateLinkInFirestore(user.uid, linkId, updatedData);
      await fetchLinks(user.uid, false, "수정된 최신 링크 목록 불러오는 중...");

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

  // Link click counter handler with Firestore persistence: users/{user.uid}/links
  const handleLinkClick = (linkId: string) => {
    if (user) {
      incrementFirestoreLinkClick(user.uid, linkId);
    }

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

      return {
        ...prev,
        links: updatedLinks,
      };
    });
  };

  // Like change handler
  const handleLikeChange = (newLikes: number) => {
    setProfile((prev) => ({
      ...prev,
      stats: {
        views: prev.stats?.views ?? 1280,
        likes: newLikes,
      },
    }));
  };

  // Seed sample links into Firestore users/{user.uid}/links
  const handleSeedSampleLinks = async () => {
    if (!user) {
      alert("로그인 후 샘플 링크를 등록할 수 있습니다.");
      return;
    }

    try {
      setIsSeeding(true);
      setIsUpdating(true);
      setUpdateMessage("샘플 링크를 등록하고 목록을 불러오는 중...");
      const starters = INITIAL_PROFILE.links.slice(0, 4);
      await seedSampleLinksToFirestore(user.uid, starters);
      await fetchLinks(user.uid, false, "샘플 데이터 반영 중...");
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
      const matchesCategory =
        selectedCategory === "전체" || link.category === selectedCategory;

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
        {/* Left Column: Official Directory or Login Explanation Gate (2/3 width) */}
        <div className="md:col-span-2 space-y-2">
          {isAuthLoading ? (
            /* Auth Loading Skeleton */
            <Card variant="plate" className="p-8 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#f68d1f] mx-auto" />
              <p className="text-xs font-black uppercase text-[#21242e] tracking-wider">
                인증 상태 확인 중...
              </p>
              <p className="text-[10px] text-[#60619c]">
                구글 소셜 로그인 계정 및 Firestore 연결 상태를 불러오고 있습니다.
              </p>
            </Card>
          ) : !user ? (
            /* ========================================================== */
            /* Logged-Out Explanation View (로그인에 따른 미로그인 화면)   */
            /* ========================================================== */
            <div className="space-y-3 animate-in fade-in-50 duration-200">
              {/* Login Requirement Banner */}
              <div className="w-full bg-[#8ba1d4] nintendo-plate p-3 sm:p-4 space-y-3">
                <div className="flex items-center gap-2 border-b border-[#3d4f97] pb-2">
                  <div className="w-2.5 h-2.5 bg-[#e60012] rounded-full animate-ping shrink-0" />
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#21242e] flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-[#e60012]" />
                    로그인이 필요한 서비스입니다
                  </span>
                  <Badge variant="nintendoGold" className="text-[8px] sm:text-[9px] ml-auto">
                    GUEST MODE
                  </Badge>
                </div>

                {/* Primary Explanation Text */}
                <div className="space-y-1.5 bg-white nintendo-inset p-3 rounded-[2px]">
                  <h3 className="text-xs sm:text-sm font-black text-[#21242e] leading-snug">
                    구글 소셜 로그인 후 나만의 개인화된 링크 허브를 시작해보세요! 🚀
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-[#3d4f97] font-medium leading-relaxed">
                    마이링크는 로그인한 사용자별로 독립된 Firestore 클라우드 경로인{" "}
                    <code className="bg-[#e2e8f0] px-1 py-0.5 rounded text-[#e60012] font-mono font-bold">
                      users/&#123;user.uid&#125;/links
                    </code>
                    를 할당합니다. 로그인하시면 나만의 개발자/크리에이터 링크를 추가하고 실시간으로 관리할 수 있습니다.
                  </p>
                </div>

                {/* 3 Step Feature Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[10px]">
                  <div className="bg-white/80 border border-[#3d4f97] p-2 rounded-[2px] space-y-1">
                    <div className="flex items-center gap-1 text-[#e60012] font-black">
                      <GoogleIcon className="w-3 h-3 shrink-0" />
                      <span>1초 간편 로그인</span>
                    </div>
                    <p className="text-[9px] text-[#21242e] leading-tight">
                      별도 회원가입 없이 구글 계정으로 즉시 연동됩니다.
                    </p>
                  </div>

                  <div className="bg-white/80 border border-[#3d4f97] p-2 rounded-[2px] space-y-1">
                    <div className="flex items-center gap-1 text-[#10b981] font-black">
                      <Database className="w-3 h-3 shrink-0" />
                      <span>개인화 클라우드</span>
                    </div>
                    <p className="text-[9px] text-[#21242e] leading-tight font-mono">
                      users/&#123;uid&#125;/links 경로에 내 데이터가 보관됩니다.
                    </p>
                  </div>

                  <div className="bg-white/80 border border-[#3d4f97] p-2 rounded-[2px] space-y-1">
                    <div className="flex items-center gap-1 text-[#f68d1f] font-black">
                      <Sparkles className="w-3 h-3 shrink-0" />
                      <span>2001 레트로 테마</span>
                    </div>
                    <p className="text-[9px] text-[#21242e] leading-tight">
                      5가지 하드웨어 섀시 테마와 클릭수 분석을 제공합니다.
                    </p>
                  </div>
                </div>

                {/* Big Google Login CTA Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                  <Button
                    onClick={() => loginWithGoogle()}
                    variant="nintendoOrange"
                    size="lg"
                    className="w-full sm:w-auto flex-1 h-9 sm:h-10 text-xs sm:text-sm font-black tracking-wide shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 bg-[#f68d1f] hover:bg-[#ff9d33]"
                  >
                    <GoogleIcon className="w-4 h-4 bg-white rounded-full p-0.5 shrink-0" />
                    <span>Google 계정으로 로그인하고 시작하기</span>
                    <ChevronRight className="w-4 h-4 stroke-[3]" />
                  </Button>
                </div>
              </div>

              {/* Preview Section: How it looks after login */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-black text-[#21242e] uppercase tracking-wider flex items-center gap-1">
                    <FolderGit2 className="w-3.5 h-3.5 text-[#3d4f97]" />
                    로그인 후 제공되는 링크 디렉토리 미리보기 (Preview)
                  </span>
                  <Badge variant="nintendoCarbon" className="text-[8px]">
                    PREVIEW ONLY
                  </Badge>
                </div>

                {/* Mock Starter Link Cards */}
                <div className="space-y-1.5 opacity-85">
                  {[
                    {
                      title: "GitHub & 프로젝트 저장소",
                      category: "개발/코드",
                      desc: "주요 웹 개발 프로젝트 소스 코드 및 오픈소스 기여 기록",
                      clicks: 342,
                      url: "https://github.com",
                    },
                    {
                      title: "인터랙티브 웹 포트폴리오",
                      category: "포트폴리오",
                      desc: "Three.js & WebGL 기반 인터랙티브 인터페이스 쇼케이스",
                      clicks: 289,
                      url: "https://example.com",
                    },
                    {
                      title: "기술 블로그 (Tech Insights)",
                      category: "블로그",
                      desc: "Next.js App Router, 웹 성능 최적화, 프론트엔드 기록",
                      clicks: 218,
                      url: "https://velog.io",
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="w-full bg-[#dedede] nintendo-plate p-2.5 sm:p-3 flex items-center justify-between gap-2 rounded-[2px] border border-[#3d4f97]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-[2px] bg-[#8ba1d4] border border-[#3d4f97] flex items-center justify-center text-[#21242e] font-black shrink-0">
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] sm:text-xs font-black text-[#21242e] truncate">
                              {item.title}
                            </span>
                            <Badge variant="nintendoGold" className="text-[8px] py-0 px-1">
                              {item.category}
                            </Badge>
                          </div>
                          <p className="text-[9px] sm:text-[10px] text-[#60619c] truncate">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[9px] font-mono text-[#3d4f97] font-bold">
                          {item.clicks}회 클릭
                        </span>
                        <Button
                          onClick={() => loginWithGoogle()}
                          variant="nintendoPlate"
                          size="sm"
                          className="h-6 px-1.5 text-[9px] font-bold"
                        >
                          <Lock className="w-2.5 h-2.5 mr-0.5 text-[#e60012]" />
                          <span>로그인 필요</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white/60 border border-[#3d4f97] p-2 rounded-[2px] text-center">
                  <p className="text-[10px] text-[#3d4f97] font-bold">
                    💡 구글 로그인 시 사용자님의 전용 저장소(users/&#123;user.uid&#125;/links)가 즉시 활성화되어 링크를 자유롭게 추가·수정할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================== */
            /* Logged-In Active Dashboard (로그인 완료 화면)               */
            /* ========================================================== */
            <div className="space-y-2">
              {/* Section Label Bar with Personalized Path & User Info */}
              <div className="w-full bg-[#8ba1d4] nintendo-plate px-2.5 py-1.5 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <div className="w-2 h-2 bg-[#00ff66] rounded-full animate-ping" />
                  <h2 className="text-xs font-bold uppercase tracking-[0.5px] text-[#21242e]">
                    내 공식 링크 목록
                  </h2>

                  {/* Status Badge: Active Firestore path for user */}
                  {isUpdating ? (
                    <span className="inline-flex items-center gap-1 text-[8px] font-mono font-bold bg-[#21242e] text-[#f68d1f] px-1.5 py-0.5 rounded-[2px] animate-pulse">
                      <Loader2 className="w-2.5 h-2.5 animate-spin text-[#f68d1f]" />
                      동기화 중...
                    </span>
                  ) : isFirestoreConnected ? (
                    <span
                      title={`Firestore 경로: users/${user.uid}/links (개인화 연동됨)`}
                      className="inline-flex items-center gap-1 text-[8px] font-mono font-bold bg-[#21242e] text-[#10b981] px-1.5 py-0.5 rounded-[2px]"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                      users/{user.uid.slice(0, 6)}.../links
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
                  {/* Manual Refresh Button */}
                  <Button
                    onClick={() =>
                      fetchLinks(user.uid, false, "Firestore 링크 목록 다시 불러오는 중...")
                    }
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

              {/* User Identity Info Banner */}
              <div className="w-full bg-white/70 border border-[#3d4f97] px-2.5 py-1 rounded-[2px] flex items-center justify-between text-[9px] sm:text-[10px] font-bold text-[#21242e] flex-wrap gap-1">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-3 h-3 text-[#10b981]" />
                  <span>로그인 계정:</span>
                  <span className="text-[#3d4f97]">{user.displayName || "사용자"}</span>
                  <span className="text-[#60619c]">({user.email})</span>
                </div>
                <div className="flex items-center gap-1 font-mono text-[#10b981]">
                  <span>경로: users/{user.uid}/links</span>
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
                      <span>
                        FIRESTORE에서 내 링크 목록을 불러오는 중... (users/{user.uid.slice(0, 6)}.../links)
                      </span>
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
                        ? "현재 등록된 링크가 없습니다."
                        : "검색 및 카테고리 조건에 일치하는 링크가 없습니다."}
                    </p>
                    <p className="text-[10px] text-[#60619c] max-w-sm mx-auto">
                      {profile.links.length === 0
                        ? `경로 'users/${user.uid}/links'에 첫 번째 링크를 등록하거나 샘플 링크를 생성해보세요!`
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
                              <span>기본 샘플 링크 4개 가져오기</span>
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}
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
              <span
                className={`text-[9px] font-mono font-bold ${
                  user ? "text-[#10b981]" : "text-[#f68d1f]"
                }`}
              >
                {user ? "개인화 연동됨" : "로그인 대기"}
              </span>
            </div>
            <p className="text-[10px] text-[#21242e] font-medium leading-relaxed">
              • 컬렉션:{" "}
              <code className="bg-[#dedede] px-1 py-0.5 rounded-[2px] font-mono text-[9px] text-[#3d4f97]">
                {user ? `users/${user.uid}/links` : "users/{user.uid}/links"}
              </code>
              <br />
              • 사용자:{" "}
              <span className="font-mono text-[9px] text-[#3d4f97]">
                {user ? `${user.displayName || "회원"} (${user.email})` : "게스트 (미로그인)"}
              </span>
              <br />
              • 정렬:{" "}
              <code className="bg-[#dedede] px-1 py-0.5 rounded-[2px] font-mono text-[9px] text-[#3d4f97]">
                createdAt (최신순 내림차순)
              </code>
              <br />
              • 동작: {user ? "실시간 갱신 및 CRUD 지원" : "로그인 후 개인 데이터베이스 활성화"}
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
              <span className="text-[9px] font-bold text-[#3d4f97]">ISSUE #01</span>
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
