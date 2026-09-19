"use client";

import { useState } from "react";
import { Copy, Check, X, Share2, QrCode } from "lucide-react";
import { UserProfile } from "@/types";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
}

export function ShareModal({ isOpen, onClose, profile }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://mylink.me/${profile.username}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                프로필 공유하기
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                @{profile.username}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Visual */}
        <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 text-center space-y-3">
          <div className="w-36 h-36 p-3 rounded-2xl bg-white shadow-sm flex flex-col items-center justify-center border border-zinc-200/80">
            <QrCode className="w-20 h-20 text-emerald-500" />
            <span className="text-[10px] font-bold text-zinc-700 mt-1 truncate max-w-full">
              {profile.displayName}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
            스마트폰 카메라로 스캔하여 프로필을 빠르게 공유하세요
          </p>
        </div>

        {/* Link Copy Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            프로필 링크 주소
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  복사됨
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  복사
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
