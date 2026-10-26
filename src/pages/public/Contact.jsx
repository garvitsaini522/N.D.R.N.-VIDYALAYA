import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Building,
  ShieldCheck,
  MessageCircle,
  AlertCircle,
  School,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import SectionHeading from '../../components/common/SectionHeading';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import CampusMap from '../../components/common/CampusMap';
import { api } from '../../services/api';
import { useSchoolSettings } from '../../context/SchoolSettingsContext';
import { SCHOOL_CONFIG, getPrincipalWhatsAppDestination } from '../../config/schoolConfig';

const GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/5yCbv6myG3H9mEFN7';

export default function Contact() {
  const { settings } = useSchoolSettings();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // Form Validation & Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    const trimmedName = formData.name.trim();
    const trimmedPhone = formData.phone.trim();
    const trimmedMessage = formData.message.trim();
    const digitsOnly = trimmedPhone.replace(/\D/g, '');

    if (!trimmedName || trimmedName.length < 2) {
      errors.name = 'Please enter your full name (minimum 2 characters).';
    }

    if (!trimmedPhone || digitsOnly.length < 10) {
      errors.phone = 'Please provide a valid contact mobile number (at least 10 digits).';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email format or leave blank.';
    }

    if (!trimmedMessage || trimmedMessage.length < 5) {
      errors.message = 'Please provide a message or inquiry details (minimum 5 characters).';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await api.submitContactMessage({
        name: trimmedName,
        phone: trimmedPhone,
        email: formData.email.trim() ? formData.email.trim() : undefined,
        department: formData.subject,
        subject: `${formData.subject} from ${trimmedName}`,
        message: trimmedMessage,
      });

      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit contact message:', err);
      setSubmitError(err.message || 'Unable to submit your message right now. Please call our office directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Direct WhatsApp contact helper
  const handleOpenWhatsApp = () => {
    const cleanNumber = getPrincipalWhatsAppDestination(settings);
    const message = `Namaste N.D.R.N Vidyalaya,

I am reaching out via your website Contact page to make an inquiry regarding the school in Daulatyarpur, Madhoganj.

(Nursery to Class 5 Education)`;
    const url = cleanNumber
      ? `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <PageContainer
      title={`Contact & Helpdesk`}
      subtitle={`Reach out to ${SCHOOL_CONFIG.name} in ${SCHOOL_CONFIG.location.displayLocation}. We welcome parent inquiries, campus visits, and admissions queries.`}
      badge="CONNECT WITH US"
      breadcrumbs={[{ label: 'Contact' }]}
    >
      <div className="space-y-12">
        {/* Contact Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* School Address */}
          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 bg-white rounded-xl border border-brown-200/80 shadow-soft-sm hover:shadow-card-hover hover:border-gold-500/60 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer block"
            aria-label="Open N.D.R.N. Vidyalaya location in Google Maps"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-cream-200 text-saffron-600 flex items-center justify-center mb-4 group-hover:bg-saffron-500 group-hover:text-white transition-all duration-200 shadow-2xs">
                <MapPin className="w-5 h-5 text-current transition-transform duration-200 group-hover:scale-110" />
              </div>

              <div>
                <h3 className="font-bold text-brown-800 text-sm mb-1 group-hover:text-saffron-600 transition-colors duration-200">
                  Campus Address
                </h3>
                <p className="text-xs text-brown-600 leading-relaxed font-medium group-hover:text-saffron-600 transition-colors duration-200">
                  {SCHOOL_CONFIG.name}<br />
                  {SCHOOL_CONFIG.location.village}, {SCHOOL_CONFIG.location.town}<br />
                  {SCHOOL_CONFIG.location.state}, India
                </p>
              </div>
            </div>
            <div className="mt-4 pt-2 border-t border-cream-200 text-[10px] text-brown-500 group-hover:text-saffron-600 font-semibold uppercase block transition-colors duration-200">
              Physical Location
            </div>
          </a>

          {/* Telephone Contact */}
          <a
            href={`tel:${(SCHOOL_CONFIG.contact.phone || '+918429231617').replace(/\s+/g, '')}`}
            className="p-6 bg-white rounded-xl border border-brown-200/80 shadow-soft-sm hover:shadow-card-hover hover:border-gold-500/60 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer block"
            aria-label="Call N.D.R.N. Vidyalaya telephone desk"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-cream-200 text-saffron-600 flex items-center justify-center mb-4 group-hover:bg-saffron-500 group-hover:text-white transition-all duration-200 shadow-2xs">
                <Phone className="w-5 h-5 text-current transition-transform duration-200 group-hover:scale-110" />
              </div>

              <div>
                <h3 className="font-bold text-brown-800 text-sm mb-1 group-hover:text-saffron-600 transition-colors duration-200">
                  Telephone Contact
                </h3>
                <p className="text-xs text-brown-800 font-semibold leading-relaxed group-hover:text-saffron-600 transition-colors duration-200">
                  {SCHOOL_CONFIG.contact.phone}
                </p>
              </div>
              <p className="text-[11px] text-brown-500 mt-1">
                Available during school visiting hours.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-cream-200 text-[10px] text-brown-500 group-hover:text-saffron-600 font-semibold uppercase transition-colors duration-200">
              Phone Desk
            </div>
          </a>

          {/* Email Inquiries */}
          <a
            href="mailto:ueyuwhw@gmail.com"
            className="p-6 bg-white rounded-xl border border-brown-200/80 shadow-soft-sm hover:shadow-card-hover hover:border-gold-500/60 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer block"
            aria-label="Email N.D.R.N. Vidyalaya at ueyuwhw@gmail.com"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-cream-200 text-saffron-600 flex items-center justify-center mb-4 group-hover:bg-saffron-500 group-hover:text-white transition-all duration-200 shadow-2xs">
                <Mail className="w-5 h-5 text-current transition-transform duration-200 group-hover:scale-110" />
              </div>

              <div>
                <h3 className="font-bold text-brown-800 text-sm mb-1 group-hover:text-saffron-600 transition-colors duration-200">
                  Email Inquiries
                </h3>
                <p className="text-xs text-brown-800 font-semibold leading-relaxed group-hover:text-saffron-600 transition-colors duration-200 break-all">
                  ueyuwhw@gmail.com
                </p>
              </div>
              <p className="text-[11px] text-brown-500 mt-1">
                Official correspondence & enquiry inbox.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-cream-200 text-[10px] text-brown-500 group-hover:text-saffron-600 font-semibold uppercase transition-colors duration-200">
              Email Desk
            </div>
          </a>

          {/* Visiting Hours */}
          <Card className="p-6 bg-white flex flex-col justify-between border-cream-200">
            <div>
              <div className="w-10 h-10 rounded-xl bg-cream-200 text-saffron-600 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-brown-800 text-sm mb-1">Office Visiting Hours</h3>
              <p className="text-xs text-brown-600 leading-relaxed font-medium">
                {SCHOOL_CONFIG.contact.visitingHours}<br />
                Sunday & Public Holidays: Closed
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-cream-200 text-[10px] text-brown-500 font-semibold uppercase">
              Campus Hours
            </div>
          </Card>
        </div>

        {/* WhatsApp Contact Callout Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brown-950 via-brown-900 to-brown-800 text-white shadow-soft-md flex flex-col sm:flex-row items-center justify-between gap-6 border border-cream-200">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-gold-400/30 flex items-center justify-center text-gold-300 flex-shrink-0">
              <MessageCircle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Direct WhatsApp Chat with School</h3>
              <p className="text-xs sm:text-sm text-cream-100 mt-0.5">
                Have a quick question regarding Nursery to Class 5 admissions or campus location? Connect directly on WhatsApp.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="px-6 py-3 rounded-xl bg-saffron-500 hover:bg-saffron-600 text-white text-sm font-extrabold shadow-soft-sm transition-all flex items-center justify-center gap-2 flex-shrink-0 select-none"
          >
            <MessageCircle className="w-4 h-4 text-white" />
            <span>Chat on WhatsApp</span>
          </button>
        </div>

        {/* Contact Form and Map Placeholder Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Message Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-soft-sm">
            <h3 className="text-xl font-bold text-brown-800 mb-1">Send a Message to School</h3>
            <p className="text-xs sm:text-sm text-brown-600 mb-6">
              Please enter your details below. Your query will be reviewed by our administrative office in Daulatyarpur, Madhoganj.
            </p>

            {submitted ? (
              <div className="p-6 sm:p-8 rounded-2xl bg-cream-200 border border-gold-400/50 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-cream-100 text-saffron-600 flex items-center justify-center mx-auto border border-gold-300">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-brown-800">Message Dispatched Successfully!</h4>
                <p className="text-xs sm:text-sm text-brown-700 max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out to <strong>{SCHOOL_CONFIG.name}</strong>. Our administrative desk will review your inquiry and follow up promptly.
                </p>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        phone: '',
                        email: '',
                        subject: 'General Inquiry',
                        message: '',
                      });
                    }}
                  >
                    Send Another Message
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Visitor Name */}
                  <div>
                    <label className="block text-xs font-bold text-brown-700 mb-1">
                      Full Name <span className="text-saffron-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (formErrors.name) setFormErrors({ ...formErrors, name: null });
                      }}
                      className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border transition-colors text-brown-800 ${
                        formErrors.name
                          ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                          : 'border-cream-300 focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 bg-white'
                      }`}
                    />
                    {formErrors.name && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{formErrors.name}</p>
                    )}
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label className="block text-xs font-bold text-brown-700 mb-1">
                      Mobile Number <span className="text-saffron-600">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Enter 10-digit mobile number"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (formErrors.phone) setFormErrors({ ...formErrors, phone: null });
                      }}
                      className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border transition-colors text-brown-800 ${
                        formErrors.phone
                          ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                          : 'border-cream-300 focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 bg-white'
                      }`}
                    />
                    {formErrors.phone && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{formErrors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email (Optional) */}
                  <div>
                    <label className="block text-xs font-bold text-brown-700 mb-1">
                      Email Address <span className="text-brown-500 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (formErrors.email) setFormErrors({ ...formErrors, email: null });
                      }}
                      className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border transition-colors text-brown-800 ${
                        formErrors.email
                          ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                          : 'border-cream-300 focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 bg-white'
                      }`}
                    />
                    {formErrors.email && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{formErrors.email}</p>
                    )}
                  </div>

                  {/* Inquiry Topic */}
                  <div>
                    <label className="block text-xs font-bold text-brown-700 mb-1">
                      Inquiry Category
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-cream-300 bg-white text-brown-800 font-medium focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500"
                    >
                      <option>General Inquiry</option>
                      <option>Admissions (Nursery to Class 5)</option>
                      <option>Curriculum & Classroom Learning</option>
                      <option>Campus Visit Request</option>
                      <option>Fee Structure & Formalities</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold text-brown-700 mb-1">
                    Your Message / Query <span className="text-saffron-600">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Type your message clearly..."
                    value={formData.message}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value });
                      if (formErrors.message) setFormErrors({ ...formErrors, message: null });
                    }}
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border transition-colors text-brown-800 ${
                      formErrors.message
                        ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                        : 'border-cream-300 focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 bg-white'
                    }`}
                  />
                  {formErrors.message && (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium">{formErrors.message}</p>
                  )}
                </div>

                {submitError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{submitError}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  disabled={isSubmitting}
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  {isSubmitting ? 'Sending Message...' : 'Send Official Message'}
                </Button>
              </form>
            )}
          </div>

          {/* Map Placeholder Card (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-cream-200 p-6 sm:p-8 shadow-soft-sm space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-saffron-600 block">
                  CAMPUS NAVIGATION
                </span>
                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 mt-0.5 hover:text-saffron-600 transition-colors cursor-pointer"
                  aria-label="Open N.D.R.N. Vidyalaya location in Google Maps"
                >
                  <h4 className="text-lg font-bold text-brown-800 group-hover:text-saffron-600 transition-colors">
                    Campus Location Map Preview
                  </h4>
                  <ExternalLink className="w-4 h-4 text-saffron-600 opacity-80 group-hover:opacity-100 transition-opacity" />
                </a>
                <p className="text-xs text-brown-600 mt-0.5">
                  Daulatyarpur, Madhoganj, Uttar Pradesh
                </p>
              </div>
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-saffron-600 hover:text-saffron-700 bg-cream-100 hover:bg-cream-200 border border-cream-300 px-3 py-1.5 rounded-xl transition-colors inline-flex items-center gap-1 shrink-0 cursor-pointer"
                aria-label="Open in Google Maps"
              >
                <span>View on Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Interactive Campus Map Preview (Leaflet & OpenStreetMap) */}
            <CampusMap />

            <div className="p-4 rounded-xl bg-cream-100/70 border border-cream-200 text-xs text-brown-600 space-y-1">
              <div className="font-bold text-brown-800">Visiting Guidelines:</div>
              <p className="text-brown-600 leading-relaxed">
                Parents are requested to visit during official visiting hours ({SCHOOL_CONFIG.contact.visitingHours}) for guided campus orientation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
