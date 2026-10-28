"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LinkItem, ThemeAccent } from "@/types";
import {
  linkFormSchema,
  type LinkFormValues,
  DEFAULT_CATEGORIES,
  normalizeUrl,
} from "@/lib/validation";
import {
  BookOpen,
  Mail,
  Globe,
  Copy,
  Check,
  ChevronRight,
  Flame,
  FileText,
  Code2,
  Send,
  Sparkles,
  MousePointerClick,
  Trash2,
  Pencil,
  X,
  AlertTriangle,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LinkCardProps {
  link: LinkItem;
  theme?: ThemeAccent;
  onLinkClick?: (id: string) => void;
  onDelete?: (id: string) => Promise<void> | void;
  onUpdate?: (id: string, updatedLink: Partial<LinkItem>) => Promise<void> | void;
  existingCategories?: string[];
}

const AVAILABLE_ICONS = [
  { id: "globe", label: "웹사이트" },
  { id: "github", label: "깃허브" },
  { id: "project", label: "프로젝트" },
  { id: "blog", label: "블로그" },
  { id: "resume", label: "이력서" },
  { id: "code", label: "코드" },
  { id: "linkedin", label: "링크드인" },
  { id: "youtube", label: "유튜브" },
  { id: "twitter", label: "트위터" },
  { id: "mail", label: "커피챗" },
  { id: "send", label: "이메일" },
];

function GithubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="15"
      height="15"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="15"
      height="15"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="15"
      height="15"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkIconRenderer({ iconName }: { iconName?: string }) {
  switch (iconName) {
    case "github":
      return <GithubIcon />;
    case "project":
      return <Sparkles className="w-3.5 h-3.5" />;
    case "blog":
      return <BookOpen className="w-3.5 h-3.5" />;
    case "resume":
      return <FileText className="w-3.5 h-3.5" />;
    case "code":
      return <Code2 className="w-3.5 h-3.5" />;
    case "linkedin":
      return <LinkedinIcon />;
    case "youtube":
      return <YoutubeIcon />;
    case "twitter":
      return <TwitterIcon />;
    case "mail":
      return <Mail className="w-3.5 h-3.5" />;
    case "send":
      return <Send className="w-3.5 h-3.5" />;
    case "globe":
    default:
      return <Globe className="w-3.5 h-3.5" />;
  }
}

export function LinkCard({
  link,
  onLinkClick,
  onDelete,
  onUpdate,
  existingCategories = [],
}: LinkCardProps) {
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const categories = Array.from(
    new Set([
      ...DEFAULT_CATEGORIES,
      ...existingCategories.filter((c) => c !== "전체"),
      ...(link.category ? [link.category] : []),
    ])
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkFormSchema),
    mode: "onChange",
    defaultValues: {
      title: link.title || "",
      url: link.url || "",
      description: link.description || "",
      category: link.category || "개발/코드",
      customCategory: "",
      icon: link.icon || "globe",
      isPopular: Boolean(link.isPopular),
    },
  });

  const titleValue = watch("title") || "";
  const urlValue = watch("url") || "";
  const descValue = watch("description") || "";
  const currentCategory = watch("category");
  const currentIcon = watch("icon");
  const currentIsPopular = watch("isPopular");

  const handleStartEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    reset({
      title: link.title || "",
      url: link.url || "",
      description: link.description || "",
      category: link.category || "개발/코드",
      customCategory: "",
      icon: link.icon || "globe",
      isPopular: Boolean(link.isPopular),
    });
    setSaveError(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (isSaving) return;
    setSaveError(null);
    reset({
      title: link.title || "",
      url: link.url || "",
      description: link.description || "",
      category: link.category || "개발/코드",
      customCategory: "",
      icon: link.icon || "globe",
      isPopular: Boolean(link.isPopular),
    });
    setIsEditing(false);
  };

  const onSave = async (data: LinkFormValues) => {
    if (!onUpdate) return;
    const finalUrl = normalizeUrl(data.url);
    const finalCategory =
      data.category === "__custom__"
        ? data.customCategory?.trim() || "기타"
        : data.category;

    try {
      setIsSaving(true);
      setSaveError(null);
      await onUpdate(link.id, {
        title: data.title.trim(),
        url: finalUrl,
        description: data.description?.trim() || "",
        category: finalCategory,
        icon: data.icon,
        isPopular: data.isPopular,
      });
      setIsEditing(false);
    } catch (err: unknown) {
      console.error("Failed to update link in Firestore:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "링크 수정 저장 중 오류가 발생했습니다. 다시 시도해주세요.";
      setSaveError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    if (link.url === "#") return;
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(link.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onDelete) return;
    if (window.confirm(`'${link.title}' 링크를 삭제하시겠습니까?`)) {
      setIsDeleting(true);
      try {
        await onDelete(link.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleClick = () => {
    if (onLinkClick) {
      onLinkClick(link.id);
    }
  };

  const hasAnyError = Boolean(
    errors.title || errors.url || errors.description || errors.customCategory
  );

  // ----------------------------------------------------------------------
  // Inline Editing Mode View
  // ----------------------------------------------------------------------
  if (isEditing) {
    return (
      <div className="w-full bg-[#efefef] border-2 border-[#f68d1f] p-3 sm:p-3.5 transition-all shadow-md rounded-[2px] space-y-3">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[#3d4f97]/40 pb-1.5">
          <div className="flex items-center gap-1.5">
            <Pencil className="w-3.5 h-3.5 text-[#f68d1f]" />
            <span className="text-[10px] sm:text-[11px] font-black uppercase text-[#21242e] tracking-wider">
              EDIT LINK CARTRIDGE (인라인 링크 수정)
            </span>
          </div>
          <button
            type="button"
            onClick={handleCancelEdit}
            disabled={isSaving}
            title="수정 취소"
            className="text-[#60619c] hover:text-[#e60012] p-0.5 rounded-[2px] transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="space-y-3">
          {/* Error Banners */}
          {saveError && (
            <div className="p-2 bg-[#e60012] text-white text-[10px] font-bold rounded-[2px] shadow-xs flex items-center gap-1.5 animate-in fade-in-50">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {hasAnyError && (
            <div className="p-2 bg-[#e60012] text-white text-[10px] font-bold rounded-[2px] shadow-xs flex items-center gap-1.5 animate-in fade-in-50">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>입력 항목을 확인해주세요. 유효성 검증 에러가 발생했습니다.</span>
            </div>
          )}

          {/* 1. Title Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase text-[#21242e]">
              <label htmlFor={`edit-title-${link.id}`}>LINK TITLE (제목)*</label>
              <div className="flex items-center gap-2">
                <span className="text-[#3d4f97] text-[9px]">REQUIRED</span>
                <span
                  className={`font-mono text-[9px] ${
                    titleValue.length > 50 ? "text-[#e60012] font-black" : "text-[#60619c]"
                  }`}
                >
                  {titleValue.length}/50
                </span>
              </div>
            </div>
            <input
              id={`edit-title-${link.id}`}
              type="text"
              placeholder="예: 최신 프로젝트 데모 사이트"
              maxLength={60}
              {...register("title")}
              className={`w-full px-2 py-1 bg-white nintendo-inset text-[11px] text-[#21242e] font-medium outline-none rounded-[2px] transition-colors ${
                errors.title ? "border-2 border-[#e60012] bg-[#fff5f5]" : ""
              }`}
            />
            {errors.title && (
              <p className="text-[10px] font-bold text-[#e60012] flex items-center gap-1 mt-0.5">
                <span>⚠️ {errors.title.message}</span>
              </p>
            )}
          </div>

          {/* 2. URL Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase text-[#21242e]">
              <label htmlFor={`edit-url-${link.id}`}>TARGET URL (주소)*</label>
              <div className="flex items-center gap-2">
                <span className="text-[#3d4f97] text-[9px]">HTTPS://</span>
                <span
                  className={`font-mono text-[9px] ${
                    urlValue.length > 200 ? "text-[#e60012] font-black" : "text-[#60619c]"
                  }`}
                >
                  {urlValue.length}/200
                </span>
              </div>
            </div>
            <div
              className={`flex items-center bg-white nintendo-inset px-2 py-1 rounded-[2px] transition-colors ${
                errors.url ? "border-2 border-[#e60012] bg-[#fff5f5]" : ""
              }`}
            >
              <LinkIcon className="w-3 h-3 text-[#3d4f97] mr-1.5 shrink-0" />
              <input
                id={`edit-url-${link.id}`}
                type="text"
                placeholder="https://example.com"
                maxLength={220}
                {...register("url")}
                className="w-full text-[11px] text-[#21242e] font-mono outline-none bg-transparent"
              />
            </div>
            {errors.url && (
              <p className="text-[10px] font-bold text-[#e60012] flex items-center gap-1 mt-0.5">
                <span>⚠️ {errors.url.message}</span>
              </p>
            )}
          </div>

          {/* 3. Description Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase text-[#21242e]">
              <label htmlFor={`edit-desc-${link.id}`}>DESCRIPTION (설명)</label>
              <div className="flex items-center gap-2">
                <span className="text-[#60619c] text-[9px]">OPTIONAL</span>
                <span
                  className={`font-mono text-[9px] ${
                    descValue.length > 100 ? "text-[#e60012] font-black" : "text-[#60619c]"
                  }`}
                >
                  {descValue.length}/100
                </span>
              </div>
            </div>
            <input
              id={`edit-desc-${link.id}`}
              type="text"
              placeholder="링크에 대한 한 줄 소개 문구를 적어주세요 (최대 100자)"
              maxLength={120}
              {...register("description")}
              className={`w-full px-2 py-1 bg-white nintendo-inset text-[11px] text-[#21242e] font-medium outline-none rounded-[2px] transition-colors ${
                errors.description ? "border-2 border-[#e60012] bg-[#fff5f5]" : ""
              }`}
            />
            {errors.description && (
              <p className="text-[10px] font-bold text-[#e60012] flex items-center gap-1 mt-0.5">
                <span>⚠️ {errors.description.message}</span>
              </p>
            )}
          </div>

          {/* 4. Category Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-[#21242e]">
              CATEGORY (분류):
            </label>
            <div className="flex items-center gap-1 flex-wrap">
              {categories.map((cat) => {
                const isSelected = currentCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setValue("category", cat, { shouldValidate: true })}
                    className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-[2px] cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#21242e] text-[#f68d1f] nintendo-chip border border-[#f68d1f]"
                        : "bg-[#dedede] hover:bg-white text-[#21242e] border border-[#3d4f97]"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setValue("category", "__custom__", { shouldValidate: true })}
                className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-[2px] cursor-pointer transition-all ${
                  currentCategory === "__custom__"
                    ? "bg-[#21242e] text-[#f68d1f] nintendo-chip border border-[#f68d1f]"
                    : "bg-[#dedede] hover:bg-white text-[#21242e] border border-[#3d4f97]"
                }`}
              >
                + 직접 입력
              </button>
            </div>
            {currentCategory === "__custom__" && (
              <div className="space-y-0.5">
                <input
                  type="text"
                  placeholder="새로운 카테고리명을 입력하세요 (최대 20자)"
                  maxLength={25}
                  {...register("customCategory")}
                  className={`w-full mt-1 px-2 py-0.5 bg-white nintendo-inset text-[10px] text-[#21242e] font-medium outline-none rounded-[2px] transition-colors ${
                    errors.customCategory ? "border-2 border-[#e60012] bg-[#fff5f5]" : ""
                  }`}
                />
                {errors.customCategory && (
                  <p className="text-[10px] font-bold text-[#e60012] flex items-center gap-1">
                    <span>⚠️ {errors.customCategory.message}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 5. Icon Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-[#21242e]">
              CHASSIS ICON (아이콘):
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1">
              {AVAILABLE_ICONS.map((item) => {
                const isSelected = currentIcon === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setValue("icon", item.id, { shouldValidate: true })}
                    title={item.label}
                    className={`flex items-center justify-center gap-1 p-1 rounded-[2px] transition-all text-[9px] font-bold cursor-pointer ${
                      isSelected
                        ? "bg-[#f68d1f] text-white nintendo-chip border border-[#283463]"
                        : "bg-[#dedede] hover:bg-white text-[#21242e] border border-[#3d4f97]"
                    }`}
                  >
                    <LinkIconRenderer iconName={item.id} />
                    <span className="truncate">{item.id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Popular Flag (HOT Badge) */}
          <div className="flex items-center justify-between p-2 bg-[#dedede] nintendo-inset rounded-[2px]">
            <div className="flex items-center gap-1.5">
              <Badge variant="nintendoRed" className="text-[8px] px-1 py-0.2">
                <Flame className="w-2.5 h-2.5 fill-white" />
                HOT
              </Badge>
              <span className="text-[10px] font-bold text-[#21242e]">
                인기 링크 배지 표시 (POPULAR)
              </span>
            </div>
            <button
              type="button"
              aria-label="인기 링크 배지 토글"
              data-testid="toggle-edit-popular"
              onClick={() => setValue("isPopular", !currentIsPopular, { shouldValidate: true })}
              className={`w-9 h-5 rounded-[2px] p-0.5 transition-colors cursor-pointer flex items-center ${
                currentIsPopular ? "bg-[#e60012] justify-end" : "bg-[#8ba1d4] justify-start"
              }`}
            >
              <span className="w-4 h-4 bg-white rounded-[1px] shadow-xs flex items-center justify-center text-[8px] font-black">
                {currentIsPopular ? "✓" : ""}
              </span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-1.5 border-t border-[#3d4f97]/40">
            <Button
              type="button"
              variant="nintendoPlate"
              size="sm"
              onClick={handleCancelEdit}
              disabled={isSaving}
              className="text-[10px]"
            >
              CANCEL (취소)
            </Button>
            <Button
              type="submit"
              variant="nintendoOrange"
              size="sm"
              disabled={isSaving}
              className="text-[10px] font-black"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>SAVING...</span>
                </>
              ) : (
                <>
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>SAVE (수정 완료)</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // Normal Reading Mode View (with Always-Visible Edit Button)
  // ----------------------------------------------------------------------
  return (
    <div className="relative group block w-full bg-[#dedede] hover:bg-[#ffffff] border-t border-l border-white border-b-2 border-r-2 border-[#3d4f97] p-2 sm:p-2.5 transition-all duration-150 shadow-xs rounded-[2px]">
      <div className="flex items-center justify-between gap-2">
        {/* Left: Icon & Headline Info */}
        <a
          href={link.url}
          target={link.url.startsWith("http") ? "_blank" : "_self"}
          rel="noopener noreferrer"
          onClick={handleClick}
          className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer"
        >
          {/* Beveled Icon Box */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#8ba1d4] nintendo-plate flex items-center justify-center text-[#21242e] shrink-0">
            <LinkIconRenderer iconName={link.icon} />
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              {/* Category Pill */}
              {link.category && (
                <Badge variant="nintendoCarbon" className="text-[8px] sm:text-[9px] px-1.5 py-0.2">
                  {link.category}
                </Badge>
              )}

              {/* Hot / Popular Badge */}
              {link.isPopular && (
                <Badge variant="nintendoRed" className="text-[7px] sm:text-[8px] px-1 py-0.2 font-black">
                  <Flame className="w-2.5 h-2.5 fill-white shrink-0 mr-0.5" />
                  HOT
                </Badge>
              )}

              {/* Title Link in Ink-Soft */}
              <h3 className="font-bold text-[11px] sm:text-xs text-[#3d4f97] group-hover:text-[#e60012] transition-colors truncate max-w-full">
                {link.title}
              </h3>
            </div>

            {/* Description */}
            {link.description && (
              <p className="text-[10px] sm:text-[11px] text-[#21242e] font-normal mt-0.5 truncate max-w-full">
                {link.description}
              </p>
            )}

            {/* Click count indicator */}
            {typeof link.clickCount === "number" && (
              <div className="flex items-center gap-1 mt-0.5 text-[8px] sm:text-[9px] text-[#60619c] font-mono">
                <MousePointerClick className="w-2.5 h-2.5" />
                <span>{link.clickCount.toLocaleString()} clicks</span>
              </div>
            )}
          </div>
        </a>

        {/* Right: Actions (Copy, Edit, Delete, Arrow) */}
        <div className="flex items-center gap-1 shrink-0 ml-0.5">
          {/* Copy Button */}
          {link.url !== "#" && (
            <Button
              type="button"
              onClick={handleCopy}
              title="URL 복사"
              variant="nintendoGold"
              size="sm"
              className="h-5 sm:h-6 px-1.5 py-0 text-[8px] sm:text-[9px]"
            >
              {copied ? (
                <>
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                  <span>OK</span>
                </>
              ) : (
                <>
                  <Copy className="w-2.5 h-2.5" />
                  <span>COPY</span>
                </>
              )}
            </Button>
          )}

          {/* Edit Button - ALWAYS VISIBLE */}
          {onUpdate && (
            <Button
              type="button"
              onClick={handleStartEdit}
              title="링크 수정 (인라인 편집)"
              data-testid="edit-link-button"
              variant="nintendoPlate"
              size="sm"
              className="h-5 sm:h-6 px-1.5 py-0 text-[8px] sm:text-[9px] font-bold text-[#3d4f97] hover:text-[#f68d1f] border border-[#3d4f97] hover:border-[#f68d1f] flex items-center gap-0.5 cursor-pointer opacity-100"
            >
              <Pencil className="w-2.5 h-2.5 text-[#3d4f97]" />
              <span>EDIT</span>
            </Button>
          )}

          {/* Delete Button */}
          {onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              title="링크 삭제"
              className="w-5 h-5 sm:w-6 sm:h-6 bg-[#dedede] hover:bg-[#e60012] hover:text-white text-[#60619c] border border-[#3d4f97] flex items-center justify-center rounded-[2px] transition-colors cursor-pointer"
            >
              <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </button>
          )}

          {/* Button-Arrow-Chip: Signal Orange Chip */}
          <a
            href={link.url}
            target={link.url.startsWith("http") ? "_blank" : "_self"}
            rel="noopener noreferrer"
            onClick={handleClick}
            className="w-4 h-4 sm:w-5 sm:h-5 bg-[#f68d1f] group-hover:bg-[#e48600] text-white border border-[#283463] flex items-center justify-center transition-transform group-hover:translate-x-0.5 shadow-xs shrink-0 rounded-[2px]"
          >
            <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
          </a>
        </div>
      </div>
    </div>
  );
}
