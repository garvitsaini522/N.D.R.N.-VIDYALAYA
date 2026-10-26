import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  Layers,
  Clock,
  BookOpenCheck,
  Award,
  Users,
  Eye,
  EyeOff,
  School,
  X,
  AlertCircle
} from 'lucide-react';
import { DataService } from '../../services/dataService';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const STANDARD_CLASSES = [
  'Nursery',
  'LKG & UKG',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
];

export default function AdminAcademics() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'courses' ? 'courses' : 'classes';
  const [activeTab, setActiveTab] = useState(initialTab); // 'classes' | 'subjects' | 'courses' | 'timetable' | 'homework' | 'results'
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);

  // Modals
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [classForm, setClassForm] = useState({
    name: 'Class 1',
    section: 'A',
    room: 'Room 104',
    capacity: 35,
    classTeacher: 'Mrs. Anjali Mishra',
  });

  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectForm, setSubjectForm] = useState({
    code: 'EVS-01',
    name: 'Environmental Studies',
    grades: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'],
    maxMarks: 100,
  });

  // Course Modal
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [isSavingCourse, setIsSavingCourse] = useState(false);
  const [courseForm, setCourseForm] = useState({
    classGrade: 'Class 1',
    academicSession: '2026-27',
    stage: 'Primary Level',
    age: '6+ Years',
    medium: 'Bilingual (UP Board curriculum standard)',
    timing: '8:00 AM – 2:00 PM (Regular primary hours)',
    weeklyLoad: '32 Periods / Week with prescribed textbooks',
    overview: 'Formal introduction to primary reading, foundational arithmetic, and bilingual language expression.',
    curriculumPoints: [
      'Reading simple sentences in Hindi and English',
      'Addition, subtraction, and single-digit mathematical logic',
    ],
    subjectList: [
      { name: 'Hindi Language', desc: 'Reading & Grammar' },
      { name: 'Mathematics', desc: 'Numbers & Arithmetic' },
    ],
    outcomes: [
      'Independent reading of simple Hindi and English sentences',
      'Single-digit arithmetic calculations',
    ],
    isPublished: true,
  });

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [notification, setNotification] = useState(null);

  const loadData = async () => {
    setClasses(DataService.getClasses());
    setSubjects(DataService.getSubjects());
    setStudents(DataService.getStudents());
    setTeachers(DataService.getTeachers());
    try {
      const crs = await api.getAdminCourses('2026-27');
      const list = Array.isArray(crs) ? crs : (crs?.data || []);
      setCourses(list.length > 0 ? list : DataService.getCourses(false, '2026-27'));
    } catch {
      setCourses(DataService.getCourses(false, '2026-27'));
    }
  };

  useEffect(() => {
    loadData();

    const handleSync = () => loadData();
    window.addEventListener('ndrn:courses-updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('ndrn:courses-updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const handleSaveClass = (e) => {
    e.preventDefault();
    if (!classForm.name || !classForm.section) return;

    if (editingClass) {
      DataService.updateClass(editingClass.id, classForm);
    } else {
      DataService.addClass(classForm);
    }

    loadData();
    setClassModalOpen(false);
  };

  const handleSaveSubject = (e) => {
    e.preventDefault();
    if (!subjectForm.name || !subjectForm.code) return;

    if (editingSubject) {
      DataService.updateSubject(editingSubject.id, subjectForm);
    } else {
      DataService.addSubject(subjectForm);
    }

    loadData();
    setSubjectModalOpen(false);
  };

  const handleOpenCourseModal = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setCourseForm({
        classGrade: course.classGrade || 'Class 1',
        academicSession: course.academicSession || '2026-27',
        stage: course.stage || 'Primary Level',
        age: course.age || '6+ Years',
        medium: course.medium || 'Bilingual (UP Board curriculum standard)',
        timing: course.timing || '8:00 AM – 2:00 PM',
        weeklyLoad: course.weeklyLoad || '32 Periods / Week',
        overview: course.overview || '',
        curriculumPoints: Array.isArray(course.curriculumPoints) && course.curriculumPoints.length > 0 ? [...course.curriculumPoints] : [''],
        subjectList: Array.isArray(course.subjectList) && course.subjectList.length > 0 ? course.subjectList.map((s) => ({ name: s.name || '', desc: s.desc || '' })) : [{ name: '', desc: '' }],
        outcomes: Array.isArray(course.outcomes) && course.outcomes.length > 0 ? [...course.outcomes] : [''],
        isPublished: course.isPublished !== undefined ? Boolean(course.isPublished) : true,
      });
    } else {
      setEditingCourse(null);
      setCourseForm({
        classGrade: 'Class 1',
        academicSession: '2026-27',
        stage: 'Primary Level',
        age: '6+ Years',
        medium: 'Bilingual (UP Board curriculum standard)',
        timing: '8:00 AM – 2:00 PM',
        weeklyLoad: '32 Periods / Week',
        overview: '',
        curriculumPoints: [''],
        subjectList: [{ name: '', desc: '' }],
        outcomes: [''],
        isPublished: true,
      });
    }
    setCourseModalOpen(true);
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.classGrade) return;

    setIsSavingCourse(true);
    try {
      const payload = {
        ...courseForm,
        curriculumPoints: (courseForm.curriculumPoints || []).filter((p) => p && p.trim()),
        subjectList: (courseForm.subjectList || []).filter((s) => s.name && s.name.trim()),
        outcomes: (courseForm.outcomes || []).filter((o) => o && o.trim()),
      };

      if (editingCourse) {
        await api.updateCourse(editingCourse.id || editingCourse._id, payload);
        setNotification({ type: 'success', message: `Course details for ${courseForm.classGrade} updated successfully.` });
      } else {
        await api.createCourse(payload);
        setNotification({ type: 'success', message: `Course specifications for ${courseForm.classGrade} created.` });
      }

      setCourseModalOpen(false);
      setEditingCourse(null);
      await loadData();
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to save course specifications.' });
    } finally {
      setIsSavingCourse(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleTogglePublishCourse = async (course) => {
    try {
      const targetId = course.id || course._id;
      const nextPublished = !course.isPublished;
      await api.togglePublishCourse(targetId, nextPublished);
      setNotification({
        type: 'success',
        message: `${course.classGrade} course details ${nextPublished ? 'published' : 'unpublished'} successfully.`,
      });
      await loadData();
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to toggle publication status.' });
    } finally {
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'class') {
      DataService.deleteClass(itemToDelete.id);
    } else if (itemToDelete.type === 'subject') {
      DataService.deleteSubject(itemToDelete.id);
    } else if (itemToDelete.type === 'course') {
      await api.deleteCourse(itemToDelete.id);
      setNotification({ type: 'success', message: `Removed course specifications for ${itemToDelete.name}` });
      setTimeout(() => setNotification(null), 3000);
    }

    loadData();
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-school-700 uppercase tracking-widest block mb-1">
            CURRICULUM & COHORTS • NURSERY TO CLASS 5
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Academic Management Console
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure primary classes, curriculum subject definitions, weekly timetables, homework rosters, and term evaluation results.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'classes' && (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => {
                setEditingClass(null);
                setClassForm({
                  name: 'Class 1',
                  section: 'A',
                  room: 'Room 104',
                  capacity: 35,
                  classTeacher: teachers[0]?.name || 'Faculty Incharge',
                });
                setClassModalOpen(true);
              }}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Class Cohort
            </Button>
          )}

          {activeTab === 'courses' && (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => handleOpenCourseModal()}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Course Specification
            </Button>
          )}

          {activeTab === 'subjects' && (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => {
                setEditingSubject(null);
                setSubjectForm({
                  code: 'SUB-01',
                  name: 'New Primary Subject',
                  grades: ['Class 1', 'Class 2', 'Class 3'],
                  maxMarks: 100,
                });
                setSubjectModalOpen(true);
              }}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Subject
            </Button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
            notification.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-slate-200 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('classes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'classes'
              ? 'bg-school-700 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Classes ({classes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('courses')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'courses'
              ? 'bg-school-700 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Course Specifications ({courses.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('subjects')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'subjects'
              ? 'bg-school-700 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Subjects ({subjects.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('timetable')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'timetable'
              ? 'bg-school-700 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Timetable Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('homework')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'homework'
              ? 'bg-school-700 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpenCheck className="w-4 h-4" />
          <span>Homework Ledger</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('results')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'results'
              ? 'bg-school-700 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Scholastic Results</span>
        </button>
      </div>

      {/* Tab 1: Classes Grid */}
      {activeTab === 'classes' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {classes.map((cls) => {
            const enrolled = students.filter((s) => s.grade === cls.name).length;
            return (
              <Card key={cls.id} className="p-5 bg-white border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-extrabold text-slate-900">{cls.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-school-100 text-school-800">
                    Sec {cls.section}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-500 mb-4">
                  <div>Classroom: <strong className="text-slate-700">{cls.room}</strong></div>
                  <div>Class Teacher: <strong className="text-slate-700">{cls.classTeacher}</strong></div>
                  <div>Enrolled: <strong className="text-school-700">{enrolled}</strong> / {cls.capacity} students</div>
                </div>

                {/* Capacity progress bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-4">
                  <div
                    className="bg-school-600 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (enrolled / cls.capacity) * 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingClass(cls);
                      setClassForm({
                        name: cls.name,
                        section: cls.section,
                        room: cls.room,
                        capacity: cls.capacity,
                        classTeacher: cls.classTeacher,
                      });
                      setClassModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-school-700 hover:bg-slate-100"
                    title="Edit Class"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setItemToDelete({ type: 'class', id: cls.id, name: `${cls.name} ${cls.section}` });
                      setDeleteConfirmOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    title="Delete Class"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Tab: Course Specifications */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-school-50 to-cream-50 border border-school-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <h4 className="font-extrabold text-school-900 text-sm flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-school-700" />
                <span>Class-Specific Course & Curriculum Specifications</span>
              </h4>
              <p className="text-slate-600 mt-0.5">
                Each class from Nursery to Class 5 has independent syllabus, daily timings, instruction medium, weekly loads, and learning outcomes. All changes automatically update the public website.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleOpenCourseModal()}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Course Specification
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((crs) => (
              <Card key={crs.id || crs._id} className="p-5 bg-white border border-slate-200 flex flex-col justify-between hover:shadow-soft-sm transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-slate-900">{crs.classGrade}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-school-100 text-school-800">
                        {crs.stage || 'Primary Level'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTogglePublishCourse(crs)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                        crs.isPublished
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                      title={crs.isPublished ? 'Click to Unpublish' : 'Click to Publish'}
                    >
                      {crs.isPublished ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-amber-600" />}
                      <span>{crs.isPublished ? 'Published' : 'Draft'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {crs.overview || 'Standard foundational educational specifications for this class.'}
                  </p>

                  <div className="space-y-1.5 text-[11px] text-slate-600 border-t border-slate-100 pt-2.5">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-school-600 shrink-0" />
                      <span><strong>Timing:</strong> {crs.timing || '8:00 AM – 2:00 PM'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <School className="w-3.5 h-3.5 text-school-600 shrink-0" />
                      <span><strong>Medium:</strong> {crs.medium || 'Bilingual (UP Board)'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-school-600 shrink-0" />
                      <span><strong>Schedule:</strong> {crs.weeklyLoad || '32 Periods/Week'}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                      <span className="font-bold text-slate-700">Subject Modules:</span>
                      <span className="font-semibold text-school-700">{crs.subjectList?.length || 0} Modules</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(crs.subjectList || []).slice(0, 3).map((sub, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 max-w-[130px] truncate">
                          {sub.name}
                        </span>
                      ))}
                      {(crs.subjectList?.length || 0) > 3 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                          +{crs.subjectList.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-1.5 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Key Outcomes:</span>
                    <span className="font-semibold text-slate-700">{crs.outcomes?.length || 0} milestones</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 mt-3">
                  <button
                    type="button"
                    onClick={() => handleOpenCourseModal(crs)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-school-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    title={`Edit ${crs.classGrade} Course`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setItemToDelete({ type: 'course', id: crs.id || crs._id, name: `${crs.classGrade} Course Specifications` });
                      setDeleteConfirmOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title={`Delete ${crs.classGrade} Course`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Subjects Table */}
      {activeTab === 'subjects' && (
        <Card className="bg-white border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3.5 pl-6">Subject Code</th>
                  <th className="p-3.5">Subject Name</th>
                  <th className="p-3.5">Applicable Grades</th>
                  <th className="p-3.5">Max Marks</th>
                  <th className="p-3.5 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 pl-6 font-mono font-bold text-school-700">{sub.code}</td>
                    <td className="p-3.5 font-bold text-slate-900">{sub.name}</td>
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {sub.grades.map((g) => (
                          <span key={g} className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {g}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">{sub.maxMarks}</td>
                    <td className="p-3.5 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSubject(sub);
                            setSubjectForm({
                              code: sub.code,
                              name: sub.name,
                              grades: sub.grades,
                              maxMarks: sub.maxMarks,
                            });
                            setSubjectModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-school-700 hover:bg-slate-100"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setItemToDelete({ type: 'subject', id: sub.id, name: sub.name });
                            setDeleteConfirmOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: Timetable Overview */}
      {activeTab === 'timetable' && (
        <Card className="p-6 bg-white border border-slate-200">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Primary Section Class Routine</h3>
              <p className="text-xs text-slate-500">Daulatyarpur campus daily period allocation</p>
            </div>
            <span className="text-xs font-bold text-school-700 bg-school-50 px-2.5 py-1 rounded-full border border-school-200">
              Active Session 2026-27
            </span>
          </div>

          <div className="py-12 text-center text-slate-400 text-xs">
            <Clock className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-700 text-sm">No class routine schedules configured yet.</p>
            <p className="text-slate-500 mt-1 max-w-md mx-auto">
              Period allocations and daily routines will appear here once finalized by the academic coordinator.
            </p>
          </div>
        </Card>
      )}

      {/* Tab 4: Homework Ledger */}
      {activeTab === 'homework' && (
        <Card className="p-6 bg-white border border-slate-200">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Active Primary Assignments</h3>
              <p className="text-xs text-slate-500">Homework tasks issued to Nursery - Class 5 students</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Session 2026-27
            </span>
          </div>

          <div className="py-12 text-center text-slate-400 text-xs">
            <BookOpenCheck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-700 text-sm">No active homework assignments recorded.</p>
            <p className="text-slate-500 mt-1 max-w-md mx-auto">
              Assignments posted by faculty members will be listed here for monitoring.
            </p>
          </div>
        </Card>
      )}

      {/* Tab 5: Scholastic Results */}
      {activeTab === 'results' && (
        <Card className="p-6 bg-white border border-slate-200">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Term Evaluation Standing</h3>
              <p className="text-xs text-slate-500">Class 5 & Primary scholastic grades overview</p>
            </div>
            <span className="text-xs font-bold text-school-700">Session 2026-27</span>
          </div>

          {students.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <GraduationCap className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-slate-700 text-sm">No student evaluation records found.</p>
              <p className="text-slate-500 mt-1 max-w-md mx-auto">
                Term evaluation standing will be displayed here once students are enrolled and grades are recorded.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Student</th>
                    <th className="p-2.5">Class</th>
                    <th className="p-2.5">Term Grade</th>
                    <th className="p-2.5">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/60">
                      <td className="p-2.5 font-bold text-slate-900">{s.name}</td>
                      <td className="p-2.5 text-slate-700">{s.grade}-{s.section || 'A'}</td>
                      <td className="p-2.5 font-bold text-school-700">{s.termGrade || '—'}</td>
                      <td className="p-2.5 text-slate-500">{s.remarks || 'Enrolled student'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Class Modal */}
      <Modal
        isOpen={classModalOpen}
        onClose={() => setClassModalOpen(false)}
        title={editingClass ? `Edit Cohort: ${editingClass.name}` : 'Create Class Cohort'}
        subtitle="Daulatyarpur Campus • Nursery to Class 5"
        footer={
          <>
            <button
              type="button"
              onClick={() => setClassModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <Button type="submit" form="class-form" variant="primary" size="sm">
              {editingClass ? 'Save Changes' : 'Create Class'}
            </Button>
          </>
        }
      >
        <form id="class-form" onSubmit={handleSaveClass} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Class Grade Name *</label>
              <select
                value={classForm.name}
                onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600 font-bold"
              >
                {['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Section *</label>
              <input
                type="text"
                required
                value={classForm.section}
                onChange={(e) => setClassForm({ ...classForm, section: e.target.value })}
                placeholder="A"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Room Number</label>
              <input
                type="text"
                value={classForm.room}
                onChange={(e) => setClassForm({ ...classForm, room: e.target.value })}
                placeholder="Room 104"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Student Capacity</label>
              <input
                type="number"
                value={classForm.capacity}
                onChange={(e) => setClassForm({ ...classForm, capacity: Number(e.target.value) })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Class Teacher Incharge</label>
              <select
                value={classForm.classTeacher}
                onChange={(e) => setClassForm({ ...classForm, classTeacher: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.name}>{t.name} ({t.designation})</option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Subject Modal */}
      <Modal
        isOpen={subjectModalOpen}
        onClose={() => setSubjectModalOpen(false)}
        title={editingSubject ? `Edit Subject: ${editingSubject.name}` : 'Add Primary Subject'}
        subtitle="Daulatyarpur Campus"
        footer={
          <>
            <button
              type="button"
              onClick={() => setSubjectModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <Button type="submit" form="subject-form" variant="primary" size="sm">
              {editingSubject ? 'Save Changes' : 'Create Subject'}
            </Button>
          </>
        }
      >
        <form id="subject-form" onSubmit={handleSaveSubject} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Subject Code *</label>
              <input
                type="text"
                required
                value={subjectForm.code}
                onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                placeholder="e.g. MTH-01"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Subject Name *</label>
              <input
                type="text"
                required
                value={subjectForm.name}
                onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                placeholder="e.g. Mathematics"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Maximum Marks</label>
              <input
                type="number"
                value={subjectForm.maxMarks}
                onChange={(e) => setSubjectForm({ ...subjectForm, maxMarks: Number(e.target.value) })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Course Specifications Modal */}
      <Modal
        isOpen={courseModalOpen}
        onClose={() => setCourseModalOpen(false)}
        title={editingCourse ? `Edit Course Details: ${editingCourse.classGrade}` : 'Add Course Specifications'}
        subtitle="Educational Continuum • Nursery to Class 5"
        maxWidth="max-w-2xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setCourseModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <Button
              type="submit"
              form="course-form"
              variant="primary"
              size="sm"
              disabled={isSavingCourse}
            >
              {isSavingCourse ? 'Saving Course...' : editingCourse ? 'Update Course Details' : 'Create Course Details'}
            </Button>
          </>
        }
      >
        <form id="course-form" onSubmit={handleSaveCourse} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Class / Grade *</label>
              <select
                required
                value={courseForm.classGrade}
                onChange={(e) => setCourseForm({ ...courseForm, classGrade: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              >
                {STANDARD_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Academic Session *</label>
              <input
                type="text"
                required
                value={courseForm.academicSession}
                onChange={(e) => setCourseForm({ ...courseForm, academicSession: e.target.value })}
                placeholder="2026-27"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Educational Stage</label>
              <input
                type="text"
                value={courseForm.stage}
                onChange={(e) => setCourseForm({ ...courseForm, stage: e.target.value })}
                placeholder="e.g. Primary Level"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Appropriate Age</label>
              <input
                type="text"
                value={courseForm.age}
                onChange={(e) => setCourseForm({ ...courseForm, age: e.target.value })}
                placeholder="e.g. 6+ Years"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Daily Timings</label>
              <input
                type="text"
                value={courseForm.timing}
                onChange={(e) => setCourseForm({ ...courseForm, timing: e.target.value })}
                placeholder="8:00 AM – 2:00 PM"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Instruction Medium</label>
              <input
                type="text"
                value={courseForm.medium}
                onChange={(e) => setCourseForm({ ...courseForm, medium: e.target.value })}
                placeholder="Bilingual (UP Board curriculum standard)"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Weekly Period Load</label>
              <input
                type="text"
                value={courseForm.weeklyLoad}
                onChange={(e) => setCourseForm({ ...courseForm, weeklyLoad: e.target.value })}
                placeholder="32 Periods / Week with prescribed textbooks"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Course Overview & Philosophy</label>
              <textarea
                rows={3}
                value={courseForm.overview}
                onChange={(e) => setCourseForm({ ...courseForm, overview: e.target.value })}
                placeholder="Comprehensive class overview..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>
          </div>

          {/* Subject Modules List */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-800">
                Prescribed Subject Modules & Curricular Focus ({courseForm.subjectList?.length || 0})
              </label>
              <button
                type="button"
                onClick={() => setCourseForm({
                  ...courseForm,
                  subjectList: [...(courseForm.subjectList || []), { name: '', desc: '' }],
                })}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-school-700 hover:text-school-800 px-2 py-1 bg-school-50 rounded-lg cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Subject</span>
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {(courseForm.subjectList || []).map((sub, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      placeholder="Subject Name (e.g. Mathematics, Hindi)"
                      value={sub.name}
                      onChange={(e) => {
                        const next = [...courseForm.subjectList];
                        next[idx].name = e.target.value;
                        setCourseForm({ ...courseForm, subjectList: next });
                      }}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Syllabus description / core focus"
                      value={sub.desc}
                      onChange={(e) => {
                        const next = [...courseForm.subjectList];
                        next[idx].desc = e.target.value;
                        setCourseForm({ ...courseForm, subjectList: next });
                      }}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = courseForm.subjectList.filter((_, i) => i !== idx);
                      setCourseForm({ ...courseForm, subjectList: next });
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 mt-1 cursor-pointer"
                    title="Remove subject"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Key Outcomes List */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-800">
                Key Learning Outcomes & Developmental Milestones ({courseForm.outcomes?.length || 0})
              </label>
              <button
                type="button"
                onClick={() => setCourseForm({
                  ...courseForm,
                  outcomes: [...(courseForm.outcomes || []), ''],
                })}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-school-700 hover:text-school-800 px-2 py-1 bg-school-50 rounded-lg cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Outcome</span>
              </button>
            </div>

            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {(courseForm.outcomes || []).map((out, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Independent reading of simple sentences..."
                    value={out}
                    onChange={(e) => {
                      const next = [...courseForm.outcomes];
                      next[idx] = e.target.value;
                      setCourseForm({ ...courseForm, outcomes: next });
                    }}
                    className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const next = courseForm.outcomes.filter((_, i) => i !== idx);
                      setCourseForm({ ...courseForm, outcomes: next });
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Published Toggle */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <span className="font-bold text-slate-700">Display on Public Website</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={courseForm.isPublished}
                onChange={(e) => setCourseForm({ ...courseForm, isPublished: e.target.checked })}
                className="rounded border-slate-300 text-school-600 focus:ring-school-600"
              />
              <span className="text-xs text-slate-600 font-medium">Active & Published</span>
            </label>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Academic Item"
        message={`Are you sure you want to delete ${itemToDelete?.name}?`}
        confirmText="Confirm Delete"
        type="danger"
      />
    </div>
  );
}
