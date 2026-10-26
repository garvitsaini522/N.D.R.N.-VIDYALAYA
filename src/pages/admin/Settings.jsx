import React, { useState } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  Building,
  Phone,
  Mail,
  MapPin,
  User,
  Share2,
  Clock,
  ExternalLink,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useSchoolSettings } from '../../context/SchoolSettingsContext';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';

export default function AdminSettings() {
  const { settings, updateSettings, refreshSettings } = useSchoolSettings();
  const [form, setForm] = useState(settings);
  const [savedAlert, setSavedAlert] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings(form);
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 4000);
  };

  const handleReset = () => {
    setForm(settings);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-school-700 uppercase tracking-widest block mb-1">
            WEBSITE CONFIGURATION • CENTRAL PARAMETERS
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Institutional Website Settings
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure live public information (contact numbers, address, principal message, WhatsApp desk) without code changes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Reset Fields
          </button>

          <Button
            type="submit"
            form="settings-form"
            variant="primary"
            size="md"
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save All Settings
          </Button>
        </div>
      </div>

      {/* Success Notification */}
      {savedAlert && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-soft-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Settings successfully saved! All public website components and portals are now synchronized.</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-normal">Active Live</span>
        </div>
      )}

      <form id="settings-form" onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Section 1: Institutional Identity */}
        <Card className="p-6 bg-white border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building className="w-4 h-4 text-school-700" />
            <h3 className="text-sm font-bold text-slate-900">1. School Identity & Session</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Official School Name *</label>
              <input
                type="text"
                required
                value={form.schoolName}
                onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Institutional Tagline</label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Academic Session *</label>
              <input
                type="text"
                required
                value={form.academicSession}
                onChange={(e) => setForm({ ...form, academicSession: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Grades Level Offered *</label>
              <input
                type="text"
                required
                value={form.gradesOffered}
                onChange={(e) => setForm({ ...form, gradesOffered: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">School Working Hours</label>
              <input
                type="text"
                value={form.schoolHours}
                onChange={(e) => setForm({ ...form, schoolHours: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Affiliation / Status Note</label>
              <input
                type="text"
                value={form.affiliationInfo}
                onChange={(e) => setForm({ ...form, affiliationInfo: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>
          </div>
        </Card>

        {/* Section 2: Contact Information & WhatsApp */}
        <Card className="p-6 bg-white border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Phone className="w-4 h-4 text-school-700" />
            <h3 className="text-sm font-bold text-slate-900">2. Official Communication & Helpline</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Primary School Phone *</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Secondary / Office Phone</label>
              <input
                type="tel"
                value={form.secondaryPhone}
                onChange={(e) => setForm({ ...form, secondaryPhone: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Official Email Address *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">WhatsApp Helpline Number</label>
              <input
                type="tel"
                value={form.whatsapp}
                placeholder="e.g. 918429231617 (Country code + number, digits only)"
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600 font-bold text-emerald-700"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">International format without + or spaces</span>
            </div>
          </div>
        </Card>

        {/* Section 3: Physical Postal Address */}
        <Card className="p-6 bg-white border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <MapPin className="w-4 h-4 text-school-700" />
            <h3 className="text-sm font-bold text-slate-900">3. Campus Address & Location</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Village / Street *</label>
              <input
                type="text"
                required
                value={form.village}
                onChange={(e) => setForm({ ...form, village: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Post Office / Town *</label>
              <input
                type="text"
                required
                value={form.postOffice}
                onChange={(e) => setForm({ ...form, postOffice: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">District *</label>
              <input
                type="text"
                required
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">State *</label>
              <input
                type="text"
                required
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">PIN Code *</label>
              <input
                type="text"
                required
                value={form.pinCode}
                onChange={(e) => setForm({ ...form, pinCode: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600 font-mono font-bold"
              />
            </div>
          </div>
        </Card>

        {/* Section 4: Leadership & Principal Message */}
        <Card className="p-6 bg-white border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-school-700" />
            <h3 className="text-sm font-bold text-slate-900">4. Head of Institution & Leadership</h3>
          </div>

          <div className="flex flex-col md:flex-row gap-5 items-start">
            <div className="flex flex-col items-center shrink-0">
              <img
                src="/images/principal-portrait.jpg"
                alt="Principal Portrait"
                className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-200 shadow-soft-xs"
              />
              <span className="text-[10px] text-slate-500 font-semibold mt-1.5">Official Portrait</span>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Principal / Head Name *</label>
                <input
                  type="text"
                  required
                  value={form.principalName}
                  onChange={(e) => setForm({ ...form, principalName: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Principal Designation</label>
                <input
                  type="text"
                  value={form.principalDesignation}
                  onChange={(e) => setForm({ ...form, principalDesignation: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Principal Welcome Message (Displayed on About Page) *
                </label>
                <textarea
                  rows={4}
                  required
                  value={form.principalMessage}
                  onChange={(e) => setForm({ ...form, principalMessage: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600 resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Section 5: Social Media Links */}
        <Card className="p-6 bg-white border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Share2 className="w-4 h-4 text-school-700" />
            <h3 className="text-sm font-bold text-slate-900">5. Social Links (Optional)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Facebook Page</label>
              <input
                type="url"
                value={form.socialLinks?.facebook || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    socialLinks: { ...form.socialLinks, facebook: e.target.value },
                  })
                }
                placeholder="https://facebook.com/..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">YouTube Channel</label>
              <input
                type="url"
                value={form.socialLinks?.youtube || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    socialLinks: { ...form.socialLinks, youtube: e.target.value },
                  })
                }
                placeholder="https://youtube.com/..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Instagram Profile</label>
              <input
                type="url"
                value={form.socialLinks?.instagram || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    socialLinks: { ...form.socialLinks, instagram: e.target.value },
                  })
                }
                placeholder="https://instagram.com/..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Twitter / X Handle</label>
              <input
                type="url"
                value={form.socialLinks?.twitter || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    socialLinks: { ...form.socialLinks, twitter: e.target.value },
                  })
                }
                placeholder="https://twitter.com/..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-school-600"
              />
            </div>
          </div>
        </Card>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="submit" variant="primary" size="md" leftIcon={<Save className="w-4 h-4" />}>
            Save All Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
