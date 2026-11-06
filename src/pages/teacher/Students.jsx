import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  Eye,
  X,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  School
} from 'lucide-react';
import { api } from '../../services/api';
import { DataService } from '../../services/dataService';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';

const CLASS_OPTIONS = [
  'All',
  'Class 5',
  'Class 4',
  'Class 3',
  'Class 2',
  'Class 1',
  'UKG',
  'LKG',
  'Nursery',
];

export default function TeacherStudents() {
  const [students, setStudents] = useState([]);
  const [classFilter, setClassFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const data = await api.getStudents();
        if (isMounted) setStudents(Array.isArray(data) ? data : []);
      } catch {
        if (isMounted) setStudents(DataService.getStudents());
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredStudents = students.filter((s) => {
    const matchesClass = classFilter === 'All' || s.grade === classFilter || s.grade?.startsWith(classFilter);
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      (s.rollNo && s.rollNo.toString().includes(q)) ||
      (s.admissionNo && s.admissionNo.toLowerCase().includes(q)) ||
      (s.parentName && s.parentName.toLowerCase().includes(q));

    return matchesClass && matchesSearch;
  });

  const totalBoys = students.filter((s) => s.gender === 'Male').length;
  const totalGirls = students.filter((s) => s.gender === 'Female').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-school-700 uppercase tracking-widest block mb-1">
            ACADEMIC ROSTER • PRIMARY DIRECTORY
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Student Records & Details
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Comprehensive primary wing student roster, parent particulars, and attendance records • Daulatyarpur Campus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
            Total Enrolled: <strong className="text-slate-900">{students.length}</strong>
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Students</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{students.length}</div>
          <span className="text-[11px] text-slate-400">Nursery to Class 5</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Boys</span>
          <div className="text-2xl font-black text-blue-700 mt-1">{totalBoys}</div>
          <span className="text-[11px] text-slate-400">Enrolled male students</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Girls</span>
          <div className="text-2xl font-black text-pink-700 mt-1">{totalGirls}</div>
          <span className="text-[11px] text-slate-400">Enrolled female students</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Filtered Count</span>
          <div className="text-2xl font-black text-school-800 mt-1">{filteredStudents.length}</div>
          <span className="text-[11px] text-slate-400">Active in view</span>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="p-4 bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-bold text-slate-700">Filter Grade:</span>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-school-600"
            >
              {CLASS_OPTIONS.map((cls) => (
                <option key={cls} value={cls}>
                  {cls === 'All' ? 'All Classes' : `${cls}`}
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, roll, admission no..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-school-600"
            />
          </div>
        </div>
      </Card>

      {/* Students Table / Grid */}
      <Card className="overflow-hidden p-0 border border-slate-200/90 shadow-soft-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Student Roster ({filteredStudents.length} Students)
          </span>
          <span className="text-xs text-slate-400">Click student to view particulars</span>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No students found matching your search and filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-black tracking-wider">
                  <th className="py-3 px-4">Roll</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Admission No</th>
                  <th className="py-3 px-4">Parent Contact</th>
                  <th className="py-3 px-4 text-center">Attendance</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-black text-slate-900 font-mono">
                      #{s.rollNo || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{s.name}</div>
                      <div className="text-[11px] text-slate-400">{s.gender || 'Male'} • {s.house || 'Ganga House'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-school-800">
                      {s.grade}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-600">
                      {s.admissionNo || s.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{s.parentName || 'Parent'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{s.parentPhone || '—'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        {s.attendancePercent || 94.5}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedStudent(s)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-school-50 hover:bg-school-100 text-school-800 font-bold text-xs transition-colors border border-school-200"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Student Details Inspection Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-school-100 text-school-800 font-black text-base flex items-center justify-center">
                  #{selectedStudent.rollNo || '1'}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">{selectedStudent.name}</h3>
                  <span className="text-xs font-bold text-school-700 bg-school-50 px-2 py-0.5 rounded-full border border-school-200">
                    {selectedStudent.grade} • Section {selectedStudent.section || 'A'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Admission Number</span>
                <span className="font-bold text-slate-800 font-mono">{selectedStudent.admissionNo || selectedStudent.id}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">House Allotment</span>
                <span className="font-bold text-slate-800">{selectedStudent.house || 'Ganga House'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Date of Birth</span>
                <span className="font-bold text-slate-800">{selectedStudent.dob || '—'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Blood Group</span>
                <span className="font-bold text-slate-800">{selectedStudent.bloodGroup || '—'}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <div className="font-black text-slate-900 uppercase text-[10px] tracking-wider">Guardian Contact Information</div>
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500">Parent / Guardian:</span>
                <span className="font-bold text-slate-800">{selectedStudent.parentName || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500">Registered Phone:</span>
                <span className="font-bold text-slate-800 font-mono">{selectedStudent.parentPhone || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500">Bus Route:</span>
                <span className="font-bold text-slate-800">{selectedStudent.busRoute || 'Self / Walking'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Address:</span>
                <span className="font-bold text-slate-800 text-right max-w-[220px]">
                  {typeof selectedStudent.address === 'string'
                    ? selectedStudent.address
                    : 'Daulatyarpur, Madhoganj, Hardoi, Uttar Pradesh'}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedStudent(null)}
                className="text-xs font-bold"
              >
                Close Particulars
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

