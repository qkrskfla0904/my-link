"use client";

import { useState } from "react";
import { LinkItem } from "@/types";

interface LinkCardProps {
  link: LinkItem;
}

export function LinkCard({ link }: LinkCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    if (link.url === "#") return;
    e.preventDefault();
    navigator.clipboard.writeText(link.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <a
      href={link.url}
      target={link.url.startsWith("http") ? "_blank" : "_self"}
      rel="noopener noreferrer"
      className="group relative block w-full p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/80 shadow-sm hover:shadow-md hover:border-emerald-400 dark:hover:border-emerald-500 transition-all duration-200 active:scale-[0.99]"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors tracking-tight">
              {link.title}
            </h3>
            {link.category && (
              <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
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

        <div className="flex items-center gap-2 shrink-0">
          {link.url !== "#" && (
            <button
              onClick={handleCopy}
              title="링크 복사"
              className="p-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {copied ? "✓ 복사됨" : "📋"}
            </button>
          )}
          <span className="text-zinc-400 group-hover:translate-x-1 transition-transform duration-200 font-bold">
            →
          </span>
        </div>
      </div>
    </a>
  );
}
