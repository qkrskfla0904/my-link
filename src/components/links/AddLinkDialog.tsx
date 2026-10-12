"use client";

import { useState } from "react";
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
  onAddLink: (newLink: LinkItem) => void;
  existingCategories: string[];
}

interface FormErrors {
  title?: string;
  url?: string;
  description?: string;
  customCategory?: string;
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

const DEFAULT_CATEGORIES = ["개발/코드", "포트폴리오", "블로그", "SNS", "연락처"];

function validateUrl(rawUrl: string): boolean {
  const trimmed = rawUrl.trim();
  if (!trimmed) return false;

  // mailto check
  if (trimmed.startsWith("mailto:")) {
    const email = trimmed.replace("mailto:", "");
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  let toCheck = trimmed;
  if (!toCheck.startsWith("http://") && !toCheck.startsWith("https://")) {
    toCheck = `https://${toCheck}`;
  }

  try {
    const parsed = new URL(toCheck);
    return Boolean(
      parsed.hostname &&
      (parsed.hostname === "localhost" || parsed.hostname.includes(".")) &&
      !parsed.hostname.startsWith(".") &&
      !parsed.hostname.endsWith(".")
    );
  } catch {
    return false;
  }
}

export function AddLinkDialog({
  isOpen,
  onClose,
  onAddLink,
  existingCategories,
}: AddLinkDialogProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("개발/코드");
  const [customCategory, setCustomCategory] = useState("");
  const [icon, setIcon] = useState("globe");
  const [isPopular, setIsPopular] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const categories = Array.from(
    new Set([
      ...DEFAULT_CATEGORIES,
      ...existingCategories.filter((c) => c !== "전체"),
    ])
  );

  const validateField = (field: keyof FormErrors, value: string): string | undefined => {
    switch (field) {
      case "title": {
        const t = value.trim();
        if (!t) return "링크 제목을 입력해주세요.";
        if (t.length < 2) return "제목은 최소 2글자 이상 입력해야 합니다.";
        if (value.length > 50) return "제목은 최대 50자까지 입력 가능합니다.";
        return undefined;
      }
      case "url": {
        const u = value.trim();
        if (!u) return "URL 주소를 입력해주세요.";
        if (!validateUrl(u)) return "올바른 URL(예: https://example.com) 형식을 입력해주세요.";
        if (value.length > 200) return "URL은 최대 200자까지 입력 가능합니다.";
        return undefined;
      }
      case "description": {
        if (value.length > 100) return "설명은 최대 100자까지 입력 가능합니다.";
        return undefined;
      }
      case "customCategory": {
        if (category === "__custom__") {
          const c = value.trim();
          if (!c) return "새 카테고리명을 입력해주세요.";
          if (c.length > 20) return "카테고리명은 최대 20자까지 가능합니다.";
        }
        return undefined;
      }
    }
  };

  const handleBlur = (field: keyof FormErrors) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    let val = "";
    if (field === "title") val = title;
    else if (field === "url") val = url;
    else if (field === "description") val = description;
    else if (field === "customCategory") val = customCategory;

    const error = validateField(field, val);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (touched.title) {
      setErrors((prev) => ({ ...prev, title: validateField("title", val) }));
    }
  };

  const handleUrlChange = (val: string) => {
    setUrl(val);
    if (touched.url) {
      setErrors((prev) => ({ ...prev, url: validateField("url", val) }));
    }
  };

  const handleDescriptionChange = (val: string) => {
    setDescription(val);
    if (touched.description) {
      setErrors((prev) => ({ ...prev, description: validateField("description", val) }));
    }
  };

  const handleCustomCategoryChange = (val: string) => {
    setCustomCategory(val);
    if (touched.customCategory) {
      setErrors((prev) => ({ ...prev, customCategory: validateField("customCategory", val) }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const titleError = validateField("title", title);
    const urlError = validateField("url", url);
    const descError = validateField("description", description);
    const catError = category === "__custom__" ? validateField("customCategory", customCategory) : undefined;

    const newErrors: FormErrors = {
      title: titleError,
      url: urlError,
      description: descError,
      customCategory: catError,
    };

    setErrors(newErrors);
    setTouched({
      title: true,
      url: true,
      description: true,
      customCategory: true,
    });

    if (titleError || urlError || descError || catError) {
      return;
    }

    let finalUrl = url.trim();
    if (
      !finalUrl.startsWith("http://") &&
      !finalUrl.startsWith("https://") &&
      !finalUrl.startsWith("mailto:")
    ) {
      finalUrl = `https://${finalUrl}`;
    }

    const finalCategory =
      category === "__custom__"
        ? customCategory.trim() || "기타"
        : category;

    const newLink: LinkItem = {
      id: `link-${Date.now()}`,
      title: title.trim(),
      url: finalUrl,
      description: description.trim() || undefined,
      category: finalCategory,
      icon,
      isPopular,
      isActive: true,
      clickCount: 0,
    };

    onAddLink(newLink);

    // Reset form
    setTitle("");
    setUrl("");
    setDescription("");
    setCategory("개발/코드");
    setCustomCategory("");
    setIcon("globe");
    setIsPopular(false);
    setErrors({});
    setTouched({});
    onClose();
  };

  const hasAnyError = Boolean(errors.title || errors.url || errors.description || errors.customCategory);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        {/* Hardware Header Bar */}
        <DialogHeader>
          <div className="flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-[#f68d1f]" />
            <DialogTitle>INSERT NEW LINK CARTRIDGE</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-3.5 sm:p-4 space-y-3">
          {/* Global Error Banner */}
          {hasAnyError && (
            <div className="p-2 bg-[#e60012] text-white text-[10px] font-bold rounded-[2px] shadow-xs flex items-center gap-1.5 animate-in fade-in-50">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>입력 항목을 확인해주세요. 유효하지 않은 값이 포함되어 있습니다.</span>
            </div>
          )}

          {/* 1. Title Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase text-[#21242e]">
              <label htmlFor="link-title">LINK TITLE (제목)*</label>
              <div className="flex items-center gap-2">
                <span className="text-[#3d4f97] text-[9px]">REQUIRED</span>
                <span className={`font-mono text-[9px] ${title.length > 50 ? "text-[#e60012] font-black" : "text-[#60619c]"}`}>
                  {title.length}/50
                </span>
              </div>
            </div>
            <input
              id="link-title"
              type="text"
              placeholder="예: 최신 프로젝트 데모 사이트"
              value={title}
              maxLength={60}
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={() => handleBlur("title")}
              className={`w-full px-2 py-1 bg-white nintendo-inset text-[11px] text-[#21242e] font-medium outline-none rounded-[2px] transition-colors ${
                errors.title && touched.title ? "border-2 border-[#e60012] bg-[#fff5f5]" : ""
              }`}
            />
            {errors.title && touched.title && (
              <p className="text-[10px] font-bold text-[#e60012] flex items-center gap-1 mt-0.5">
                <span>⚠️ {errors.title}</span>
              </p>
            )}
          </div>

          {/* 2. URL Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase text-[#21242e]">
              <label htmlFor="link-url">TARGET URL (주소)*</label>
              <div className="flex items-center gap-2">
                <span className="text-[#3d4f97] text-[9px]">HTTPS://</span>
                <span className={`font-mono text-[9px] ${url.length > 200 ? "text-[#e60012] font-black" : "text-[#60619c]"}`}>
                  {url.length}/200
                </span>
              </div>
            </div>
            <div
              className={`flex items-center bg-white nintendo-inset px-2 py-1 rounded-[2px] transition-colors ${
                errors.url && touched.url ? "border-2 border-[#e60012] bg-[#fff5f5]" : ""
              }`}
            >
              <LinkIcon className="w-3 h-3 text-[#3d4f97] mr-1.5 shrink-0" />
              <input
                id="link-url"
                type="text"
                placeholder="https://example.com"
                value={url}
                maxLength={220}
                onChange={(e) => handleUrlChange(e.target.value)}
                onBlur={() => handleBlur("url")}
                className="w-full text-[11px] text-[#21242e] font-mono outline-none bg-transparent"
              />
            </div>
            {errors.url && touched.url && (
              <p className="text-[10px] font-bold text-[#e60012] flex items-center gap-1 mt-0.5">
                <span>⚠️ {errors.url}</span>
              </p>
            )}
          </div>

          {/* 3. Description Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase text-[#21242e]">
              <label htmlFor="link-desc">DESCRIPTION (설명)</label>
              <div className="flex items-center gap-2">
                <span className="text-[#60619c] text-[9px]">OPTIONAL</span>
                <span className={`font-mono text-[9px] ${description.length > 100 ? "text-[#e60012] font-black" : "text-[#60619c]"}`}>
                  {description.length}/100
                </span>
              </div>
            </div>
            <input
              id="link-desc"
              type="text"
              placeholder="링크에 대한 한 줄 소개 문구를 적어주세요 (최대 100자)"
              value={description}
              maxLength={120}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              onBlur={() => handleBlur("description")}
              className={`w-full px-2 py-1 bg-white nintendo-inset text-[11px] text-[#21242e] font-medium outline-none rounded-[2px] transition-colors ${
                errors.description && touched.description ? "border-2 border-[#e60012] bg-[#fff5f5]" : ""
              }`}
            />
            {errors.description && touched.description && (
              <p className="text-[10px] font-bold text-[#e60012] flex items-center gap-1 mt-0.5">
                <span>⚠️ {errors.description}</span>
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
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategory(cat);
                      setErrors((prev) => ({ ...prev, customCategory: undefined }));
                    }}
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
                onClick={() => setCategory("__custom__")}
                className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-[2px] cursor-pointer transition-all ${
                  category === "__custom__"
                    ? "bg-[#21242e] text-[#f68d1f] nintendo-chip border border-[#f68d1f]"
                    : "bg-[#dedede] hover:bg-white text-[#21242e] border border-[#3d4f97]"
                }`}
              >
                + 직접 입력
              </button>
            </div>
            {category === "__custom__" && (
              <div className="space-y-0.5">
                <input
                  type="text"
                  placeholder="새로운 카테고리명을 입력하세요 (최대 20자)"
                  value={customCategory}
                  maxLength={25}
                  onChange={(e) => handleCustomCategoryChange(e.target.value)}
                  onBlur={() => handleBlur("customCategory")}
                  className={`w-full mt-1 px-2 py-0.5 bg-white nintendo-inset text-[10px] text-[#21242e] font-medium outline-none rounded-[2px] transition-colors ${
                    errors.customCategory && touched.customCategory ? "border-2 border-[#e60012] bg-[#fff5f5]" : ""
                  }`}
                />
                {errors.customCategory && touched.customCategory && (
                  <p className="text-[10px] font-bold text-[#e60012] flex items-center gap-1">
                    <span>⚠️ {errors.customCategory}</span>
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
                const isSelected = icon === item.id;
                const IconComp = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIcon(item.id)}
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
              onClick={() => setIsPopular(!isPopular)}
              className={`w-9 h-5 rounded-[2px] p-0.5 transition-colors cursor-pointer flex items-center ${
                isPopular ? "bg-[#e60012] justify-end" : "bg-[#8ba1d4] justify-start"
              }`}
            >
              <span className="w-4 h-4 bg-white rounded-[1px] shadow-xs flex items-center justify-center text-[8px] font-black">
                {isPopular ? "✓" : ""}
              </span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-1.5 border-t border-[#3d4f97]">
            <Button
              type="button"
              variant="nintendoPlate"
              size="sm"
              onClick={onClose}
              className="text-[10px]"
            >
              CANCEL (취소)
            </Button>
            <Button
              type="submit"
              variant="nintendoOrange"
              size="sm"
              className="text-[10px] font-black"
            >
              <Check className="w-3 h-3 stroke-[3]" />
              INSERT LINK (추가)
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
