import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  Phone,
  Mail,
  CreditCard,
  CalendarCheck2,
  Edit2,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  UserCheck,
  Filter,
  Eye,
  Bus,
  RefreshCw,
  Building
} from 'lucide-react';
import { DataService } from '../../services/dataService';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import SearchInput from '../../components/common/SearchInput';

const CLASS_OPTIONS = [
  'Nursery',
  'LKG',
  'UKG',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
];

const INITIAL_FORM_STATE = {
  name: '',
  rollNo: '',
  grade: 'Class 5',
  section: 'A',
  gender: 'Male',
  dob: '',
  parentName: '',
  parentPhone: '',
  parentEmail: '',
  address: 'Daulatyarpur, Madhoganj',
  house: 'Ganga House',
  bloodGroup: 'B+',
  busRoute: 'Route 3 - Madhoganj Bus Stand',
  status: 'Active',
  feeStatus: 'Paid',
  pendingFeeAmount: 0,
};

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewStudentModal, setViewStudentModal] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM_STATE);

  const loadStudents = () => {
    setStudents(DataService.getStudents());
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // Filtered List
  const filtered = students.filter((s) => {
    const matchClass = classFilter === 'All' || s.grade === classFilter;
    const matchStatus = statusFilter === 'All' || s.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      (s.rollNo && s.rollNo.toString().includes(q)) ||
      (s.parentName && s.parentName.toLowerCase().includes(q)) ||
      (s.parentPhone && s.parentPhone.includes(q));

    return matchClass && matchStatus && matchSearch;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedStudents = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setForm(INITIAL_FORM_STATE);
    setModalOpen(true);
  };

  const handleOpenEditModal = (student) => {
    setEditingStudent(student);
    setForm({
      name: student.name || '',
      rollNo: student.rollNo || '',
      grade: student.grade || 'Class 5',
      section: student.section || 'A',
      gender: student.gender || 'Male',
      dob: student.dob || '',
      parentName: student.parentName || '',
      parentPhone: student.parentPhone || '',
      parentEmail: student.parentEmail || '',
      address: student.address || 'Daulatyarpur, Madhoganj',
      house: student.house || 'Ganga House',
      bloodGroup: student.bloodGroup || 'B+',
      busRoute: student.busRoute || 'Walking / Self',
      status: student.status || 'Active',
      feeStatus: student.feeStatus || 'Paid',
      pendingFeeAmount: student.pendingFeeAmount || 0,
    });
    setModalOpen(true);
  };

  const handleSaveStudent = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.parentName.trim() || !form.parentPhone.trim()) {
      return;
    }

    if (editingStudent) {
      DataService.updateStudent(editingStudent.id, form);
    } else {
      DataService.addStudent(form);
    }

    loadStudents();
    setModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (studentToDelete) {
      DataService.deleteStudent(studentToDelete.id);
      loadStudents();
      setDeleteConfirmOpen(false);
      setStudentToDelete(null);
    }
  };

  const handleToggleStatus = (student) => {
    const nextStatus = student.status === 'Active' ? 'Inactive' : 'Active';
    DataService.updateStudent(student.id, { status: nextStatus });
    loadStudents();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-school-700 uppercase tracking-widest block mb-1">
            ACADEMIC REGISTRY • NURSERY TO CLASS 5
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Student Management Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage primary enrollments, assign classes, update guardian phone numbers, and monitor student status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleOpenAddModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Enroll New Student
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white border border-slate-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="w-full md:w-80">
            <SearchInput
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val);
                setCurrentPage(1);
              }}
              placeholder="Search by student name, roll #, parent..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Class Filter */}
            <select
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-school-600"
            >
              <option value="All">All Classes (Nursery - 5)</option>
              {CLASS_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Status Filter */}
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
              <option value="Inactive">Inactive / Suspended</option>
            </select>

            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setClassFilter('All');
                setStatusFilter('All');
                setCurrentPage(1);
              }}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors text-xs font-semibold flex items-center gap-1"
              title="Reset Filters"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Students Data Table */}
      <Card className="bg-white border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5 pl-6">Student Info</th>
                <th className="p-3.5">Class / Section</th>
                <th className="p-3.5">Guardian Contact</th>
                <th className="p-3.5">Attendance</th>
                <th className="p-3.5">Fee Status</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No student records matching current filters.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Student Info */}
                    <td className="p-3.5 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-school-100 text-school-800 font-bold flex items-center justify-center shrink-0">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                            <span>{s.name}</span>
                            <span className="text-[10px] font-normal text-slate-400">
                              (Roll #{s.rollNo})
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            ID: {s.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Class / Section */}
                    <td className="p-3.5 font-bold text-slate-800">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-slate-100 border border-slate-200 text-slate-800 font-bold">
                        {s.grade} - {s.section || 'A'}
                      </span>
                    </td>

                    {/* Guardian Contact */}
                    <td className="p-3.5 text-slate-700">
                      <div className="font-semibold text-slate-800">{s.parentName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{s.parentPhone}</span>
                      </div>
                    </td>

                    {/* Attendance */}
                    <td className="p-3.5 font-bold text-slate-800">
                      <span
                        className={`text-xs ${
                          (s.attendancePercent || 95) >= 90
                            ? 'text-emerald-700'
                            : (s.attendancePercent || 95) >= 75
                            ? 'text-amber-700'
                            : 'text-rose-700'
                        }`}
                      >
                        {s.attendancePercent || 95}%
                      </span>
                    </td>

                    {/* Fee Status */}
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.feeStatus === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {s.feeStatus === 'Paid' ? 'Paid' : `Due (₹${s.pendingFeeAmount || 3200})`}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(s)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                          s.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                        title="Click to toggle status"
                      >
                        {s.status || 'Active'}
                      </button>
                    </td>

                    {/* Action Buttons */}
                    <td className="p-3.5 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewStudentModal(s)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-school-700 hover:bg-slate-100"
                          title="View Full Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(s)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-school-700 hover:bg-slate-100"
                          title="Edit Student"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setStudentToDelete(s);
                            setDeleteConfirmOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Deactivate / Delete"
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

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingStudent ? `Edit Student: ${editingStudent.name}` : 'Enroll New Student'}
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
            <Button type="submit" form="student-form" variant="primary" size="sm">
              {editingStudent ? 'Save Changes' : 'Enroll Student'}
            </Button>
          </>
        }
      >
        <form id="student-form" onSubmit={handleSaveStudent} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Student Full Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter student full name"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Roll Number *
              </label>
              <input
                type="text"
                required
                value={form.rollNo}
                onChange={(e) => setForm({ ...form, rollNo: e.target.value })}
                placeholder="e.g. 12"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Class / Grade *
              </label>
              <select
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600 font-semibold"
              >
                {CLASS_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Section
              </label>
              <input
                type="text"
                value={form.section}
                onChange={(e) => setForm({ ...form, section: e.target.value })}
                placeholder="A"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Gender
              </label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
              Guardian Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Parent / Guardian Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.parentName}
                  onChange={(e) => setForm({ ...form, parentName: e.target.value })}
                  placeholder="e.g. Mrs. Sunita Kumar"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Parent Mobile Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={form.parentPhone}
                  onChange={(e) => setForm({ ...form, parentPhone: e.target.value })}
                  placeholder="Enter parent mobile number"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Parent Email (Optional)
                </label>
                <input
                  type="email"
                  value={form.parentEmail}
                  onChange={(e) => setForm({ ...form, parentEmail: e.target.value })}
                  placeholder="Enter parent email (optional)"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
              Locality & Logistics
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Village / Residential Address
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Daulatyarpur, Madhoganj"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  School Bus Route / Commute
                </label>
                <input
                  type="text"
                  value={form.busRoute}
                  onChange={(e) => setForm({ ...form, busRoute: e.target.value })}
                  placeholder="Route 3 - Madhoganj Bus Stand"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
                />
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* View Full Profile Modal */}
      {viewStudentModal && (
        <Modal
          isOpen={!!viewStudentModal}
          onClose={() => setViewStudentModal(null)}
          title={`Student Profile: ${viewStudentModal.name}`}
          subtitle={`Admission ID: ${viewStudentModal.id} • ${viewStudentModal.grade}-${viewStudentModal.section || 'A'}`}
          footer={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setViewStudentModal(null)}
            >
              Close Profile
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Class & Section</span>
                <span className="font-extrabold text-slate-900 text-sm">{viewStudentModal.grade} - {viewStudentModal.section || 'A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Roll Number</span>
                <span className="font-extrabold text-slate-900 text-sm">#{viewStudentModal.rollNo}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">House</span>
                <span className="font-bold text-slate-800">{viewStudentModal.house}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Attendance</span>
                <span className="font-bold text-emerald-700">{viewStudentModal.attendancePercent}%</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Fee Status</span>
                <span className="font-bold text-slate-800">{viewStudentModal.feeStatus}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Academic Grade</span>
                <span className="font-bold text-school-700">{viewStudentModal.termGrade}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900">Guardian & Residence</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                <div>Parent: <strong className="text-slate-900">{viewStudentModal.parentName}</strong></div>
                <div>Phone: <strong className="text-slate-900">{viewStudentModal.parentPhone}</strong></div>
                <div>Email: <strong className="text-slate-900">{viewStudentModal.parentEmail || 'Not Provided'}</strong></div>
                <div>Address: <strong className="text-slate-900">{viewStudentModal.address}</strong></div>
                <div>Bus Route: <strong className="text-slate-900">{viewStudentModal.busRoute}</strong></div>
                <div>Status: <strong className="text-slate-900">{viewStudentModal.status}</strong></div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Dialog for Deletion */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remove Student Record"
        message={`Are you sure you want to remove ${studentToDelete?.name} (${studentToDelete?.grade}) from the active roster?`}
        confirmText="Remove Record"
        type="danger"
      />
    </div>
  );
}
