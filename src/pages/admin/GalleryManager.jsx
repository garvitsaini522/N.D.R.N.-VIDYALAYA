import React, { useState, useEffect } from 'react';
import {
  Image,
  Plus,
  Trash2,
  ExternalLink,
  Eye,
  Filter,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { DataService } from '../../services/dataService';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingState from '../../components/common/LoadingState';

const INITIAL_IMAGE_FORM = {
  title: '',
  category: 'Campus',
  url: '',
  description: '',
};

export default function AdminGalleryManager() {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [previewModal, setPreviewModal] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [form, setForm] = useState(INITIAL_IMAGE_FORM);

  const loadGallery = async () => {
    try {
      setLoading(true);
      const data = await api.getGallery();
      setGallery(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load gallery items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();

    const handleSync = () => loadGallery();
    window.addEventListener('ndrn:gallery-updated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('ndrn:gallery-updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const filtered = gallery.filter((item) => {
    return categoryFilter === 'All' || item.category === categoryFilter;
  });

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.url.trim()) return;

    await api.createGalleryItem({
      ...form,
      imageUrl: form.url,
    });
    await loadGallery();
    setModalOpen(false);
    setForm(INITIAL_IMAGE_FORM);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      const targetId = itemToDelete.id || itemToDelete._id;
      await api.deleteGalleryItem(targetId);
      await loadGallery();
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-school-700 uppercase tracking-widest block mb-1">
            CAMPUS MEDIA • VISUAL ARCHIVE
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            School Gallery Media Manager
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Curate campus photographs, classroom activity snapshots, and primary sports moments shown on the website.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/gallery"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-school-700 bg-white border border-slate-200 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Gallery</span>
          </Link>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => {
              setForm(INITIAL_IMAGE_FORM);
              setModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Upload Photo Record
          </Button>
        </div>
      </div>

      {/* Category Filter Bar */}
      <Card className="p-4 bg-white border border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {['All', 'Campus', 'Classroom', 'Activities', 'Sports'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  categoryFilter === cat
                    ? 'bg-school-700 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-500 font-semibold">
            Showing <strong className="text-slate-800">{filtered.length}</strong> photos
          </span>
        </div>
      </Card>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <Card key={item.id} className="bg-white border border-slate-200 overflow-hidden flex flex-col justify-between group">
            <div className="relative aspect-video bg-slate-100 overflow-hidden">
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 backdrop-blur-xs text-white">
                {item.category}
              </span>
            </div>

            <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
              <div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{item.description}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPreviewModal(item)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-school-700 hover:text-school-800"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setItemToDelete(item);
                    setDeleteConfirmOpen(true);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  title="Delete Image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Image Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Upload Gallery Photograph"
        subtitle="Daulatyarpur, Madhoganj Campus Visual Media"
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <Button type="submit" form="gallery-form" variant="primary" size="sm">
              Add to Gallery
            </Button>
          </>
        }
      >
        <form id="gallery-form" onSubmit={handleSaveItem} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Photograph Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Primary School Morning Assembly"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600 font-bold"
              >
                <option value="Campus">Campus</option>
                <option value="Classroom">Classroom</option>
                <option value="Activities">Activities</option>
                <option value="Sports">Sports</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Image URL *</label>
              <input
                type="url"
                required
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Caption / Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Contextual description of the campus activity..."
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600 resize-none"
            />
          </div>
        </form>
      </Modal>

      {/* Preview Modal */}
      {previewModal && (
        <Modal
          isOpen={!!previewModal}
          onClose={() => setPreviewModal(null)}
          title={previewModal.title}
          subtitle={`Category: ${previewModal.category}`}
          footer={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPreviewModal(null)}
            >
              Close
            </Button>
          }
        >
          <div className="space-y-3">
            <img
              src={previewModal.url}
              alt={previewModal.title}
              className="w-full rounded-2xl max-h-[60vh] object-cover border border-slate-200"
            />
            {previewModal.description && (
              <p className="text-xs text-slate-600">{previewModal.description}</p>
            )}
          </div>
        </Modal>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Photo Record"
        message={`Are you sure you want to delete "${itemToDelete?.title}" from the public gallery?`}
        confirmText="Delete Photo"
        type="danger"
      />
    </div>
  );
}
