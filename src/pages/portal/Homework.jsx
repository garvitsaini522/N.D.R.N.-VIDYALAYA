import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
  BookOpenCheck,
  CheckCircle2,
  Clock,
  UploadCloud,
  FileText,
  AlertCircle,
  X,
  Send,
  Sparkles,
  Users,
  ShieldCheck,
  Filter,
  Search,
  MessageSquareQuote
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';

export default function Homework() {
  const { user } = useAuth();

  // Teachers are guided to faculty homework desk
  if (user?.role === 'teacher') {
    return <Navigate to="/teacher/homework" replace />;
  }

  const {
    currentStudent,
    availableWards,
    activeWardId,
    switchWard,
    hasMultipleChildren,
  } = usePortal();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [selectedTask, setSelectedTask] = useState(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadHomework() {
      if (!currentStudent) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);

      try {
        const classTarget = currentStudent.classId || currentStudent.grade || '';
        const studentIdTarget = currentStudent.id || currentStudent._id || '';

        const res = await api.getHomework({
          classId: classTarget,
          studentId: studentIdTarget,
        });

        if (isMounted) {
          const rawItems = res?.items || (Array.isArray(res) ? res : []);
          setTasks(rawItems);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load homework assignments from database.');
          setLoading(false);
        }
      }
    }

    loadHomework();

    return () => {
      isMounted = false;
    };
  }, [currentStudent, activeWardId]);

  const handleCompleteSubmission = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const studentIdTarget = currentStudent?._id || currentStudent?.id;
      const res = await api.submitHomework(selectedTask.id || selectedTask._id, {
        submissionNotes,
        studentId: studentIdTarget,
      });

      // Update state upon confirmed MongoDB persistence
      setTasks((prev) =>
        prev.map((t) => {
          const tid = t.id || t._id;
          const targetId = selectedTask.id || selectedTask._id;
          return tid === targetId
            ? {
                ...t,
                status: 'Submitted',
                isSubmitted: true,
                submissionDate: res?.submittedAt || new Date().toISOString(),
                submissionNotes: submissionNotes || 'Work completed and submitted.',
              }
            : t;
        })
      );

      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setSelectedTask(null);
        setSubmissionNotes('');
      }, 1600);
    } catch (err) {
      setSubmitError(err.message || 'Failed to persist submission in database. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading primary homework tasks from database..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  // Extract unique subjects
  const availableSubjects = ['All', ...new Set(tasks.map((t) => t.subject).filter(Boolean))];

  const filteredTasks = tasks.filter((t) => {
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesSubject = subjectFilter === 'All' || t.subject === subjectFilter;
    return matchesStatus && matchesSubject;
  });

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <span className="text-xs font-bold text-school-700 uppercase tracking-widest block mb-1">
          HOME STUDY & CURRICULUM TASKS
        </span>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Homework & Assignments ({currentStudent?.grade || 'Primary Cohort'})
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Daily academic exercises, handwriting practice, and creative assignments assigned by primary wing educators.
        </p>
      </div>

      {/* Multi-Child Switcher for Parent */}
      {hasMultipleChildren && (
        <div className="bg-white rounded-2xl p-4 border border-school-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <Users className="w-4 h-4 text-school-600" />
            <span>Viewing Homework For:</span>
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

      {/* Filter and Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-l-4 border-l-school-600">
          <span className="text-xs text-slate-500 font-semibold uppercase block">Total Assigned</span>
          <span className="text-2xl font-black text-slate-900">{tasks.length}</span>
        </Card>

        <Card className="p-4 bg-white border-l-4 border-l-amber-500">
          <span className="text-xs text-slate-500 font-semibold uppercase block">Pending Review</span>
          <span className="text-2xl font-black text-slate-900">
            {tasks.filter((t) => t.status === 'Pending').length}
          </span>
        </Card>

        <Card className="p-4 bg-white border-l-4 border-l-emerald-600">
          <span className="text-xs text-slate-500 font-semibold uppercase block">Submitted</span>
          <span className="text-2xl font-black text-slate-900">
            {tasks.filter((t) => t.status === 'Submitted').length}
          </span>
        </Card>

        <Card className="p-4 bg-white border-l-4 border-l-rose-500">
          <span className="text-xs text-slate-500 font-semibold uppercase block">Overdue</span>
          <span className="text-2xl font-black text-slate-900">
            {tasks.filter((t) => t.status === 'Overdue').length}
          </span>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 ml-1">Status:</span>
          {['All', 'Pending', 'Submitted', 'Overdue'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === status
                  ? 'bg-school-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {availableSubjects.length > 2 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Subject:</span>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700"
            >
              {availableSubjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Homework Cards List */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={BookOpenCheck}
          title="No homework tasks matching your filters"
          message="All set! There are currently no outstanding assignments in this category."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task) => {
            const isSubmitted = task.status === 'Submitted' || task.isSubmitted;
            const isOverdue = task.status === 'Overdue';

            return (
              <Card
                key={task.id || task._id}
                className="p-5 flex flex-col justify-between border-slate-200/90 hover:border-school-300 transition-all shadow-soft-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-school-100 text-school-800">
                      {task.subject}
                    </span>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                        isSubmitted
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : isOverdue
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {isSubmitted ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      <span>{task.status}</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{task.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {task.description || task.instructions}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-500 font-medium">
                    <div>
                      Due: <span className="font-bold text-slate-800">{task.dueDateFormatted || task.dueDate}</span>
                    </div>
                    <div className="text-slate-400">By {task.assignedBy || 'Subject Educator'}</div>
                  </div>

                  <div>
                    {isSubmitted ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Submitted</span>
                      </span>
                    ) : (
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => setSelectedTask(task)}
                        className="bg-school-800 hover:bg-school-900 text-white font-bold text-xs"
                      >
                        Submit Response
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Homework Submission Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpenCheck className="w-5 h-5 text-school-700" />
                <h3 className="text-base font-bold text-slate-900">
                  Submit Homework: {selectedTask.subject}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {submitSuccess ? (
              <div className="py-12 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="text-base font-black text-slate-900">Submission Persisted!</h4>
                <p className="text-xs text-slate-500">
                  Your response has been saved to the database for {currentStudent?.name || 'Student'}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCompleteSubmission} className="space-y-4 mt-4">
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-500">Assignment Topic</h4>
                  <p className="text-sm font-black text-slate-900">{selectedTask.title}</p>
                  <p className="text-xs text-slate-600 mt-1">{selectedTask.description}</p>
                </div>

                <div>
                  <label htmlFor="submission-notes" className="block text-xs font-bold text-slate-700 mb-1">
                    Student Notes / Completion Confirmation:
                  </label>
                  <textarea
                    id="submission-notes"
                    value={submissionNotes}
                    onChange={(e) => setSubmissionNotes(e.target.value)}
                    required
                    placeholder="e.g. Completed Chapter 4 exercises in math notebook. Practiced table 7 to 9."
                    rows={4}
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-school-600"
                  />
                </div>

                <div className="p-3 bg-school-50 rounded-2xl border border-school-200 text-[11px] text-school-900 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-school-700 shrink-0 mt-0.5" />
                  <span>
                    Submitting as <strong>{currentStudent?.name || user?.name}</strong> ({currentStudent?.grade || 'Primary'}). Records are synchronized directly with faculty marks and attendance registry.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTask(null)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isSubmitting || !submissionNotes.trim()}
                    className="bg-school-800 hover:bg-school-900 text-white font-bold"
                  >
                    {isSubmitting ? 'Saving to Database...' : 'Confirm Submission'}
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
