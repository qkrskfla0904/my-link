"use client";

import { useState } from "react";
import { LinkItem, ThemeAccent } from "@/types";
import {
  BookOpen,
  Mail,
  Globe,
  Copy,
  Check,
  ArrowUpRight,
  Flame,
} from "lucide-react";

interface LinkCardProps {
  link: LinkItem;
  theme: ThemeAccent;
}

const themeStyles: Record<
  ThemeAccent,
  {
    borderHover: string;
    textHover: string;
    iconBg: string;
    iconText: string;
    popularBadge: string;
  }
> = {
  emerald: {
    borderHover: "hover:border-emerald-400 dark:hover:border-emerald-500/80",
    textHover: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/60",
    iconText: "text-emerald-600 dark:text-emerald-400",
    popularBadge:
      "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  },
  violet: {
    borderHover: "hover:border-violet-400 dark:hover:border-violet-500/80",
    textHover: "group-hover:text-violet-600 dark:group-hover:text-violet-400",
    iconBg: "bg-violet-50 dark:bg-violet-950/60",
    iconText: "text-violet-600 dark:text-violet-400",
    popularBadge:
      "bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800",
  },
  sky: {
    borderHover: "hover:border-sky-400 dark:hover:border-sky-500/80",
    textHover: "group-hover:text-sky-600 dark:group-hover:text-sky-400",
    iconBg: "bg-sky-50 dark:bg-sky-950/60",
    iconText: "text-sky-600 dark:text-sky-400",
    popularBadge:
      "bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800",
  },
  rose: {
    borderHover: "hover:border-rose-400 dark:hover:border-rose-500/80",
    textHover: "group-hover:text-rose-600 dark:group-hover:text-rose-400",
    iconBg: "bg-rose-50 dark:bg-rose-950/60",
    iconText: "text-rose-600 dark:text-rose-400",
    popularBadge:
      "bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  },
  amber: {
    borderHover: "hover:border-amber-400 dark:hover:border-amber-500/80",
    textHover: "group-hover:text-amber-600 dark:group-hover:text-amber-400",
    iconBg: "bg-amber-50 dark:bg-amber-950/60",
    iconText: "text-amber-600 dark:text-amber-400",
    popularBadge:
      "bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  },
};

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
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
      width="24"
      height="24"
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

export function LinkCard({ link, theme }: LinkCardProps) {
  const [copied, setCopied] = useState(false);
  const IconComponent = getIcon(link.icon);
  const styles = themeStyles[theme] || themeStyles.emerald;

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
      className={`group relative block w-full p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/90 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-xs hover:shadow-lg ${styles.borderHover} transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.99]`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left Side: Icon & Title/Description */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`p-2.5 rounded-xl ${styles.iconBg} ${styles.iconText} transition-transform group-hover:scale-110 duration-200 shrink-0`}
          >
            <IconComponent className="w-5 h-5" />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className={`font-bold text-sm text-zinc-900 dark:text-zinc-100 ${styles.textHover} transition-colors tracking-tight truncate`}
              >
                {link.title}
              </h3>

              {link.isPopular && (
                <span
                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${styles.popularBadge}`}
                >
                  <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                  인기
                </span>
              )}

              {link.category && (
                <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60">
                  {link.category}
                </span>
              )}
            </div>

            {link.description && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 truncate">
                {link.description}
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Copy Button & External Arrow */}
        <div className="flex items-center gap-1 shrink-0">
          {link.url !== "#" && (
            <button
              onClick={handleCopy}
              title="링크 복사"
              className="p-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {copied ? (
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                  <Check className="w-3.5 h-3.5" /> 복사됨
                </span>
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          )}

          <div className="p-1.5 rounded-lg text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </a>
  );
}
