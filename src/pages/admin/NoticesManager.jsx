import React, { useState, useEffect } from 'react';
import {
  BellRing,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Pin,
  ExternalLink,
  Search,
  Sparkles,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { DataService } from '../../services/dataService';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import SearchInput from '../../components/common/SearchInput';
import LoadingState from '../../components/common/LoadingState';

const INITIAL_NOTICE_FORM = {
  title: '',
  category: 'Academics',
  priority: 'normal',
  summary: '',
  content: '',
  pinned: false,
};

export default function AdminNoticesManager() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState(null);
  const [form, setForm] = useState(INITIAL_NOTICE_FORM);
  const [publishedAlert, setPublishedAlert] = useState(false);

  const loadNotices = async () => {
    try {
      setLoading(true);
      const data = await api.getNotices();
      setNotices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load notices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();

    const handleSync = () => loadNotices();
    window.addEventListener('ndrn:notices-updated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('ndrn:notices-updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const filtered = notices.filter((n) => {
    const itemCat = (n.category || '').toLowerCase();
    const selCat = categoryFilter.toLowerCase();
    const matchCat =
      categoryFilter === 'All' ||
      itemCat === selCat ||
      (selCat.startsWith('academic') && itemCat.startsWith('academic'));
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      (n.title && n.title.toLowerCase().includes(q)) ||
      (n.summary && n.summary.toLowerCase().includes(q));

    return matchCat && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedNotices = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleOpenAddModal = () => {
    setEditingNotice(null);
    setForm(INITIAL_NOTICE_FORM);
    setModalOpen(true);
  };

  const handleOpenEditModal = (notice) => {
    setEditingNotice(notice);
    setForm({
      title: notice.title || '',
      category: (notice.category || '').toLowerCase().startsWith('academic') ? 'Academics' : (notice.category || 'Academics'),
      priority: notice.priority || 'normal',
      summary: notice.summary || '',
      content: notice.content || notice.summary || '',
      pinned: notice.pinned !== undefined ? Boolean(notice.pinned) : Boolean(notice.isPinned),
    });
    setModalOpen(true);
  };

  const handleSaveNotice = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.summary.trim()) return;

    const payload = {
      ...form,
      content: form.content.trim() || form.summary.trim(),
    };

    if (editingNotice) {
      const targetId = editingNotice.id || editingNotice._id;
      await api.updateNotice(targetId, payload);
    } else {
      await api.createNotice(payload);
    }

    await loadNotices();
    setModalOpen(false);
    setPublishedAlert(true);
    setTimeout(() => setPublishedAlert(false), 3500);
  };

  const handleTogglePin = async (notice) => {
    const targetId = notice.id || notice._id;
    const isCurrentlyPinned = notice.pinned !== undefined ? Boolean(notice.pinned) : Boolean(notice.isPinned);
    await api.updateNotice(targetId, { pinned: !isCurrentlyPinned, isPinned: !isCurrentlyPinned });
    await loadNotices();
  };

  const handleConfirmDelete = async () => {
    if (noticeToDelete) {
      const targetId = noticeToDelete.id || noticeToDelete._id;
      await api.deleteNotice(targetId);
      await loadNotices();
      setDeleteConfirmOpen(false);
      setNoticeToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-school-700 uppercase tracking-widest block mb-1">
            OFFICIAL COMMUNICATIONS • PUBLIC BULLETIN
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Circulars & Notices Manager
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Publish school notifications, holiday declarations, assessment schedules, and administrative circulars.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/notices"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-school-700 bg-white border border-slate-200 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Board</span>
          </Link>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleOpenAddModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Issue New Circular
          </Button>
        </div>
      </div>

      {/* Published banner */}
      {publishedAlert && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Notice successfully updated and published to the public school website!</span>
        </div>
      )}

      {/* Search and Filters */}
      <Card className="p-4 bg-white border border-slate-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="w-full md:w-80">
            <SearchInput
              value={search}
              onChange={(val) => {
                setSearch(val);
                setCurrentPage(1);
              }}
              placeholder="Search circulars by title or keyword..."
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-school-600"
            >
              <option value="All">All Categories</option>
              <option value="Academics">Academics</option>
              <option value="Admissions">Admissions</option>
              <option value="Holidays">Holidays</option>
              <option value="General">General</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Notices Grid / List */}
      <div className="space-y-3">
        {paginatedNotices.length === 0 ? (
          <Card className="p-8 text-center text-slate-400 bg-white border border-slate-200">
            No circulars found matching current filters.
          </Card>
        ) : (
          paginatedNotices.map((n, idx) => {
            const noticeId = n.id || n._id || `admin-notice-${idx}`;
            const displayDate = n.date || (n.publishedDate ? new Date(n.publishedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '');

            return (
              <Card
                key={noticeId}
                className={`p-5 bg-white border transition-all ${
                  n.pinned || n.isPinned ? 'border-amber-300 shadow-soft-sm bg-gradient-to-r from-amber-50/20 to-white' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {(n.pinned || n.isPinned) && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <Pin className="w-3 h-3 text-amber-600" />
                          <span>Pinned to Top</span>
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {n.category || 'General'}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          n.priority === 'urgent'
                            ? 'bg-rose-100 text-rose-800'
                            : n.priority === 'academic'
                            ? 'bg-school-100 text-school-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {n.priority || 'normal'}
                      </span>

                      {displayDate && <span className="text-[11px] text-slate-400">{displayDate}</span>}
                    </div>

                  <h3 className="text-base font-bold text-slate-900">{n.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.summary}</p>
                  {n.content && (
                    <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2">
                      {n.content}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleTogglePin(n)}
                    className={`p-2 rounded-xl transition-colors ${
                      n.pinned
                        ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                    }`}
                    title={n.pinned ? 'Unpin Notice' : 'Pin to Top'}
                  >
                    <Pin className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(n)}
                    className="p-2 rounded-xl text-slate-500 hover:text-school-700 hover:bg-slate-100 transition-colors"
                    title="Edit Notice"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNoticeToDelete(n);
                      setDeleteConfirmOpen(true);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
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

      {/* Add / Edit Notice Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingNotice ? 'Edit Circular Notice' : 'Issue Official Circular'}
        subtitle="Publicly broadcast to website, student portal, and parent dashboard"
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <Button type="submit" form="notice-form" variant="primary" size="sm">
              {editingNotice ? 'Update Notice' : 'Publish Notice'}
            </Button>
          </>
        }
      >
        <form id="notice-form" onSubmit={handleSaveNotice} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Notice Headline *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Term II Scholastic Assessment Timetable Declared"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600 font-bold"
              >
                <option value="Academics">Academics</option>
                <option value="Admissions">Admissions</option>
                <option value="Holidays">Holidays</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Priority Badge</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              >
                <option value="normal">Normal</option>
                <option value="academic">Academic</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Short Summary (Preview) *</label>
            <textarea
              rows={2}
              required
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              placeholder="One or two sentence summary displayed on homepage cards..."
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600 resize-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Circular Text</label>
            <textarea
              rows={4}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Detailed guidelines or instructions..."
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600 resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="pinned"
              checked={form.pinned}
              onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
              className="rounded text-school-600 focus:ring-school-500 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="pinned" className="text-xs font-bold text-slate-700 cursor-pointer">
              Pin notice to top of public announcements banner
            </label>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Retract Circular Notice"
        message={`Are you sure you want to permanently delete the notice "${noticeToDelete?.title}"?`}
        confirmText="Retract & Delete"
        type="danger"
      />
    </div>
  );
}
