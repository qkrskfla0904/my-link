"use client";

import { useState, useEffect } from "react";
import { UserProfile } from "@/types";
import {
  UserCog,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Camera,
  Tag,
  Coffee,
  X,
  Plus,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { checkDisplayNameDuplicate } from "@/lib/links";

interface EditProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  currentUserId?: string;
  onSave: (updatedData: {
    displayName: string;
    bio?: string;
    avatarUrl?: string;
    tags?: string[];
    statusMessage?: string;
    isAvailableForHire?: boolean;
  }) => Promise<void>;
}

const AVATAR_PRESETS = [
  { label: "기본 프로필", url: "/profile.jpg" },
  { label: "픽셀 마리오", url: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80" },
  { label: "테크 아바타 1", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
  { label: "테크 아바타 2", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
  { label: "개발자 고양이", url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&auto=format&fit=crop&q=80" },
];

const RECOMMENDED_TAGS = [
  "💻 프론트엔드",
  "🚀 Next.js & React",
  "🎨 UI/UX",
  "⚡ 풀스택 개발",
  "📱 모바일/앱",
  "🤖 AI 엔지니어링",
  "☕ 커피챗 환영",
];

export function EditProfileDialog({
  isOpen,
  onClose,
  currentProfile,
  currentUserId,
  onSave,
}: EditProfileDialogProps) {
  const [displayName, setDisplayName] = useState(currentProfile.displayName || "");
  const [bio, setBio] = useState(currentProfile.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(currentProfile.avatarUrl || "");
  const [statusMessage, setStatusMessage] = useState(currentProfile.statusMessage || "");
  const [isAvailableForHire, setIsAvailableForHire] = useState(
    currentProfile.isAvailableForHire ?? true
  );
  const [tags, setTags] = useState<string[]>(currentProfile.tags || []);
  const [tagInput, setTagInput] = useState("");

  // Duplication check status
  type CheckStatus = "idle" | "checking" | "available" | "duplicated" | "error";
  const [checkStatus, setCheckStatus] = useState<CheckStatus>("idle");
  const [checkMessage, setCheckMessage] = useState<string>("");
  const [verifiedName, setVerifiedName] = useState<string>(currentProfile.displayName || "");

  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Sync state whenever dialog opens with latest currentProfile
  useEffect(() => {
    if (isOpen) {
      setDisplayName(currentProfile.displayName || "");
      setBio(currentProfile.bio || "");
      setAvatarUrl(currentProfile.avatarUrl || "");
      setStatusMessage(currentProfile.statusMessage || "");
      setIsAvailableForHire(currentProfile.isAvailableForHire ?? true);
      setTags(currentProfile.tags || []);
      setTagInput("");
      setCheckStatus("idle");
      setCheckMessage("");
      setVerifiedName(currentProfile.displayName || "");
      setFormError(null);
    }
  }, [isOpen, currentProfile]);

  // Handle display name change
  const handleNameChange = (val: string) => {
    setDisplayName(val);
    setFormError(null);

    // If matches the original name or verified name
    if (val.trim() === currentProfile.displayName) {
      setCheckStatus("available");
      setCheckMessage("현재 사용 중인 닉네임입니다.");
      setVerifiedName(val.trim());
    } else if (val.trim() === verifiedName && val.trim().length >= 2) {
      setCheckStatus("available");
    } else {
      setCheckStatus("idle");
      setCheckMessage("");
    }
  };

  // Perform duplication check
  const handleCheckDuplicate = async () => {
    const trimmed = displayName.trim();
    if (!trimmed) {
      setCheckStatus("error");
      setCheckMessage("이름을 입력해주세요.");
      return;
    }
    if (trimmed.length < 2) {
      setCheckStatus("error");
      setCheckMessage("이름은 최소 2글자 이상이어야 합니다.");
      return;
    }
    if (trimmed.length > 20) {
      setCheckStatus("error");
      setCheckMessage("이름은 최대 20자까지 가능합니다.");
      return;
    }

    try {
      setCheckStatus("checking");
      setCheckMessage("중복 확인 중...");

      const result = await checkDisplayNameDuplicate(trimmed, currentUserId);

      if (result.isAvailable) {
        setCheckStatus("available");
        setCheckMessage(result.message);
        setVerifiedName(trimmed);
      } else {
        setCheckStatus("duplicated");
        setCheckMessage(result.message);
      }
    } catch {
      setCheckStatus("error");
      setCheckMessage("확인 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  // Tag management
  const handleAddTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (!trimmed) return;
    if (tags.includes(trimmed)) return;
    if (tags.length >= 6) {
      setFormError("태그는 최대 6개까지 등록할 수 있습니다.");
      return;
    }
    setTags((prev) => [...prev, trimmed]);
    setTagInput("");
    setFormError(null);
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTags((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Compare tags array equality
  const areTagsEqual = (a: string[], b: string[]) => {
    if (a.length !== b.length) return false;
    return a.every((tag, idx) => tag === b[idx]);
  };

  // Check if any field has actually changed compared to currentProfile
  const hasChanges =
    displayName.trim() !== (currentProfile.displayName || "").trim() ||
    bio.trim() !== (currentProfile.bio || "").trim() ||
    avatarUrl.trim() !== (currentProfile.avatarUrl || "").trim() ||
    statusMessage.trim() !== (currentProfile.statusMessage || "").trim() ||
    isAvailableForHire !== (currentProfile.isAvailableForHire ?? true) ||
    !areTagsEqual(tags, currentProfile.tags || []);

  // Submit profile updates
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // If nothing changed, do not perform update
    if (!hasChanges) {
      onClose();
      return;
    }

    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setFormError("표시 이름(Display Name)을 입력해주세요.");
      return;
    }
    if (trimmedName.length < 2 || trimmedName.length > 20) {
      setFormError("이름은 2자 이상 20자 이하로 입력해주세요.");
      return;
    }

    // Validation: if name is changed, check must have passed
    const isOriginal = trimmedName === currentProfile.displayName;
    const isVerified = checkStatus === "available" && verifiedName === trimmedName;

    if (!isOriginal && !isVerified) {
      setFormError("표시 이름 중복 확인을 먼저 완료해주세요.");
      return;
    }

    try {
      setIsSaving(true);
      await onSave({
        displayName: trimmedName,
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim(),
        tags,
        statusMessage: statusMessage.trim(),
        isAvailableForHire,
      });
      onClose();
    } catch (err: unknown) {
      console.error("Failed to save profile:", err);
      const msg = err instanceof Error ? err.message : "프로필 저장 중 오류가 발생했습니다.";
      setFormError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSaving && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Hardware Header Bar */}
        <DialogHeader>
          <div className="flex items-center gap-1.5">
            <UserCog className="w-4 h-4 text-[#f68d1f]" />
            <DialogTitle>EDIT CREATOR PROFILE (프로필 수정)</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-3.5 sm:p-4 space-y-3.5">
          {/* Top Form Error Alert */}
          {formError && (
            <div className="p-2.5 bg-[#e60012] text-white text-[11px] font-bold rounded-[2px] shadow-xs flex items-center gap-2 animate-in fade-in-50">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* 1. Display Name with Duplicate Check */}
          <div className="space-y-1.5 bg-white/70 nintendo-plate p-2.5 rounded-[2px] border border-[#3d4f97]">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase text-[#21242e]">
              <label htmlFor="edit-displayName" className="flex items-center gap-1">
                <span>표시 이름 (DISPLAY NAME)*</span>
                <Badge variant="nintendoCarbon" className="text-[7px] py-0 px-1">
                  중복 확인 지원
                </Badge>
              </label>
              <span className="font-mono text-[9px] text-[#60619c]">
                {displayName.length}/20
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <input
                id="edit-displayName"
                type="text"
                placeholder="예: 박나림, dev_hero"
                value={displayName}
                maxLength={20}
                onChange={(e) => handleNameChange(e.target.value)}
                className="flex-1 bg-white border border-[#3d4f97] nintendo-inset px-2.5 py-1.5 text-xs font-bold text-[#21242e] outline-none rounded-[2px] focus:border-[#f68d1f] focus:ring-1 focus:ring-[#f68d1f]"
              />

              <Button
                type="button"
                onClick={handleCheckDuplicate}
                disabled={checkStatus === "checking" || displayName.trim().length < 2}
                variant="nintendoOrange"
                size="sm"
                className="h-8 px-2.5 text-[10px] font-black tracking-tight shrink-0 flex items-center gap-1"
              >
                {checkStatus === "checking" ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>검사 중</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>중복 확인</span>
                  </>
                )}
              </Button>
            </div>

            {/* Check Feedback Message */}
            {checkMessage && (
              <div
                className={`text-[10px] font-bold flex items-center gap-1 mt-1 ${
                  checkStatus === "available"
                    ? "text-[#059669]"
                    : checkStatus === "duplicated" || checkStatus === "error"
                    ? "text-[#e60012]"
                    : "text-[#3d4f97]"
                }`}
              >
                {checkStatus === "available" ? (
                  <CheckCircle2 className="w-3 h-3 text-[#059669] shrink-0" />
                ) : checkStatus === "duplicated" || checkStatus === "error" ? (
                  <AlertCircle className="w-3 h-3 text-[#e60012] shrink-0" />
                ) : null}
                <span>{checkMessage}</span>
              </div>
            )}
            <p className="text-[9px] text-[#60619c] leading-tight">
              ※ 다른 사용자와 겹치지 않는 고유하고 멋진 닉네임을 설정하세요.
            </p>
          </div>

          {/* 2. Avatar Selection & Preview */}
          <div className="space-y-1.5 bg-white/70 nintendo-plate p-2.5 rounded-[2px] border border-[#3d4f97]">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase text-[#21242e]">
              <label htmlFor="edit-avatarUrl" className="flex items-center gap-1">
                <Camera className="w-3 h-3 text-[#f68d1f]" />
                <span>프로필 아바타 (AVATAR)</span>
              </label>
              <span className="text-[9px] text-[#60619c]">URL 입력 또는 프리셋 선택</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Preview Avatar */}
              <div className="relative shrink-0">
                <Avatar className="w-14 h-14 rounded-none border-2 border-[#3d4f97] bg-white shadow-xs">
                  {avatarUrl && (
                    <AvatarImage src={avatarUrl} alt={displayName} className="object-cover" />
                  )}
                  <AvatarFallback className="rounded-none font-black text-lg bg-[#e60012] text-white">
                    {(displayName || "U").slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* URL Input */}
              <div className="flex-1 space-y-1">
                <input
                  id="edit-avatarUrl"
                  type="text"
                  placeholder="https://example.com/photo.jpg 또는 /profile.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full bg-white border border-[#3d4f97] nintendo-inset px-2 py-1 text-[11px] font-medium text-[#21242e] outline-none rounded-[2px]"
                />

                {/* Preset Avatars */}
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[8px] font-bold text-[#60619c]">프리셋:</span>
                  {AVATAR_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(p.url)}
                      className={`text-[8px] font-bold px-1.5 py-0.5 rounded-[2px] border transition-colors cursor-pointer ${
                        avatarUrl === p.url
                          ? "bg-[#3d4f97] text-white border-[#3d4f97]"
                          : "bg-white text-[#21242e] border-[#3d4f97] hover:bg-[#dedede]"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl("")}
                      className="text-[8px] text-[#e60012] font-bold hover:underline cursor-pointer ml-1"
                    >
                      초기화
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Bio (한 줄 소개) */}
          <div className="space-y-1 bg-white/70 nintendo-plate p-2.5 rounded-[2px] border border-[#3d4f97]">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase text-[#21242e]">
              <label htmlFor="edit-bio">한 줄 소개 (BIO)</label>
              <span className="font-mono text-[9px] text-[#60619c]">
                {bio.length}/120
              </span>
            </div>
            <textarea
              id="edit-bio"
              rows={2}
              maxLength={120}
              placeholder="나를 표현하는 한 줄 소개 또는 목표를 적어보세요."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-white border border-[#3d4f97] nintendo-inset p-2 text-xs font-medium text-[#21242e] outline-none rounded-[2px] resize-none"
            />
          </div>

          {/* 4. Status Message (상태 메시지) & Coffee Chat Toggle */}
          <div className="space-y-2 bg-white/70 nintendo-plate p-2.5 rounded-[2px] border border-[#3d4f97]">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-[#21242e]">
                <label htmlFor="edit-status" className="flex items-center gap-1">
                  <Coffee className="w-3 h-3 text-[#f68d1f]" />
                  <span>상태 메시지 (STATUS BADGE)</span>
                </label>
                <span className="font-mono text-[9px] text-[#60619c]">
                  {statusMessage.length}/50
                </span>
              </div>
              <input
                id="edit-status"
                type="text"
                maxLength={50}
                placeholder="예: 새로운 기회와 커피챗 언제나 환영합니다 ☕"
                value={statusMessage}
                onChange={(e) => setStatusMessage(e.target.value)}
                className="w-full bg-white border border-[#3d4f97] nintendo-inset px-2 py-1 text-xs font-medium text-[#21242e] outline-none rounded-[2px]"
              />
            </div>

            {/* Available for hire toggle */}
            <div className="flex items-center justify-between pt-1 border-t border-[#3d4f97]/40">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-[#21242e]">
                  프로젝트 / 커피챗 제안 받기 상태 활성화
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAvailableForHire}
                  onChange={(e) => setIsAvailableForHire(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3.5 after:transition-all peer-checked:bg-[#00ff66]"></div>
              </label>
            </div>
          </div>

          {/* 5. Specialty Tags */}
          <div className="space-y-1.5 bg-white/70 nintendo-plate p-2.5 rounded-[2px] border border-[#3d4f97]">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase text-[#21242e]">
              <label className="flex items-center gap-1">
                <Tag className="w-3 h-3 text-[#f68d1f]" />
                <span>전문 분야 태그 ({tags.length}/6)</span>
              </label>
              <span className="text-[9px] text-[#60619c]">최대 6개</span>
            </div>

            {/* Current Tags Chips */}
            <div className="flex items-center gap-1.5 flex-wrap min-h-[26px]">
              {tags.map((tag, idx) => (
                <Badge
                  key={idx}
                  variant="default"
                  className="text-[9px] sm:text-[10px] bg-[#dedede] text-[#21242e] border-[#3d4f97] flex items-center gap-1 pr-1"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(idx)}
                    className="hover:text-[#e60012] font-black cursor-pointer ml-0.5"
                    title="태그 삭제"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </Badge>
              ))}
              {tags.length === 0 && (
                <span className="text-[9px] text-[#60619c] italic">등록된 태그가 없습니다.</span>
              )}
            </div>

            {/* Add Tag Input */}
            <div className="flex items-center gap-1 pt-1">
              <input
                type="text"
                placeholder="직접 입력 (예: 🎨 Figma)"
                value={tagInput}
                maxLength={20}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag(tagInput);
                  }
                }}
                className="flex-1 bg-white border border-[#3d4f97] nintendo-inset px-2 py-1 text-[11px] font-medium text-[#21242e] outline-none rounded-[2px]"
              />
              <Button
                type="button"
                onClick={() => handleAddTag(tagInput)}
                variant="nintendoPlate"
                size="sm"
                className="h-7 px-2 text-[10px] font-bold"
              >
                <Plus className="w-3 h-3 mr-0.5" />
                추가
              </Button>
            </div>

            {/* Recommended Tags Bar */}
            <div className="pt-1 flex items-center gap-1 flex-wrap">
              <span className="text-[8px] font-bold text-[#60619c]">추천:</span>
              {RECOMMENDED_TAGS.map((recTag, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddTag(recTag)}
                  disabled={tags.includes(recTag)}
                  className={`text-[8px] px-1.5 py-0.5 rounded-[2px] border font-bold cursor-pointer transition-colors ${
                    tags.includes(recTag)
                      ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                      : "bg-white text-[#21242e] border-[#3d4f97] hover:bg-[#fff9e6]"
                  }`}
                >
                  + {recTag}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Dialog Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-2 border-t border-[#3d4f97]">
            <div>
              {!hasChanges && (
                <span className="text-[10px] text-[#60619c] font-bold">
                  * 변경된 사항이 없습니다.
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                variant="nintendoPlate"
                size="sm"
                className="h-8 px-3 text-xs font-bold"
              >
                취소
              </Button>

              <Button
                type="submit"
                disabled={isSaving || !hasChanges}
                variant={hasChanges ? "nintendoOrange" : "nintendoPlate"}
                size="sm"
                title={!hasChanges ? "변경된 사항이 없습니다." : "프로필 변경 사항 저장"}
                className={`h-8 px-4 text-xs font-black tracking-wide flex items-center gap-1.5 transition-all ${
                  hasChanges
                    ? "bg-[#f68d1f] hover:bg-[#ff9d33] text-white cursor-pointer"
                    : "opacity-60 cursor-not-allowed text-[#60619c]"
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>저장 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>프로필 저장</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
