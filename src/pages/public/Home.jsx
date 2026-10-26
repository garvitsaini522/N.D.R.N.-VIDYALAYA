import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Award,
  Users,
  Compass,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  HeartHandshake,
  Baby,
  Smile,
  Palette,
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Camera,
  Layers,
  ZoomIn,
  X,
  AlertCircle,
  School,
  Sun,
  Shield
} from 'lucide-react';
import Button from '../../components/common/Button';
import SectionHeading from '../../components/common/SectionHeading';
import { Card, FeatureCard } from '../../components/common/Card';
import SchoolLogo from '../../components/common/SchoolLogo';
import CampusMap from '../../components/common/CampusMap';
import { api } from '../../services/api';
import { useSchoolSettings } from '../../context/SchoolSettingsContext';
import { SCHOOL_CONFIG, PRINCIPAL_WHATSAPP_NUMBER, getPrincipalWhatsAppDestination } from '../../config/schoolConfig';

export default function Home() {
  const { settings } = useSchoolSettings();
  // Principal Connect Form State
  const [connectForm, setConnectForm] = useState({
    visitorName: '',
    mobileNumber: '',
    message: '',
  });
  const [connectErrors, setConnectErrors] = useState({});
  const [connectSuccess, setConnectSuccess] = useState(false);

  // Gallery Lightbox Modal State
  const [activeGalleryItem, setActiveGalleryItem] = useState(null);

  // Dynamic Live Content from Admin / API
  const [liveGallery, setLiveGallery] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function loadDynamicContent() {
      try {
        const galleryData = await api.getGallery();
        if (isMounted && Array.isArray(galleryData) && galleryData.length > 0) {
          setLiveGallery(galleryData.slice(0, 4));
        }
      } catch {
        // Fallback to static seed lists
      }
    }
    loadDynamicContent();

    const handleUpdate = () => {
      loadDynamicContent();
    };
    window.addEventListener('ndrn:gallery-updated', handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('ndrn:gallery-updated', handleUpdate);
    };
  }, []);

  // Validation & WhatsApp dispatch for Principal Connect
  const handleConnectPrincipal = (e) => {
    e.preventDefault();
    const errors = {};

    const trimmedName = connectForm.visitorName.trim();
    const trimmedPhone = connectForm.mobileNumber.trim();
    const trimmedMessage = connectForm.message.trim();

    if (!trimmedName || trimmedName.length < 2) {
      errors.visitorName = 'Please enter your full name (minimum 2 characters).';
    }

    // Validate mobile number: minimum 10 digits
    const digitsOnly = trimmedPhone.replace(/\D/g, '');
    if (!trimmedPhone || digitsOnly.length < 10) {
      errors.mobileNumber = 'Please enter a valid mobile number (at least 10 digits).';
    }

    if (!trimmedMessage || trimmedMessage.length < 5) {
      errors.message = 'Please write a brief message (minimum 5 characters).';
    }

    if (Object.keys(errors).length > 0) {
      setConnectErrors(errors);
      setConnectSuccess(false);
      return;
    }

    setConnectErrors({});

    // Construct the formatted WhatsApp message
    // NOTE: The visitor's mobile number is included ONLY in this prefilled message text,
    // and is NEVER assumed or used as the WhatsApp destination recipient.
    const formattedText = `Namaste Principal / Director Sir/Madam,

I would like to connect regarding ${SCHOOL_CONFIG.name}.

• Visitor Name: ${trimmedName}
• Mobile Number: ${trimmedPhone}
• Message: ${trimmedMessage}

(Sent via N.D.R.N Vidyalaya Website)`;

    // Resolve Principal WhatsApp destination number from single central configuration
    const targetWhatsApp = getPrincipalWhatsAppDestination(settings);

    // Standard WhatsApp Universal URL:
    // If targetWhatsApp is configured, it opens a direct chat with the Principal.
    // If not yet configured, opens WhatsApp compose with prefilled text (NEVER targeting the visitor's own number).
    const whatsappUrl = targetWhatsApp
      ? `https://wa.me/${targetWhatsApp}?text=${encodeURIComponent(formattedText)}`
      : `https://wa.me/?text=${encodeURIComponent(formattedText)}`;

    // Open WhatsApp in a new tab/window
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    setConnectSuccess(true);
    setConnectForm({ visitorName: '', mobileNumber: '', message: '' });
  };

  // 1. School Highlights Data
  const schoolHighlights = [
    {
      icon: <GraduationCap className="w-6 h-6" />,
      title: 'Quality Education',
      description:
        'Structured, age-appropriate instruction designed to cultivate foundational literacy, numeracy, and strong conceptual understanding in early learners.',
    },
    {
      icon: <HeartHandshake className="w-6 h-6" />,
      title: 'Student Development',
      description:
        'A nurturing atmosphere encouraging moral grounding, respectful peer interaction, self-confidence, and intellectual curiosity across all primary grades.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: 'Safe Learning Environment',
      description:
        'Attentive supervision, child-friendly classroom spaces, and a secure, supportive campus where every student feels valued and protected.',
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: 'Co-curricular Activities',
      description:
        'Creative arts, drawing, storytelling, music, and physical play that promote well-rounded growth and joyful childhood memories.',
    },
  ];

  const displayGallery = liveGallery;

  return (
    <div className="w-full bg-white text-brown-800">
      {/* =========================================================
          SECTION 1: HERO SECTION
          Large premium hero with school name, welcoming headline,
          supporting text, Primary CTA, Secondary CTA, and easily
          replaceable school image placeholder.
      ========================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-cream-200 via-cream-100 to-white py-14 sm:py-20 lg:py-24 border-b border-cream-200">
        {/* Subtle patterned backdrop in gold */}
        <div className="absolute inset-0 bg-[radial-gradient(#D4A017_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.05] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-12 items-center">
            {/* Left Content (7 Cols) */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Institutional Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cream-200 border border-gold-500/30 text-saffron-700 text-xs font-bold tracking-wide uppercase shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                <span>{SCHOOL_CONFIG.schoolType} • {SCHOOL_CONFIG.location.town}, {SCHOOL_CONFIG.location.state}</span>
              </div>

              {/* Main Headline */}
              <div>
                <span className="block text-sm sm:text-base font-extrabold uppercase tracking-widest text-saffron-600 mb-2">
                  Welcome to
                </span>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-brown-800 tracking-tight leading-[1.12]">
                  {SCHOOL_CONFIG.name}
                </h1>
                <p className="mt-3 text-lg sm:text-2xl font-bold text-brown-700 leading-snug">
                  Inspiring Young Minds, Building Foundational Excellence
                </p>
              </div>

              {/* Short Supporting Text */}
              <p className="text-sm sm:text-base text-brown-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                A dedicated UP Board school located in <strong className="text-brown-800">Daulatyarpur, Madhoganj, Uttar Pradesh</strong>, providing nurturing, value-oriented education from <strong className="text-brown-800">Nursery to Class 5</strong>.
              </p>

              {/* CTAs: Primary & Secondary */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                <Button
                  href="#about"
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto font-bold shadow-soft-md"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Explore Our School
                </Button>
                <Button
                  to="/admissions"
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto font-bold border-brown-200 hover:border-saffron-500"
                >
                  Admission Enquiry
                </Button>
              </div>

              {/* Quick Key Badges */}
              <div className="pt-4 border-t border-cream-200 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-brown-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-gold-600" />
                  <span>UP Board</span>
                </span>
                <span className="text-brown-300">•</span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-gold-600" />
                  <span>Nursery to Class 5</span>
                </span>
                <span className="text-brown-300">•</span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-gold-600" />
                  <span>Daulatyarpur, Madhoganj (U.P.)</span>
                </span>
              </div>
            </div>

            {/* Right: Large School Image Placeholder (5 Cols)
                Replacing the placeholder with a real school photo requires simply
                updating SCHOOL_CONFIG.images.heroImage in src/config/schoolConfig.js! */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Decorative border backdrop */}
                <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-saffron-500/20 via-gold-400/25 to-transparent blur-lg -z-10" />

                <div className="relative bg-white rounded-3xl border-2 border-gold-500/30 p-4 sm:p-5 shadow-soft-xl overflow-hidden group">
                  {/* Official Emblem Floating Seal */}
                  <div className="absolute top-7 left-7 z-20 flex items-center gap-2.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-soft-md border border-gold-500/40">
                    <img
                      src="/logo.png"
                      alt="N.D.R.N. Vidyalaya Official Emblem"
                      className="w-6 h-6 object-contain rounded-full"
                    />
                    <span className="text-[11px] font-bold text-brown-800 tracking-wide">
                      N.D.R.N. Vidyalaya
                    </span>
                  </div>

                  {SCHOOL_CONFIG.images.heroImage ? (
                    /* Actual School Image when provided */
                    <img
                      src={SCHOOL_CONFIG.images.heroImage}
                      alt={SCHOOL_CONFIG.name}
                      className="w-full h-80 sm:h-[420px] object-cover object-top rounded-2xl"
                    />
                  ) : (
                    /* Premium Architectural School Image Placeholder */
                    <div className="w-full h-80 sm:h-96 rounded-2xl bg-gradient-to-br from-brown-950 via-brown-900 to-brown-800 flex flex-col justify-between p-6 text-white relative overflow-hidden">
                      {/* Architectural Blueprint grid overlay */}
                      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

                      {/* Top Bar inside placeholder */}
                      <div className="flex items-center justify-between relative z-10">
                        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-white/10 backdrop-blur-xs border border-white/20 text-gold-300">
                          School Campus
                        </span>
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-cream-200">
                          <Camera className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Center Crest & Watermark */}
                      <div className="my-auto text-center relative z-10 space-y-2">
                        <div className="w-16 h-16 rounded-2xl bg-white p-1 border border-white/20 flex items-center justify-center mx-auto shadow-soft-sm">
                          <img src="/logo.png" alt="N.D.R.N. Vidyalaya Crest" className="w-full h-full object-contain rounded-xl" />
                        </div>
                        <h3 className="text-xl font-black text-white tracking-tight">
                          {SCHOOL_CONFIG.name}
                        </h3>
                        <p className="text-xs text-cream-200 font-medium">
                          Daulatyarpur, Madhoganj, Uttar Pradesh
                        </p>
                      </div>

                      {/* Bottom school information badge */}
                      <div className="relative z-10 p-3 rounded-xl bg-black/40 backdrop-blur-xs border border-white/10 text-center">
                        <span className="text-[11px] font-semibold text-cream-100 block">
                          N.D.R.N. Vidyalaya Campus
                        </span>
                        <span className="text-[10px] text-cream-200/80 block mt-0.5">
                          Daulatyarpur, Madhoganj, Uttar Pradesh
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Caption Strip */}
                  <div className="mt-3.5 px-2 flex items-center justify-between text-xs text-brown-500">
                    <span className="font-semibold text-brown-800">N.D.R.N Vidyalaya Campus</span>
                    <span>Nursery to Class 5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 2: SCHOOL INTRODUCTION
          Concise introduction mentioning:
          - Daulatyarpur
          - Madhoganj
          - Uttar Pradesh
          - UP Board school
          - Nursery to Class 5
          (No invented history, achievements, affiliations, or claims)
      ========================================================= */}
      <section id="about" className="py-16 sm:py-20 bg-white border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="INSTITUTIONAL PROFILE"
            title="Introduction to"
            highlight="N.D.R.N Vidyalaya"
            subtitle="A trusted private educational center delivering foundational learning in Daulatyarpur, Madhoganj."
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-5">
              <div className="prose prose-slate max-w-none text-brown-600 text-sm sm:text-base leading-relaxed">
                <p>
                  <strong className="text-brown-800 font-bold">N.D.R.N Vidyalaya</strong> is a UP Board school established in <strong className="text-brown-800 font-semibold">Daulatyarpur, Madhoganj, Uttar Pradesh</strong>. The school is committed to offering high-quality primary and early childhood education catering specifically to children from <strong className="text-brown-800 font-semibold">Nursery to Class 5</strong>.
                </p>
                <p>
                  At N.D.R.N Vidyalaya, our primary objective is to create a welcoming, secure, and encouraging environment where foundational literacy, numeracy, and essential moral values are fostered from the very first day. We work closely with parents to ensure that every student receives patient guidance and personal attention.
                </p>
              </div>

              {/* Factual Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-cream-100/70 border border-cream-300 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cream-200 text-saffron-600 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-brown-500 uppercase tracking-wider">Location</h4>
                    <p className="text-sm font-bold text-brown-800 mt-0.5">
                      Daulatyarpur, Madhoganj, Uttar Pradesh
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-cream-100/70 border border-cream-300 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cream-200 text-saffron-600 flex items-center justify-center flex-shrink-0">
                    <School className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-brown-500 uppercase tracking-wider">Institution Type</h4>
                    <p className="text-sm font-bold text-brown-800 mt-0.5">
                      UP Board
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-cream-100/70 border border-cream-300 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cream-200 text-saffron-600 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-brown-500 uppercase tracking-wider">Classes Offered</h4>
                    <p className="text-sm font-bold text-brown-800 mt-0.5">
                      Nursery to Class 5
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-cream-100/70 border border-cream-300 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cream-200 text-saffron-600 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-brown-500 uppercase tracking-wider">Foundational Ethos</h4>
                    <p className="text-sm font-bold text-brown-800 mt-0.5">
                      Disciplined & Caring Atmosphere
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Feature Card */}
            <div className="lg:col-span-5">
              <div className="bg-gradient-to-br from-brown-900 to-brown-800 rounded-3xl p-6 sm:p-8 text-white shadow-soft-lg border border-gold-500/20">
                <span className="text-xs font-extrabold uppercase tracking-wider text-gold-300 block mb-2">
                  Our Educational Commitment
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mb-3">
                  A Strong Start for Every Child
                </h3>
                <p className="text-xs sm:text-sm text-cream-200/90 leading-relaxed mb-6">
                  Early school years shape a child's attitude towards lifelong learning. At N.D.R.N Vidyalaya, every classroom experience is designed to encourage active thinking, respectful communication, and moral strength.
                </p>

                <div className="space-y-3 pt-2 border-t border-white/10 text-xs">
                  <div className="flex items-center gap-2 text-cream-100">
                    <CheckCircle2 className="w-4 h-4 text-gold-400 flex-shrink-0" />
                    <span>Individual attention for early learners</span>
                  </div>
                  <div className="flex items-center gap-2 text-cream-100">
                    <CheckCircle2 className="w-4 h-4 text-gold-400 flex-shrink-0" />
                    <span>Balanced mental, emotional & creative development</span>
                  </div>
                  <div className="flex items-center gap-2 text-cream-100">
                    <CheckCircle2 className="w-4 h-4 text-gold-400 flex-shrink-0" />
                    <span>Regular communication and updates with guardians</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 3: SCHOOL HIGHLIGHTS
          Attractive cards for:
          - Quality Education
          - Student Development
          - Safe Learning Environment
          - Co-curricular Activities
          (Professional wording, no unsupported factual claims)
      ========================================================= */}
      <section id="highlights" className="py-16 sm:py-20 bg-cream-200/50 border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="KEY HIGHLIGHTS"
            title="Pillars of Our"
            highlight="Schooling"
            subtitle="Thoughtfully structured areas that define daily student life at N.D.R.N Vidyalaya."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {schoolHighlights.map((hl, idx) => (
              <Card key={idx} className="p-6 bg-white flex flex-col justify-between border-cream-300">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-cream-200 text-saffron-600 flex items-center justify-center mb-5 border border-gold-500/30 shadow-2xs">
                    {hl.icon}
                  </div>
                  <h3 className="text-lg font-bold text-brown-800 mb-2">
                    {hl.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-brown-600 leading-relaxed">
                    {hl.description}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-cream-200 flex items-center gap-1.5 text-xs font-semibold text-saffron-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gold-600" />
                  <span>Foundational Focus</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 4: PRINCIPAL / DIRECTOR SECTION
          - Image placeholder
          - Name placeholder
          - Message placeholder
          - "Connect with Principal" functionality:
            - Visitor Name, Mobile Number, Message
            - Validates fields
            - Opens WhatsApp with properly pre-filled encoded text
            - Configurable Principal WhatsApp number
            - Clear non-guaranteed delivery notice
      ========================================================= */}
      <section id="principal" className="py-16 sm:py-20 bg-white border-b border-cream-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="LEADERSHIP & GUIDANCE"
            title="Message from the"
            highlight="Principal / Director"
            subtitle="Guiding young learners through dedicated mentorship, discipline, and parental collaboration."
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start">
            {/* Left: Principal Profile & Message (6 cols) */}
            <div className="lg:col-span-6 space-y-6 bg-cream-100/60 rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-soft-sm">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                {/* Image Placeholder */}
                <div className="flex-shrink-0">
                  {SCHOOL_CONFIG.leadership.image ? (
                    <img
                      src={SCHOOL_CONFIG.leadership.image}
                      alt={SCHOOL_CONFIG.leadership.name || 'D.K. Saini'}
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-2 border-cream-300 shadow-soft-sm"
                    />
                  ) : (
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-brown-900 to-brown-800 border-2 border-gold-400/40 flex flex-col items-center justify-center p-3 text-white text-center shadow-soft-sm">
                      <GraduationCap className="w-8 h-8 text-gold-400 mb-1" />
                      <span className="text-[10px] font-bold text-cream-100 block">
                        D.K. Saini
                      </span>
                      <span className="text-[9px] text-cream-200/80 block mt-0.5">
                        Principal & Head
                      </span>
                    </div>
                  )}
                </div>

                {/* Name & Title */}
                <div className="text-center sm:text-left">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-saffron-600 block mb-1">
                    {SCHOOL_CONFIG.leadership.title}
                  </span>
                  <h3 className="text-xl font-extrabold text-brown-800">
                    {SCHOOL_CONFIG.leadership.name || 'D.K. Saini'}
                  </h3>
                  <p className="text-xs text-brown-600 mt-0.5">
                    {SCHOOL_CONFIG.leadership.designation}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-brown-700 bg-white px-2.5 py-1 rounded-md border border-cream-200">
                    <MapPin className="w-3 h-3 text-saffron-600" />
                    <span>Daulatyarpur, Madhoganj (U.P.)</span>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="border-t border-cream-200 pt-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brown-500/80 mb-2">
                  Institutional Message
                </h4>
                <div className="text-xs sm:text-sm text-brown-800 leading-relaxed italic bg-white p-4 rounded-xl border border-cream-200/80">
                  “{SCHOOL_CONFIG.leadership.message}”
                </div>
              </div>

              <div className="text-xs text-brown-600 flex items-center gap-2 pt-1">
                <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                <span>We welcome parents to visit our campus and meet with our faculty.</span>
              </div>
            </div>

            {/* Right: Connect with Principal Form (6 cols) */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-soft-md">
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cream-200 text-brown-800 border border-gold-400/40 mb-2">
                  <MessageCircle className="w-3.5 h-3.5 text-saffron-600" />
                  <span>Direct Communication via WhatsApp</span>
                </div>
                <h3 className="text-xl font-extrabold text-brown-800">
                  Connect with Principal
                </h3>
                <p className="text-xs sm:text-sm text-brown-600 mt-1">
                  Have an admission enquiry, academic query, or concern? Submit the details below to open a direct WhatsApp chat with the Principal's desk.
                </p>
              </div>

              {connectSuccess && (
                <div className="p-4 mb-5 rounded-2xl bg-cream-200 border border-gold-400/50 text-xs text-brown-800 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-saffron-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">WhatsApp Chat Window Opened!</span>
                    <span>Your message has been pre-filled. Please tap "Send" in WhatsApp to dispatch it directly to the Principal.</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleConnectPrincipal} className="space-y-4" noValidate>
                {/* Visitor Name */}
                <div>
                  <label htmlFor="visitorName" className="block text-xs font-bold text-brown-700 mb-1">
                    Visitor Full Name <span className="text-saffron-600">*</span>
                  </label>
                  <input
                    id="visitorName"
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={connectForm.visitorName}
                    onChange={(e) => {
                      setConnectForm({ ...connectForm, visitorName: e.target.value });
                      if (connectErrors.visitorName) setConnectErrors({ ...connectErrors, visitorName: null });
                    }}
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border transition-colors text-brown-800 ${
                      connectErrors.visitorName
                        ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                        : 'border-cream-300 focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 bg-white'
                    }`}
                  />
                  {connectErrors.visitorName && (
                    <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3" />
                      {connectErrors.visitorName}
                    </p>
                  )}
                </div>

                {/* Mobile Number */}
                <div>
                  <label htmlFor="mobileNumber" className="block text-xs font-bold text-brown-700 mb-1">
                    Your Mobile Number <span className="text-saffron-600">*</span>
                  </label>
                  <input
                    id="mobileNumber"
                    type="tel"
                    required
                    placeholder="Enter your 10-digit mobile number"
                    value={connectForm.mobileNumber}
                    onChange={(e) => {
                      setConnectForm({ ...connectForm, mobileNumber: e.target.value });
                      if (connectErrors.mobileNumber) setConnectErrors({ ...connectErrors, mobileNumber: null });
                    }}
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border transition-colors text-brown-800 ${
                      connectErrors.mobileNumber
                        ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                        : 'border-cream-300 focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 bg-white'
                    }`}
                  />
                  {connectErrors.mobileNumber && (
                    <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3" />
                      {connectErrors.mobileNumber}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="visitorMessage" className="block text-xs font-bold text-brown-700 mb-1">
                    Message / Inquiry <span className="text-saffron-600">*</span>
                  </label>
                  <textarea
                    id="visitorMessage"
                    rows={4}
                    required
                    placeholder="Type your message regarding admission, academics, or school visit..."
                    value={connectForm.message}
                    onChange={(e) => {
                      setConnectForm({ ...connectForm, message: e.target.value });
                      if (connectErrors.message) setConnectErrors({ ...connectErrors, message: null });
                    }}
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border transition-colors text-brown-800 ${
                      connectErrors.message
                        ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                        : 'border-cream-300 focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 bg-white'
                    }`}
                  />
                  {connectErrors.message && (
                    <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3" />
                      {connectErrors.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 px-5 rounded-xl bg-saffron-500 hover:bg-saffron-600 active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-soft-sm hover:shadow-soft-md transition-all flex items-center justify-center gap-2 select-none"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Connect with Principal</span>
                </button>
              </form>

              {/* Delivery Disclaimer: Do not claim delivery is guaranteed */}
              <p className="text-[11px] text-brown-500 text-center mt-4 leading-relaxed">
                Note: Submitting this form prepares your message and opens WhatsApp so you can send it directly to the Principal's desk. Delivery is dependent on recipient availability and network status.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 5: GALLERY PREVIEW
      ========================================================= */}
      <section id="gallery" className="py-16 sm:py-20 bg-white border-b border-cream-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="CAMPUS GLIMPSES"
            title="School Visual"
            highlight="Gallery"
            subtitle="Moments of student learning, activities, and campus life."
          />

          {displayGallery.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayGallery.map((item) => (
                <Card
                  key={item.id}
                  className="cursor-pointer group flex flex-col justify-between border-cream-200"
                  onClick={() => setActiveGalleryItem(item)}
                >
                  {/* Visual Image Block */}
                  <div className={`relative h-48 bg-gradient-to-tr ${item.color} p-4 flex flex-col justify-between text-white overflow-hidden`}>
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />

                    <div className="relative z-10 flex justify-between items-start">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/40 backdrop-blur-xs border border-white/20">
                        {item.category}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ZoomIn className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    <div className="relative z-10">
                      <h4 className="text-xs font-bold text-white drop-shadow-xs line-clamp-2 mt-0.5">
                        {item.title}
                      </h4>
                    </div>
                  </div>

                  <div className="p-4 bg-white">
                    <p className="text-xs text-brown-600 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-cream-100/60 rounded-3xl border border-cream-200 p-8 text-center max-w-lg mx-auto">
              <Camera className="w-8 h-8 text-saffron-600 mx-auto mb-2 opacity-60" />
              <p className="text-sm font-bold text-brown-800">No photographs available yet.</p>
              <p className="text-xs text-brown-600 mt-1">Campus photographs and activity memories will be published soon.</p>
            </div>
          )}

          <div className="mt-8 text-center">
            <Button
              to="/gallery"
              variant="outline"
              size="sm"
              className="font-bold"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Explore Complete Gallery
            </Button>
          </div>

          {/* Lightbox Modal for Gallery */}
          {activeGalleryItem && (
            <div
              className="fixed inset-0 z-50 bg-brown-950/80 backdrop-blur-xs flex items-center justify-center p-4"
              onClick={() => setActiveGalleryItem(null)}
            >
              <div
                className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative animate-slide-down border border-cream-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className={`h-60 sm:h-72 bg-gradient-to-tr ${activeGalleryItem.color} p-6 flex flex-col justify-between text-white relative overflow-hidden`}>
                  {activeGalleryItem.image && (
                    <img
                      src={activeGalleryItem.image}
                      alt={activeGalleryItem.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

                  <button
                    type="button"
                    onClick={() => setActiveGalleryItem(null)}
                    className="relative z-10 self-end p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="relative z-10">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-black/40 backdrop-blur-xs border border-white/20">
                      {activeGalleryItem.category}
                    </span>
                    <h3 className="text-lg font-bold mt-2 text-white drop-shadow-xs">
                      {activeGalleryItem.title}
                    </h3>
                  </div>
                </div>
                <div className="p-6 space-y-2">
                  <p className="text-xs sm:text-sm text-brown-700 leading-relaxed">
                    {activeGalleryItem.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          SECTION 6: CONTACT PREVIEW
          Show:
          - School name: N.D.R.N Vidyalaya
          - Location: Daulatyarpur, Madhoganj, Uttar Pradesh
          - Phone placeholder: [Contact Number to be updated]
          - Email placeholder: [Email Address to be updated]
          - Map placeholder: An attractive visual card placeholder
          (Strict adherence: No invented phone numbers, emails, or coordinates)
      ========================================================= */}
      <section id="contact" className="py-16 sm:py-20 bg-cream-200/50 border-b border-cream-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="GET IN TOUCH"
            title="School Contact &"
            highlight="Location"
            subtitle="Connect with our administrative desk or visit our campus in Daulatyarpur, Madhoganj."
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Contact Details Cards (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              {/* School Name Card */}
              <div className="p-5 rounded-2xl bg-white border border-cream-200 shadow-soft-sm flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-cream-200 text-saffron-600 flex items-center justify-center flex-shrink-0">
                  <School className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brown-500 block">
                    School Name
                  </span>
                  <h4 className="text-base font-extrabold text-brown-800 mt-0.5">
                    {SCHOOL_CONFIG.name}
                  </h4>
                  <p className="text-xs text-brown-600 mt-0.5">
                    {SCHOOL_CONFIG.schoolType} • {SCHOOL_CONFIG.levels}
                  </p>
                </div>
              </div>

              {/* Location Card */}
              <a
                href="https://maps.app.goo.gl/5yCbv6myG3H9mEFN7"
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 rounded-2xl bg-white border border-cream-200 shadow-soft-sm flex items-start gap-4 hover:border-gold-400 hover:shadow-soft-md transition-all group cursor-pointer"
                aria-label="View Campus Location on Google Maps"
              >
                <div className="w-12 h-12 rounded-xl bg-cream-200 text-saffron-600 flex items-center justify-center flex-shrink-0 group-hover:bg-saffron-500 group-hover:text-white transition-colors">
                  <MapPin className="w-6 h-6 text-current" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brown-500 block">
                    Campus Location
                  </span>
                  <p className="text-sm font-bold text-brown-800 mt-0.5 group-hover:text-saffron-600 transition-colors">
                    {SCHOOL_CONFIG.location.displayLocation}
                  </p>
                  <p className="text-xs text-brown-600 mt-0.5">
                    Click to open in Google Maps →
                  </p>
                </div>
              </a>

              {/* Phone Card */}
              <a
                href={`tel:${SCHOOL_CONFIG.contact.phone.replace(/[^0-9+]/g, '')}`}
                className="p-5 rounded-2xl bg-white border border-cream-200 shadow-soft-sm flex items-start gap-4 hover:border-gold-400 hover:shadow-soft-md transition-all group cursor-pointer"
                aria-label="Call N.D.R.N. Vidyalaya Office"
              >
                <div className="w-12 h-12 rounded-xl bg-cream-200 text-saffron-600 flex items-center justify-center flex-shrink-0 group-hover:bg-saffron-500 group-hover:text-white transition-colors">
                  <Phone className="w-6 h-6 text-current" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brown-500 block">
                    Contact Phone Number
                  </span>
                  <p className="text-sm font-bold text-brown-800 mt-0.5 group-hover:text-saffron-600 transition-colors">
                    {SCHOOL_CONFIG.contact.phone}
                  </p>
                  <p className="text-xs text-brown-500 mt-0.5">
                    Click to call directly • Mon – Sat: 8:00 AM – 2:00 PM
                  </p>
                </div>
              </a>

              {/* Email Card */}
              <a
                href={`mailto:${SCHOOL_CONFIG.contact.email}`}
                className="p-5 rounded-2xl bg-white border border-cream-200 shadow-soft-sm flex items-start gap-4 hover:border-gold-400 hover:shadow-soft-md transition-all group cursor-pointer"
                aria-label="Email N.D.R.N. Vidyalaya"
              >
                <div className="w-12 h-12 rounded-xl bg-cream-200 text-saffron-600 flex items-center justify-center flex-shrink-0 group-hover:bg-saffron-500 group-hover:text-white transition-colors">
                  <Mail className="w-6 h-6 text-current" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brown-500 block">
                    Email Address
                  </span>
                  <p className="text-sm font-bold text-brown-800 mt-0.5 group-hover:text-saffron-600 transition-colors">
                    {SCHOOL_CONFIG.contact.email}
                  </p>
                  <p className="text-xs text-brown-500 mt-0.5">
                    Click to send email inquiry directly
                  </p>
                </div>
              </a>
            </div>

            {/* Campus Location Map Card (6 cols) */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-cream-200 p-6 sm:p-8 shadow-soft-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-saffron-600 block">
                    Geographical Location
                  </span>
                  <h4 className="text-base font-bold text-brown-800 mt-0.5">
                    Campus Map Preview
                  </h4>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-cream-200 text-brown-700">
                  Daulatyarpur, Madhoganj
                </span>
              </div>

              {/* Interactive Campus Map Preview (Leaflet & OpenStreetMap) */}
              <CampusMap />

              <div className="mt-4 pt-3 border-t border-cream-200 flex items-center justify-between text-xs text-brown-600">
                <span>Visiting Hours: <strong>{SCHOOL_CONFIG.contact.visitingHours}</strong></span>
                <Link to="/contact" className="font-bold text-saffron-600 hover:text-saffron-700 hover:underline">
                  Full Contact Page →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
