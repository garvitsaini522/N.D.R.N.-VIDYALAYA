import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  Phone,
  Mail,
  GraduationCap,
  Calendar,
  Building,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Save,
  X,
  Lock,
  BookOpen,
  Award,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DataService } from '../../services/dataService';
import { portalApi } from '../../services/portalApi';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';

export default function TeacherProfile() {
  const { user } = useAuth();
  const [teacherData, setTeacherData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, message: '' });

  // Form for permitted personal edits
  const [form, setForm] = useState({
    phone: '',
    qualification: '',
    experienceYears: 6,
    bio: '',
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await portalApi.getTeacher('me');
        const data = res.data || DataService.getTeachers()[0] || {};
        setTeacherData(data);
        setForm({
          phone: data.phone || user?.phone || '',
          qualification: data.qualification || '',
          experienceYears: data.experienceYears || 0,
          bio: data.bio || '',
        });
      } catch {
        const local = DataService.getTeachers()[0] || {};
        setTeacherData(local);
        setForm({
          phone: local.phone || user?.phone || '',
          qualification: local.qualification || '',
          experienceYears: local.experienceYears || 0,
          bio: local.bio || '',
        });
      }
    }

    loadProfile();
  }, [user]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setFeedback({ type: null, message: '' });
  };

  const handleCancelEdit = () => {
    setForm({
      phone: teacherData?.phone || '',
      qualification: teacherData?.qualification || '',
      experienceYears: teacherData?.experienceYears || 0,
      bio: teacherData?.bio || '',
    });
    setIsEditing(false);
    setFeedback({ type: null, message: '' });
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback({ type: null, message: '' });

    const payload = {
      phone: form.phone.trim(),
      qualification: form.qualification.trim(),
      experienceYears: parseInt(form.experienceYears, 10) || 6,
      bio: form.bio.trim(),
    };

    try {
      const teacherId = teacherData?.id || user?.id || 'me';
      await portalApi.updateTeacher(teacherId, payload);
      setTeacherData((prev) => ({ ...prev, ...payload }));
      setFeedback({
        type: 'success',
        message: 'Faculty profile details updated and archived successfully.',
      });
      setIsEditing(false);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to update profile.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const faculty = teacherData || {};

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-school-700 uppercase tracking-widest block mb-1">
            FACULTY RECORD • OFFICIAL PROFILE
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Educator Dossier: {user?.name || faculty.name || 'Faculty Member'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Institutional credentials, primary section responsibilities, and educator qualifications • Daulatyarpur Campus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleStartEdit}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold shadow-soft-sm bg-school-800 hover:bg-school-900 text-white"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="text-xs font-bold bg-white hover:bg-slate-50 border-slate-300"
              >
                <X className="w-4 h-4 mr-1" />
                <span>Cancel</span>
              </Button>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="text-xs font-bold bg-school-800 hover:bg-school-900 text-white shadow-soft-sm"
              >
                {isSaving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-1.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback.message && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
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

      {/* Main Profile Summary Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-soft-sm space-y-6">
        {/* Top Identity Block */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-100">
          <div className="relative">
            <img
              src={
                user?.avatar ||
                faculty.avatar ||
                'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=240'
              }
              alt={user?.name || faculty.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-school-600/30 shadow-soft-sm"
            />
            <span className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-2xs">
              Active Faculty
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 truncate">
                {user?.name || faculty.name || 'Faculty Member'}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                Primary Section Faculty
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                Daulatyarpur Campus
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-1">
              {user?.designation || faculty.designation || 'Primary Section Faculty'}
            </p>

            {/* Read-Only Institutional Particulars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
              <div>
                <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                  Employee ID {isEditing && <Lock className="w-2.5 h-2.5 text-slate-400" title="School record" />}
                </span>
                <span className="font-bold text-slate-800 font-mono">
                  {faculty.employeeId || faculty.id || '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                  Institutional Wing {isEditing && <Lock className="w-2.5 h-2.5 text-slate-400" title="School record" />}
                </span>
                <span className="font-bold text-slate-800">Primary Wing</span>
              </div>
              <div>
                <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                  Assigned Classes {isEditing && <Lock className="w-2.5 h-2.5 text-slate-400" title="School record" />}
                </span>
                <span className="font-bold text-slate-800">
                  {faculty.assignedClasses && faculty.assignedClasses.length > 0
                    ? (Array.isArray(faculty.assignedClasses)
                        ? faculty.assignedClasses.map((c) => c.name || c).join(', ')
                        : faculty.assignedClasses)
                    : 'Primary Wing'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                  Campus Location {isEditing && <Lock className="w-2.5 h-2.5 text-slate-400" title="School record" />}
                </span>
                <span className="font-bold text-slate-800">Daulatyarpur, Madhoganj</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Particulars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Left Column: Personal Contact & Qualifications */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-school-600" />
              <span>Professional & Contact Particulars</span>
            </h4>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-3 text-xs">
              {/* Phone */}
              {isEditing ? (
                <div>
                  <label htmlFor="teacher-phone" className="block text-slate-600 font-medium text-xs mb-1">
                    Contact Phone (Editable)
                  </label>
                  <input
                    id="teacher-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-300 font-mono bg-white focus:outline-none focus:ring-2 focus:ring-school-600"
                  />
                </div>
              ) : (
                <div className="flex justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-500">Contact Phone</span>
                  <span className="font-bold text-slate-800 font-mono">{form.phone}</span>
                </div>
              )}

              {/* Email (Read-Only) */}
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500 flex items-center gap-1">
                  Institutional Email {isEditing && <Lock className="w-2.5 h-2.5 text-slate-400" />}
                </span>
                <span className="font-semibold text-slate-800 font-mono">
                  {user?.email || faculty.email || '—'}
                </span>
              </div>

              {/* Qualifications */}
              {isEditing ? (
                <div>
                  <label htmlFor="teacher-qual" className="block text-slate-600 font-medium text-xs mb-1">
                    Academic Qualifications (Editable)
                  </label>
                  <input
                    id="teacher-qual"
                    type="text"
                    value={form.qualification}
                    onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                    className="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-school-600"
                  />
                </div>
              ) : (
                <div className="flex justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-500">Qualifications</span>
                  <span className="font-semibold text-slate-800 text-right">{form.qualification}</span>
                </div>
              )}

              {/* Experience */}
              {isEditing ? (
                <div>
                  <label htmlFor="teacher-exp" className="block text-slate-600 font-medium text-xs mb-1">
                    Teaching Experience Years (Editable)
                  </label>
                  <input
                    id="teacher-exp"
                    type="number"
                    min="0"
                    max="50"
                    value={form.experienceYears}
                    onChange={(e) => setForm({ ...form, experienceYears: e.target.value })}
                    className="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-300 font-mono bg-white focus:outline-none focus:ring-2 focus:ring-school-600"
                  />
                </div>
              ) : (
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Teaching Experience</span>
                  <span className="font-bold text-slate-800">{form.experienceYears} Years</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Teaching Commitment & Bio */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-school-600" />
              <span>Curriculum Focus & Educator Bio</span>
            </h4>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500 flex items-center gap-1">
                  Primary Teaching Subjects {isEditing && <Lock className="w-2.5 h-2.5 text-slate-400" />}
                </span>
                <span className="font-bold text-slate-800">
                  {faculty.primarySubjects && faculty.primarySubjects.length > 0
                    ? faculty.primarySubjects.join(', ')
                    : faculty.subject || 'Assigned by Wing Coordinator'}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500 flex items-center gap-1">
                  Section Mentorship {isEditing && <Lock className="w-2.5 h-2.5 text-slate-400" />}
                </span>
                <span className="font-bold text-slate-800">
                  {faculty.assignedClasses && faculty.assignedClasses.length > 0
                    ? (Array.isArray(faculty.assignedClasses)
                        ? faculty.assignedClasses.map((c) => c.name || c).join(', ')
                        : faculty.assignedClasses)
                    : 'Primary Wing Faculty'}
                </span>
              </div>

              {/* Bio */}
              {isEditing ? (
                <div>
                  <label htmlFor="teacher-bio" className="block text-slate-600 font-medium text-xs mb-1">
                    Educator Bio & Note (Editable)
                  </label>
                  <textarea
                    id="teacher-bio"
                    rows={3}
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-school-600 resize-none"
                  />
                </div>
              ) : (
                <div className="py-1">
                  <span className="text-slate-500 block mb-1">Pedagogical Statement:</span>
                  <p className="text-slate-700 italic leading-relaxed">
                    "{form.bio}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Protection Advisory */}
        <div className="pt-4 border-t border-slate-100 flex items-center gap-3 bg-amber-50/60 rounded-2xl p-4 border border-amber-200/70 text-xs">
          <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
          <div className="text-amber-900">
            <span className="font-bold block">Protected Institutional Designation</span>
            <span>
              Official service appointments, class mentor assignments, and employee identity codes are maintained by school administration.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

