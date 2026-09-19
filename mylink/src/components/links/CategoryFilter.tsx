"use client";

import { ThemeAccent } from "@/types";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  theme: ThemeAccent;
}

const themeBadgeStyles: Record<ThemeAccent, { active: string; hover: string }> = {
  emerald: {
    active: "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30",
    hover: "hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-600 dark:hover:text-emerald-400",
  },
  violet: {
    active: "bg-violet-500 text-white shadow-sm shadow-violet-500/30",
    hover: "hover:bg-violet-50 dark:hover:bg-violet-950/50 hover:text-violet-600 dark:hover:text-violet-400",
  },
  sky: {
    active: "bg-sky-500 text-white shadow-sm shadow-sky-500/30",
    hover: "hover:bg-sky-50 dark:hover:bg-sky-950/50 hover:text-sky-600 dark:hover:text-sky-400",
  },
  rose: {
    active: "bg-rose-500 text-white shadow-sm shadow-rose-500/30",
    hover: "hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400",
  },
  amber: {
    active: "bg-amber-500 text-white shadow-sm shadow-amber-500/30",
    hover: "hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:text-amber-600 dark:hover:text-amber-400",
  },
};

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  theme,
}: CategoryFilterProps) {
  const currentStyles = themeBadgeStyles[theme] || themeBadgeStyles.emerald;

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat;
        return (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 ${
              isSelected
                ? currentStyles.active
                : `bg-white/80 dark:bg-zinc-900/80 text-zinc-600 dark:text-zinc-400 border border-zinc-200/80 dark:border-zinc-800/80 ${currentStyles.hover}`
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
