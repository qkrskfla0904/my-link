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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-[#7a8aba] nintendo-plate p-4 space-y-3.5 shadow-2xl">
        {/* Header Bar */}
        <div className="w-full bg-[#21242e] text-white px-2.5 py-1 flex items-center justify-between border-b border-[#3d4f97]">
          <div className="flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-[#f68d1f]" />
            <span className="text-[11px] font-bold text-[#e48600] uppercase tracking-wider">
              NINTENDO SHARE MODULE
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-4 h-4 bg-[#e60012] text-white flex items-center justify-center text-xs font-black cursor-pointer hover:opacity-90"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Game Boy LCD Screen Style QR Code Frame */}
        <div className="w-full bg-[#c0d5e6] nintendo-inset p-3 flex flex-col items-center justify-center text-center space-y-2">
          <div className="p-2 bg-white border border-[#3d4f97] shadow-inner">
            <QrCode className="w-20 h-20 text-[#21242e]" />
          </div>
          <p className="text-[10px] font-bold text-[#21242e] uppercase tracking-wider">
            SCAN CODE WITH YOUR HARDWARE DEVICE
          </p>
        </div>

        {/* URL Input & Signal-Orange Submit / Copy Button */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase text-[#21242e]">
            SYSTEM LINK ADDRESS:
          </label>
          <div className="flex items-center gap-1">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="flex-1 min-w-0 px-2 py-1 bg-white nintendo-inset text-[11px] font-mono text-[#21242e] outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-1 bg-[#f68d1f] hover:bg-[#e48600] text-white text-[11px] font-black uppercase nintendo-chip flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>COPIED</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>SUBMIT</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
