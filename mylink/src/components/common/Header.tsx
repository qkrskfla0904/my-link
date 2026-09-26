"use client";

import Link from "next/link";
import { Search } from "lucide-react";

export function Header() {
  return (
    <header className="w-full bg-[#7a8aba] select-none">
      {/* 1. Masthead Row: Mascot, Logo, and Search Module */}
      <div className="px-3 py-2 flex items-center justify-between gap-2 flex-wrap border-b border-[#3d4f97]">
        {/* Left: Mascot & Logo Pill */}
        <div className="flex items-center gap-2">
          {/* Mario Mascot Sprite & Speech Bubble */}
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-full bg-[#e60012] border-2 border-white flex items-center justify-center text-white text-xs font-black shadow-xs shrink-0">
              M
            </div>
            <div className="relative px-2 py-0.5 bg-white border border-[#3d4f97] rounded-[4px] text-[10px] font-bold text-[#21242e] shadow-xs">
              Welcome to MyLink.com!
              {/* Bubble tail */}
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-0 h-0 border-t-[3px] border-t-transparent border-r-[4px] border-r-white border-b-[3px] border-b-transparent" />
            </div>
          </div>

          {/* Nintendo Red Racetrack Logo Pill */}
          <Link
            href="/"
            className="px-3 py-0.5 bg-white border-2 border-[#e60012] rounded-full flex items-center justify-center hover:opacity-95 shadow-xs"
          >
            <span className="text-[#e60012] font-black italic tracking-tighter text-sm">
              Nintendo
            </span>
          </Link>
        </div>

        {/* Right: Search Module with Category Dropdown & Amber GO Chip */}
        <div className="flex items-center gap-1">
          <div className="flex items-center bg-white border border-[#3d4f97] nintendo-inset px-1.5 py-0.5 rounded-[2px]">
            <Search className="w-3 h-3 text-[#3d4f97] mr-1 shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              className="w-24 sm:w-32 text-[11px] font-medium text-[#21242e] outline-none bg-transparent"
            />
            <select className="text-[10px] font-bold text-[#3d4f97] bg-transparent border-l border-[#dedede] pl-1 outline-none">
              <option>All</option>
              <option>Games</option>
              <option>Systems</option>
            </select>
          </div>
          <button className="px-2 py-0.5 bg-[#ecab37] hover:bg-[#e48600] text-[#21242e] text-[10px] font-black uppercase nintendo-chip rounded-[2px] shadow-xs cursor-pointer">
            GO
          </button>
        </div>
      </div>

      {/* 2. Primary Navigation: Carbon-Navy Command Bar */}
      <div className="w-full bg-carbon-halftone border-y border-[#3d4f97] px-3 py-1 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        {/* Nav Words glowing in Nav-Gold */}
        <nav className="flex items-center gap-3 sm:gap-5 shrink-0">
          {[
            { label: "GAMES", href: "#" },
            { label: "SYSTEMS", href: "#" },
            { label: "NEWS", href: "#" },
            { label: "NSIDER", href: "#" },
            { label: "DOWNLOADS", href: "#" },
          ].map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="text-[#e48600] hover:text-[#f68d1f] text-xs font-bold uppercase tracking-[0.5px] whitespace-nowrap transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Amber Utility Chips */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button className="px-2 py-0.5 bg-[#ecab37] hover:bg-[#e48600] text-[#21242e] text-[10px] font-bold uppercase nintendo-chip rounded-[2px] whitespace-nowrap cursor-pointer">
            CODE BANK
          </button>
          <button className="px-2 py-0.5 bg-[#ecab37] hover:bg-[#e48600] text-[#21242e] text-[10px] font-bold uppercase nintendo-chip rounded-[2px] whitespace-nowrap cursor-pointer">
            GAME FINDER
          </button>
        </div>
      </div>

      {/* 3. Secondary Subnav Strip: Pale Sky */}
      <div className="w-full bg-[#9fbee7] border-b-2 border-[#3d4f97] px-3 py-1 flex items-center gap-2 sm:gap-3 overflow-x-auto text-[10px] font-bold text-[#21242e] uppercase tracking-wider no-scrollbar">
        <span>PARENTS</span>
        <span className="text-[#60619c]">|</span>
        <span>CUSTOMER SERVICE</span>
        <span className="text-[#60619c]">|</span>
        <span>CORPORATE</span>
        <span className="text-[#60619c]">|</span>
        <span>GLOBAL</span>
        <span className="text-[#60619c]">|</span>
        <span>PRIVACY</span>
        <span className="text-[#60619c]">|</span>
        <span>STORE</span>
        <span className="text-[#60619c]">|</span>
        <span>CONTACT</span>
      </div>
    </header>
  );
}
