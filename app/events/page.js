"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import EventFilter from "@/components/events/EventFilter";
import EventGrid from "@/components/events/EventGrid";
import { getEvents } from "@/lib/services/event-service";
import { Calendar } from "lucide-react";

function ExploreEventsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const initialSearch = searchParams.get("search") || "";

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCity, setSelectedCity] = useState("");


  useEffect(() => {
    async function fetchFilteredEvents() {
      setLoading(true);
      try {
        const fetched = await getEvents({
          category: selectedCategory,
          search: searchQuery,
          city: selectedCity,

        });
        setEvents(fetched || []);
      } catch (err) {
        console.warn("Failed fetching events:", err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchFilteredEvents();
  }, [searchQuery, selectedCategory, selectedCity]);

  const handleReset = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedCity("");

  };

  return (
    <>
      <EventFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}

      />

      {loading ? (
        <div className="p-16 text-center text-gray-400 text-xs font-black uppercase tracking-widest bg-black border border-[#5a1826]/30 rounded-2xl">
          LOADING EVENTS...
        </div>
      ) : events.length > 0 ? (
        <EventGrid events={events} loading={false} onResetFilter={handleReset} />
      ) : (
        <div className="p-16 bg-black border border-[#5a1826]/40 rounded-3xl text-center flex flex-col items-center gap-4 box-red-glow">
          <div className="w-16 h-16 bg-[#6e0008] border border-[#5a1826] rounded-2xl flex items-center justify-center text-[#5a1826]">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <div className="flex flex-col gap-1 max-w-md">
            <h3 className="font-bebas text-3xl text-white">NO UPCOMING EVENTS MATCHED</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              Please check back soon for our next scheduled release of concerts, nightlife raves, and music festivals.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default function ExploreEventsPage() {
  return (
    <div className="min-h-screen text-[#f7f1e5] pt-24 pb-20 font-montserrat">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-10 text-center sm:text-left">
          <img
            src="/images/logo.png?v=afterhours-v5"
            alt="AfterHours Brand"
            className="w-16 h-16 sm:w-18 sm:h-18 object-cover rounded-xl border border-[#e5c997]/40 mx-auto sm:mx-0 shrink-0"
          />
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#e5c997]">// OFFICIAL LINEUP</span>
            <h1 className="font-bebas text-5xl sm:text-7xl tracking-wider uppercase text-[#f7f1e5]">
              EXPLORE <span className="text-[#e5c997]">EVENTS & PASSES</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#9c8e82] max-w-xl font-normal">
              Browse upcoming nightlife events, music festivals, and live shows produced directly by AfterHours.
            </p>
          </div>
        </div>

        <Suspense fallback={<div className="text-gray-400 text-xs font-bold uppercase tracking-widest">LOADING EVENTS...</div>}>
          <ExploreEventsContent />
        </Suspense>
      </div>
    </div>
  );
}
