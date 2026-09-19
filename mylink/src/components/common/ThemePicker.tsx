"use client";

import { ThemeAccent } from "@/types";

interface ThemePickerProps {
  currentTheme: ThemeAccent;
  onSelectTheme: (theme: ThemeAccent) => void;
}

const THEMES: { id: ThemeAccent; name: string; bg: string }[] = [
  { id: "emerald", name: "에메랄드", bg: "bg-emerald-500" },
  { id: "violet", name: "바이올렛", bg: "bg-violet-500" },
  { id: "sky", name: "스카이", bg: "bg-sky-500" },
  { id: "rose", name: "로즈", bg: "bg-rose-500" },
  { id: "amber", name: "앰버", bg: "bg-amber-500" },
];

export function ThemePicker({ currentTheme, onSelectTheme }: ThemePickerProps) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 rounded-full bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md shadow-xs">
      <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
        <span>🎨</span> 테마 컬러
      </span>
      <div className="flex items-center gap-1.5 ml-2">
        {THEMES.map((theme) => {
          const isSelected = currentTheme === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => onSelectTheme(theme.id)}
              title={`${theme.name} 테마`}
              aria-label={`${theme.name} 테마로 변경`}
              className={`w-4 h-4 rounded-full ${theme.bg} transition-all duration-200 ${
                isSelected
                  ? "ring-2 ring-offset-2 ring-zinc-700 dark:ring-zinc-200 dark:ring-offset-zinc-900 scale-110"
                  : "opacity-60 hover:opacity-100 hover:scale-105"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
