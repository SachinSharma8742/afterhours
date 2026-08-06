"use client";

import { RotateCcw } from "lucide-react";

export default function EventFilter({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedCity,
  setSelectedCity,
}) {
  const categories = [
    { id: "all", label: "ALL EVENTS" },
    { id: "nightlife", label: "NIGHTLIFE" },
    { id: "music", label: "CONCERTS & MUSIC" },
    { id: "festival", label: "FESTIVALS" },
  ];

  const isFiltered = selectedCategory !== "all" || selectedCity;

  return (
    <div className="mb-10 p-4 sm:p-6 bg-black border border-[#c8102e]/40 rounded-2xl sm:rounded-3xl shadow-[0_0_30px_rgba(255,13,57,0.2)]">

      {/* Category Tabs — horizontal scroll on mobile, wrap on desktop */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div
          className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap scrollbar-hide flex-1"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 px-4 sm:px-5 py-2.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-widest transition-all ${
                selectedCategory === cat.id
                  ? "bg-[#c8102e] text-white border border-[#e01838] shadow-[0_0_15px_rgba(255,13,57,0.5)]"
                  : "bg-[#0a0a0a] border border-gray-800 text-gray-400 hover:text-white hover:border-[#c8102e]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Reset button */}
        {isFiltered && (
          <button
            onClick={() => {
              if (setSearchQuery) setSearchQuery("");
              setSelectedCategory("all");
              setSelectedCity("");
            }}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-[#c8102e] hover:bg-white/5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">RESET</span>
          </button>
        )}
      </div>
    </div>
  );
}
