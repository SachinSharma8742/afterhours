"use client";

import EventCard from "./EventCard";
import { EventCardSkeleton } from "../ui/Skeleton";
import { CalendarX, Search } from "lucide-react";
import Button from "../ui/Button";

export default function EventGrid({ events = [], loading = false, onResetFilter }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-slate-900/40 border border-slate-800/80 rounded-3xl backdrop-blur-md my-8">
        <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-4">
          <CalendarX className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-100">No Events Found</h3>
        <p className="text-sm text-slate-400 max-w-md mt-2 mb-6">
          We couldn't find any upcoming events matching your filter criteria. Try adjusting your search keywords or city filter.
        </p>
        {onResetFilter && (
          <Button variant="secondary" onClick={onResetFilter}>
            Reset All Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
