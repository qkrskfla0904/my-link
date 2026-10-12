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
  const [errorMessage, setErrorMessage] = useState("");

  const categories = Array.from(
    new Set([
      ...DEFAULT_CATEGORIES,
      ...existingCategories.filter((c) => c !== "전체"),
    ])
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage("링크 제목을 입력해주세요.");
      return;
    }
    if (!url.trim()) {
      setErrorMessage("URL 주소를 입력해주세요.");
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
    setErrorMessage("");
    onClose();
  };

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
          {errorMessage && (
            <div className="p-1.5 bg-[#e60012] text-white text-[10px] font-bold rounded-[2px] shadow-xs">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* 1. Title Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-[#21242e] flex items-center justify-between">
              <span>LINK TITLE (제목)*:</span>
              <span className="text-[#3d4f97] text-[9px]">REQUIRED</span>
            </label>
            <input
              type="text"
              required
              placeholder="예: 최신 프로젝트 데모 사이트"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errorMessage) setErrorMessage("");
              }}
              className="w-full px-2 py-1 bg-white nintendo-inset text-[11px] text-[#21242e] font-medium outline-none rounded-[2px]"
            />
          </div>

          {/* 2. URL Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-[#21242e] flex items-center justify-between">
              <span>TARGET URL (주소)*:</span>
              <span className="text-[#3d4f97] text-[9px]">HTTPS://</span>
            </label>
            <div className="flex items-center bg-white nintendo-inset px-2 py-1 rounded-[2px]">
              <LinkIcon className="w-3 h-3 text-[#3d4f97] mr-1.5 shrink-0" />
              <input
                type="text"
                required
                placeholder="https://example.com"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                className="w-full text-[11px] text-[#21242e] font-mono outline-none bg-transparent"
              />
            </div>
          </div>

          {/* 3. Description Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-[#21242e] flex items-center justify-between">
              <span>DESCRIPTION (설명):</span>
              <span className="text-[#60619c] text-[9px]">OPTIONAL</span>
            </label>
            <input
              type="text"
              placeholder="링크에 대한 한 줄 소개 문구를 적어주세요"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-2 py-1 bg-white nintendo-inset text-[11px] text-[#21242e] font-medium outline-none rounded-[2px]"
            />
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
                    onClick={() => setCategory(cat)}
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
              <input
                type="text"
                placeholder="새로운 카테고리명을 입력하세요"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full mt-1 px-2 py-0.5 bg-white nintendo-inset text-[10px] text-[#21242e] font-medium outline-none rounded-[2px]"
              />
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
