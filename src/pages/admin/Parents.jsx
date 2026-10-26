import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Phone,
  Mail,
  Edit2,
  Trash2,
  HeartHandshake,
  GraduationCap,
  Link as LinkIcon,
  Search,
  Filter,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import { DataService } from '../../services/dataService';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import SearchInput from '../../components/common/SearchInput';

const INITIAL_PARENT_FORM = {
  name: '',
  spouseName: '',
  relationship: 'Mother',
  phone: '',
  alternatePhone: '',
  email: '',
  occupation: '',
  address: 'Daulatyarpur, Madhoganj',
  wardId: '',
  status: 'Active',
};

export default function AdminParents() {
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [parentToLink, setParentToLink] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedRelationship, setSelectedRelationship] = useState('Parent');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [parentToDelete, setParentToDelete] = useState(null);
  const [form, setForm] = useState(INITIAL_PARENT_FORM);

  const loadData = () => {
    setParents(DataService.getParents());
    setStudents(DataService.getStudents());
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = parents.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      (p.spouseName && p.spouseName.toLowerCase().includes(q)) ||
      (p.wardName && p.wardName.toLowerCase().includes(q)) ||
      (p.phone && p.phone.includes(q)) ||
      (p.email && p.email.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedParents = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpenAddModal = () => {
    setEditingParent(null);
    setForm(INITIAL_PARENT_FORM);
    setModalOpen(true);
  };

  const handleOpenEditModal = (parent) => {
    setEditingParent(parent);
    setForm({
      name: parent.name || '',
      spouseName: parent.spouseName || '',
      relationship: parent.relationship || 'Mother',
      phone: parent.phone || '',
      alternatePhone: parent.alternatePhone || '',
      email: parent.email || '',
      occupation: parent.occupation || '',
      address: parent.address || 'Daulatyarpur, Madhoganj',
      wardId: parent.wardId || '',
      status: parent.status || 'Active',
    });
    setModalOpen(true);
  };

  const handleSaveParent = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;

    // If ward selected, attach ward name & grade
    let wardData = {};
    if (form.wardId) {
      const student = students.find((s) => s.id === form.wardId);
      if (student) {
        wardData = {
          wardId: student.id,
          wardName: student.name,
          wardGrade: `${student.grade}-${student.section || 'A'}`,
        };
      }
    }

    if (editingParent) {
      DataService.updateParent(editingParent.id, { ...form, ...wardData });
    } else {
      DataService.addParent({ ...form, ...wardData });
    }

    loadData();
    setModalOpen(false);
  };

  const handleOpenLinkModal = (parent) => {
    setParentToLink(parent);
    setSelectedStudentId(parent.wardId || (students[0]?.id || ''));
    setSelectedRelationship(parent.relationship || 'Parent');
    setLinkModalOpen(true);
  };

  const handleConfirmLink = (e) => {
    e.preventDefault();
    if (!parentToLink || !selectedStudentId) return;

    DataService.linkParentToStudent(parentToLink.id, selectedStudentId, selectedRelationship);
    loadData();
    setLinkModalOpen(false);
    setParentToLink(null);
  };

  const handleConfirmDelete = () => {
    if (parentToDelete) {
      DataService.deleteParent(parentToDelete.id);
      loadData();
      setDeleteConfirmOpen(false);
      setParentToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-school-700 uppercase tracking-widest block mb-1">
            FAMILY ROSTERS • GUARDIAN DIRECTORY
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Parent & Guardian Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Maintain parent contact records, update registered telephone numbers, and link guardians to enrolled students.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={handleOpenAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Parent Record
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="p-4 bg-white border border-slate-200">
        <div className="max-w-md">
          <SearchInput
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setCurrentPage(1);
            }}
            placeholder="Search parent name, student ward, phone..."
          />
        </div>
      </Card>

      {/* Parents Table */}
      <Card className="bg-white border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5 pl-6">Parent / Guardian</th>
                <th className="p-3.5">Spouse Name</th>
                <th className="p-3.5">Contact Details</th>
                <th className="p-3.5">Linked Ward (Student)</th>
                <th className="p-3.5">Occupation</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedParents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No parent records found.
                  </td>
                </tr>
              ) : (
                paginatedParents.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Parent Name */}
                    <td className="p-3.5 pl-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900">{p.name}</div>
                          <span className="text-[10px] font-semibold text-school-700 bg-school-50 px-1.5 py-0.2 rounded">
                            {p.relationship || 'Guardian'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Spouse Name */}
                    <td className="p-3.5 text-slate-700">
                      {p.spouseName || '—'}
                    </td>

                    {/* Contact Phone & Email */}
                    <td className="p-3.5 text-slate-700">
                      <div className="font-bold flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{p.phone}</span>
                      </div>
                      {p.email && (
                        <div className="text-[11px] text-slate-400 truncate max-w-[150px] mt-0.5">
                          {p.email}
                        </div>
                      )}
                    </td>

                    {/* Linked Ward */}
                    <td className="p-3.5">
                      {p.wardName ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-school-50 border border-school-200">
                          <GraduationCap className="w-3.5 h-3.5 text-school-700" />
                          <div>
                            <span className="font-bold text-school-900 block leading-tight">{p.wardName}</span>
                            <span className="text-[10px] text-school-600 font-semibold">{p.wardGrade}</span>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenLinkModal(p)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-200"
                        >
                          <LinkIcon className="w-3 h-3" />
                          <span>Link Student</span>
                        </button>
                      )}
                    </td>

                    {/* Occupation */}
                    <td className="p-3.5 text-slate-600">
                      {p.occupation || '—'}
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {p.status || 'Active'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenLinkModal(p)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-school-700 hover:bg-slate-100"
                          title="Change Linked Student"
                        >
                          <LinkIcon className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-school-700 hover:bg-slate-100"
                          title="Edit Parent"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setParentToDelete(p);
                            setDeleteConfirmOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete Parent Record"
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

      {/* Add / Edit Parent Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingParent ? `Edit Parent: ${editingParent.name}` : 'Add Guardian Record'}
        subtitle="Daulatyarpur, Madhoganj Campus"
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <Button type="submit" form="parent-form" variant="primary" size="sm">
              {editingParent ? 'Save Changes' : 'Register Parent'}
            </Button>
          </>
        }
      >
        <form id="parent-form" onSubmit={handleSaveParent} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Parent / Guardian Full Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Mrs. Sunita Kumar"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Relationship to Ward *
              </label>
              <select
                value={form.relationship}
                onChange={(e) => setForm({ ...form, relationship: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600 font-semibold"
              >
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Guardian">Guardian</option>
                <option value="Grandparent">Grandparent</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Spouse Name (Father / Mother)
              </label>
              <input
                type="text"
                value={form.spouseName}
                onChange={(e) => setForm({ ...form, spouseName: e.target.value })}
                placeholder="e.g. Mr. Ramesh Kumar"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Occupation
              </label>
              <input
                type="text"
                value={form.occupation}
                onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                placeholder="e.g. Agriculture / Business / Service"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Primary Phone Number *
              </label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Enter 10-digit phone number"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Alternate Phone Number
              </label>
              <input
                type="tel"
                value={form.alternatePhone}
                onChange={(e) => setForm({ ...form, alternatePhone: e.target.value })}
                placeholder="Enter alternate phone (optional)"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Enter email address (optional)"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Linked Student Ward
              </label>
              <select
                value={form.wardId}
                onChange={(e) => setForm({ ...form, wardId: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              >
                <option value="">-- Select Enrolled Student --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.grade}-{s.section || 'A'}, Roll #{s.rollNo})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Residential Address (Village / Town)
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Daulatyarpur, Madhoganj"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
            />
          </div>
        </form>
      </Modal>

      {/* Link Student Modal */}
      {linkModalOpen && parentToLink && (
        <Modal
          isOpen={linkModalOpen}
          onClose={() => setLinkModalOpen(false)}
          title={`Link Student to ${parentToLink.name}`}
          subtitle="Connect a registered student from the school roster to this guardian account."
          footer={
            <>
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <Button type="submit" form="link-form" variant="primary" size="sm">
                Confirm Link
              </Button>
            </>
          }
        >
          <form id="link-form" onSubmit={handleConfirmLink} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Select Student from Roster *
              </label>
              <select
                required
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600 font-semibold"
              >
                <option value="">-- Select Student --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.grade}-{s.section || 'A'}, Roll #{s.rollNo}) - ID: {s.id}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Relationship
              </label>
              <select
                value={selectedRelationship}
                onChange={(e) => setSelectedRelationship(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              >
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Guardian">Guardian</option>
                <option value="Grandparent">Grandparent</option>
              </select>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Parent Record"
        message={`Are you sure you want to remove the record for ${parentToDelete?.name}?`}
        confirmText="Delete Record"
        type="danger"
      />
    </div>
  );
}
