'use client';

import { useState, useEffect } from 'react';
import { AppShell } from './AppShell';
import { Calendar as CalendarIcon, Activity, Clock, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Placeholder for backend route /api/calendar
    const timer = setTimeout(() => {
      setEvents([]);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AppShell title="Economic Calendar">
      <div className="flex flex-col gap-6">
        <div className="glass-liquid p-6 rounded-[28px] flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Macro Events</span>
              <h2 className="text-white font-bold text-lg">Upcoming Schedule</h2>
            </div>
            <CalendarIcon className="text-accent" size={20} />
          </div>

          <div className="min-h-[200px] flex flex-col gap-3">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <Activity className="text-accent animate-spin" size={24} />
              </div>
            ) : events.length > 0 ? (
              events.map((e, i) => (
                <div key={i} className="glass-liquid p-4 rounded-xl border border-white/5 flex justify-between items-center">
                   {/* Event content */}
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 opacity-40 py-10">
                <Clock size={32} />
                <span className="text-xs italic text-center">No upcoming events found in local data.</span>
                <span className="text-[10px] uppercase tracking-widest font-bold text-accent">Run Harvest Task</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
