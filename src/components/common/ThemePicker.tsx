"use client";

import { ThemeAccent } from "@/types";

interface ThemePickerProps {
  currentTheme: ThemeAccent;
  onSelectTheme: (theme: ThemeAccent) => void;
}

const MODES: { id: ThemeAccent; name: string; color: string; label: string }[] = [
  { id: "violet", name: "HOME", color: "bg-[#acace7]", label: "LAVENDER" },
  { id: "emerald", name: "SYSTEMS", color: "bg-[#206479]", label: "TEAL" },
  { id: "rose", name: "GAMES", color: "bg-[#a7282b]", label: "RED" },
  { id: "sky", name: "NEWS", color: "bg-[#c0d5e6]", label: "ICE" },
  { id: "amber", name: "CLASSIC", color: "bg-[#ecab37]", label: "GOLD" },
];

export function ThemePicker({ currentTheme, onSelectTheme }: ThemePickerProps) {
  return (
    <div className="flex items-center gap-1.5 p-1 bg-[#8ba1d4] nintendo-plate rounded-[2px] shadow-xs">
      <span className="text-[10px] font-bold text-[#21242e] uppercase tracking-wider px-1">
        MODE:
      </span>
      <div className="flex items-center gap-1">
        {MODES.map((mode) => {
          const isSelected = currentTheme === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onSelectTheme(mode.id)}
              title={`${mode.name} (${mode.label})`}
              className={`px-1.5 py-0.5 text-[9px] font-bold uppercase transition-all rounded-[2px] ${
                isSelected
                  ? "bg-[#21242e] text-[#e48600] border border-[#3d4f97] shadow-inner font-black"
                  : "bg-white text-[#21242e] border border-[#3d4f97] hover:bg-[#dedede] opacity-80"
              }`}
            >
              {mode.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
