import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Phone,
  Mail,
  Edit2,
  Trash2,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  UserCheck,
  Search,
  Filter,
  Shield,
  Briefcase
} from 'lucide-react';
import { DataService } from '../../services/dataService';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import SearchInput from '../../components/common/SearchInput';

const AVAILABLE_CLASSES = ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];
const AVAILABLE_SUBJECTS = [
  'English',
  'Hindi (Sahitya & Vyakaran)',
  'Mathematics',
  'Environmental Studies (EVS)',
  'Art & Craft',
  'Physical Education & Games',
  'Early Language & Rhymes',
  'Moral Science & General Knowledge',
];

const INITIAL_TEACHER_FORM = {
  name: '',
  gender: 'Female',
  designation: 'Primary Educator',
  email: '',
  phone: '',
  qualification: 'B.A., B.Ed.',
  experience: '3 Years',
  assignedClasses: ['Class 1'],
  primarySubjects: ['English'],
  classTeacherOf: '',
  status: 'Active',
};

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [teacherToAssign, setTeacherToAssign] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [form, setForm] = useState(INITIAL_TEACHER_FORM);

  const loadData = () => {
    setTeachers(DataService.getTeachers());
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = teachers.filter((t) => {
    const matchStatus = statusFilter === 'All' || t.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.designation.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      (t.primarySubjects && t.primarySubjects.some((s) => s.toLowerCase().includes(q))) ||
      (t.assignedClasses && t.assignedClasses.some((c) => c.toLowerCase().includes(q)));

    return matchStatus && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedTeachers = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpenAddModal = () => {
    setEditingTeacher(null);
    setForm(INITIAL_TEACHER_FORM);
    setModalOpen(true);
  };

  const handleOpenEditModal = (teacher) => {
    setEditingTeacher(teacher);
    setForm({
      name: teacher.name || '',
      gender: teacher.gender || 'Female',
      designation: teacher.designation || 'Primary Educator',
      email: teacher.email || '',
      phone: teacher.phone || '',
      qualification: teacher.qualification || '',
      experience: teacher.experience || '',
      assignedClasses: teacher.assignedClasses || [],
      primarySubjects: teacher.primarySubjects || [],
      classTeacherOf: teacher.classTeacherOf || '',
      status: teacher.status || 'Active',
    });
    setModalOpen(true);
  };

  const handleSaveTeacher = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;

    if (editingTeacher) {
      DataService.updateTeacher(editingTeacher.id, form);
    } else {
      DataService.addTeacher(form);
    }

    loadData();
    setModalOpen(false);
  };

  const handleToggleClassAssignment = (clsName) => {
    const current = form.assignedClasses || [];
    if (current.includes(clsName)) {
      setForm({ ...form, assignedClasses: current.filter((c) => c !== clsName) });
    } else {
      setForm({ ...form, assignedClasses: [...current, clsName] });
    }
  };

  const handleToggleSubjectAssignment = (subName) => {
    const current = form.primarySubjects || [];
    if (current.includes(subName)) {
      setForm({ ...form, primarySubjects: current.filter((s) => s !== subName) });
    } else {
      setForm({ ...form, primarySubjects: [...current, subName] });
    }
  };

  const handleToggleStatus = (teacher) => {
    const nextStatus = teacher.status === 'Active' ? 'Inactive' : 'Active';
    DataService.updateTeacher(teacher.id, { status: nextStatus });
    loadData();
  };

  const handleConfirmDelete = () => {
    if (teacherToDelete) {
      DataService.deleteTeacher(teacherToDelete.id);
      loadData();
      setDeleteConfirmOpen(false);
      setTeacherToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-school-700 uppercase tracking-widest block mb-1">
            FACULTY MANAGEMENT • PRIMARY WING
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Teacher & Educator Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage primary educators, assign class responsibilities, allocate curriculum subjects, and update contact profiles.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={handleOpenAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Faculty Member
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 bg-white border border-slate-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="w-full md:w-80">
            <SearchInput
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val);
                setCurrentPage(1);
              }}
              placeholder="Search teacher, subject, class..."
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-school-600"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive / On Leave</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Teachers Table */}
      <Card className="bg-white border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5 pl-6">Faculty Member</th>
                <th className="p-3.5">Designation & Degree</th>
                <th className="p-3.5">Assigned Classes</th>
                <th className="p-3.5">Primary Subjects</th>
                <th className="p-3.5">Class Teacher</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedTeachers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No teacher records found matching criteria.
                  </td>
                </tr>
              ) : (
                paginatedTeachers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Faculty Name */}
                    <td className="p-3.5 pl-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-school-100 text-school-800 font-bold flex items-center justify-center shrink-0">
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900">{t.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">{t.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Designation & Qualifications */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-800">{t.designation}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {t.qualification} • {t.experience}
                      </div>
                    </td>

                    {/* Assigned Classes */}
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {t.assignedClasses && t.assignedClasses.length > 0 ? (
                          t.assignedClasses.map((cls) => (
                            <span
                              key={cls}
                              className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700"
                            >
                              {cls}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </div>
                    </td>

                    {/* Primary Subjects */}
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {t.primarySubjects && t.primarySubjects.length > 0 ? (
                          t.primarySubjects.map((sub) => (
                            <span
                              key={sub}
                              className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-school-50 text-school-800 border border-school-200"
                            >
                              {sub}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </div>
                    </td>

                    {/* Class Teacher of */}
                    <td className="p-3.5">
                      {t.classTeacherOf ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-gold-100 text-gold-900 border border-gold-300">
                          {t.classTeacherOf}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(t)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                          t.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                        title="Click to toggle status"
                      >
                        {t.status || 'Active'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(t)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-school-700 hover:bg-slate-100"
                          title="Edit Teacher"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setTeacherToDelete(t);
                            setDeleteConfirmOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Deactivate / Remove"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add / Edit Teacher Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTeacher ? `Edit Faculty: ${editingTeacher.name}` : 'Appoint New Educator'}
        subtitle="Daulatyarpur, Madhoganj Campus • Nursery to Class 5 Primary Section"
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <Button type="submit" form="teacher-form" variant="primary" size="sm">
              {editingTeacher ? 'Save Changes' : 'Register Educator'}
            </Button>
          </>
        }
      >
        <form id="teacher-form" onSubmit={handleSaveTeacher} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Mrs. Priya Sharma"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Designation / Role *
              </label>
              <input
                type="text"
                required
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                placeholder="e.g. Primary Lead Educator & Coordinator"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Contact Phone *
              </label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Enter contact phone"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Institutional Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Enter educator email"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Qualifications & Degree
              </label>
              <input
                type="text"
                value={form.qualification}
                onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                placeholder="e.g. M.A. (English), B.Ed."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Teaching Experience
              </label>
              <input
                type="text"
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
                placeholder="e.g. 8 Years"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Class Teacher Responsibility
              </label>
              <select
                value={form.classTeacherOf}
                onChange={(e) => setForm({ ...form, classTeacherOf: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              >
                <option value="">None (Subject Teacher)</option>
                <option value="Nursery-A">Nursery - Section A</option>
                <option value="LKG-A">LKG - Section A</option>
                <option value="UKG-A">UKG - Section A</option>
                <option value="Class 1-A">Class 1 - Section A</option>
                <option value="Class 2-A">Class 2 - Section A</option>
                <option value="Class 3-A">Class 3 - Section A</option>
                <option value="Class 4-A">Class 4 - Section A</option>
                <option value="Class 5-A">Class 5 - Section A</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive / On Leave</option>
              </select>
            </div>
          </div>

          {/* Assigned Classes Multi-Check */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block font-bold text-slate-700 mb-1.5">
              Assigned Classes (Select all that apply)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {AVAILABLE_CLASSES.map((cls) => {
                const isSelected = form.assignedClasses?.includes(cls);
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => handleToggleClassAssignment(cls)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all text-center ${
                      isSelected
                        ? 'bg-school-700 text-white border-school-700 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {cls}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assigned Subjects Multi-Check */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block font-bold text-slate-700 mb-1.5">
              Assigned Teaching Subjects
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {AVAILABLE_SUBJECTS.map((sub) => {
                const isSelected = form.primarySubjects?.includes(sub);
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => handleToggleSubjectAssignment(sub)}
                    className={`py-1.5 px-2.5 rounded-xl text-[11px] font-bold border transition-all text-left flex items-center justify-between ${
                      isSelected
                        ? 'bg-school-50 text-school-900 border-school-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{sub}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-school-700" />}
                  </button>
                );
              })}
            </div>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remove Faculty Member"
        message={`Are you sure you want to remove ${teacherToDelete?.name} from active faculty rosters?`}
        confirmText="Remove Teacher"
        type="danger"
      />
    </div>
  );
}
