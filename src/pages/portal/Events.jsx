import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Users,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';
import { portalApi } from '../../services/portalApi';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';

export default function Events() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Upcoming' | 'Past'

  useEffect(() => {
    let isMounted = true;

    async function loadEvents() {
      setLoading(true);
      setError(null);

      try {
        const res = await portalApi.getEvents();
        if (isMounted) {
          setEvents(res.data || []);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load events.');
          setLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <LoadingState message="Loading school events & activity calendar..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  const filteredEvents = events.filter((e) => {
    if (statusFilter === 'All') return true;
    return (e.status || 'Upcoming') === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <span className="text-xs font-bold text-school-700 uppercase tracking-widest block mb-1">
          SCHOOL CALENDAR • CO-CURRICULAR & CULTURAL
        </span>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          School Events & Celebrations
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Annual celebrations, Bal Mela festivals, sports meets, and parent-teacher conferences at Daulatyarpur campus.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['All', 'Upcoming', 'Past'].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              statusFilter === s
                ? 'bg-school-800 text-white shadow-soft-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {s} Events
          </button>
        ))}
      </div>

      {/* Event Cards Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredEvents.map((evt) => (
            <Card
              key={evt.id}
              className="p-6 flex flex-col justify-between hover:border-school-200 transition-all border border-slate-200/80"
            >
              <div>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-school-900 text-white flex flex-col items-center justify-center shrink-0 shadow-soft-sm">
                    <span className="text-[10px] font-extrabold uppercase text-gold-300">
                      {evt.date?.split(' ')[1] || 'NOV'}
                    </span>
                    <span className="text-lg font-black leading-none">
                      {evt.date?.split(' ')[0] || '14'}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-school-100 text-school-800 uppercase">
                        {evt.category || 'Co-Curricular'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          evt.status === 'Past'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {evt.status || 'Upcoming'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-2 leading-snug">
                      {evt.title}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  {evt.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-school-600 shrink-0" />
                  <span>Time: {evt.time || '09:00 AM - 01:00 PM'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-school-600 shrink-0" />
                  <span>Venue: {evt.venue || 'Campus Central Ground, Daulatyarpur'}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No events in this category"
          description="Select 'All' to view all academic and cultural events."
        />
      )}
    </div>
  );
}
