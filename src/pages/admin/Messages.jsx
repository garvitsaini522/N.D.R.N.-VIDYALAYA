import React, { useState, useEffect } from 'react';
import {
  Mail,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Phone,
  MessageSquare,
  Send,
  User,
  Sparkles,
  Trash2,
  Check,
  X
} from 'lucide-react';
import { api } from '../../services/api';
import { DataService } from '../../services/dataService';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import SearchInput from '../../components/common/SearchInput';
import LoadingState from '../../components/common/LoadingState';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sentNotice, setSentNotice] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [msgToDelete, setMsgToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await api.getContactMessages();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load contact messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();

    const handleSync = () => loadMessages();
    window.addEventListener('ndrn:contacts-updated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('ndrn:contacts-updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const filtered = messages.filter((m) => {
    const matchStatus = statusFilter === 'All' || m.status === statusFilter;
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      (m.name && m.name.toLowerCase().includes(q)) ||
      (m.email && m.email.toLowerCase().includes(q)) ||
      (m.subject && m.subject.toLowerCase().includes(q)) ||
      (m.message && m.message.toLowerCase().includes(q));

    return matchStatus && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleOpenReplyModal = (msg) => {
    setSelectedMsg(msg);
    setReplyText(msg.reply || '');
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!selectedMsg) return;

    const targetId = selectedMsg.id || selectedMsg._id;
    await api.markContactAsRead(targetId);
    DataService.updateContactStatus(targetId, 'Resolved', replyText);

    await loadMessages();
    setSelectedMsg(null);
    setSentNotice(true);
    setTimeout(() => setSentNotice(false), 3500);
  };

  const handleToggleStatus = async (msg) => {
    const targetId = msg.id || msg._id;
    const next = msg.status === 'Open' ? 'Resolved' : 'Open';
    DataService.updateContactStatus(targetId, next, msg.reply || '');
    if (next === 'Resolved') {
      await api.markContactAsRead(targetId);
    }
    await loadMessages();
  };

  const handleConfirmDelete = async () => {
    if (msgToDelete) {
      const targetId = msgToDelete.id || msgToDelete._id;
      await api.deleteContactMessage(targetId);
      await loadMessages();
      setDeleteConfirmOpen(false);
      setMsgToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-school-700 uppercase tracking-widest block mb-1">
            COMMUNICATIONS • PUBLIC HELPDESK
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Public Enquiries & Helpdesk Messages
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review parent inquiries, general admissions questions, and transport requests sent from the public website.
          </p>
        </div>
      </div>

      {sentNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Response recorded and enquiry status updated to Resolved.</span>
          </div>
          <button type="button" onClick={() => setSentNotice(false)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white border border-slate-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="w-full md:w-80">
            <SearchInput
              value={search}
              onChange={(val) => {
                setSearch(val);
                setCurrentPage(1);
              }}
              placeholder="Search sender, subject, message..."
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
              <option value="All">All Inquiries ({messages.length})</option>
              <option value="Open">Open Inquiries</option>
              <option value="Resolved">Resolved Inquiries</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Messages List */}
      <div className="space-y-3">
        {paginated.length === 0 ? (
          <Card className="p-8 text-center text-slate-400 bg-white border border-slate-200 text-xs">
            No public inquiries matching current criteria.
          </Card>
        ) : (
          paginated.map((msg) => (
            <Card key={msg.id} className="p-5 bg-white border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        msg.status === 'Open'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {msg.status}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {msg.department || 'General Helpdesk'}
                    </span>
                    <span className="text-[11px] text-slate-400">{msg.date}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{msg.subject}</h3>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    "{msg.message}"
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span>Sender: <strong className="text-slate-800">{msg.name}</strong></span>
                    {msg.phone && <span>Phone: <strong className="text-slate-800">{msg.phone}</strong></span>}
                    {msg.email && <span>Email: <strong className="text-slate-800">{msg.email}</strong></span>}
                  </div>

                  {msg.reply && (
                    <div className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 mt-2">
                      <strong className="block text-[11px] uppercase tracking-wider text-emerald-900 mb-0.5">Official Response:</strong>
                      {msg.reply}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleOpenReplyModal(msg)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-school-700 text-white hover:bg-school-800 transition-colors"
                  >
                    {msg.reply ? 'Edit Response' : 'Reply & Resolve'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleStatus(msg)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Toggle Open/Resolved"
                  >
                    <Check className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMsgToDelete(msg);
                      setDeleteConfirmOpen(true);
                    }}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))
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

      {/* Reply / Resolution Modal */}
      {selectedMsg && (
        <Modal
          isOpen={!!selectedMsg}
          onClose={() => setSelectedMsg(null)}
          title={`Reply to Enquiry from ${selectedMsg.name}`}
          subtitle={`Subject: ${selectedMsg.subject}`}
          footer={
            <>
              <button
                type="button"
                onClick={() => setSelectedMsg(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <Button type="submit" form="reply-form" variant="primary" size="sm">
                Save & Mark Resolved
              </Button>
            </>
          }
        >
          <form id="reply-form" onSubmit={handleSendReply} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Original Message:
              </span>
              <p className="text-slate-700 italic">"{selectedMsg.message}"</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Official Administrative Response *
              </label>
              <textarea
                rows={4}
                required
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Enter response, instructions, or resolution details..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600 resize-none"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Helpdesk Enquiry"
        message={`Are you sure you want to delete the enquiry from ${msgToDelete?.name}?`}
        confirmText="Delete Message"
        type="danger"
      />
    </div>
  );
}
