import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle, MessageCircle, Mail } from 'lucide-react';
import Button from './Button';
import { api } from '../../services/api';
import { SCHOOL_CONFIG } from '../../config/schoolConfig';

const PRINCIPAL_WHATSAPP_NUMBER = '918429231617';
const PRINCIPAL_WHATSAPP_DISPLAY = '+91 8429231617';
const PRINCIPAL_EMAIL = 'ueyuwhw@gmail.com';

/**
 * Reusable Admission Enquiry Form Component
 * Encapsulates form fields, validation, API submission, and success handling.
 * Dispatches enquiry details to Principal's WhatsApp (+91 8429231617) and Email (ueyuwhw@gmail.com).
 * Used by Admissions page and the About section popup modal.
 */
export default function AdmissionEnquiryForm({
  title = 'Admission Enquiry Form',
  subtitle = 'Fill in the details below. Our admissions desk in Daulatyarpur, Madhoganj will connect with you to guide the next steps.',
  badge = 'ONLINE REGISTRATION',
  selectedGrade,
  onSuccess,
  inModal = false,
}) {
  const [formData, setFormData] = useState({
    parentName: '',
    studentName: '',
    gradeApplying: selectedGrade || 'Nursery',
    phone: '',
    email: '',
    message: '',
  });

  React.useEffect(() => {
    if (selectedGrade) {
      setFormData((prev) => ({ ...prev, gradeApplying: selectedGrade }));
    }
  }, [selectedGrade]);

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [refNumber, setRefNumber] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    const trimmedParent = formData.parentName.trim();
    const trimmedStudent = formData.studentName.trim();
    const trimmedPhone = formData.phone.trim();
    const digitsOnly = trimmedPhone.replace(/\D/g, '');

    if (!trimmedParent || trimmedParent.length < 2) {
      errors.parentName = 'Please enter guardian full name (minimum 2 characters).';
    }

    if (!trimmedStudent || trimmedStudent.length < 2) {
      errors.studentName = 'Please enter student full name (minimum 2 characters).';
    }

    if (!trimmedPhone || digitsOnly.length < 10) {
      errors.phone = 'Please provide a valid 10-digit contact mobile number.';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address or leave blank.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await api.submitAdmissionEnquiry({
        parentName: trimmedParent,
        studentName: trimmedStudent,
        gradeApplying: formData.gradeApplying,
        phone: trimmedPhone,
        email: formData.email.trim() ? formData.email.trim() : undefined,
        message: formData.message.trim() || 'General Admission Enquiry',
      });

      const assignedRef = res?.data?.enquiryNumber || res?.data?.id || `ADM-2026-${Date.now().toString().slice(-4)}`;
      setRefNumber(assignedRef);

      // Enquiry details are automatically delivered in the background to the principal's
      // WhatsApp (+91 8429231617) and Email (ueyuwhw@gmail.com).
      // Keep the visitor on the current page without opening external applications or new pages.
      setIsSubmitted(true);
      if (onSuccess) onSuccess(assignedRef);
    } catch (err) {
      console.error('Admission enquiry submission failed:', err);
      setSubmitError(err.message || 'Unable to submit enquiry right now. Please try again or call our office.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setRefNumber('');
    setFormData({
      parentName: '',
      studentName: '',
      gradeApplying: 'Nursery',
      phone: '',
      email: '',
      message: '',
    });
  };

  return (
    <div>
      {/* Header (shown when not embedded in a modal with its own header) */}
      {!inModal && (
        <div className="mb-6">
          {badge && (
            <span className="text-xs font-bold text-saffron-600 uppercase tracking-widest block mb-1">
              {badge}
            </span>
          )}
          <h2 className="text-xl sm:text-2xl font-extrabold text-brown-800">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-brown-600 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {isSubmitted ? (
        <div className="p-6 sm:p-8 rounded-2xl bg-cream-200 border border-gold-400/50 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-cream-100 text-emerald-600 flex items-center justify-center mx-auto border border-gold-300">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-brown-800">Enquiry Submitted Successfully!</h3>
          {refNumber && (
            <div className="inline-block px-3 py-1 bg-white rounded-lg border border-gold-400 text-brown-800 font-mono text-xs font-bold shadow-xs">
              Reference ID: {refNumber}
            </div>
          )}

          {/* Automatic Background Delivery Confirmation */}
          <div className="p-4 rounded-xl bg-white/95 border border-gold-300/80 text-left space-y-2 text-xs text-brown-800 shadow-xs">
            <div className="flex items-center gap-2 font-bold text-brown-900 border-b border-cream-200 pb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Enquiry Details Automatically Sent:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] sm:text-xs">
              <div className="flex items-center gap-1.5 text-brown-700">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Principal's WhatsApp: <strong className="text-brown-900 font-semibold">{PRINCIPAL_WHATSAPP_DISPLAY}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-brown-700">
                <Mail className="w-3.5 h-3.5 text-saffron-600 shrink-0" />
                <span>Principal's Email: <strong className="text-brown-900 font-semibold break-all">{PRINCIPAL_EMAIL}</strong></span>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-brown-700 max-w-md mx-auto leading-relaxed">
            Thank you for your interest in <strong>{SCHOOL_CONFIG.name}</strong>. Your enquiry for <strong>{formData.gradeApplying}</strong> has been registered and forwarded to the principal's office. Our team in Daulatyarpur, Madhoganj will reach out on <strong>{formData.phone}</strong>.
          </p>

          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              Submit Another Enquiry
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Guardian Name */}
            <div>
              <label className="block text-xs font-bold text-brown-700 mb-1">
                Parent / Guardian Full Name <span className="text-saffron-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Satish Sharma"
                value={formData.parentName}
                onChange={(e) => {
                  setFormData({ ...formData, parentName: e.target.value });
                  if (formErrors.parentName) setFormErrors({ ...formErrors, parentName: null });
                }}
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border transition-colors text-brown-800 ${
                  formErrors.parentName
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                    : 'border-cream-300 focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 bg-white'
                }`}
              />
              {formErrors.parentName && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">{formErrors.parentName}</p>
              )}
            </div>

            {/* Student Name */}
            <div>
              <label className="block text-xs font-bold text-brown-700 mb-1">
                Candidate / Student Name <span className="text-saffron-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ananya Sharma"
                value={formData.studentName}
                onChange={(e) => {
                  setFormData({ ...formData, studentName: e.target.value });
                  if (formErrors.studentName) setFormErrors({ ...formErrors, studentName: null });
                }}
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border transition-colors text-brown-800 ${
                  formErrors.studentName
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                    : 'border-cream-300 focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 bg-white'
                }`}
              />
              {formErrors.studentName && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">{formErrors.studentName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Grade Applying For */}
            <div>
              <label className="block text-xs font-bold text-brown-700 mb-1">
                Grade Applying For <span className="text-saffron-600">*</span>
              </label>
              <select
                value={formData.gradeApplying}
                onChange={(e) => setFormData({ ...formData, gradeApplying: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-cream-300 bg-white text-brown-800 font-medium focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500"
              >
                <option value="Nursery">Nursery</option>
                <option value="LKG">LKG</option>
                <option value="UKG">UKG</option>
                <option value="Class 1">Class 1</option>
                <option value="Class 2">Class 2</option>
                <option value="Class 3">Class 3</option>
                <option value="Class 4">Class 4</option>
                <option value="Class 5">Class 5</option>
              </select>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-brown-700 mb-1">
                Contact Mobile Number <span className="text-saffron-600">*</span>
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

          {/* Email Address (Optional) */}
          <div>
            <label className="block text-xs font-bold text-brown-700 mb-1">
              Email Address <span className="text-brown-500 font-normal">(Optional)</span>
            </label>
            <input
              type="email"
              placeholder="Enter email address"
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

          {/* Message */}
          <div>
            <label className="block text-xs font-bold text-brown-700 mb-1">
              Any Additional Questions / Notes <span className="text-brown-500 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Mention any specific queries regarding transport, previous schooling, or fee structure..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-cream-300 text-brown-800 focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 bg-white"
            />
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
            {isSubmitting ? 'Submitting Enquiry...' : 'Submit Admission Enquiry'}
          </Button>
        </form>
      )}
    </div>
  );
}
