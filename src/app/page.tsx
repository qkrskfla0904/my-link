"use client";

import { useState, useMemo, useEffect } from "react";
import { INITIAL_PROFILE } from "@/constants";
import { ProfileHeader } from "@/components/links/ProfileHeader";
import { LinkCard } from "@/components/links/LinkCard";
import { CategoryFilter } from "@/components/links/CategoryFilter";
import { AddLinkDialog } from "@/components/links/AddLinkDialog";
import { EditProfileDialog } from "@/components/links/EditProfileDialog";
import { ShareModal } from "@/components/common/ShareModal";
import { ThemeAccent, UserProfile, LinkItem } from "@/types";
import { useAuth } from "@/context/AuthContext";
import {
  useLinks,
  useAddLink,
  useUpdateLink,
  useDeleteLink,
  useIncrementLinkClick,
  useSeedSampleLinks,
} from "@/hooks/useLinks";
import {
  useUserProfile,
  useUpdateProfile,
  useSyncUserProfile,
} from "@/hooks/useProfile";
import {
  Search,
  Plus,
  Loader2,
  Database,
  RefreshCw,
  Lock,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

  // TanStack Query hooks
  const {
    data: linksData = [],
    isLoading: isLinksLoading,
    isFetching: isLinksFetching,
    refetch: refetchLinks,
  } = useLinks(user?.uid);

  const {
    data: userProfileData,
    isLoading: isProfileLoading,
  } = useUserProfile(user?.uid);

  const addLinkMutation = useAddLink(user?.uid);
  const updateLinkMutation = useUpdateLink(user?.uid);
  const deleteLinkMutation = useDeleteLink(user?.uid);
  const clickCountMutation = useIncrementLinkClick(user?.uid);
  const seedSampleMutation = useSeedSampleLinks(user?.uid);
  const updateProfileMutation = useUpdateProfile(user?.uid);
  const syncProfileMutation = useSyncUserProfile();

  const [theme, setTheme] = useState<ThemeAccent>("violet");
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // Sync initial user profile info to Firestore upon login
  useEffect(() => {
    if (user) {
      syncProfileMutation.mutate({
        userId: user.uid,
        userData: {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        },
      });
    }
  }, [user?.uid]);

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

  // Theme change handler
  const handleThemeChange = (newTheme: ThemeAccent) => {
    setTheme(newTheme);
    try {
      localStorage.setItem(STORAGE_THEME_KEY, newTheme);
    } catch (e) {
      console.error("Failed to save theme to localStorage:", e);
    }
  };

  // Composed profile derived from TanStack Query caches and Auth
  const profile: UserProfile = useMemo(() => {
    if (!user) {
      return {
        ...INITIAL_PROFILE,
        id: "",
        displayName: "",
        bio: "",
        avatarUrl: undefined,
        tags: [],
        statusMessage: "",
        links: [],
      };
    }
    return {
      ...INITIAL_PROFILE,
      id: user.uid,
      displayName: userProfileData?.displayName || user.displayName || "마이링크 사용자",
      bio: userProfileData?.bio !== undefined ? userProfileData.bio : "환영합니다! 나만의 맞춤형 링크 모음입니다. 🚀",
      avatarUrl: userProfileData?.avatarUrl || user.photoURL || undefined,
      tags: userProfileData?.tags || ["💻 개발자", "🔗 마이링크"],
      statusMessage: userProfileData?.statusMessage || "온라인",
      isAvailableForHire: userProfileData?.isAvailableForHire ?? true,
      stats: {
        views: userProfileData?.stats?.views ?? 1,
        likes: userProfileData?.stats?.likes ?? likesCount,
      },
      links: linksData,
    };
  }, [user, userProfileData, linksData, likesCount]);

  const isUpdating =
    isLinksFetching ||
    addLinkMutation.isPending ||
    updateLinkMutation.isPending ||
    deleteLinkMutation.isPending ||
    seedSampleMutation.isPending ||
    updateProfileMutation.isPending;

  const isInitialLoading = user ? isLinksLoading || isProfileLoading : false;

  // Profile update handler
  const handleSaveProfile = async (updatedData: {
    displayName: string;
    bio?: string;
    avatarUrl?: string;
    tags?: string[];
    statusMessage?: string;
    isAvailableForHire?: boolean;
  }) => {
    if (user) {
      await updateProfileMutation.mutateAsync(updatedData);
    }
  };

  // Add link handler
  const handleAddLink = async (newLink: LinkItem) => {
    if (!user) {
      alert("로그인 후 링크를 추가할 수 있습니다.");
      return;
    }

    await addLinkMutation.mutateAsync(newLink);

    if (selectedCategory !== "전체" && selectedCategory !== newLink.category) {
      setSelectedCategory("전체");
    }
  };

  // Delete link handler
  const handleDeleteLink = async (linkId: string) => {
    if (!user) return;
    await deleteLinkMutation.mutateAsync(linkId);
  };

  // Update link handler
  const handleUpdateLink = async (linkId: string, updatedData: Partial<LinkItem>) => {
    if (!user) return;
    await updateLinkMutation.mutateAsync({ linkId, data: updatedData });
  };

  // Link click counter handler
  const handleLinkClick = (linkId: string) => {
    if (user) {
      clickCountMutation.mutate(linkId);
    }
  };

  // Seed sample links into Firestore
  const handleSeedSampleLinks = async () => {
    if (!user) return;
    try {
      const starters = INITIAL_PROFILE.links.slice(0, 4);
      await seedSampleMutation.mutateAsync(starters);
    } catch (error) {
      console.error("Error seeding starter links:", error);
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
        (link.category && link.category.toLowerCase().includes(query));

      return matchesCategory && matchesQuery;
    });
  }, [profile.links, selectedCategory, searchQuery]);

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
      {/* Auth Loading Skeleton */}
      {isAuthLoading ? (
        <Card variant="plate" className="p-8 text-center space-y-3 bg-[#dedede] nintendo-plate border-2 border-[#3d4f97]">
          <Loader2 className="w-8 h-8 animate-spin text-[#f68d1f] mx-auto" />
          <p className="text-xs font-black text-[#21242e] uppercase tracking-wider">
            인증 상태 확인 중...
          </p>
        </Card>
      ) : !user ? (
        /* ========================================================== */
        /* Logged-Out View (로그인 전에는 개인 정보 일체 미노출)      */
        /* ========================================================== */
        <div className="w-full bg-[#dedede] nintendo-plate p-5 sm:p-7 border-2 border-[#3d4f97] shadow-md space-y-5 text-center rounded-[2px] animate-in fade-in-50 duration-200">
          {/* Nintendo Hardware Header Bar */}
          <div className="flex items-center justify-between border-b-2 border-[#3d4f97] pb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e60012] animate-ping" />
              <span className="text-xs font-black uppercase tracking-wider text-[#21242e] flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-[#e60012]" />
                로그인 대기 모드 (GUEST)
              </span>
            </div>
            <span className="text-[9px] font-mono font-bold bg-[#21242e] text-[#ecab37] px-2 py-0.5 rounded-[2px]">
              INSERT USER CARTRIDGE
            </span>
          </div>

          {/* Centered Nintendo Cartridge Slot Icon */}
          <div className="w-16 h-16 mx-auto rounded-[3px] bg-[#8ba1d4] nintendo-plate flex items-center justify-center border-2 border-[#3d4f97] shadow-inner">
            <Sparkles className="w-8 h-8 text-[#ecab37]" />
          </div>

          {/* Headline & Description */}
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-base sm:text-lg font-black nintendo-boxart-text tracking-tight text-[#21242e]">
              나만의 닌텐도 마이링크를 시작하세요!
            </h2>
            <p className="text-xs text-[#3d4f97] font-medium leading-relaxed break-keep">
              Google 계정으로 로그인하시면 나만의 프로필과 맞춤형 링크 카트리지가 즉시 활성화됩니다.
            </p>
          </div>

          {/* Big Nintendo Google Login CTA Button */}
          <div className="pt-2 flex justify-center">
            <Button
              onClick={() => loginWithGoogle()}
              variant="nintendoOrange"
              size="lg"
              className="h-10 sm:h-11 px-6 sm:px-8 text-xs sm:text-sm font-black tracking-wide shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <GoogleIcon className="w-4 h-4 bg-white rounded-full p-0.5 shrink-0" />
              <span>Google 계정으로 로그인하기</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </Button>
          </div>
        </div>
      ) : (
        /* ========================================================== */
        /* Logged-In View (로그인 완료 시에만 내 정보 & 링크 표시)     */
        /* ========================================================== */
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          {/* 1. Nintendo Retro Profile Card with Real-Time Theme Swatches */}
          <ProfileHeader
            profile={profile}
            theme={theme}
            onOpenShareModal={() => setIsShareOpen(true)}
            onLikeChange={(likes) => setLikesCount(likes)}
            onOpenEditProfile={() => setIsEditProfileOpen(true)}
            onSelectTheme={handleThemeChange}
          />

          {/* 2. Action Header: Add Link Button + Search + Refresh */}
          <div className="flex items-center justify-between gap-2 flex-wrap bg-[#8ba1d4] nintendo-plate p-2 rounded-[2px] border border-[#3d4f97]">
            {/* Primary Add Link Button */}
            <Button
              onClick={() => setIsAddLinkOpen(true)}
              disabled={isUpdating}
              variant="nintendoOrange"
              size="sm"
              className="h-7 sm:h-8 px-3 sm:px-4 text-[11px] sm:text-xs font-black tracking-wider shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>링크 추가</span>
            </Button>

            {/* Quick search input */}
            <div className="flex items-center gap-1 bg-white nintendo-inset px-2 py-0.5 rounded-[2px] flex-1 max-w-xs border border-[#3d4f97]">
              <Search className="w-3.5 h-3.5 text-[#3d4f97] shrink-0" />
              <input
                type="text"
                placeholder="링크 검색..."
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

            {/* Refresh & Link Count */}
            <div className="flex items-center gap-2 text-xs font-bold text-[#21242e]">
              <Button
                onClick={() => refetchLinks()}
                disabled={isInitialLoading || isUpdating}
                variant="nintendoPlate"
                size="sm"
                title="새로고침"
                className="h-7 px-2 text-[10px] font-bold"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLinksFetching ? "animate-spin text-[#f68d1f]" : ""}`} />
                <span className="hidden sm:inline">새로고침</span>
              </Button>
              <span className="font-mono text-[#3d4f97]">{filteredLinks.length}개</span>
            </div>
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

          {/* Link Cards List */}
          <div className="space-y-2">
            {isInitialLoading ? (
              <div className="space-y-2 py-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-full h-16 bg-[#dedede] nintendo-inset animate-pulse rounded-[2px]"
                  />
                ))}
              </div>
            ) : filteredLinks.length > 0 ? (
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
              ))
            ) : (
              /* Empty State */
              <Card variant="inset" className="p-8 text-center space-y-3 bg-[#dedede] border border-[#3d4f97]">
                <div className="w-10 h-10 mx-auto rounded-full bg-[#8ba1d4] flex items-center justify-center text-[#21242e]">
                  <Database className="w-5 h-5 text-[#f68d1f]" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-black text-[#21242e] uppercase tracking-wider">
                    {profile.links.length === 0
                      ? "현재 등록된 링크 카트리지가 없습니다."
                      : "검색 및 카테고리 조건에 일치하는 링크가 없습니다."}
                  </p>
                  <p className="text-[10px] text-[#60619c]">
                    {profile.links.length === 0
                      ? "상단의 [링크 추가] 버튼을 눌러 첫 번째 링크를 등록해보세요!"
                      : "검색어를 지우거나 필터를 초기화해보세요."}
                  </p>
                </div>
                {profile.links.length === 0 && (
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <Button
                      onClick={() => setIsAddLinkOpen(true)}
                      variant="nintendoOrange"
                      size="sm"
                      className="text-xs font-black"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3] mr-1" />
                      새 링크 추가
                    </Button>
                    <Button
                      onClick={handleSeedSampleLinks}
                      variant="nintendoPlate"
                      size="sm"
                      className="text-xs font-bold"
                    >
                      기본 샘플 링크 가져오기
                    </Button>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Dialog Modals */}
      <AddLinkDialog
        isOpen={isAddLinkOpen}
        onClose={() => setIsAddLinkOpen(false)}
        onAddLink={handleAddLink}
        existingCategories={categories}
      />

      <EditProfileDialog
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentProfile={profile}
        currentUserId={user?.uid}
        onSave={handleSaveProfile}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        profile={profile}
      />
    </div>
  );
}
