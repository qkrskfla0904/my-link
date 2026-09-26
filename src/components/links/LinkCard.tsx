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
} from "lucide-react";

interface LinkCardProps {
  link: LinkItem;
  theme: ThemeAccent;
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
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
      {...props}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
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
      {...props}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

const getIcon = (iconName?: string) => {
  switch (iconName) {
    case "github":
      return GithubIcon;
    case "blog":
      return BookOpen;
    case "linkedin":
      return LinkedinIcon;
    case "mail":
      return Mail;
    case "globe":
    default:
      return Globe;
  }
};

export function LinkCard({ link }: LinkCardProps) {
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

  return (
    <a
      href={link.url}
      target={link.url.startsWith("http") ? "_blank" : "_self"}
      rel="noopener noreferrer"
      className="group relative block w-full bg-[#dedede] hover:bg-[#ffffff] border-t border-l border-white border-b-2 border-r-2 border-[#3d4f97] p-2 sm:p-2.5 transition-all duration-150 shadow-xs"
    >
      <div className="flex items-center justify-between gap-2">
        {/* Left: Icon & Headline Info */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Beveled Icon Box */}
          <div className="w-6 h-6 sm:w-7 sm:h-7 bg-[#8ba1d4] nintendo-plate flex items-center justify-center text-[#21242e] shrink-0">
            <IconComponent />
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              {/* Category Pill */}
              {link.category && (
                <span className="px-1.5 py-0.2 bg-[#21242e] text-[#ecab37] text-[8px] sm:text-[9px] font-bold uppercase tracking-wider shrink-0">
                  {link.category}
                </span>
              )}

              {/* Hot / Popular Badge */}
              {link.isPopular && (
                <span className="inline-flex items-center gap-0.5 px-1 py-0.2 bg-[#e60012] text-white text-[7px] sm:text-[8px] font-black uppercase shrink-0">
                  <Flame className="w-2 h-2 fill-white" />
                  HOT
                </span>
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
          </div>
        </div>

        {/* Right: Copy Button & Signal-Orange Chevron Chip */}
        <div className="flex items-center gap-1 shrink-0 ml-0.5">
          {link.url !== "#" && (
            <button
              onClick={handleCopy}
              title="Copy URL"
              className="px-1.5 py-0.5 sm:py-1 bg-[#ecab37] hover:bg-[#e48600] text-[#21242e] text-[8px] sm:text-[9px] font-bold uppercase nintendo-chip flex items-center gap-0.5 cursor-pointer whitespace-nowrap"
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
            </button>
          )}

          {/* Button-Arrow-Chip: 18px Signal Orange Chip */}
          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-[#f68d1f] group-hover:bg-[#e48600] text-white border border-[#283463] flex items-center justify-center transition-transform group-hover:translate-x-0.5 shadow-xs shrink-0">
            <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
          </div>
        </div>
      </div>
    </a>
  );
}
