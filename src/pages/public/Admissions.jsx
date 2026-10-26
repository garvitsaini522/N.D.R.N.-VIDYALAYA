import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle,
  HelpCircle,
  Calendar,
  ClipboardList,
  UserCheck,
  Send,
  PhoneCall,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  ArrowRight,
  MessageCircle,
  Receipt,
  Calculator,
  Coins,
  Info,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import SectionHeading from '../../components/common/SectionHeading';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import CampusMap from '../../components/common/CampusMap';
import AdmissionEnquiryForm from '../../components/common/AdmissionEnquiryForm';
import { api } from '../../services/api';
import { useSchoolSettings } from '../../context/SchoolSettingsContext';
import { SCHOOL_CONFIG, getPrincipalWhatsAppDestination } from '../../config/schoolConfig';

const GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/5yCbv6myG3H9mEFN7';

export default function Admissions() {
  const { settings } = useSchoolSettings();
  const [selectedGrade, setSelectedGrade] = useState('Nursery');
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // Dynamic Fee Structure State
  const [feeSchedules, setFeeSchedules] = useState([]);
  const [feesLoading, setFeesLoading] = useState(true);
  const [feeSession, setFeeSession] = useState('2026-27');
  const [availableSessions, setAvailableSessions] = useState(['2026-27']);
  const [feeError, setFeeError] = useState(null);

  const loadFeeStructures = async (selectedSession = feeSession) => {
    setFeesLoading(true);
    setFeeError(null);
    try {
      const normSession = normalizeAcademicSession(selectedSession) || '2026-27';
      const res = await api.getPublicFeeStructure(normSession);
      const rawList = Array.isArray(res) ? res : (res?.data || []);

      // Filter only published records matching the normalized session
      const published = rawList.filter((item) => {
        const itemSession = normalizeAcademicSession(item.academicSession);
        const matchesSession = normSession === 'all' || itemSession === normSession;
        return Boolean(item.isPublished) && matchesSession;
      });

      setFeeSchedules(published);

      // Collect all unique normalized sessions
      const discovered = Array.from(
        new Set(
          rawList
            .map((item) => normalizeAcademicSession(item.academicSession))
            .filter(Boolean)
        )
      );
      if (discovered.length > 0) {
        setAvailableSessions((prev) => {
          const merged = Array.from(new Set([...prev.map(normalizeAcademicSession), ...discovered]));
          return merged.sort().reverse();
        });
      }
    } catch (err) {
      console.warn('Failed to load public fee structure:', err);
      setFeeError('Unable to load fee schedule. Please try refreshing.');
      setFeeSchedules([]);
    } finally {
      setFeesLoading(false);
    }
  };

  useEffect(() => {
    loadFeeStructures(feeSession);

    // Real-time synchronization when fee records are updated or published in Admin Portal
    const handleSync = () => {
      loadFeeStructures(feeSession);
    };

    window.addEventListener('ndrn:fee-structure-updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('ndrn:fee-structure-updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [feeSession]);

  const scrollToEnquiry = (preselectedGrade = null) => {
    if (preselectedGrade) {
      setSelectedGrade(preselectedGrade);
    }
    const el = document.getElementById('enquiry-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Admission Process Steps
  const admissionSteps = [
    {
      step: '01',
      title: 'Admission Enquiry',
      desc: 'Submit the online enquiry form below or visit the school office in Daulatyarpur, Madhoganj to collect registration details.',
    },
    {
      step: '02',
      title: 'Informal Interaction',
      desc: 'A friendly, pressure-free interaction for young learners and a brief discussion with guardians regarding child readiness.',
    },
    {
      step: '03',
      title: 'Document Verification',
      desc: 'Submission and verification of the child’s birth certificate, guardian ID, photographs, and previous school transfer proof if transferring.',
    },
    {
      step: '04',
      title: 'Enrollment Confirmation',
      desc: 'Completion of enrollment formalities, class assignment, and welcoming the child into N.D.R.N Vidyalaya.',
    },
  ];

  // Eligibility Guidelines Section
  const eligibilityGuidelines = [
    {
      grade: 'Nursery',
      ageCriteria: '3+ Years as of 31st March',
      description: 'Play-based foundational readiness; basic sensory observation and informal interaction.',
    },
    {
      grade: 'LKG & UKG',
      ageCriteria: '4+ to 5+ Years',
      description: 'Phonics readiness and age-appropriate recognition of numbers and alphabets.',
    },
    {
      grade: 'Class 1',
      ageCriteria: '6+ Years',
      description: 'Foundational literacy readiness and bilingual listening comprehension.',
    },
    {
      grade: 'Class 2 to Class 5',
      ageCriteria: '7+ to 10+ Years progressively',
      description: 'Basic diagnostic evaluation in languages and arithmetic; previous school grade completion.',
    },
  ];

  // Required Documents List
  const requiredDocuments = [
    {
      title: 'Child’s Official Birth Certificate',
      desc: 'Issued by Municipal Corporation, Gram Panchayat, or authorized Registrar of Births.',
      mandatory: true,
    },
    {
      title: 'Guardian Identity & Address Proof',
      desc: 'Aadhaar Card, Voter ID, or official government residential document of parent/guardian.',
      mandatory: true,
    },
    {
      title: 'Recent Passport Size Photographs',
      desc: '4 recent color passport photos of the student, and 2 photos of parents/guardians.',
      mandatory: true,
    },
    {
      title: 'Previous School Transfer Certificate (TC)',
      desc: 'Required only for students seeking admission into Class 2, 3, 4, or 5 from a previous school.',
      mandatory: false,
    },
    {
      title: 'Previous Academic Progress Report',
      desc: 'Copy of previous term marksheet/report card for transfer admissions into Class 2 to 5.',
      mandatory: false,
    },
    {
      title: 'Child’s Aadhaar Card Copy',
      desc: 'Photocopy of student Aadhaar card for official student registration records, if generated.',
      mandatory: false,
    },
  ];

  return (
    <PageContainer
      title={`Admissions at ${SCHOOL_CONFIG.name}`}
      subtitle={`Enrolling young minds from ${SCHOOL_CONFIG.levels} in ${SCHOOL_CONFIG.location.displayLocation}. Transparent, caring, and student-focused admission process.`}
      badge="ENROLLMENT OPEN"
      breadcrumbs={[{ label: 'Admissions' }]}
    >
      <div className="space-y-16">
        {/* 1. Admission Steps Roadmap */}
        <div>
          <SectionHeading
            badge="STEP-BY-STEP ROADMAP"
            title="How to Secure"
            highlight="Admission"
            subtitle="Follow our straightforward 4-step procedure to enroll your child for the academic session."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {admissionSteps.map((st, i) => (
              <Card key={i} className="p-6 bg-white relative border-cream-200">
                <span className="text-3xl font-extrabold text-gold-400 block mb-3 font-mono">
                  {st.step}
                </span>
                <h3 className="text-base font-bold text-brown-800 mb-2">{st.title}</h3>
                <p className="text-xs sm:text-sm text-brown-600 leading-relaxed">{st.desc}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* 2. Form & Eligibility Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left: Interactive Enquiry Form (7 cols) */}
          <div id="enquiry-form" className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-soft-md scroll-mt-24">
            <AdmissionEnquiryForm selectedGrade={selectedGrade} />
          </div>

          {/* Right: Eligibility Placeholders (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-cream-100/60 rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-soft-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-saffron-600 block mb-1">
                ELIGIBILITY GUIDELINES
              </span>
              <h3 className="text-lg font-bold text-brown-800 mb-2">
                Age Criteria Guidelines
              </h3>
              <p className="text-xs text-brown-600 mb-5">
                Note: Age requirements are indicative based on annual academic guidelines.
              </p>

              <div className="space-y-3">
                {eligibilityGuidelines.map((el, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-white border border-cream-200">
                    <div className="mb-1">
                      <span className="text-xs font-bold text-brown-800">{el.grade}</span>
                    </div>
                    <div className="text-xs font-semibold text-saffron-600 mb-1">
                      {typeof el.ageCriteria === 'string' ? el.ageCriteria.replace(/\s*\(Placeholder\)/gi, '').trim() : el.ageCriteria}
                    </div>
                    <p className="text-[11px] text-brown-600 leading-relaxed">{el.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Fee Structure Section */}
        <div id="fee-structure" className="scroll-mt-24">
          <SectionHeading
            badge="TRANSPARENT TUITION SCHEDULE"
            title="Class-Wise"
            highlight="Fee Structure"
            subtitle="Transparent fee breakdown for Nursery through Class 5. Direct, honest figures with zero hidden surcharges or surprise levies."
          />

          {/* Fee Schedule Controls & Academic Session Bar */}
          <div className="bg-white rounded-2xl border border-cream-200 p-4 mb-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cream-100 border border-cream-200 text-xs font-bold text-brown-800">
                <Calendar className="w-3.5 h-3.5 text-saffron-600" />
                <span>Academic Session:</span>
                <select
                  value={feeSession}
                  onChange={(e) => setFeeSession(e.target.value)}
                  className="bg-transparent text-brown-800 font-extrabold cursor-pointer focus:outline-none"
                  aria-label="Select Academic Session"
                >
                  {availableSessions.map((s) => (
                    <option key={s} value={s}>
                      {s} {s === '2026-27' ? '(Upcoming)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-lg">
                <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Indicative Schedule • Subject to Administrative Confirmation</span>
              </span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => loadFeeStructures(feeSession)}
                disabled={feesLoading}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brown-700 hover:text-saffron-600 px-3 py-1.5 rounded-xl border border-cream-200 hover:border-gold-400 bg-cream-50 hover:bg-white transition-all shadow-2xs cursor-pointer"
                title="Refresh fee data from school server"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-saffron-600 ${feesLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Schedule</span>
              </button>
            </div>
          </div>

          {/* Desktop & Tablet Table (md and up) */}
          <div className="hidden md:block bg-white rounded-3xl border border-cream-200 shadow-soft-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-cream-100 via-cream-200 to-cream-100 border-b border-cream-200 text-brown-900 text-xs uppercase tracking-wider font-extrabold">
                    <th className="py-4 px-5">Class / Grade</th>
                    <th className="py-4 px-4 text-right">
                      Admission Fee
                      <span className="block text-[10px] font-normal text-brown-600 lowercase tracking-normal">
                        (one-time, new adm.)
                      </span>
                    </th>
                    <th className="py-4 px-4 text-right">
                      Monthly Tuition
                      <span className="block text-[10px] font-normal text-brown-600 lowercase tracking-normal">
                        (payable monthly)
                      </span>
                    </th>
                    <th className="py-4 px-4 text-right">
                      Annual Charges
                      <span className="block text-[10px] font-normal text-brown-600 lowercase tracking-normal">
                        (activity & dev.)
                      </span>
                    </th>
                    <th className="py-4 px-4 text-right">
                      Other Charges
                      <span className="block text-[10px] font-normal text-brown-600 lowercase tracking-normal">
                        (exam & stationery)
                      </span>
                    </th>
                    <th className="py-4 px-4 text-right">
                      Bus Fee
                      <span className="block text-[10px] font-normal text-brown-600 lowercase tracking-normal">
                        (transport / mo)
                      </span>
                    </th>
                    <th className="py-4 px-5 text-right bg-gold-400/10">
                      Total Annual Fee
                      <span className="block text-[10px] font-normal text-brown-600 lowercase tracking-normal">
                        (new admission est.)
                      </span>
                    </th>
                    <th className="py-4 px-5 text-center">Enquire</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100 text-xs sm:text-sm">
                  {feesLoading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-brown-600">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-saffron-600 mb-2" />
                        <p className="font-semibold text-xs">Loading official fee schedules...</p>
                      </td>
                    </tr>
                  ) : feeSchedules.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-brown-600">
                        <Receipt className="w-8 h-8 text-cream-300 mx-auto mb-2" />
                        <p className="font-bold text-sm text-brown-800">Fee details are currently unavailable. Please contact the school office.</p>
                        <p className="text-xs text-brown-600 mt-1">Please check with the admissions office desk in Daulatyarpur.</p>
                      </td>
                    </tr>
                  ) : (
                    feeSchedules.map((row) => {
                      const totalAnnual = calculateTotalEstimatedAnnualFee(row);
                      const continuingAnnual =
                        (Number(row.monthlyTuitionFee) || 0) * 12 +
                        (Number(row.annualCharges) || 0) +
                        (Number(row.otherCharges) || 0);

                      return (
                        <tr
                          key={row._id || row.id || row.classGrade}
                          className="hover:bg-cream-50/70 transition-colors"
                        >
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-brown-900 text-sm">{row.classGrade}</span>
                              {row.isVerified ? (
                                <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                  Official
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded" title="Subject to administrator confirmation">
                                  Indicative
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-brown-600 block mt-0.5">
                              {['Nursery', 'LKG', 'UKG'].includes(row.classGrade) ? 'Foundational Stage' : 'Primary Wing (Grade 1–5)'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right font-medium text-brown-700 font-mono">
                            ₹{(Number(row.admissionFee) || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-4 px-4 text-right font-medium text-brown-700 font-mono">
                            ₹{(Number(row.monthlyTuitionFee) || 0).toLocaleString('en-IN')}
                            <span className="text-[10px] text-brown-600 block font-sans">/ month</span>
                          </td>
                          <td className="py-4 px-4 text-right font-medium text-brown-700 font-mono">
                            ₹{(Number(row.annualCharges) || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-4 px-4 text-right font-medium text-brown-700 font-mono">
                            ₹{(Number(row.otherCharges) || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-4 px-4 text-right font-medium text-brown-700 font-mono">
                            ₹{(Number(row.busFee) || 0).toLocaleString('en-IN')}
                            <span className="text-[10px] text-brown-600 block font-sans">/ month</span>
                          </td>
                          <td className="py-4 px-5 text-right bg-gold-400/5">
                            <div className="font-extrabold text-saffron-700 text-base font-mono">
                              ₹{totalAnnual.toLocaleString('en-IN')}
                            </div>
                            <span className="text-[10px] text-brown-600 block" title="Continuing students without one-time admission fee">
                              (₹{continuingAnnual.toLocaleString('en-IN')} for re-enrollment)
                            </span>
                          </td>
                          <td className="py-4 px-5 text-center">
                            <button
                              type="button"
                              onClick={() => scrollToEnquiry(row.classGrade)}
                              className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#F28C28] hover:bg-[#E67E22] text-white shadow-xs transition-colors cursor-pointer"
                            >
                              <span>Enquire</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card Grid (below md) */}
          <div className="md:hidden space-y-4">
            {feesLoading ? (
              <div className="py-8 text-center text-brown-600 bg-white rounded-2xl border border-cream-200">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-saffron-600 mb-2" />
                <p className="font-semibold text-xs">Loading fee schedule...</p>
              </div>
            ) : feeSchedules.length === 0 ? (
              <div className="p-6 text-center text-brown-600 bg-white rounded-2xl border border-cream-200">
                <Receipt className="w-8 h-8 text-cream-300 mx-auto mb-2" />
                <p className="font-bold text-sm text-brown-800">Fee details are currently unavailable. Please contact the school office.</p>
              </div>
            ) : (
              feeSchedules.map((row) => {
                const totalAnnual = calculateTotalEstimatedAnnualFee(row);

                return (
                  <div
                    key={row._id || row.id || row.classGrade}
                    className="p-5 rounded-2xl bg-white border border-cream-200 shadow-soft-sm space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-cream-100 pb-2.5">
                      <div>
                        <h4 className="text-base font-extrabold text-brown-800">{row.classGrade}</h4>
                        <span className="text-[11px] text-brown-600">
                          {['Nursery', 'LKG', 'UKG'].includes(row.classGrade) ? 'Foundational Pre-Primary' : 'Primary Wing'} • {row.academicSession || feeSession}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${row.isVerified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                        {row.isVerified ? 'Official Schedule' : 'Indicative Estimate'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="p-2.5 rounded-xl bg-cream-50 border border-cream-200/60">
                        <span className="text-[10px] text-brown-600 block">Admission Fee (1-Time)</span>
                        <span className="font-bold text-brown-800 font-mono">₹{(Number(row.admissionFee) || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-cream-50 border border-cream-200/60">
                        <span className="text-[10px] text-brown-600 block">Monthly Tuition Fee</span>
                        <span className="font-bold text-brown-800 font-mono">₹{(Number(row.monthlyTuitionFee) || 0).toLocaleString('en-IN')} / mo</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-cream-50 border border-cream-200/60">
                        <span className="text-[10px] text-brown-600 block">Annual Charges</span>
                        <span className="font-bold text-brown-800 font-mono">₹{(Number(row.annualCharges) || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-cream-50 border border-cream-200/60">
                        <span className="text-[10px] text-brown-600 block">Other Charges</span>
                        <span className="font-bold text-brown-800 font-mono">₹{(Number(row.otherCharges) || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-cream-50 border border-cream-200/60 col-span-2">
                        <span className="text-[10px] text-brown-600 block">Bus Fee (Transport)</span>
                        <span className="font-bold text-brown-800 font-mono">₹{(Number(row.busFee) || 0).toLocaleString('en-IN')} / mo</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-cream-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-brown-600 block">Total Est. Annual Fee</span>
                        <span className="text-lg font-black text-saffron-700 font-mono">₹{totalAnnual.toLocaleString('en-IN')}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => scrollToEnquiry(row.classGrade)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-[#F28C28] hover:bg-[#E67E22] text-white shadow-xs transition-colors cursor-pointer"
                      >
                        <span>Enquire for {row.classGrade}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Institutional Policy Note Banner */}
          <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-cream-100/70 border border-gold-300/70 shadow-2xs space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-cream-200 text-saffron-700 flex items-center justify-center shrink-0 mt-0.5">
                <Info className="w-4 h-4" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-sm font-extrabold text-brown-900">
                  Important Institutional Policy & Fee Calculation Disclosure
                </h4>
                <ul className="space-y-1.5 text-xs text-brown-700 leading-relaxed list-disc list-inside">
                  <li>
                    <strong>Annual Calculation Formula:</strong> Total Estimated Annual Fee is calculated as: <code>Admission Fee (one-time) + (12 × Monthly Tuition Fee) + Annual Charges + Other Charges</code>.
                  </li>
                  <li>
                    <strong>Existing & Continuing Students:</strong> Students continuing from previous academic sessions do not pay the one-time admission fee upon annual progression into subsequent classes.
                  </li>
                  <li>
                    <strong>Policy & Administrative Confirmation:</strong> The amounts shown above are indicative fee schedules configured for planning purposes. Official fees are subject to school management committee policies and final verification at the administrative office in Daulatyarpur, Madhoganj.
                  </li>
                  <li>
                    <strong>Installment Modes:</strong> Parents may remit tuition fees on a monthly, quarterly, or half-yearly basis at the school cashier desk with official numbered receipts.
                  </li>
                </ul>
              </div>
            </div>

            {/* Direct Inquiry CTAs */}
            <div className="pt-3 border-t border-gold-300/50 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-brown-600 font-medium">
                Have questions regarding fee concessions, transportation, or siblings?
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => scrollToEnquiry()}
                  leftIcon={<HelpCircle className="w-4 h-4" />}
                >
                  Enquire About Fees & Enrollment
                </Button>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brown-800 hover:text-saffron-700 px-3 py-2 rounded-xl border border-cream-300 hover:border-gold-400 bg-white transition-all shadow-2xs"
                >
                  <span>Contact School Desk</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Required Documents Section */}
        <div>
          <SectionHeading
            badge="CHECKLIST"
            title="Required Documents for"
            highlight="Enrollment"
            subtitle="Please prepare the following documents during physical verification and admission confirmation."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {requiredDocuments.map((doc, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-cream-200 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-cream-200 text-saffron-600 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        doc.mandatory
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-cream-200 text-brown-700'
                      }`}
                    >
                      {doc.mandatory ? 'Mandatory' : 'If Applicable'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-brown-800 mb-1.5">{doc.title}</h4>
                  <p className="text-xs text-brown-600 leading-relaxed">{doc.desc}</p>
                </div>
                <div className="mt-4 pt-2 border-t border-cream-200 flex items-center gap-1.5 text-[11px] text-saffron-600 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-saffron-600" />
                  <span>Standard Document Checklist</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Important Information */}
        <div className="bg-cream-100/60 rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-soft-sm">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-saffron-600 block">
              ADMISSION DESK DIRECTIVES
            </span>
            <h3 className="text-xl font-bold text-brown-800">
              Important Information for Parents & Guardians
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-brown-600 leading-relaxed pt-1">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-saffron-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Academic Session Start:</strong> The annual academic session commences in April. Admissions remain open on a rolling basis subject to seat availability in Nursery through Class 5.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-saffron-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Office Hours:</strong> The school administrative desk is open Monday to Saturday from <strong>8:00 AM to 2:00 PM</strong> for physical enquiries and campus visits.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-saffron-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Campus Location:</strong> N.D.R.N Vidyalaya is located in <strong>Daulatyarpur, Madhoganj, Uttar Pradesh</strong>.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* 5. Strong Admission CTA Banner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-brown-950 via-brown-900 to-brown-800 text-white shadow-soft-md flex flex-col md:flex-row items-center justify-between gap-6 border border-cream-200">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-2xl font-black text-white">
              Ready to Join N.D.R.N Vidyalaya?
            </h3>
            <p className="text-xs sm:text-sm text-cream-100">
              Provide your child with a strong, caring foundation from Nursery to Class 5.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsMapModalOpen(true)}
              className="inline-flex items-center justify-center font-bold text-sm px-5 py-2.5 rounded-xl bg-[#F28C28] hover:bg-[#E67E22] text-[#FFFFFF] shadow-sm hover:shadow-md transition-all duration-200 border border-[#F28C28] hover:border-[#E67E22] min-h-[44px] cursor-pointer"
            >
              Visit Campus
            </button>
            <a
              href={(() => {
                const dest = getPrincipalWhatsAppDestination(settings);
                return dest
                  ? `https://wa.me/${dest}?text=${encodeURIComponent('Hello, I have an inquiry regarding admissions at N.D.R.N Vidyalaya.')}`
                  : `https://wa.me/?text=${encodeURIComponent('Hello, I have an inquiry regarding admissions at N.D.R.N Vidyalaya.')}`;
              })()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 font-bold text-sm px-5 py-2.5 rounded-xl bg-[#F28C28] hover:bg-[#E67E22] text-[#FFFFFF] shadow-sm hover:shadow-md transition-all duration-200 border border-[#F28C28] hover:border-[#E67E22] min-h-[44px]"
            >
              <MessageCircle className="w-4 h-4 text-white shrink-0" />
              <span>WhatsApp Admission Desk</span>
            </a>
          </div>
        </div>

        {/* Campus Location Map Modal */}
        <Modal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          title="Campus Location & Navigation"
          subtitle={`Daulatyarpur, Madhoganj • Official Campus of ${SCHOOL_CONFIG.name}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
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
                  <h4 className="text-base sm:text-lg font-bold text-brown-800 group-hover:text-saffron-600 transition-colors">
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
        </Modal>
      </div>
    </PageContainer>
  );
}
