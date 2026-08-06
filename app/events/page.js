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
        <div className="p-16 text-center text-gray-400 text-xs font-black uppercase tracking-widest bg-black border border-[#c8102e]/30 rounded-2xl">
          LOADING EVENTS...
        </div>
      ) : events.length > 0 ? (
        <EventGrid events={events} loading={false} onResetFilter={handleReset} />
      ) : (
        <div className="p-16 bg-black border border-[#c8102e]/40 rounded-3xl text-center flex flex-col items-center gap-4 box-red-glow">
          <div className="w-16 h-16 bg-[#6e0008] border border-[#c8102e] rounded-2xl flex items-center justify-center text-[#c8102e]">
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
    <div className="min-h-screen bg-black text-white pt-24 pb-20 font-montserrat">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="flex flex-col gap-2 mb-10 text-center sm:text-left">
          <span className="text-xs font-black uppercase tracking-[0.35em] text-[#c8102e]">// OFFICIAL LINEUP</span>
          <h1 className="font-bebas text-5xl sm:text-7xl tracking-wider uppercase text-white">
            EXPLORE <span className="text-[#c8102e] red-text-glow">EVENTS & PASSES</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-xl font-medium">
            Browse upcoming nightlife events, music festivals, and live shows produced directly by AfterHours.
          </p>
        </div>

        <Suspense fallback={<div className="text-gray-400 text-xs font-bold uppercase tracking-widest">LOADING EVENTS...</div>}>
          <ExploreEventsContent />
        </Suspense>
      </div>
    </div>
  );
}
