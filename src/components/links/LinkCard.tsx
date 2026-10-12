"use client";

import { useState } from "react";
import { LinkItem, ThemeAccent } from "@/types";
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LinkCardProps {
  link: LinkItem;
  theme?: ThemeAccent;
  onLinkClick?: (id: string) => void;
}

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

const getIcon = (iconName?: string) => {
  switch (iconName) {
    case "github":
      return GithubIcon;
    case "project":
      return Sparkles;
    case "blog":
      return BookOpen;
    case "resume":
      return FileText;
    case "code":
      return Code2;
    case "linkedin":
      return LinkedinIcon;
    case "youtube":
      return YoutubeIcon;
    case "twitter":
      return TwitterIcon;
    case "mail":
      return Mail;
    case "send":
      return Send;
    case "globe":
    default:
      return Globe;
  }
};

export function LinkCard({ link, onLinkClick }: LinkCardProps) {
  const [copied, setCopied] = useState(false);
  const IconComponent = getIcon(link.icon);

  const handleCopy = (e: React.MouseEvent) => {
    if (link.url === "#") return;
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(link.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClick = () => {
    if (onLinkClick) {
      onLinkClick(link.id);
    }
  };

  return (
    <a
      href={link.url}
      target={link.url.startsWith("http") ? "_blank" : "_self"}
      rel="noopener noreferrer"
      onClick={handleClick}
      className="group relative block w-full bg-[#dedede] hover:bg-[#ffffff] border-t border-l border-white border-b-2 border-r-2 border-[#3d4f97] p-2 sm:p-2.5 transition-all duration-150 shadow-xs rounded-[2px]"
    >
      <div className="flex items-center justify-between gap-2">
        {/* Left: Icon & Headline Info */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Beveled Icon Box */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#8ba1d4] nintendo-plate flex items-center justify-center text-[#21242e] shrink-0">
            <IconComponent />
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
        </div>

        {/* Right: Copy Button & Signal-Orange Chevron Chip */}
        <div className="flex items-center gap-1 shrink-0 ml-0.5">
          {link.url !== "#" && (
            <Button
              type="button"
              onClick={handleCopy}
              title="Copy URL"
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

          {/* Button-Arrow-Chip: Signal Orange Chip */}
          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-[#f68d1f] group-hover:bg-[#e48600] text-white border border-[#283463] flex items-center justify-center transition-transform group-hover:translate-x-0.5 shadow-xs shrink-0 rounded-[2px]">
            <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
          </div>
        </div>
      </div>
    </a>
  );
}
