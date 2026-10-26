import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  Edit2,
  Clock,
  MapPin,
  ExternalLink,
  CheckCircle2,
  CalendarCheck2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { DataService } from '../../services/dataService';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import LoadingState from '../../components/common/LoadingState';

const INITIAL_EVENT_FORM = {
  title: '',
  date: new Date().toISOString().split('T')[0],
  time: '09:00 AM - 01:00 PM',
  venue: 'School Playground, Daulatyarpur Campus',
  category: 'Sports & Cultural',
  description: '',
  status: 'Upcoming',
};

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [form, setForm] = useState(INITIAL_EVENT_FORM);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await api.getEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();

    const handleSync = () => loadEvents();
    window.addEventListener('ndrn:events-updated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('ndrn:events-updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const filtered = events.filter((e) => {
    const rawStatus = (e.status || '').toLowerCase();
    const rawType = (e.type || '').toLowerCase();
    const selStatus = statusFilter.toLowerCase();
    const matchStatus =
      statusFilter === 'All' ||
      rawStatus === selStatus ||
      rawType === selStatus ||
      (selStatus === 'upcoming' && (rawStatus === 'scheduled' || rawType === 'upcoming')) ||
      (selStatus === 'completed' && (rawStatus === 'completed' || rawType === 'past'));
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      (e.title && e.title.toLowerCase().includes(q)) ||
      (e.description && e.description.toLowerCase().includes(q)) ||
      (e.venue && e.venue.toLowerCase().includes(q));

    return matchStatus && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedEvents = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleOpenAddModal = () => {
    setEditingEvent(null);
    setForm(INITIAL_EVENT_FORM);
    setModalOpen(true);
  };

  const handleOpenEditModal = (event) => {
    setEditingEvent(event);
    let eventDate = '';
    if (event.startDate) {
      try {
        const dt = new Date(event.startDate);
        if (!isNaN(dt.getTime())) eventDate = dt.toISOString().split('T')[0];
      } catch {}
    }
    if (!eventDate && event.date) {
      if (typeof event.date === 'string' && event.date.includes('-')) {
        eventDate = event.date;
      } else {
        try {
          const dt = new Date(event.date);
          if (!isNaN(dt.getTime())) eventDate = dt.toISOString().split('T')[0];
        } catch {}
      }
    }
    if (!eventDate) eventDate = new Date().toISOString().split('T')[0];

    const isPast = event.status === 'completed' || event.status === 'Completed' || event.status === 'past' || event.type === 'past';

    setForm({
      title: event.title || '',
      date: eventDate,
      time: event.time || '09:00 AM - 01:00 PM',
      venue: event.venue || event.location || 'School Playground, Daulatyarpur Campus',
      category: event.category === 'Celebration' ? 'Celebrations' : (event.category || 'Sports & Cultural'),
      description: event.description || '',
      status: isPast ? 'Completed' : 'Upcoming',
    });
    setModalOpen(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date.trim()) return;

    const isPast = form.status === 'Completed' || form.status === 'Past';
    const payload = {
      ...form,
      title: form.title.trim(),
      venue: form.venue.trim() || 'School Playground, Daulatyarpur Campus',
      description: form.description.trim(),
      startDate: form.date,
      type: isPast ? 'past' : 'upcoming',
      status: isPast ? 'completed' : 'scheduled',
    };

    try {
      if (editingEvent) {
        const targetId = editingEvent.id || editingEvent._id;
        await api.updateEvent(targetId, payload);
      } else {
        await api.createEvent(payload);
      }
    } catch (err) {
      console.error('Failed to save event:', err);
    }

    await loadEvents();
    setModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (eventToDelete) {
      const targetId = eventToDelete.id || eventToDelete._id;
      await api.deleteEvent(targetId);
      await loadEvents();
      setDeleteConfirmOpen(false);
      setEventToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-school-700 uppercase tracking-widest block mb-1">
            CAMPUS ACTIVITIES • CALENDAR
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            School Events & Activities Manager
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Schedule upcoming primary school celebrations, Bal-Mela, Parent-Teacher Meetings, and sports meets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/events"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-school-700 bg-white border border-slate-200 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Events Page</span>
          </Link>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleOpenAddModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Schedule New Event
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-4 bg-white border border-slate-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="w-full md:w-80">
            <SearchInput
              value={search}
              onChange={(val) => {
                setSearch(val);
                setCurrentPage(1);
              }}
              placeholder="Search event title, venue, details..."
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-school-600"
            >
              <option value="All">All Events</option>
              <option value="Upcoming">Upcoming Only</option>
              <option value="Past">Past Events</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedEvents.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-400 bg-white rounded-3xl border border-slate-200 text-xs">
            No events scheduled matching current criteria.
          </div>
        ) : (
          paginatedEvents.map((evt, idx) => {
            const eventId = evt.id || evt._id || `admin-evt-${idx}`;
            const displayDate = evt.date || (evt.startDate ? new Date(evt.startDate).toISOString().split('T')[0] : '');
            const displayStatus = evt.status === 'scheduled' ? 'Upcoming' : (evt.status === 'completed' ? 'Completed' : (evt.status || 'Upcoming'));

            return (
              <Card key={eventId} className="p-5 bg-white border border-slate-200 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-school-50 text-school-800 border border-school-200">
                      {evt.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        displayStatus === 'Upcoming'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {displayStatus}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{evt.title}</h3>

                  <div className="space-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-700">{displayDate}</span>
                      <span className="text-[11px] text-slate-400">({evt.time})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{evt.venue}</span>
                    </div>
                  </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {evt.description}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(evt)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-school-700 hover:bg-slate-100"
                  title="Edit Event"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEventToDelete(evt);
                    setDeleteConfirmOpen(true);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  title="Delete Event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          );
        })
      )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />

      {/* Add / Edit Event Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingEvent ? `Edit Event: ${editingEvent.title}` : 'Schedule School Event'}
        subtitle="Daulatyarpur Campus • Nursery to Class 5"
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <Button type="submit" form="event-form" variant="primary" size="sm">
              {editingEvent ? 'Save Changes' : 'Schedule Event'}
            </Button>
          </>
        }
      >
        <form id="event-form" onSubmit={handleSaveEvent} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Event Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Annual Primary Sports Day 2026"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Event Date *</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Timing</label>
              <input
                type="text"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                placeholder="09:00 AM - 01:30 PM"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Venue / Location</label>
              <input
                type="text"
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                placeholder="School Playground, Daulatyarpur Campus"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              >
                <option value="Sports & Cultural">Sports & Cultural</option>
                <option value="Academic">Academic</option>
                <option value="Celebrations">Celebrations</option>
                <option value="Sports & Play">Sports & Play</option>
                <option value="Creative Arts">Creative Arts</option>
                <option value="Community">Community</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
            >
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed / Past</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Event Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Outline activities, schedule, and participation notes..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600 resize-none"
            />
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Event"
        message={`Are you sure you want to remove "${eventToDelete?.title}" from the school calendar?`}
        confirmText="Delete Event"
        type="danger"
      />
    </div>
  );
}
