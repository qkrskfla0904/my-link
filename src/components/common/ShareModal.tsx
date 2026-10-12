"use client";

import { useState } from "react";
import { Copy, Check, Share2, QrCode } from "lucide-react";
import { UserProfile } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
}

export function ShareModal({ isOpen, onClose, profile }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        {/* Header Bar */}
        <DialogHeader>
          <div className="flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-[#f68d1f]" />
            <DialogTitle>NINTENDO SHARE MODULE</DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-3.5">
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
              <Button
                onClick={handleCopy}
                variant="nintendoOrange"
                size="sm"
                className="h-7 text-[10px] sm:text-[11px] shrink-0"
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
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

