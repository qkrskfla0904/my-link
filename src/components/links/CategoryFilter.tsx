"use client";

import { ThemeAccent } from "@/types";
import { Button } from "@/components/ui/button";

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
          <Button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            variant={isSelected ? "nintendoCarbon" : "nintendoPlate"}
            size="sm"
            className={`px-3 py-1 text-[10px] sm:text-[11px] tracking-wider whitespace-nowrap ${
              isSelected
                ? "border-t-2 border-l-2 border-[#f68d1f] shadow-xs"
                : "border-t border-l border-white border-r border-b border-[#3d4f97]"
            }`}
          >
            {cat}
          </Button>
        );
      })}
    </div>
  );
}

