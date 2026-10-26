import React, { useState } from 'react';
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
  Building
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';

export default function Profile() {
  const { user } = useAuth();
  const {
    currentStudent,
    availableWards,
    activeWardId,
    switchWard,
    hasMultipleChildren,
    isParent,
  } = usePortal();

  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestField, setRequestField] = useState('Contact Phone');
  const [proposedValue, setProposedValue] = useState('');
  const [submitted, setSubmitted] = useState(false);

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
      <div>
        <span className="text-xs font-bold text-school-700 uppercase tracking-widest block mb-1">
          {isParent ? 'WARD RECORD • OFFICIAL PROFILE' : 'STUDENT RECORD • OFFICIAL PROFILE'}
        </span>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {isParent ? `${currentStudent?.name}'s Profile` : 'My Student Profile'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Academic enrollment and official primary school particulars for Session 2026-27 • Daulatyarpur Campus.
        </p>
      </div>

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
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-100">
          <div className="relative">
            <img
              src={
                currentStudent?.avatar ||
                'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=240'
              }
              alt={currentStudent?.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-school-600/30 shadow-soft-sm"
            />
            <span className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-2xs">
              Enrolled
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 truncate">
                {currentStudent?.name}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-school-100 text-school-800">
                {currentStudent?.grade}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                {currentStudent?.house || 'Ganga House'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Admission No</span>
                <span className="font-bold text-slate-800">{currentStudent?.admissionNo || currentStudent?.id}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Roll Number</span>
                <span className="font-bold text-slate-800">#{currentStudent?.rollNo}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Academic Year</span>
                <span className="font-bold text-slate-800">2026-2027</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Campus</span>
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
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500">Date of Birth</span>
                <span className="font-semibold text-slate-800">{currentStudent?.dob || '15 April 2015'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500">Gender</span>
                <span className="font-semibold text-slate-800">Male</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500">Blood Group</span>
                <span className="font-semibold text-slate-800">{currentStudent?.bloodGroup || 'B+'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500">Medium of Instruction</span>
                <span className="font-semibold text-slate-800">Hindi & English Dual Medium</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Assigned Bus Route</span>
                <span className="font-semibold text-slate-800">{currentStudent?.busRoute || 'Route 3 - Madhoganj Bus Stand'}</span>
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
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500">Parent / Guardian Name</span>
                <span className="font-semibold text-slate-800">{currentStudent?.parentName || 'Mrs. Sunita Kumar & Mr. Ramesh Kumar'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500">Registered Mobile</span>
                <span className="font-semibold text-slate-800">{currentStudent?.parentPhone || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500">Emergency Alternate</span>
                <span className="font-semibold text-slate-800">{currentStudent?.emergencyPhone || '—'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Permanent Address</span>
                <span className="font-semibold text-slate-800 text-right max-w-[200px]">
                  {currentStudent?.address || 'Daulatyarpur, Madhoganj, Hardoi, Uttar Pradesh'}
                </span>
              </div>
            </div>
          </div>
        </div>

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
              Send an official update request for <span className="font-bold text-slate-700">{currentStudent?.name}</span> to the school administrative desk.
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Particular to Update
                  </label>
                  <select
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Correct Details & Supporting Note
                  </label>
                  <textarea
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
