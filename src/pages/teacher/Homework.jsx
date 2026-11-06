import React, { useState, useEffect } from 'react';
import {
  BookOpenCheck,
  Plus,
  Calendar,
  Clock,
  Trash2,
  Users,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Search,
  School
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';

export default function TeacherHomework() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('All');
  const [homeworkList, setHomeworkList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // New Homework Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    classId: '',
    subject: 'Mathematics',
    title: '',
    description: '',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  // Submissions Modal State
  const [activeSubmissionsTask, setActiveSubmissionsTask] = useState(null);
  const [submissionsList, setSubmissionsList] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // 1. Fetch assigned classes for this teacher
  useEffect(() => {
    let isMounted = true;
    async function loadAssignedClasses() {
      try {
        const classList = await api.getClasses();
        if (!isMounted) return;
        const all = Array.isArray(classList) ? classList : [];
        if (user?.role === 'teacher' && user?.wing !== 'Administration' && Array.isArray(user?.assignedClasses) && user.assignedClasses.length > 0) {
          const assignedIds = user.assignedClasses.map((c) => c.toString());
          const filtered = all.filter((c) => assignedIds.includes((c._id || c.id)?.toString()));
          setClasses(filtered.length > 0 ? filtered : all);
          if (filtered.length > 0) {
            setFormData((prev) => ({ ...prev, classId: (filtered[0]._id || filtered[0].id)?.toString() }));
          }
        } else {
          setClasses(all);
          if (all.length > 0) {
            setFormData((prev) => ({ ...prev, classId: (all[0]._id || all[0].id)?.toString() }));
          }
        }
      } catch {
        // non-fatal
      }
    }
    loadAssignedClasses();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // 2. Fetch homework assignments from MongoDB
  const fetchHomework = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const params = {};
      if (selectedClassId && selectedClassId !== 'All') {
        params.classId = selectedClassId;
      }
      const res = await api.getHomework(params);
      const items = res?.items || (Array.isArray(res) ? res : []);
      setHomeworkList(items);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load homework from database.');
      setHomeworkList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomework();
  }, [selectedClassId]);

  // 3. Create new homework assignment
  const handleCreateHomework = async (e) => {
    e.preventDefault();
    if (!formData.classId || !formData.title.trim() || !formData.description.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await api.createHomework(formData);
      setSuccessMessage('Homework task issued and persisted to MongoDB successfully.');
      setIsModalOpen(false);
      setFormData((prev) => ({
        ...prev,
        title: '',
        description: '',
      }));
      fetchHomework();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to assign homework task.');
    } finally {
      setIsSaving(false);
    }
  };

  // 4. Delete homework assignment
  const handleDeleteHomework = async (id) => {
    if (!window.confirm('Are you sure you want to remove this homework assignment?')) return;
    try {
      await api.deleteHomework(id);
      setSuccessMessage('Homework assignment removed.');
      setHomeworkList((prev) => prev.filter((hw) => (hw.id || hw._id) !== id));
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to remove homework task.');
    }
  };

  // 5. View Submissions
  const handleViewSubmissions = async (task) => {
    setActiveSubmissionsTask(task);
    setLoadingSubmissions(true);
    try {
      const subs = await api.getHomeworkSubmissions(task.id || task._id);
      setSubmissionsList(Array.isArray(subs) ? subs : []);
    } catch (err) {
      setSubmissionsList([]);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-school-700 uppercase tracking-widest block mb-1">
            CURRICULUM TASKS • FACULTY DESK
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Homework & Assignments Ledger
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Issue, track, and review daily assignments for primary cohorts • Daulatyarpur Campus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="bg-school-800 hover:bg-school-900 text-white font-bold text-xs shadow-soft-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Issue New Homework</span>
          </Button>
        </div>
      </div>

      {/* Error & Success Messages */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button type="button" onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button type="button" onClick={() => setSuccessMessage(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <Card className="p-4 bg-white border border-slate-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-xs font-bold text-slate-600 shrink-0">Filter Cohort:</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="text-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-school-600"
            >
              <option value="All">All Assigned Cohorts</option>
              {classes.map((c) => (
                <option key={c._id || c.id} value={c._id || c.id}>
                  {c.name} - Section {c.section || 'A'}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Showing {homeworkList.length} active assignments in MongoDB
          </div>
        </div>
      </Card>

      {/* Homework Cards */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
          Loading assigned homework tasks from MongoDB...
        </div>
      ) : homeworkList.length === 0 ? (
        <Card className="p-12 text-center text-xs text-slate-400">
          <BookOpenCheck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <p className="font-semibold text-slate-700 text-sm">No homework tasks recorded.</p>
          <p className="text-slate-500 mt-1 max-w-md mx-auto">
            Click 'Issue New Homework' above to publish assignments for your primary cohorts.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {homeworkList.map((hw) => (
            <Card
              key={hw.id || hw._id}
              className="p-5 flex flex-col justify-between border-slate-200/90 hover:border-school-300 transition-all shadow-soft-xs"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-school-100 text-school-800">
                      {hw.subject}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 font-mono">
                      {hw.className}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteHomework(hw.id || hw._id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                    title="Delete Assignment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{hw.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {hw.description || hw.instructions}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="text-[11px] text-slate-500 font-medium">
                  <div>
                    Due: <span className="font-bold text-slate-800">{hw.dueDateFormatted || hw.dueDate}</span>
                  </div>
                  <div className="text-slate-400">By {hw.assignedBy}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleViewSubmissions(hw)}
                    className="px-3 py-1.5 rounded-xl bg-school-50 text-school-800 hover:bg-school-100 border border-school-200 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5 text-school-600" />
                    <span>Submissions ({hw.totalSubmissions || 0})</span>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Homework Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpenCheck className="w-5 h-5 text-school-700" />
                <h3 className="text-base font-bold text-slate-900">Issue New Homework Task</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHomework} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Primary Cohort *</label>
                <select
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-school-600"
                >
                  {classes.map((c) => (
                    <option key={c._id || c.id} value={c._id || c.id}>
                      {c.name} - Section {c.section || 'A'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject *</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    placeholder="e.g. Mathematics"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-school-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Submission Due Date *</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-school-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g. Chapter 4 Multiplication Word Problems"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-school-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Instructions & Guidance *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  placeholder="Detail the pages, notebook work, or practice questions to be completed..."
                  rows={4}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-school-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSaving}
                  className="bg-school-800 hover:bg-school-900 text-white font-bold"
                >
                  {isSaving ? 'Saving to Database...' : 'Issue Homework'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submissions Roster Modal */}
      {activeSubmissionsTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Student Submissions</h3>
                <span className="text-xs text-slate-500">
                  {activeSubmissionsTask.title} • {activeSubmissionsTask.subject} ({activeSubmissionsTask.className})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubmissionsTask(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 max-h-96 overflow-y-auto">
              {loadingSubmissions ? (
                <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
                  Loading verified student submissions from MongoDB...
                </div>
              ) : submissionsList.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No student submissions recorded for this assignment yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {submissionsList.map((sub) => (
                    <div key={sub._id || sub.student?._id} className="py-3 flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-slate-900 text-xs">
                          {sub.student?.fullName || sub.studentName || 'Student'}
                          {sub.student?.rollNumber && (
                            <span className="ml-2 font-mono text-[11px] text-slate-400">
                              Roll #{sub.student.rollNumber}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{sub.submissionNotes}</p>
                        <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                          Submitted: {new Date(sub.submittedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Submitted
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <Button type="button" variant="outline" size="sm" onClick={() => setActiveSubmissionsTask(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

