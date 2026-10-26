import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  Filter,
  FileText,
  Download,
  AlertCircle,
  Calendar,
  X,
  Sparkles,
  School,
  CheckCircle2
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import { Card } from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { api } from '../../services/api';
import { SCHOOL_CONFIG } from '../../config/schoolConfig';
import LoadingState from '../../components/common/LoadingState';

export default function Notices() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [noticesList, setNoticesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [downloadAlert, setDownloadAlert] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchNotices() {
      setLoading(true);
      try {
        const data = await api.getNotices();
        if (isMounted) {
          setNoticesList(data || []);
          setLoading(false);
        }
      } catch {
        if (isMounted) setLoading(false);
      }
    }
    fetchNotices();

    const handleUpdate = () => {
      fetchNotices();
    };
    window.addEventListener('ndrn:notices-updated', handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('ndrn:notices-updated', handleUpdate);
    };
  }, []);

  const categories = ['All', 'Admissions', 'Academics', 'Holidays', 'General'];

  const filteredNotices = noticesList.filter((item) => {
    const itemCat = (item.category || '').toLowerCase();
    const selCat = selectedCategory.toLowerCase();
    const matchesCategory =
      selectedCategory === 'All' ||
      itemCat === selCat ||
      (selCat.startsWith('academic') && itemCat.startsWith('academic'));
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.summary && item.summary.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const handleDownloadNotice = (notice) => {
    if (!notice) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${notice.title} - N.D.R.N. Vidyalaya</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #2D1B0D; max-width: 800px; margin: auto; }
            .header { border-bottom: 2px solid #E98B2A; padding-bottom: 16px; margin-bottom: 24px; text-align: center; }
            .logo-title { font-size: 24px; font-weight: bold; color: #4A3525; margin: 0; }
            .subtitle { font-size: 14px; color: #8C7355; margin: 4px 0 0; }
            .badge { display: inline-block; background: #FFF4E5; border: 1px solid #E98B2A; color: #B05E12; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: bold; margin-top: 10px; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 24px; font-size: 13px; color: #666; border-bottom: 1px solid #eee; padding-bottom: 8px; }
            .content { font-size: 15px; line-height: 1.7; margin-bottom: 40px; white-space: pre-wrap; }
            .footer { margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #ddd; padding-top: 20px; font-size: 12px; color: #777; }
            .seal { text-align: right; }
            .sig-line { width: 180px; border-top: 1px solid #333; margin-top: 40px; margin-bottom: 5px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="logo-title">N.D.R.N. VIDYALAYA</h1>
            <p class="subtitle">Daulatyarpur, Madhoganj, Uttar Pradesh • UP Board (Nursery – Class 5)</p>
            <div class="badge">OFFICIAL CIRCULAR / NOTICE</div>
          </div>
          <div class="meta">
            <div><strong>Ref No:</strong> NDRN/CIR/${notice.id || '2026-01'}</div>
            <div><strong>Date:</strong> ${notice.date || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <div><strong>Category:</strong> ${notice.category || 'General'}</div>
          </div>
          <h2 style="color: #382619; font-size: 18px; margin-bottom: 16px;">${notice.title}</h2>
          <div class="content">${notice.content || notice.summary}</div>
          <div class="footer">
            <div>
              <p>Issued by: Administrative Office</p>
              <p>N.D.R.N. Vidyalaya, Daulatyarpur</p>
            </div>
            <div class="seal">
              <div class="sig-line"></div>
              <strong>Head of Institution / Principal</strong>
              <p style="margin: 0;">N.D.R.N. Vidyalaya</p>
            </div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    }
    setDownloadAlert(true);
    setTimeout(() => setDownloadAlert(false), 4000);
  };

  return (
    <PageContainer
      title={`Notices & Announcements`}
      subtitle={`Official circulars, academic notices, and holiday directives from ${SCHOOL_CONFIG.name}, ${SCHOOL_CONFIG.location.displayLocation}.`}
      badge="OFFICIAL DIRECTIVES"
      breadcrumbs={[{ label: 'Notices' }]}
    >
      <div className="space-y-8">
        {downloadAlert && (
          <div className="p-4 rounded-2xl bg-cream-200 border border-gold-400/50 text-xs text-brown-800 flex items-center justify-between shadow-soft-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-saffron-600 flex-shrink-0" />
              <span>Official signed notice document prepared. Document ready for printing or saving as PDF.</span>
            </div>
            <button
              type="button"
              onClick={() => setDownloadAlert(false)}
              className="text-brown-500 hover:text-brown-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-soft-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-brown-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search circulars by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-cream-300 text-brown-800 focus:outline-hidden focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 bg-white"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  selectedCategory === cat
                    ? 'bg-saffron-500 text-white shadow-2xs font-bold'
                    : 'bg-cream-100 text-brown-700 hover:bg-cream-200 border border-cream-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Notice Cards Grid */}
        {loading ? (
          <LoadingState message="Fetching school circulars..." />
        ) : filteredNotices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotices.map((n, idx) => {
              const noticeId = n.id || n._id || `notice-${idx}`;
              const displayDate = n.date || (n.publishedDate ? new Date(n.publishedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '');

              return (
                <Card key={noticeId} className="p-6 bg-white flex flex-col justify-between border-cream-200">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cream-200 text-saffron-700 border border-gold-400/30">
                        {n.category || 'General'}
                      </span>
                      {displayDate && (
                        <span className="text-xs text-brown-500 flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          {displayDate}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-brown-800 mb-2 line-clamp-2 leading-snug">
                      {n.title}
                    </h3>

                    <p className="text-xs text-brown-600 line-clamp-3 leading-relaxed mb-4">
                      {n.summary || n.content}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-cream-200 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedNotice(n)}
                      className="font-bold text-saffron-600 hover:text-saffron-700 hover:underline cursor-pointer"
                    >
                      View Details →
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadNotice(n)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-brown-600 hover:text-saffron-600 bg-cream-100 hover:bg-cream-200 px-2.5 py-1 rounded-lg border border-cream-200 transition-colors cursor-pointer"
                      title="Download Notice PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title={noticesList.length === 0 ? "No notices published yet." : "No notices found"}
            description={noticesList.length === 0 ? "Official notices and circulars will appear here when published by the administration." : "There are no active notices matching your search criteria. Please adjust your query."}
            actionText={noticesList.length === 0 ? undefined : "Clear Filter"}
            onAction={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
          />
        )}

        {/* Notice Details Modal */}
        {selectedNotice && (
          <div
            className="fixed inset-0 z-50 bg-brown-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedNotice(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8 border border-cream-200"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-cream-100 hover:bg-cream-200 text-brown-700"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cream-200 text-saffron-700 border border-gold-400/30">
                  {selectedNotice.category}
                </span>
                <span className="text-xs text-brown-500 font-medium">
                  {selectedNotice.date}
                </span>
              </div>

              <h3 className="text-xl font-bold text-brown-800 mb-4">
                {selectedNotice.title}
              </h3>

              <div className="p-4 rounded-xl bg-cream-100/60 border border-cream-200 text-xs sm:text-sm text-brown-800 leading-relaxed space-y-3 mb-6">
                <p>{selectedNotice.content || selectedNotice.summary}</p>
                <div className="pt-2 border-t border-cream-200 text-xs text-brown-600">
                  Issued by: <strong className="text-brown-800">{selectedNotice.author || 'School Administration'}</strong> • {SCHOOL_CONFIG.name}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedNotice(null)}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    handleDownloadNotice(selectedNotice);
                  }}
                  leftIcon={<Download className="w-4 h-4" />}
                >
                  Download Official Circular (PDF)
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
