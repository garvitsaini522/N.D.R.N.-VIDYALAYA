import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Target,
  Compass,
  Award,
  Shield,
  CheckCircle,
  Users,
  BookOpen,
  School,
  Heart,
  Smile,
  GraduationCap,
  Sparkles,
  MapPin,
  Clock,
  MessageCircle,
  Building,
  Camera
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import SectionHeading from '../../components/common/SectionHeading';
import { Card, FeatureCard } from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import AdmissionEnquiryForm from '../../components/common/AdmissionEnquiryForm';
import { useSchoolSettings } from '../../context/SchoolSettingsContext';
import { SCHOOL_CONFIG, getPrincipalWhatsAppDestination } from '../../config/schoolConfig';

export default function About() {
  const { settings } = useSchoolSettings();
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const values = [
    {
      title: 'Foundational Excellence',
      desc: 'Focusing on core literacy, numeracy, and cognitive development tailored to early childhood and primary stages.',
      badge: '01',
    },
    {
      title: 'Kindness & Empathy',
      desc: 'Nurturing a warm, respectful environment where every young learner learns to care, share, and collaborate.',
      badge: '02',
    },
    {
      title: 'Moral Integrity & Discipline',
      desc: 'Instilling respectful manners, honesty, and responsible habits as the groundwork of good citizenship.',
      badge: '03',
    },
    {
      title: 'Joyful & Active Learning',
      desc: 'Encouraging natural curiosity through stories, creative crafts, exploratory games, and experiential discovery.',
      badge: '04',
    },
  ];

  // Facilities list for School Facilities & Learning Infrastructure
  const facilityPlaceholders = [
    {
      title: 'Child-Friendly Classrooms',
      category: 'Learning Space',
      desc: 'Comfortable, well-ventilated, and age-appropriate classroom seating for Nursery through Class 5 students.',
    },
    {
      title: 'Reading & Activity Corner',
      category: 'Academic Enrichment',
      desc: 'A dedicated reading corner with illustrated picture books, story collections, and early learning aids.',
    },
    {
      title: 'Outdoor Play & Recreation Area',
      category: 'Sports & Play',
      desc: 'Designated outdoor space for physical games, free play, morning drill, and healthy sports activities.',
    },
    {
      title: 'Clean Drinking Water & Hygienic Sanitation',
      category: 'Health & Hygiene',
      desc: 'Maintained sanitation facilities and purified drinking water stations dedicated for young students.',
    },
    {
      title: 'First Aid & Basic Health Support',
      category: 'Student Safety',
      desc: 'Equipped first aid amenities and supervised emergency care procedures for prompt student assistance.',
    },
    {
      title: 'Administrative & Parent Inquiry Desk',
      category: 'Administration',
      desc: 'A welcoming front office for parent-teacher interactions, fee processing, and admission guidance.',
    },
  ];

  // WhatsApp helper for Principal Connect
  const openPrincipalWhatsApp = () => {
    const cleanNumber = getPrincipalWhatsAppDestination(settings);
    const text = `Namaste Principal / Director Sir/Madam,

I am visiting the About section of the ${SCHOOL_CONFIG.name} website and would like to connect regarding the school.

(Inquiry regarding ${SCHOOL_CONFIG.location.displayLocation})`;
    const url = cleanNumber
      ? `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <PageContainer
      title={`About ${SCHOOL_CONFIG.name}`}
      subtitle={`A dedicated UP Board school in ${SCHOOL_CONFIG.location.displayLocation}, nurturing young learners from ${SCHOOL_CONFIG.levels}.`}
      badge="INSTITUTIONAL OVERVIEW"
      breadcrumbs={[{ label: 'About Us' }]}
    >
      <div className="space-y-16">
        {/* 1. School Introduction Card */}
        <div className="bg-white rounded-3xl border border-cream-200 p-8 sm:p-10 shadow-soft-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-200 text-saffron-700 text-xs font-bold uppercase tracking-wider border border-gold-400/40">
                <School className="w-3.5 h-3.5 text-saffron-600" />
                <span>{SCHOOL_CONFIG.schoolType} • {SCHOOL_CONFIG.levels}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-brown-800 tracking-tight">
                About Our School
              </h2>
            </div>
            <div className="shrink-0 flex items-center justify-center p-2 rounded-2xl bg-white border-2 border-gold-500/40 shadow-soft-sm">
              <img
                src="/logo.png"
                alt="N.D.R.N. Vidyalaya Official Emblem"
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-brown-600 leading-relaxed text-sm sm:text-base">
              <strong className="text-brown-800 font-bold">{SCHOOL_CONFIG.name}</strong> is a UP Board educational institution established in <strong className="text-brown-800 font-semibold">{SCHOOL_CONFIG.location.village}, {SCHOOL_CONFIG.location.town}, {SCHOOL_CONFIG.location.state}</strong>. Our school is structured exclusively to provide early childhood and primary schooling, catering to students from <strong className="text-brown-800 font-semibold">{SCHOOL_CONFIG.levels}</strong>.
            </p>
            <p className="text-brown-600 leading-relaxed text-sm sm:text-base">
              We believe that the formative years between Nursery and Class 5 set the tone for all future academic and personal milestones. Our curriculum and daily routines are designed to inspire natural curiosity, develop fundamental linguistic and numerical competencies, and build self-confidence in a secure, disciplined, and supportive environment.
            </p>
          </div>

          {/* Quick Institutional Attributes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 mt-8 border-t border-cream-200">
            <div className="p-4 rounded-xl bg-cream-100/60 border border-cream-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brown-500 block">Location</span>
              <strong className="text-sm font-bold text-brown-800 mt-0.5 block">
                {SCHOOL_CONFIG.location.displayLocation}
              </strong>
            </div>
            <div className="p-4 rounded-xl bg-cream-100/60 border border-cream-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brown-500 block">Class Levels</span>
              <strong className="text-sm font-bold text-brown-800 mt-0.5 block">
                {SCHOOL_CONFIG.levels}
              </strong>
            </div>
            <div className="p-4 rounded-xl bg-cream-100/60 border border-cream-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brown-500 block">Classification</span>
              <strong className="text-sm font-bold text-brown-800 mt-0.5 block">
                {SCHOOL_CONFIG.schoolType}
              </strong>
            </div>
          </div>
        </div>

        {/* 2. Vision and Mission Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-cream-100/80 to-white border border-cream-200 shadow-soft-sm">
            <div className="w-12 h-12 rounded-xl bg-saffron-500 text-white flex items-center justify-center mb-5 shadow-2xs">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-brown-800 mb-3">Our Vision</h2>
            <p className="text-brown-600 leading-relaxed text-sm sm:text-base">
              To be a nurturing and respected center of foundational education in {SCHOOL_CONFIG.location.town}, where young minds from Nursery to Class 5 develop an enduring love for learning, sound moral character, and the essential skills required for future scholastic stages.
            </p>
          </div>

          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-cream-200/50 to-white border border-gold-400/30 shadow-soft-sm">
            <div className="w-12 h-12 rounded-xl bg-gold-500 text-white flex items-center justify-center mb-5 shadow-2xs">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-brown-800 mb-3">Our Mission</h2>
            <p className="text-brown-600 leading-relaxed text-sm sm:text-base">
              To deliver structured, supportive, and accessible primary education by fostering core reading, writing, and arithmetic skills, cultivating mutual respect and discipline, and maintaining transparent collaboration between families and dedicated educators.
            </p>
          </div>
        </div>

        {/* 3. Principal / Director Message Section */}
        <div className="bg-cream-100/60 rounded-3xl border border-cream-200 p-8 sm:p-10 shadow-soft-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Leadership Profile Image & Title */}
            <div className="lg:col-span-4 text-center lg:text-left flex flex-col items-center lg:items-start">
              {SCHOOL_CONFIG.leadership.image ? (
                <img
                  src={SCHOOL_CONFIG.leadership.image}
                  alt={SCHOOL_CONFIG.leadership.namePlaceholder}
                  className="w-32 h-32 rounded-2xl object-cover border-2 border-cream-300 shadow-soft-md mb-4"
                />
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-brown-950 to-brown-800 border-2 border-gold-400/30 flex flex-col items-center justify-center text-white shadow-soft-md mb-4 p-3 text-center">
                  <GraduationCap className="w-10 h-10 text-gold-400 mb-1" />
                  <span className="text-[10px] font-bold text-cream-100">[ Photo Placeholder ]</span>
                  <span className="text-[9px] text-cream-200/80">Principal / Director</span>
                </div>
              )}
              <span className="text-xs font-bold uppercase tracking-wider text-saffron-600">
                {SCHOOL_CONFIG.leadership.title}
              </span>
              <h3 className="text-xl font-black text-brown-800 mt-0.5">
                {SCHOOL_CONFIG.leadership.namePlaceholder}
              </h3>
              <p className="text-xs text-brown-600 mt-0.5">
                {SCHOOL_CONFIG.leadership.designation}
              </p>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={openPrincipalWhatsApp}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-saffron-500 hover:bg-saffron-600 text-white text-xs font-bold transition-all shadow-2xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Connect via WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Message Text */}
            <div className="lg:col-span-8 lg:border-l lg:border-cream-200 lg:pl-8 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-brown-500 block">
                Leadership Message
              </span>
              <h4 className="text-lg sm:text-xl font-bold text-brown-800">
                Guiding Every Young Learner with Care and Purpose
              </h4>
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-cream-200 text-xs sm:text-sm text-brown-800 leading-relaxed italic">
                “{SCHOOL_CONFIG.leadership.messagePlaceholder}”
              </div>
              <p className="text-xs text-brown-600">
                Parents wishing to discuss their ward's admission or academic growth are warmly encouraged to schedule a campus visit.
              </p>
            </div>
          </div>
        </div>

        {/* 4. School Values */}
        <div>
          <SectionHeading
            badge="FOUNDATIONAL VALUES"
            title="Values That Guide"
            highlight="Our School"
            subtitle="Guiding both classroom instruction and daily conduct across all age groups."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val, i) => (
              <Card key={i} className="p-6 bg-white border-cream-200">
                <div className="w-9 h-9 rounded-lg bg-cream-200 text-saffron-700 font-bold text-xs flex items-center justify-center mb-4 border border-gold-400/30">
                  {val.badge}
                </div>
                <h3 className="font-bold text-brown-800 mb-2 text-base">{val.title}</h3>
                <p className="text-xs sm:text-sm text-brown-600 leading-relaxed">{val.desc}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* 5. Facilities Placeholder Section */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-cream-200 shadow-soft-sm">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-bold text-saffron-600 uppercase tracking-widest block mb-1">
              CAMPUS AMENITIES
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brown-800">
              School Facilities & Learning Infrastructure
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {facilityPlaceholders.map((fac, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-cream-100/50 border border-cream-200 flex flex-col"
              >
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white border border-cream-200 text-saffron-600 mb-2.5 w-fit">
                  {fac.category}
                </span>
                <h4 className="text-sm font-bold text-brown-800 mb-1.5">
                  {typeof fac.title === 'string' ? fac.title.replace(/\[Facility Placeholder\]\s*/gi, '').trim() : fac.title}
                </h4>
                <p className="text-xs text-brown-600 leading-relaxed">{fac.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Admission CTA Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-brown-950 via-brown-900 to-brown-800 text-white flex flex-col md:flex-row items-center justify-between gap-6 border border-cream-200">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white text-[#FFFFFF]">
              Interested in Enrolling Your Ward?
            </h3>
            <p className="text-xs sm:text-sm text-cream-100 mt-1">
              Admissions are open for {SCHOOL_CONFIG.levels} in {SCHOOL_CONFIG.location.displayLocation}.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsEnquiryModalOpen(true)}
              className="inline-flex items-center justify-center font-bold text-sm px-5 py-2.5 rounded-xl bg-[#F28C28] hover:bg-[#d97715] text-[#FFFFFF] shadow-sm hover:shadow-md transition-all duration-200 border border-[#F28C28] hover:border-[#d97715] cursor-pointer"
            >
              Admission Enquiry
            </button>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center font-bold text-sm px-5 py-2.5 rounded-xl bg-[#F28C28] hover:bg-[#d97715] text-[#FFFFFF] shadow-sm hover:shadow-md transition-all duration-200 border border-[#F28C28] hover:border-[#d97715]"
            >
              Contact Desk
            </Link>
          </div>
        </div>

        {/* Admission Enquiry Modal */}
        <Modal
          isOpen={isEnquiryModalOpen}
          onClose={() => setIsEnquiryModalOpen(false)}
          title="Admission Enquiry"
          subtitle={`Register your inquiry for ${SCHOOL_CONFIG.name} (${SCHOOL_CONFIG.levels})`}
          maxWidth="max-w-2xl"
        >
          <AdmissionEnquiryForm inModal={true} />
        </Modal>
      </div>
    </PageContainer>
  );
}
