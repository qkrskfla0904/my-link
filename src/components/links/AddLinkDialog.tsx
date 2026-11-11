"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LinkItem } from "@/types";
import {
  Plus,
  Flame,
  Globe,
  BookOpen,
  Mail,
  Send,
  FileText,
  Code2,
  Sparkles,
  Link as LinkIcon,
  Check,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AddLinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLink: (newLink: LinkItem) => Promise<void> | void;
  existingCategories: string[];
}

const AVAILABLE_ICONS = [
  { id: "globe", label: "웹사이트", icon: Globe },
  { id: "github", label: "깃허브", icon: Code2 },
  { id: "project", label: "프로젝트", icon: Sparkles },
  { id: "blog", label: "블로그", icon: BookOpen },
  { id: "resume", label: "이력서", icon: FileText },
  { id: "code", label: "코드", icon: Code2 },
  { id: "linkedin", label: "링크드인", icon: Globe },
  { id: "youtube", label: "유튜브", icon: Globe },
  { id: "twitter", label: "트위터", icon: Globe },
  { id: "mail", label: "커피챗", icon: Mail },
  { id: "send", label: "이메일", icon: Send },
];

import {
  linkFormSchema,
  type LinkFormValues,
  DEFAULT_CATEGORIES,
  normalizeUrl,
} from "@/lib/validation";

type AddLinkFormValues = LinkFormValues;

export function AddLinkDialog({
  isOpen,
  onClose,
  onAddLink,
  existingCategories,
}: AddLinkDialogProps) {
  const categories = Array.from(
    new Set([
      ...DEFAULT_CATEGORIES,
      ...existingCategories.filter((c) => c !== "전체"),
    ])
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddLinkFormValues>({
    resolver: zodResolver(linkFormSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      url: "",
      description: "",
      category: "개발/코드",
      customCategory: "",
      icon: "globe",
      isPopular: false,
    },
  });

  const titleValue = watch("title") || "";
  const urlValue = watch("url") || "";
  const descValue = watch("description") || "";
  const currentCategory = watch("category");
  const currentIcon = watch("icon");
  const currentIsPopular = watch("isPopular");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = async (data: AddLinkFormValues) => {
    const finalUrl = normalizeUrl(data.url);

    const finalCategory =
      data.category === "__custom__"
        ? data.customCategory?.trim() || "기타"
        : data.category;

    const newLink: LinkItem = {
      id: `link-${Date.now()}`,
      title: data.title.trim(),
      url: finalUrl,
      description: data.description?.trim() || undefined,
      category: finalCategory,
      icon: data.icon,
      isPopular: data.isPopular,
      isActive: true,
      clickCount: 0,
    };

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await onAddLink(newLink);
      reset();
      onClose();
    } catch (err: unknown) {
      console.error("Failed to add link:", err);
      const errorMessage =
        err instanceof Error ? err.message : "링크 저장 중 오류가 발생했습니다. 다시 시도해주세요.";
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    if (isSubmitting) return; // Prevent closing while saving
    setSubmitError(null);
    reset();
    onClose();
  };

  const hasAnyError = Boolean(
    errors.title || errors.url || errors.description || errors.customCategory
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleModalClose()}>
      <DialogContent className="max-w-md">
        {/* Hardware Header Bar */}
        <DialogHeader>
          <div className="flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-[#f68d1f]" />
            <DialogTitle>INSERT NEW LINK CARTRIDGE</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-3.5 sm:p-4 space-y-3">
          {/* Submit Error Banner */}
          {submitError && (
            <div className="p-2 bg-[#e60012] text-white text-[10px] font-bold rounded-[2px] shadow-xs flex items-center gap-1.5 animate-in fade-in-50">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Global Error Banner */}
          {hasAnyError && (
            <div className="p-2 bg-[#e60012] text-white text-[10px] font-bold rounded-[2px] shadow-xs flex items-center gap-1.5 animate-in fade-in-50">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>입력 항목을 확인해주세요. 유효성 검증 에러가 발생했습니다.</span>
            </div>
          )}

          {/* 1. Title Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase text-[#21242e]">
              <label htmlFor="link-title" className="flex items-center gap-1">
                <span>LINK TITLE (링크 제목)*</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[#3d4f97] text-[9px] font-bold">REQUIRED</span>
                <span
                  className={`font-mono text-[10px] ${
                    titleValue.length > 50 ? "text-[#e60012] font-black" : "text-[#60619c]"
                  }`}
                >
                  {titleValue.length}/50
                </span>
              </div>
            </div>
            <input
              id="link-title"
              type="text"
              placeholder="예: 내 네이버 블로그, 포트폴리오, 깃허브"
              maxLength={60}
              {...register("title")}
              className={`w-full px-2.5 py-1.5 bg-white nintendo-inset text-xs sm:text-sm text-[#21242e] font-bold outline-none rounded-[2px] transition-colors ${
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
            <div className="flex items-center justify-between text-[11px] font-bold uppercase text-[#21242e]">
              <label htmlFor="link-url">TARGET URL (블로그 / 웹사이트 주소)*</label>
              <div className="flex items-center gap-2">
                <span className="text-[#3d4f97] text-[9px] bg-[#dedede] px-1 py-0.2 rounded font-mono font-bold">
                  HTTP / HTTPS 지원
                </span>
                <span
                  className={`font-mono text-[10px] ${
                    urlValue.length > 300 ? "text-[#e60012] font-black" : "text-[#60619c]"
                  }`}
                >
                  {urlValue.length}/300
                </span>
              </div>
            </div>
            <div
              className={`flex items-center bg-white nintendo-inset px-2.5 py-1.5 rounded-[2px] transition-colors ${
                errors.url ? "border-2 border-[#e60012] bg-[#fff5f5]" : ""
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5 text-[#3d4f97] mr-2 shrink-0" />
              <input
                id="link-url"
                type="text"
                placeholder="예: blog.naver.com/아이디, velog.io/@아이디, https://..."
                maxLength={320}
                {...register("url")}
                className="w-full text-xs sm:text-[13px] text-[#21242e] font-mono outline-none bg-transparent"
              />
            </div>
            <p className="text-[9px] text-[#60619c] font-medium">
              💡 https:// 없이 블로그 주소(예: <span className="font-bold text-[#3d4f97]">blog.naver.com/아이디</span>)만 입력하셔도 자동으로 연결됩니다.
            </p>
            {errors.url && (
              <p className="text-[10px] font-bold text-[#e60012] flex items-center gap-1 mt-0.5">
                <span>⚠️ {errors.url.message}</span>
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
                const IconComp = item.icon;
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
                    <IconComp className="w-3 h-3 shrink-0" />
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
              data-testid="toggle-popular"
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
          <div className="pt-2 flex items-center justify-end gap-1.5 border-t border-[#3d4f97]">
            <Button
              type="button"
              variant="nintendoPlate"
              size="sm"
              onClick={handleModalClose}
              disabled={isSubmitting}
              className="text-[10px]"
            >
              CANCEL (취소)
            </Button>
            <Button
              type="submit"
              variant="nintendoOrange"
              size="sm"
              disabled={isSubmitting}
              className="text-[10px] font-black"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>SAVING...</span>
                </>
              ) : (
                <>
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>INSERT LINK (추가)</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
