import React, { useState } from 'react';
import {
  FileDown,
  FileText,
  Search,
  BookOpen,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  FolderDown
} from 'lucide-react';
import { portalApi } from '../../services/portalApi';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';

export default function Downloads() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const downloads = portalApi.getDownloads();
  const categories = ['All', 'Curriculum', 'Homework', 'Examination', 'Calendar', 'Forms', 'Guidelines'];

  const filteredDownloads = downloads.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDownload = (doc) => {
    alert(`Initiating download for "${doc.title}" (${doc.fileSize}).`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <span className="text-xs font-bold text-school-700 uppercase tracking-widest block mb-1">
          RESOURCES & ACADEMIC DOCUMENTS
        </span>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Downloads & Syllabi Hub
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Download syllabus frameworks, holiday study packages, examination date sheets, and administrative forms for Nursery to Class 5.
        </p>
      </div>

      {/* Search and Category Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-school-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === c
                  ? 'bg-school-800 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Downloads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDownloads.map((doc) => (
          <Card
            key={doc.id}
            className="p-5 flex flex-col justify-between hover:border-school-200 transition-all border border-slate-200/80"
          >
            <div>
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-school-100 text-school-800 flex items-center justify-center shrink-0 shadow-2xs">
                  <FileText className="w-5 h-5 text-school-700" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-school-50 text-school-800 border border-school-200 uppercase">
                      {doc.category}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {doc.format} • {doc.fileSize}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-1.5 leading-snug">
                    {doc.title}
                  </h3>
                </div>
              </div>

              <p className="text-xs text-slate-600 mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                {doc.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">Uploaded {doc.dateAdded}</span>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleDownload(doc)}
                leftIcon={<FileDown className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Download Document
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
