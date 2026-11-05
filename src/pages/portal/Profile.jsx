import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
  User,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  Bus,
  CheckCircle2,
  Users,
  AlertCircle,
  FileText,
  Send,
  Building,
  Edit3,
  Save,
  X,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';
import { portalApi } from '../../services/portalApi';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';

function formatDisplayDate(dateVal) {
  if (!dateVal) return '15 April 2015';
  try {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  } catch {
    // fallback
  }
  return String(dateVal);
}

function formatDateForInput(dateVal) {
  if (!dateVal) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) return dateVal;
  try {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch {
    // fallback
  }
  return '';
}

function formatAddressText(addr) {
  if (!addr) return 'Daulatyarpur, Madhoganj, Hardoi, Uttar Pradesh';
  if (typeof addr === 'string') return addr;
  const parts = [addr.street, addr.village, addr.district, addr.state, addr.pincode].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Daulatyarpur, Madhoganj, Hardoi, Uttar Pradesh';
}

export default function Profile() {
  const { user } = useAuth();

  if (user?.role === 'teacher') {
    return <Navigate to="/teacher/profile" replace />;
  }
  const {
    currentStudent,
    availableWards,
    activeWardId,
    switchWard,
    updateWardData,
    hasMultipleChildren,
    isParent,
  } = usePortal();

  // Local student state for immediate reactivity
  const [studentDetails, setStudentDetails] = useState(null);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, message: '' });

  // Form state for permitted editable personal details
  const [editForm, setEditForm] = useState({
    dob: '',
    gender: 'Male',
    bloodGroup: 'B+',
    address: '',
    emergencyPhone: '',
  });

  // Modal for administrative amendments
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestField, setRequestField] = useState('Contact Phone');
  const [proposedValue, setProposedValue] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Sync active student data when ward changes
  useEffect(() => {
    if (currentStudent) {
      setStudentDetails(currentStudent);
      setEditForm({
        dob: formatDateForInput(currentStudent.dob || currentStudent.dateOfBirth || '2015-04-15'),
        gender: currentStudent.gender || 'Male',
        bloodGroup: currentStudent.bloodGroup || 'B+',
        address: formatAddressText(currentStudent.address),
        emergencyPhone: currentStudent.emergencyPhone || currentStudent.emergencyContact?.phone || '',
      });
      setIsEditing(false);
      setFeedback({ type: null, message: '' });
    }
  }, [currentStudent?.id, activeWardId]);

  const activeStudent = studentDetails || currentStudent;

  const handleStartEdit = () => {
    setEditForm({
      dob: formatDateForInput(activeStudent?.dob || activeStudent?.dateOfBirth || '2015-04-15'),
      gender: activeStudent?.gender || 'Male',
      bloodGroup: activeStudent?.bloodGroup || 'B+',
      address: formatAddressText(activeStudent?.address),
      emergencyPhone: activeStudent?.emergencyPhone || activeStudent?.emergencyContact?.phone || '',
    });
    setFeedback({ type: null, message: '' });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditForm({
      dob: formatDateForInput(activeStudent?.dob || activeStudent?.dateOfBirth || '2015-04-15'),
      gender: activeStudent?.gender || 'Male',
      bloodGroup: activeStudent?.bloodGroup || 'B+',
      address: formatAddressText(activeStudent?.address),
      emergencyPhone: activeStudent?.emergencyPhone || activeStudent?.emergencyContact?.phone || '',
    });
    setFeedback({ type: null, message: '' });
    setIsEditing(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!activeStudent) return;

    setIsSaving(true);
    setFeedback({ type: null, message: '' });

    const studentId = activeStudent.id || activeStudent.admissionNo;

    const payload = {
      dateOfBirth: editForm.dob,
      dob: editForm.dob,
      gender: editForm.gender,
      bloodGroup: editForm.bloodGroup,
      address: editForm.address,
      emergencyPhone: editForm.emergencyPhone,
      emergencyContact: {
        phone: editForm.emergencyPhone,
        name: activeStudent.parentName || 'Parent',
        relationship: 'Guardian',
      },
    };

    try {
      // 1. Call universal portal API (persists to MongoDB backend and updates local store)
      await portalApi.updateStudent(studentId, payload);

      // 2. Update reactive local state
      const updatedData = {
        ...activeStudent,
        ...payload,
        dob: editForm.dob,
        dateOfBirth: editForm.dob,
        gender: editForm.gender,
        bloodGroup: editForm.bloodGroup,
        address: editForm.address,
        emergencyPhone: editForm.emergencyPhone,
      };

      setStudentDetails(updatedData);

      // 3. Update PortalContext so ward switcher and overall portal reflect updates
      if (updateWardData) {
        updateWardData(studentId, updatedData);
      }

      setFeedback({
        type: 'success',
        message: 'Personal details updated successfully in the school records.',
      });
      setIsEditing(false);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to update records. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    if (!proposedValue.trim()) return;

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setRequestModalOpen(false);
      setProposedValue('');
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-school-700 uppercase tracking-widest block mb-1">
            {isParent ? 'WARD RECORD • OFFICIAL PROFILE' : 'STUDENT RECORD • OFFICIAL PROFILE'}
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isParent ? `${activeStudent?.name}'s Profile` : 'My Student Profile'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Academic enrollment and official primary school particulars for Session 2026-27 • Daulatyarpur Campus.
          </p>
        </div>

        {isParent && (
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button
                type="button"
                variant="primary"
                onClick={handleStartEdit}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold shadow-soft-sm"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border-slate-300"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-school-700 hover:bg-school-800 text-white shadow-soft-sm"
                >
                  {isSaving ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Feedback Notification Banner */}
      {feedback.message && (
        <div
          className={`p-4 rounded-2xl text-xs font-medium flex items-center justify-between border animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback({ type: null, message: '' })}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Multi-Child Switcher for Parent */}
      {hasMultipleChildren && (
        <div className="bg-white rounded-2xl p-4 border border-school-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <Users className="w-4 h-4 text-school-600" />
            <span>Select Ward to View:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableWards.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => switchWard(w.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  w.id === activeWardId
                    ? 'bg-school-800 text-white shadow-soft-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {w.name} ({w.grade})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Profile Summary Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-soft-sm">
        {/* Active Edit Mode Information Advisory */}
        {isEditing && (
          <div className="mb-6 p-4 bg-school-50/70 border border-school-200/90 rounded-2xl text-xs text-school-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-school-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Parent Profile Editor Active</span>
              <span className="text-slate-600">
                You may edit permitted personal details below (Date of Birth, Gender, Blood Group, Permanent Address, and Emergency Phone). Official school records (Admission No, Roll No, Academic Year, and Class) are protected and maintained exclusively by administration.
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-100">
          <div className="relative">
            <img
              src={
                activeStudent?.avatar ||
                'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=240'
              }
              alt={activeStudent?.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-school-600/30 shadow-soft-sm"
            />
            <span className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-2xs">
              Enrolled
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 truncate">
                {activeStudent?.name}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-school-100 text-school-800">
                {activeStudent?.grade}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                {activeStudent?.house || 'Ganga House'}
              </span>
            </div>

            {/* Read-Only Official Academic Particulars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
              <div>
                <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                  Admission No {isEditing && <Lock className="w-2.5 h-2.5 text-slate-400" title="Read-only official record" />}
                </span>
                <span className="font-bold text-slate-800">{activeStudent?.admissionNo || activeStudent?.id}</span>
              </div>
              <div>
                <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                  Roll Number {isEditing && <Lock className="w-2.5 h-2.5 text-slate-400" title="Read-only official record" />}
                </span>
                <span className="font-bold text-slate-800">#{activeStudent?.rollNo}</span>
              </div>
              <div>
                <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                  Academic Year {isEditing && <Lock className="w-2.5 h-2.5 text-slate-400" title="Read-only official record" />}
                </span>
                <span className="font-bold text-slate-800">2026-2027</span>
              </div>
              <div>
                <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                  Campus {isEditing && <Lock className="w-2.5 h-2.5 text-slate-400" title="Read-only official record" />}
                </span>
                <span className="font-bold text-slate-800">Daulatyarpur, Madhoganj</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Particulars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {/* Left Column: Personal & Academic Particulars */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-school-600" />
              <span>Personal Details</span>
            </h4>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-2.5 text-xs">
              {/* Date of Birth (Editable) */}
              {isEditing ? (
                <div className="py-1.5 border-b border-slate-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <label htmlFor="dob-input" className="text-slate-600 font-medium text-xs flex items-center gap-1">
                    <span>Date of Birth</span>
                    <span className="text-school-700 font-semibold text-[10px] bg-school-100 px-1.5 py-0.5 rounded">Editable</span>
                  </label>
                  <input
                    id="dob-input"
                    type="date"
                    name="dob"
                    value={editForm.dob}
                    onChange={handleFormChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="text-xs px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-school-600 bg-white font-medium text-slate-800 sm:w-48 shadow-2xs"
                  />
                </div>
              ) : (
                <div className="flex justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-500">Date of Birth</span>
                  <span className="font-semibold text-slate-800">
                    {formatDisplayDate(activeStudent?.dob || activeStudent?.dateOfBirth)}
                  </span>
                </div>
              )}

              {/* Gender (Editable) */}
              {isEditing ? (
                <div className="py-1.5 border-b border-slate-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <label htmlFor="gender-select" className="text-slate-600 font-medium text-xs flex items-center gap-1">
                    <span>Gender</span>
                    <span className="text-school-700 font-semibold text-[10px] bg-school-100 px-1.5 py-0.5 rounded">Editable</span>
                  </label>
                  <select
                    id="gender-select"
                    name="gender"
                    value={editForm.gender}
                    onChange={handleFormChange}
                    className="text-xs px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-school-600 bg-white font-medium text-slate-800 sm:w-48 shadow-2xs"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              ) : (
                <div className="flex justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-500">Gender</span>
                  <span className="font-semibold text-slate-800">{activeStudent?.gender || 'Male'}</span>
                </div>
              )}

              {/* Blood Group (Editable) */}
              {isEditing ? (
                <div className="py-1.5 border-b border-slate-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <label htmlFor="bloodGroup-select" className="text-slate-600 font-medium text-xs flex items-center gap-1">
                    <span>Blood Group</span>
                    <span className="text-school-700 font-semibold text-[10px] bg-school-100 px-1.5 py-0.5 rounded">Editable</span>
                  </label>
                  <select
                    id="bloodGroup-select"
                    name="bloodGroup"
                    value={editForm.bloodGroup}
                    onChange={handleFormChange}
                    className="text-xs px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-school-600 bg-white font-medium text-slate-800 sm:w-48 shadow-2xs"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>
              ) : (
                <div className="flex justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-500">Blood Group</span>
                  <span className="font-semibold text-slate-800">{activeStudent?.bloodGroup || 'B+'}</span>
                </div>
              )}

              {/* Medium of Instruction (Read-Only) */}
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500 flex items-center gap-1">
                  Medium of Instruction {isEditing && <Lock className="w-2.5 h-2.5 text-slate-400" title="School record" />}
                </span>
                <span className="font-semibold text-slate-800">Hindi & English Dual Medium</span>
              </div>

              {/* Assigned Bus Route (Read-Only) */}
              <div className="flex justify-between py-1">
                <span className="text-slate-500 flex items-center gap-1">
                  Assigned Bus Route {isEditing && <Lock className="w-2.5 h-2.5 text-slate-400" title="School record" />}
                </span>
                <span className="font-semibold text-slate-800">{activeStudent?.busRoute || 'Route 3 - Madhoganj Bus Stand'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Family & Contact Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-school-600" />
              <span>Guardian & Emergency Contacts</span>
            </h4>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-2.5 text-xs">
              {/* Parent / Guardian Name (Read-Only) */}
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500 flex items-center gap-1">
                  Parent / Guardian Name {isEditing && <Lock className="w-2.5 h-2.5 text-slate-400" title="School record" />}
                </span>
                <span className="font-semibold text-slate-800">{activeStudent?.parentName || '—'}</span>
              </div>

              {/* Registered Mobile (Read-Only) */}
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500 flex items-center gap-1">
                  Registered Mobile {isEditing && <Lock className="w-2.5 h-2.5 text-slate-400" title="School record" />}
                </span>
                <span className="font-semibold text-slate-800">{activeStudent?.parentPhone || '—'}</span>
              </div>

              {/* Emergency Alternate (Editable) */}
              {isEditing ? (
                <div className="py-1.5 border-b border-slate-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <label htmlFor="emergencyPhone-input" className="text-slate-600 font-medium text-xs flex items-center gap-1">
                    <span>Emergency Alternate</span>
                    <span className="text-school-700 font-semibold text-[10px] bg-school-100 px-1.5 py-0.5 rounded">Editable</span>
                  </label>
                  <input
                    id="emergencyPhone-input"
                    type="tel"
                    name="emergencyPhone"
                    value={editForm.emergencyPhone}
                    onChange={handleFormChange}
                    placeholder="+91 98765 43210"
                    className="text-xs px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-school-600 bg-white font-medium text-slate-800 sm:w-48 shadow-2xs"
                  />
                </div>
              ) : (
                <div className="flex justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-500">Emergency Alternate</span>
                  <span className="font-semibold text-slate-800">{activeStudent?.emergencyPhone || activeStudent?.emergencyContact?.phone || '—'}</span>
                </div>
              )}

              {/* Permanent Address (Editable) */}
              {isEditing ? (
                <div className="py-1.5 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="address-input" className="text-slate-600 font-medium text-xs flex items-center gap-1">
                      <span>Permanent Address</span>
                      <span className="text-school-700 font-semibold text-[10px] bg-school-100 px-1.5 py-0.5 rounded">Editable</span>
                    </label>
                  </div>
                  <textarea
                    id="address-input"
                    rows={2}
                    name="address"
                    value={editForm.address}
                    onChange={handleFormChange}
                    placeholder="Enter street, village, district, state..."
                    className="text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-school-600 bg-white w-full font-medium text-slate-800 resize-none shadow-2xs"
                  />
                </div>
              ) : (
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Permanent Address</span>
                  <span className="font-semibold text-slate-800 text-right max-w-[220px]">
                    {formatAddressText(activeStudent?.address)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Action Bar for Edit Mode */}
        {isEditing && (
          <div className="mt-6 pt-4 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 bg-school-50/50 p-4 rounded-2xl border border-school-200/70">
            <div className="text-xs text-school-900 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-school-700 shrink-0" />
              <span>Review your changes before saving. Official records will be updated immediately.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="bg-white hover:bg-slate-100 border-slate-300 text-slate-700 text-xs font-semibold px-4"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="bg-school-800 hover:bg-school-900 text-white text-xs font-bold px-5 flex items-center gap-1.5 shadow-soft-sm"
              >
                {isSaving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Protection & Access Control Advisory */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-amber-50/60 rounded-2xl p-4 border border-amber-200/70">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-amber-900 block">Protected Academic Record</span>
              <p className="text-amber-800 mt-0.5">
                Official enrollment details, examination results, and class assignments are governed by the school administration and cannot be modified directly by students or parents.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setRequestModalOpen(true)}
            className="shrink-0 bg-white border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-bold"
          >
            Request Record Update
          </Button>
        </div>
      </div>

      {/* Record Update Request Modal */}
      {requestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Submit Record Amendment Request
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Send an official update request for <span className="font-bold text-slate-700">{activeStudent?.name}</span> to the school administrative desk.
            </p>

            {submitted ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="text-xs font-bold text-emerald-800">Update Request Forwarded</div>
                <p className="text-[11px] text-emerald-600">
                  Your amendment notice has been forwarded to the administrative office in Daulatyarpur. The staff will verify documents and update the official record.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div>
                  <label htmlFor="particular-select" className="block text-xs font-bold text-slate-700 mb-1">
                    Particular to Update
                  </label>
                  <select
                    id="particular-select"
                    value={requestField}
                    onChange={(e) => setRequestField(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-school-600"
                  >
                    <option value="Contact Phone">Primary Contact Phone</option>
                    <option value="Residential Address">Residential Address</option>
                    <option value="Bus Route">Bus Stop / Route Adjustment</option>
                    <option value="Emergency Contact">Emergency Contact Person</option>
                    <option value="Spelling / Name Correction">Name / Spelling Correction</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="amendment-note" className="block text-xs font-bold text-slate-700 mb-1">
                    Correct Details & Supporting Note
                  </label>
                  <textarea
                    id="amendment-note"
                    rows={3}
                    required
                    value={proposedValue}
                    onChange={(e) => setProposedValue(e.target.value)}
                    placeholder="Enter updated information and reason for modification..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-school-600 resize-none"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRequestModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <Button type="submit" variant="primary" size="sm">
                    Submit Request
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
