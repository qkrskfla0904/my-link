"use client";

import { ThemeAccent } from "@/types";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  theme: ThemeAccent;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar border-b border-[#3d4f97]">
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat;
        return (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              isSelected
                ? "bg-[#21242e] text-[#f68d1f] border-t-2 border-l-2 border-[#f68d1f] border-r-2 border-b-0 border-[#21242e] shadow-xs"
                : "bg-[#8ba1d4] hover:bg-[#9fbee7] text-[#21242e] border-t border-l border-white border-r border-b border-[#3d4f97]"
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
