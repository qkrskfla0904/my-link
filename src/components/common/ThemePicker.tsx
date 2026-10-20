"use client";

import { ThemeAccent } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemePickerProps {
  currentTheme: ThemeAccent;
  onSelectTheme: (theme: ThemeAccent) => void;
}

const MODES: { id: ThemeAccent; name: string; color: string; label: string; hex: string }[] = [
  { id: "violet", name: "라벤더", color: "bg-[#acace7]", hex: "#acace7", label: "바이올렛" },
  { id: "emerald", name: "시스템", color: "bg-[#206479]", hex: "#206479", label: "에메랄드" },
  { id: "rose", name: "게임레드", color: "bg-[#a7282b]", hex: "#a7282b", label: "로즈레드" },
  { id: "sky", name: "아이스", color: "bg-[#c0d5e6]", hex: "#c0d5e6", label: "스카이블루" },
  { id: "amber", name: "골드", color: "bg-[#ecab37]", hex: "#ecab37", label: "앰버골드" },
];

export function ThemePicker({ currentTheme, onSelectTheme }: ThemePickerProps) {
  const currentMode = MODES.find((m) => m.id === currentTheme) || MODES[0];

  return (
    <div className="w-full bg-[#8ba1d4] nintendo-plate p-1.5 space-y-1.5 rounded-[2px] shadow-xs">
      {/* Active Mode Status Bar */}
      <div className="flex items-center justify-between px-1 text-[9px] sm:text-[10px] font-bold text-[#21242e] uppercase">
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full border border-[#21242e] shadow-xs animate-pulse"
            style={{ backgroundColor: currentMode.hex }}
          />
          <span className="tracking-wider">선택 색상:</span>
        </div>
        <span className="font-mono text-[#3d4f97] font-bold">
          {currentMode.label}
        </span>
      </div>

      {/* 5-Equal Column Cartridge Mode Grid (No dangling wrapping) */}
      <div className="grid grid-cols-5 gap-1">
        {MODES.map((mode) => {
          const isSelected = currentTheme === mode.id;
          return (
            <Button
              key={mode.id}
              type="button"
              onClick={() => onSelectTheme(mode.id)}
              title={`${mode.name} (${mode.label})`}
              variant={isSelected ? "nintendoCarbon" : "secondary"}
              size="sm"
              className={cn(
                "h-auto flex flex-col items-center justify-center p-1 w-full gap-1 rounded-[2px] transition-all",
                isSelected
                  ? "border border-[#f68d1f] shadow-xs"
                  : "hover:bg-white"
              )}
            >
              {/* Hardware Color Swatch Bar */}
              <span
                className={cn(
                  "w-full h-1.5 rounded-[1px] border border-black/20 shrink-0",
                  mode.color
                )}
              />
              <span
                className={cn(
                  "text-[8px] sm:text-[9px] font-black uppercase tracking-tighter leading-none truncate w-full text-center",
                  isSelected ? "text-[#ecab37]" : "text-[#21242e]"
                )}
              >
                {mode.name}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
