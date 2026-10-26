import React, { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  Filter,
  FileDown,
  Calendar,
  AlertCircle,
  Eye,
  X,
  FileText,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';
import { portalApi } from '../../services/portalApi';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';

export default function Notices() {
  const { user } = useAuth();
  const { isParent } = usePortal();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notices, setNotices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedNotice, setSelectedNotice] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadNotices() {
      setLoading(true);
      setError(null);

      try {
        const audience = isParent ? 'parents' : 'students';
        const res = await portalApi.getNotices(audience);

        if (isMounted) {
          setNotices(res.data || []);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load circulars.');
          setLoading(false);
        }
      }
    }

    loadNotices();

    return () => {
      isMounted = false;
    };
  }, [isParent]);

  if (loading) {
    return <LoadingState message="Fetching official school circulars..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  const categories = ['All', 'Academic', 'Examination', 'Holiday', 'Events', 'Administrative'];

  const filteredNotices = notices.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || n.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <span className="text-xs font-bold text-school-700 uppercase tracking-widest block mb-1">
          OFFICIAL CIRCULARS & NOTICES
        </span>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          School Announcements & Circulars
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Official notifications from N.D.R.N. Vidyalaya administration and primary coordinators.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search circulars..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-school-600"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                categoryFilter === c
                  ? 'bg-school-800 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Notices List */}
      {filteredNotices.length > 0 ? (
        <div className="space-y-4">
          {filteredNotices.map((notice) => (
            <Card
              key={notice.id}
              className="p-5 sm:p-6 hover:border-school-200 transition-all border border-slate-200/80"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-school-100 text-school-800 uppercase tracking-wider">
                    {notice.category || 'Announcement'}
                  </span>
                  {notice.priority === 'urgent' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 animate-pulse">
                      Urgent Notice
                    </span>
                  )}
                  {notice.pinned && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      Pinned
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{notice.date}</span>
                </div>
              </div>

              <div className="mt-3">
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {notice.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  {notice.content}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-[11px] text-slate-400">
                  Issued by: <span className="font-semibold text-slate-700">{notice.author || 'School Administration'}</span> • Daulatyarpur
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedNotice(notice)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors text-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Circular</span>
                  </button>

                  <a
                    href="#download"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`Downloading PDF circular: ${notice.title}`);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-school-50 hover:bg-school-100 text-school-800 font-bold transition-colors text-xs"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>PDF Copy</span>
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No circulars found"
          message="No circulars matched your filter query."
        />
      )}

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-xs font-bold text-school-700 uppercase tracking-wider">
                Official School Notice
              </span>
              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-school-100 text-school-800 uppercase">
                  {selectedNotice.category || 'Circular'}
                </span>
                <span className="text-xs text-slate-400">{selectedNotice.date}</span>
              </div>

              <h3 className="text-lg font-bold text-slate-900">{selectedNotice.title}</h3>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {selectedNotice.content}
              </div>

              <div className="p-3 bg-school-50 rounded-xl border border-school-100 text-xs text-school-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-school-700 shrink-0" />
                <span>Verified by Principal & Head of Institution, Daulatyarpur, Madhoganj.</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedNotice(null)}>
                Close
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => {
                  alert(`Downloading: ${selectedNotice.title}`);
                  setSelectedNotice(null);
                }}
                leftIcon={<FileDown className="w-4 h-4" />}
              >
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
