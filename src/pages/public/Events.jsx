import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Search,
  Tag,
  Sparkles,
  Camera,
  CheckCircle2,
  CalendarDays,
  ArrowRight
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import SectionHeading from '../../components/common/SectionHeading';
import { Card } from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { SCHOOL_CONFIG } from '../../config/schoolConfig';

import { api } from '../../services/api';
import LoadingState from '../../components/common/LoadingState';

export default function Events() {
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'past', 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchEvents() {
      setLoading(true);
      try {
        const data = await api.getEvents();
        if (isMounted) {
          const formatted = (data || []).map((e, idx) => {
            const rawDate = e.startDate || e.date;
            let m = 'NOV';
            let d = '14';
            try {
              if (typeof rawDate === 'string' && /^\d{4}-\d{2}-\d{2}/.test(rawDate)) {
                const parts = rawDate.split('T')[0].split('-');
                const monthIdx = parseInt(parts[1], 10) - 1;
                const dayNum = parseInt(parts[2], 10);
                const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                m = months[monthIdx] || m;
                d = String(dayNum).padStart(2, '0');
              } else if (rawDate) {
                const dt = new Date(rawDate);
                if (!isNaN(dt.getTime())) {
                  m = dt.toLocaleString('default', { month: 'short' }).toUpperCase();
                  d = String(dt.getDate()).padStart(2, '0');
                }
              }
            } catch {
              // Ignore
            }

            const gradients = [
              'from-saffron-500 to-brown-800',
              'from-gold-500 to-brown-900',
              'from-saffron-600 to-saffron-700',
              'from-gold-600 to-brown-800',
              'from-saffron-500 to-gold-600',
            ];

            const rawStatus = (e.status || '').toLowerCase();
            const rawType = (e.type || '').toLowerCase();
            const resolvedType = (rawType === 'past' || rawStatus === 'completed' || rawStatus === 'cancelled') ? 'past' : 'upcoming';

            return {
              ...e,
              id: e.id || e._id || `event-${idx}`,
              title: typeof e.title === 'string' ? e.title.replace(/\[Event Placeholder\]\s*/gi, '').trim() : e.title,
              month: e.month || m,
              date: e.day || d,
              type: resolvedType,
              color: e.color || gradients[idx % gradients.length],
            };
          });

          setEventsList(formatted);
          setLoading(false);
        }
      } catch {
        if (isMounted) setLoading(false);
      }
    }
    fetchEvents();

    const handleUpdate = () => {
      fetchEvents();
    };
    window.addEventListener('ndrn:events-updated', handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('ndrn:events-updated', handleUpdate);
    };
  }, []);

  const categories = ['All', 'Sports & Cultural', 'Academic', 'Celebrations', 'Sports & Play', 'Community'];

  const filteredEvents = eventsList.filter((ev) => {
    const matchTab = activeTab === 'all' || ev.type === activeTab;
    const catStr = (ev.category || '').toLowerCase().trim();
    const selCatStr = selectedCategory.toLowerCase().trim();
    const matchCategory =
      selectedCategory === 'All' ||
      catStr === selCatStr ||
      catStr.replace(/s$/, '') === selCatStr.replace(/s$/, '') ||
      catStr.includes(selCatStr) ||
      selCatStr.includes(catStr);
    const matchSearch =
      (ev.title && ev.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ev.description && ev.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ((ev.venue || ev.location) && (ev.venue || ev.location).toLowerCase().includes(searchQuery.toLowerCase()));
    return matchTab && matchCategory && matchSearch;
  });

  return (
    <PageContainer
      title={`School Events & Activities`}
      subtitle={`Annual functions, sports days, cultural celebrations, and academic meets at ${SCHOOL_CONFIG.name}, ${SCHOOL_CONFIG.location.displayLocation}.`}
      badge="CAMPUS CALENDAR"
      breadcrumbs={[{ label: 'Events' }]}
    >
      <div className="space-y-12">
        {/* Visual Sports & Activities Spotlight */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-3xl border border-cream-200 p-6 sm:p-8 shadow-soft-sm overflow-hidden">
          <div className="lg:col-span-6 space-y-3">
            <span className="text-xs font-bold text-saffron-600 uppercase tracking-widest block">
              CO-CURRICULAR & SPORTS
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-brown-800">
              Active Outdoor Drills & Joyful Childhood
            </h3>
            <p className="text-xs sm:text-sm text-brown-600 leading-relaxed">
              At N.D.R.N. Vidyalaya, foundational education is harmonized with physical drills, relay games, and seasonal celebrations on our open campus playground, teaching teamwork and healthy habits from early years.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-brown-600">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-saffron-600" />
                Physical Fitness
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-saffron-600" />
                Teamwork & Games
              </span>
            </div>
          </div>
          <div className="lg:col-span-6">
            <div className="rounded-2xl overflow-hidden shadow-soft-md border border-cream-200 group">
              <img
                src="/images/sports-activities.jpg"
                alt="Primary Students Outdoor Sports and Play at N.D.R.N. Vidyalaya"
                className="w-full h-64 sm:h-72 object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-soft-sm flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Active Tab Toggle (Upcoming vs Past vs All) */}
          <div className="flex bg-cream-100 p-1 rounded-xl w-full md:w-auto border border-cream-200">
            <button
              type="button"
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-white text-brown-800 shadow-2xs'
                  : 'text-brown-600 hover:text-brown-800'
              }`}
            >
              Upcoming Events
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('past')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'past'
                  ? 'bg-white text-brown-800 shadow-2xs'
                  : 'text-brown-600 hover:text-brown-800'
              }`}
            >
              Past Events
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-brown-800 shadow-2xs'
                  : 'text-brown-600 hover:text-brown-800'
              }`}
            >
              All Events
            </button>
          </div>

          {/* Search Query */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-brown-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-cream-300 text-brown-800 focus:outline-hidden focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 bg-white"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-brown-500 mr-2">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-saffron-500 text-white shadow-2xs font-bold'
                  : 'bg-cream-100 text-brown-700 hover:bg-cream-200 border border-cream-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {loading ? (
          <LoadingState message="Fetching campus calendar..." />
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((ev) => (
              <Card key={ev.id} className="p-0 bg-white overflow-hidden flex flex-col justify-between border border-cream-200">
                <div>
                  {/* Image Placeholder with category gradient */}
                  <div className={`h-40 bg-gradient-to-tr ${ev.color} p-4 flex flex-col justify-between text-white relative`}>
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/30 backdrop-blur-xs border border-white/20">
                        {ev.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ev.type === 'upcoming'
                            ? 'bg-saffron-500 text-white'
                            : 'bg-brown-900/80 text-cream-200'
                        }`}
                      >
                        {ev.type === 'upcoming' ? 'Upcoming' : 'Concluded'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-bold text-white/80 uppercase tracking-wider flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5" />
                        <span>N.D.R.N. Campus</span>
                      </div>
                      <span className="text-white/20 font-black text-2xl select-none">NDRN</span>
                    </div>
                  </div>

                  {/* Date & Details */}
                  <div className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      {/* Date Stamp */}
                      <div className="w-12 rounded-xl bg-cream-100 border border-cream-200 text-center py-1.5 flex-shrink-0">
                        <span className="block text-[10px] font-extrabold text-saffron-600 uppercase">
                          {ev.month}
                        </span>
                        <span className="block text-lg font-black text-brown-800 leading-none">
                          {ev.date}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-brown-800 line-clamp-2 leading-snug">
                          {typeof ev.title === 'string' ? ev.title.replace(/\[Event Placeholder\]\s*/gi, '').trim() : ev.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-xs text-brown-600 leading-relaxed line-clamp-3 mb-4">
                      {ev.description}
                    </p>

                    <div className="space-y-1.5 text-[11px] text-brown-600 pt-3 border-t border-cream-200">
                      <div className="flex items-center gap-1.5 truncate">
                        <Clock className="w-3.5 h-3.5 text-saffron-600 flex-shrink-0" />
                        <span>{ev.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-saffron-600 flex-shrink-0" />
                        <span>{ev.venue}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-cream-100/60 border-t border-cream-200 text-center">
                  <span className="text-[11px] font-bold text-saffron-600">
                    N.D.R.N Vidyalaya Event
                  </span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title={eventsList.length === 0 ? "No upcoming events at the moment." : "No events found"}
            description={eventsList.length === 0 ? "Please check back soon for updates on campus celebrations and activities." : "No events match your current filter criteria. Please try a different category or search term."}
            actionText={eventsList.length === 0 ? undefined : "Clear Filters"}
            onAction={() => {
              setActiveTab('all');
              setSelectedCategory('All');
              setSearchQuery('');
            }}
          />
        )}
      </div>
    </PageContainer>
  );
}
