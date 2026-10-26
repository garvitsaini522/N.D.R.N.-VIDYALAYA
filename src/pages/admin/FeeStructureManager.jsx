import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Receipt,
  CreditCard,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
  HelpCircle,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Info
} from 'lucide-react';
import { api } from '../../services/api';
import { normalizeAcademicSession, calculateTotalEstimatedAnnualFee } from '../../services/dataService';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const STANDARD_CLASSES = [
  'Nursery',
  'LKG',
  'UKG',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
];

export default function FeeStructureManager() {
  const [session, setSession] = useState('2026-27');
  const [feeStructures, setFeeStructures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Form Modal (Add / Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    classGrade: 'Nursery',
    academicSession: '2026-27',
    admissionFee: 500,
    monthlyTuitionFee: 300,
    annualCharges: 600,
    otherCharges: 200,
    busFee: 250,
    isPublished: true,
    isVerified: false,
    notes: 'Indicative fee schedule. Subject to official administration confirmation.',
    sortOrder: 1,
  });
  const [formErrors, setFormErrors] = useState({});

  // Preview Modal
  const [previewOpen, setPreviewOpen] = useState(false);

  // Delete Confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchFeeStructures = async () => {
    setIsLoading(true);
    try {
      const normSession = normalizeAcademicSession(session) || 'all';
      const data = await api.getAdminFeeStructures(normSession);
      const list = Array.isArray(data) ? data : (data?.data || []);
      setFeeStructures(list);
    } catch {
      setNotification({
        type: 'error',
        message: 'Unable to fetch fee structure from server. Loaded offline data.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeStructures();

    const handleSync = () => {
      fetchFeeStructures();
    };

    window.addEventListener('ndrn:fee-structure-updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('ndrn:fee-structure-updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [session]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    const nextOrder = feeStructures.length + 1;
    // Suggest first standard class not yet present
    const existingClasses = feeStructures.map((f) => f.classGrade);
    const suggestedClass = STANDARD_CLASSES.find((c) => !existingClasses.includes(c)) || 'Class 1';

    setFormData({
      classGrade: suggestedClass,
      academicSession: session,
      admissionFee: 800,
      monthlyTuitionFee: 400,
      annualCharges: 800,
      otherCharges: 250,
      busFee: 300,
      isPublished: true,
      isVerified: true,
      notes: 'Standard tuition and activity charges.',
      sortOrder: nextOrder,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      classGrade: item.classGrade,
      academicSession: item.academicSession || session,
      admissionFee: item.admissionFee ?? 0,
      monthlyTuitionFee: item.monthlyTuitionFee ?? 0,
      annualCharges: item.annualCharges ?? 0,
      otherCharges: item.otherCharges ?? 0,
      busFee: item.busFee ?? 0,
      isPublished: item.isPublished !== undefined ? item.isPublished : true,
      isVerified: item.isVerified !== undefined ? item.isVerified : false,
      notes: item.notes || '',
      sortOrder: item.sortOrder || 1,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.classGrade.trim()) errors.classGrade = 'Class / Grade is required';
    if (!formData.academicSession.trim()) errors.academicSession = 'Academic session is required';
    if (isNaN(formData.admissionFee) || Number(formData.admissionFee) < 0) {
      errors.admissionFee = 'Admission fee must be 0 or greater';
    }
    if (isNaN(formData.monthlyTuitionFee) || Number(formData.monthlyTuitionFee) < 0) {
      errors.monthlyTuitionFee = 'Monthly tuition fee must be 0 or greater';
    }
    if (isNaN(formData.annualCharges) || Number(formData.annualCharges) < 0) {
      errors.annualCharges = 'Annual charges must be 0 or greater';
    }
    if (isNaN(formData.otherCharges) || Number(formData.otherCharges) < 0) {
      errors.otherCharges = 'Other charges must be 0 or greater';
    }
    if (isNaN(formData.busFee) || Number(formData.busFee) < 0) {
      errors.busFee = 'Bus fee must be 0 or greater';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = {
        ...formData,
        academicSession: normalizeAcademicSession(formData.academicSession || session) || '2026-27',
        admissionFee: Number(formData.admissionFee),
        monthlyTuitionFee: Number(formData.monthlyTuitionFee),
        annualCharges: Number(formData.annualCharges),
        otherCharges: Number(formData.otherCharges),
        busFee: Number(formData.busFee || 0),
        sortOrder: Number(formData.sortOrder || 1),
      };

      if (editingItem) {
        const id = editingItem.id || editingItem._id;
        await api.updateFeeStructure(id, payload);
        showNotification('success', `Fee structure for ${payload.classGrade} updated successfully.`);
      } else {
        await api.createFeeStructure(payload);
        showNotification('success', `Fee structure for ${payload.classGrade} added successfully.`);
      }

      setModalOpen(false);
      fetchFeeStructures();
    } catch (err) {
      showNotification('error', err.message || 'Failed to save fee structure.');
    }
  };

  const handleTogglePublish = async (item) => {
    const id = item.id || item._id;
    const newStatus = !item.isPublished;
    try {
      await api.togglePublishFeeStructure(id, newStatus);
      showNotification(
        'success',
        `${item.classGrade} fee structure is now ${newStatus ? 'Published on Public Website' : 'Hidden from Public Website'}.`
      );
      fetchFeeStructures();
    } catch (err) {
      showNotification('error', err.message || 'Failed to update publish status.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const id = deleteTarget.id || deleteTarget._id;
      await api.deleteFeeStructure(id);
      showNotification('success', `Fee structure for ${deleteTarget.classGrade} was deleted.`);
      setDeleteTarget(null);
      fetchFeeStructures();
    } catch (err) {
      showNotification('error', err.message || 'Failed to delete fee structure.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculations for summary stats
  const publishedCount = feeStructures.filter((f) => f.isPublished).length;
  const draftCount = feeStructures.filter((f) => !f.isPublished).length;

  // Live modal calculation
  const modalMonthlyAnnual = Number(formData.monthlyTuitionFee || 0) * 12;
  const modalTotalNew =
    Number(formData.admissionFee || 0) +
    modalMonthlyAnnual +
    Number(formData.annualCharges || 0) +
    Number(formData.otherCharges || 0);
  const modalTotalExisting =
    modalMonthlyAnnual +
    Number(formData.annualCharges || 0) +
    Number(formData.otherCharges || 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-saffron-600">
              ADMISSIONS & ACCOUNTS CONTROL
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-saffron-100 text-saffron-800 font-bold border border-saffron-300">
              Session {session}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-saffron-600" />
            <span>Manage Fee Structure</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure, calculate, and publish class-wise tuition fees and charges displayed on the public Admissions page.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Academic Session Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={session}
              onChange={(e) => setSession(e.target.value)}
              className="bg-transparent text-slate-800 focus:outline-none cursor-pointer font-bold"
              aria-label="Select Academic Session"
            >
              <option value="2026-27">Session 2026–27</option>
              <option value="2025-26">Session 2025–26</option>
              <option value="all">All Sessions</option>
            </select>
          </div>

          {/* Preview Public View */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPreviewOpen(true)}
            leftIcon={<Eye className="w-4 h-4 text-saffron-600" />}
          >
            Preview Public View
          </Button>

          {/* Add New Class Fee */}
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Class Fee
          </Button>
        </div>
      </div>

      {/* Fee Desk Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px">
        <Link
          to="/admin/fees"
          className="px-4 py-2 font-medium text-sm text-slate-600 hover:text-school-700 hover:bg-slate-100 rounded-t-lg transition-colors flex items-center gap-2"
        >
          <CreditCard className="w-4 h-4 text-slate-400" />
          <span>Student Dues & Collections</span>
        </Link>
        <span className="px-4 py-2 font-bold text-sm text-school-700 border-b-2 border-school-600 bg-white rounded-t-lg flex items-center gap-2">
          <Receipt className="w-4 h-4 text-school-600" />
          <span>Public Fee Structure Schedule</span>
        </span>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-xs sm:text-sm font-semibold transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Classes Configured
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {feeStructures.length}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Nursery to Class 5 cohorts
          </span>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
            Published Online
          </span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {publishedCount}
          </div>
          <span className="text-[11px] text-emerald-600 mt-0.5 block">
            Visible on Admissions page
          </span>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
            Draft / Hidden
          </span>
          <div className="text-2xl font-black text-amber-700 mt-1">
            {draftCount}
          </div>
          <span className="text-[11px] text-amber-600 mt-0.5 block">
            Internal / unpublished
          </span>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-saffron-600 block">
            Academic Session
          </span>
          <div className="text-2xl font-black text-brown-800 mt-1">
            {session}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Rolling annual admission
          </span>
        </Card>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Fee Records ({feeStructures.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live database records synced with public Admissions portal.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchFeeStructures}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
              title="Refresh Data"
              aria-label="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            <div className="w-8 h-8 border-2 border-saffron-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span>Loading fee structure records...</span>
          </div>
        ) : feeStructures.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">No Fee Records Found</h4>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              No fee structure has been configured for session {session}. Click below to add classes.
            </p>
            <Button size="sm" variant="primary" onClick={handleOpenAdd} leftIcon={<Plus className="w-4 h-4" />}>
              Add First Fee Record
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Class / Grade</th>
                  <th className="py-3 px-4 text-right">Admission Fee</th>
                  <th className="py-3 px-4 text-right">Monthly Tuition</th>
                  <th className="py-3 px-4 text-right">Annual Charges</th>
                  <th className="py-3 px-4 text-right">Other Charges</th>
                  <th className="py-3 px-4 text-right">Bus Fee</th>
                  <th className="py-3 px-4 text-right text-saffron-700">Total Est. Annual</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {feeStructures.map((item) => {
                  const calculatedTotal =
                    Number(item.admissionFee || 0) +
                    Number(item.monthlyTuitionFee || 0) * 12 +
                    Number(item.annualCharges || 0) +
                    Number(item.otherCharges || 0);

                  return (
                    <tr key={item.id || item._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{item.classGrade}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {item.notes || 'Standard fee schedule'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                        ₹{(item.admissionFee || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                        ₹{(item.monthlyTuitionFee || 0).toLocaleString('en-IN')}
                        <span className="text-[10px] text-slate-400 block">/month</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                        ₹{(item.annualCharges || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                        ₹{(item.otherCharges || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                        ₹{(item.busFee || 0).toLocaleString('en-IN')}
                        <span className="text-[10px] text-slate-400 block">/month</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-saffron-700 bg-saffron-50/30">
                        ₹{calculatedTotal.toLocaleString('en-IN')}
                        <span className="text-[10px] text-slate-400 block font-normal">
                          (New Admission)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(item)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                            item.isPublished
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
                          }`}
                          title="Click to toggle publish status"
                        >
                          {item.isPublished ? (
                            <>
                              <Eye className="w-3 h-3 text-emerald-600" />
                              <span>Published</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 text-amber-600" />
                              <span>Draft</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-saffron-600 hover:bg-saffron-50 transition-colors"
                            title="Edit fee amounts"
                            aria-label={`Edit ${item.classGrade} fee`}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete fee record"
                            aria-label={`Delete ${item.classGrade} fee`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Fee Record Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? `Edit Fee Structure: ${editingItem.classGrade}` : 'Add Class Fee Structure'}
        maxWidth="max-w-xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <Button type="button" variant="primary" size="sm" onClick={handleSave}>
              {editingItem ? 'Save Changes' : 'Create Fee Record'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Class / Grade */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Class / Grade <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.classGrade}
                onChange={(e) => setFormData({ ...formData, classGrade: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500 font-semibold"
              >
                {STANDARD_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
              {formErrors.classGrade && (
                <p className="text-[11px] text-rose-500 mt-1">{formErrors.classGrade}</p>
              )}
            </div>

            {/* Academic Session */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Academic Session <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.academicSession}
                onChange={(e) => setFormData({ ...formData, academicSession: e.target.value })}
                placeholder="2026-27"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500 font-semibold"
              />
              {formErrors.academicSession && (
                <p className="text-[11px] text-rose-500 mt-1">{formErrors.academicSession}</p>
              )}
            </div>
          </div>

          {/* Fee Components */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-slate-200">
            {/* Admission Fee */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Admission Fee (One-Time) (₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">₹</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={formData.admissionFee}
                  onChange={(e) => setFormData({ ...formData, admissionFee: e.target.value })}
                  className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500 font-semibold"
                />
              </div>
              {formErrors.admissionFee && (
                <p className="text-[11px] text-rose-500 mt-1">{formErrors.admissionFee}</p>
              )}
            </div>

            {/* Monthly Tuition Fee */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Monthly Tuition Fee (₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">₹</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={formData.monthlyTuitionFee}
                  onChange={(e) => setFormData({ ...formData, monthlyTuitionFee: e.target.value })}
                  className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500 font-semibold"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Annualized tuition: ₹{modalMonthlyAnnual.toLocaleString('en-IN')} (×12 months)
              </span>
              {formErrors.monthlyTuitionFee && (
                <p className="text-[11px] text-rose-500 mt-1">{formErrors.monthlyTuitionFee}</p>
              )}
            </div>

            {/* Annual Charges */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Annual Charges (₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">₹</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={formData.annualCharges}
                  onChange={(e) => setFormData({ ...formData, annualCharges: e.target.value })}
                  className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500 font-semibold"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Exams, development & library
              </span>
              {formErrors.annualCharges && (
                <p className="text-[11px] text-rose-500 mt-1">{formErrors.annualCharges}</p>
              )}
            </div>

            {/* Other Charges */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Other Charges (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">₹</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={formData.otherCharges}
                  onChange={(e) => setFormData({ ...formData, otherCharges: e.target.value })}
                  className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500 font-semibold"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Activity, identity card & sports
              </span>
              {formErrors.otherCharges && (
                <p className="text-[11px] text-rose-500 mt-1">{formErrors.otherCharges}</p>
              )}
            </div>

            {/* Bus Fee */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bus Fee (₹ / month)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">₹</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={formData.busFee}
                  onChange={(e) => setFormData({ ...formData, busFee: e.target.value })}
                  className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500 font-semibold"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                School transport / bus conveyance
              </span>
              {formErrors.busFee && (
                <p className="text-[11px] text-rose-500 mt-1">{formErrors.busFee}</p>
              )}
            </div>
          </div>

          {/* Dynamic Calculated Total Card */}
          <div className="p-3.5 rounded-xl bg-saffron-50 border border-saffron-200 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-saffron-900 font-semibold">
              <span>Estimated Annual Fee (New Admission):</span>
              <span className="font-extrabold text-sm text-saffron-700">
                ₹{modalTotalNew.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-600">
              <span>Existing Student Annual (without one-time admission fee):</span>
              <span className="font-bold text-slate-800">
                ₹{modalTotalExisting.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Component Notes / Inclusions
            </label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Workbooks, art kit and exam sheets included."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-saffron-500"
            />
          </div>

          {/* Publishing Controls */}
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="w-4 h-4 rounded text-saffron-600 focus:ring-saffron-500"
              />
              <span>Publish on Public Admissions Page</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={formData.isVerified}
                onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                className="w-4 h-4 rounded text-saffron-600 focus:ring-saffron-500"
              />
              <span>Mark as Administratively Verified</span>
            </label>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Fee Record?"
        message={`Are you sure you want to delete the fee structure record for ${deleteTarget?.classGrade} (${deleteTarget?.academicSession})? This will immediately remove it from public display.`}
        confirmText="Yes, Delete Record"
        isLoading={isDeleting}
      />

      {/* Public View Preview Modal */}
      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={`Public Preview: Fee Schedule (${session})`}
        maxWidth="max-w-3xl"
        footer={
          <Button type="button" variant="primary" size="sm" onClick={() => setPreviewOpen(false)}>
            Close Preview
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Administrator Live Preview:</strong> Only published fee records ({publishedCount}) are visible to visiting parents on the public website.
            </div>
          </div>

          <div className="border border-cream-200 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-cream-100 border-b border-cream-200 text-brown-800 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3 text-right">Admission Fee</th>
                  <th className="py-2.5 px-3 text-right">Monthly Tuition</th>
                  <th className="py-2.5 px-3 text-right">Annual Charges</th>
                  <th className="py-2.5 px-3 text-right">Other Charges</th>
                  <th className="py-2.5 px-3 text-right">Bus Fee</th>
                  <th className="py-2.5 px-3 text-right text-saffron-700">Total Est. Annual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {feeStructures
                  .filter((f) => f.isPublished)
                  .map((item) => {
                    const total =
                      Number(item.admissionFee || 0) +
                      Number(item.monthlyTuitionFee || 0) * 12 +
                      Number(item.annualCharges || 0) +
                      Number(item.otherCharges || 0);

                    return (
                      <tr key={item.id || item._id} className="hover:bg-cream-50/50">
                        <td className="py-2.5 px-3 font-bold text-brown-800">{item.classGrade}</td>
                        <td className="py-2.5 px-3 text-right text-brown-700">
                          ₹{(item.admissionFee || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-right text-brown-700">
                          ₹{(item.monthlyTuitionFee || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-right text-brown-700">
                          ₹{(item.annualCharges || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-right text-brown-700">
                          ₹{(item.otherCharges || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-right text-brown-700">
                          ₹{(item.busFee || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-saffron-600 bg-cream-50/80">
                          ₹{total.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
}
