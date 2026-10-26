import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Phone,
  Mail,
  User,
  GraduationCap,
  Calendar,
  X,
  Sparkles,
  UserPlus,
  Trash2,
  Edit2
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

export default function AdminAdmissions() {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [statusNote, setStatusNote] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState(null);
  const pageSize = 8;

  const loadAdmissions = async () => {
    try {
      setLoading(true);
      const data = await api.getAdmissions();
      setAdmissions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load admissions in admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmissions();

    const handleSync = () => loadAdmissions();
    window.addEventListener('ndrn:admissions-updated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('ndrn:admissions-updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const filtered = admissions.filter((item) => {
    const matchStatus = filterStatus === 'All' || item.status === filterStatus;
    const q = searchQuery.toLowerCase().trim();
    const idStr = String(item.id || item._id || item.enquiryNumber || '').toLowerCase();
    const matchSearch =
      !q ||
      (item.studentName && item.studentName.toLowerCase().includes(q)) ||
      (item.parentName && item.parentName.toLowerCase().includes(q)) ||
      (item.gradeApplying && item.gradeApplying.toLowerCase().includes(q)) ||
      idStr.includes(q);
    return matchStatus && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    const targetId = selectedApp.id || selectedApp._id;
    await api.updateAdmissionStatus(
      targetId,
      newStatus || selectedApp.status,
      statusNote || selectedApp.notes
    );

    await loadAdmissions();
    setSelectedApp(null);
  };

  const handleConfirmDelete = async () => {
    if (appToDelete) {
      const targetId = appToDelete.id || appToDelete._id;
      await api.deleteAdmission(targetId);
      await loadAdmissions();
      setDeleteConfirmOpen(false);
      setAppToDelete(null);
    }
  };

  const openAppDetails = (app) => {
    setSelectedApp(app);
    setNewStatus(app.status);
    setStatusNote(app.notes || '');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-school-700 uppercase tracking-widest block mb-1">
            ENROLLMENT PIPELINE • SESSION 2026-27
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Admissions Desk & Inquiries
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review incoming primary admission applications, verify student age and certificates, and update status.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white border border-slate-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="w-full md:w-80">
            <SearchInput
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val);
                setCurrentPage(1);
              }}
              placeholder="Search applicant, parent, class..."
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-school-600"
            >
              <option value="All">All Inquiries ({admissions.length})</option>
              <option value="New">New Inquiries</option>
              <option value="Verified">Verified Candidates</option>
              <option value="Admitted">Admitted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Admissions Table */}
      <Card className="bg-white border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5 pl-6">Application ID</th>
                <th className="p-3.5">Candidate Name</th>
                <th className="p-3.5">Class Applying</th>
                <th className="p-3.5">Parent Contact</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No admission applications found.
                  </td>
                </tr>
              ) : (
                paginated.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 pl-6 font-mono font-bold text-school-700">
                      {item.id}
                    </td>

                    <td className="p-3.5 font-bold text-slate-900">
                      {item.studentName}
                    </td>

                    <td className="p-3.5 font-bold text-slate-800">
                      <span className="px-2 py-0.5 rounded text-xs bg-slate-100 border border-slate-200">
                        {item.gradeApplying}
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-600">
                      <div>{item.parentName}</div>
                      <div className="text-[11px] text-slate-400">{item.phone}</div>
                    </td>

                    <td className="p-3.5 text-slate-500 font-medium">
                      {item.date}
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'New'
                            ? 'bg-amber-100 text-amber-800'
                            : item.status === 'Verified'
                            ? 'bg-gold-100 text-gold-800'
                            : item.status === 'Admitted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="p-3.5 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openAppDetails(item)}
                          className="px-2.5 py-1 text-xs font-bold text-school-700 hover:bg-school-50 rounded-lg transition-colors"
                        >
                          Review & Update
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setAppToDelete(item);
                            setDeleteConfirmOpen(true);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete Application"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 bg-white border-t border-slate-100">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </Card>

      {/* Review & Update Status Modal */}
      {selectedApp && (
        <Modal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={`Admission Application: ${selectedApp.studentName}`}
          subtitle={`Application ID: ${selectedApp.id} • Grade Applying: ${selectedApp.gradeApplying}`}
          footer={
            <>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <Button type="submit" form="status-form" variant="primary" size="sm">
                Save Status Decision
              </Button>
            </>
          }
        >
          <form id="status-form" onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Parent / Guardian:</span>
                <strong className="text-slate-900">{selectedApp.parentName}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Phone Number:</span>
                <strong className="text-slate-900">{selectedApp.phone}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Email:</span>
                <strong className="text-slate-900">{selectedApp.email || 'None'}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Date of Application:</span>
                <strong className="text-slate-900">{selectedApp.date}</strong>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Admission Workflow Decision *
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600 font-bold"
              >
                <option value="New">New (Pending Review)</option>
                <option value="Under Review">Under Review</option>
                <option value="Verified">Verified (Documents Checked)</option>
                <option value="Admitted">Admitted (Seat Confirmed)</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Administrative Notes / Action Remarks
              </label>
              <textarea
                rows={3}
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Record interview notes, birth certificate verification, or payment details..."
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
        title="Remove Admission Application"
        message={`Are you sure you want to delete the enquiry for ${appToDelete?.studentName}?`}
        confirmText="Delete Record"
        type="danger"
      />
    </div>
  );
}
