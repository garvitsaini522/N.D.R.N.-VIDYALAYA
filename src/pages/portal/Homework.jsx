import React, { useState, useEffect } from 'react';
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
import { portalApi } from '../../services/portalApi';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';

export default function Homework() {
  const { user } = useAuth();
  const {
    currentStudent,
    availableWards,
    activeWardId,
    switchWard,
    hasMultipleChildren,
    isParent,
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

  useEffect(() => {
    let isMounted = true;

    async function loadHomework() {
      if (!currentStudent) return;
      setLoading(true);
      setError(null);

      try {
        const grade = currentStudent.grade || 'Class 5-A';
        const res = await portalApi.getHomework(grade);

        if (isMounted) {
          setTasks(res.data || []);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load homework assignments.');
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
    try {
      await portalApi.submitHomework(selectedTask.id, {
        submissionNotes,
        studentName: currentStudent.name,
      });

      setTasks(
        tasks.map((t) =>
          t.id === selectedTask.id
            ? { ...t, status: 'Submitted', submissionDate: 'Just now' }
            : t
        )
      );

      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setSelectedTask(null);
        setSubmissionNotes('');
      }, 1500);
    } catch {
      alert('Could not submit task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading primary homework tasks..." />;
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
          Homework & Assignments ({currentStudent?.grade})
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

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['All', 'Pending', 'Submitted', 'Graded'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === status
                  ? 'bg-school-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Subject Filter Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 shrink-0">Subject:</span>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-school-600 w-full sm:w-auto"
          >
            {availableSubjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Homework Cards List */}
      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((hw) => (
            <Card
              key={hw.id}
              className="p-5 flex flex-col justify-between hover:border-school-200 transition-all border border-slate-200/80"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-school-100 text-school-800">
                    {hw.subject}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      hw.status === 'Graded'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : hw.status === 'Submitted'
                        ? 'bg-saffron-100 text-saffron-800 border border-saffron-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {hw.status}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  {hw.title}
                </h3>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {hw.description}
                </p>

                {/* If Graded: Show Teacher Feedback */}
                {hw.status === 'Graded' && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-900 mb-1">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Teacher Assessment</span>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-200/70 text-emerald-900">
                        {hw.gradeMarks || 'A+ (20/20)'}
                      </span>
                    </div>
                    {hw.feedback && (
                      <p className="text-[11px] text-emerald-800 italic">"{hw.feedback}"</p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block">Assigned by {hw.teacher}</span>
                  <span className="font-semibold text-rose-600 text-[11px]">Due: {hw.dueDate}</span>
                </div>

                {hw.status === 'Pending' && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => setSelectedTask(hw)}
                    className="text-xs"
                  >
                    Submit Notes
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No assignments match filter"
          message="Try selecting 'All' to view all curriculum assignments."
        />
      )}

      {/* Homework Submission Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Submit Homework: {selectedTask.subject}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Recording completion for <span className="font-bold text-slate-700">{selectedTask.title}</span>.
            </p>

            {submitSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="text-xs font-bold text-emerald-800">Assignment Submitted</div>
                <p className="text-[11px] text-emerald-600">
                  Your work notes have been recorded. The teacher will evaluate your notebook during tomorrow's morning period.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCompleteSubmission} className="space-y-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <span className="font-bold text-slate-700 block mb-0.5">Task Instructions:</span>
                  <p className="text-slate-600">{selectedTask.description}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Student Completion Notes (Rough working / Questions solved)
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={submissionNotes}
                    onChange={(e) => setSubmissionNotes(e.target.value)}
                    placeholder="e.g. Completed all 10 problems in notebook. Q5 checked with parent."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-school-600 resize-none"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTask(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                    {isSubmitting ? 'Recording...' : 'Mark as Completed'}
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
