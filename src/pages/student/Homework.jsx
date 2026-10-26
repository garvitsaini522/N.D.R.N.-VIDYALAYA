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
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DataService } from '../../services/dataService';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';

export default function StudentHomework() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('All');
  const [selectedTask, setSelectedTask] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const homework = DataService.getHomeworkTasks(user?.grade);
    setTasks(homework || []);
  }, [user]);

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'All') return true;
    return t.status === filter;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-school-700 uppercase tracking-widest block mb-1">
            ACADEMIC HOME DESK • PRIMARY LESSON REVISION
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Daily Homework & Activity Assignments
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Session 2026-27 • {user?.grade || 'Primary Wing'} • Daulatyarpur, Madhoganj
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          {['All', 'Pending', 'Submitted', 'Graded'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === f
                  ? 'bg-white text-school-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {tasks.length === 0 ? (
        <Card className="p-12 text-center bg-white border border-slate-200">
          <BookOpenCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Homework Assignments Issued Yet</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
            Your class educators have not posted any pending home revision tasks at this time. Please check your notebook for daily classroom instructions.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTasks.map((t) => (
            <Card key={t.id} className="p-5 bg-white border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-school-700 bg-school-50 px-2.5 py-0.5 rounded-full border border-school-200">
                    {t.subject}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">{t.dueDate}</span>
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm mb-1">{t.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-3">{t.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">{t.teacher}</span>
                <Button size="sm" variant="outline" onClick={() => setSelectedTask(t)}>
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedTask && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedTask(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedTask(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-xs font-bold text-school-700 bg-school-50 px-3 py-1 rounded-full border border-school-200 mb-2 inline-block">
              {selectedTask.subject}
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-2">{selectedTask.title}</h3>
            <p className="text-xs text-slate-500 mt-1">Due: {selectedTask.dueDate} • Assigned by {selectedTask.teacher}</p>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 mt-4 leading-relaxed">
              {selectedTask.description}
            </div>

            <div className="mt-6 flex justify-end">
              <Button size="sm" variant="secondary" onClick={() => setSelectedTask(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
