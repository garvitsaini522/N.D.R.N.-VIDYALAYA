import { DataService, SEED_SETTINGS } from '../services/dataService';

function getLiveSettings() {
  try {
    return DataService.getSettings();
  } catch {
    return SEED_SETTINGS;
  }
}

const live = getLiveSettings();

/**
 * =============================================================================
 * PRINCIPAL WHATSAPP DESTINATION CONFIGURATION (SINGLE SOURCE OF TRUTH)
 * =============================================================================
 * Enter the Principal's real WhatsApp destination number in international format:
 * - Format: [Country Code][Subscriber Number] with digits only (NO '+', NO spaces, NO dashes)
 * - India Example: '918429231617' (where '91' is India's country code followed by the 10-digit number)
 * - Default: '' (Leave empty until the real WhatsApp number is entered)
 *
 * This single configuration constant controls the destination number for:
 * 1. Home page: "Connect with Principal" form
 * 2. About page: "Connect via WhatsApp" button
 * 3. Contact page: "Direct WhatsApp Chat with School" button
 * 4. Admissions page: "WhatsApp Admission Desk" link
 * =============================================================================
 */
export const PRINCIPAL_WHATSAPP_NUMBER = '918429231617';

/**
 * Resolves the clean, digits-only Principal WhatsApp destination number.
 * Priority:
 * 1. PRINCIPAL_WHATSAPP_NUMBER (the centralized code constant above)
 * 2. liveSettings.whatsapp (if updated via the Admin Console)
 * 3. Default: '918429231617'
 */
export function getPrincipalWhatsAppDestination(liveSettings) {
  const directConfig = (PRINCIPAL_WHATSAPP_NUMBER || '').replace(/\D/g, '');
  if (directConfig) return directConfig;

  const dynamicSetting = (liveSettings?.whatsapp || live?.whatsapp || '').replace(/\D/g, '');
  if (dynamicSetting && dynamicSetting !== '919876543210' && dynamicSetting !== '9876543210') {
    return dynamicSetting;
  }
  return '918429231617';
}

export const SCHOOL_CONFIG = {
  name: live.schoolName || 'N.D.R.N. Vidyalaya',
  shortName: 'N.D.R.N.',
  fullName: live.schoolName || 'N.D.R.N. Vidyalaya',
  schoolType: 'UP Board',
  levels: live.gradesOffered || 'Nursery to Class 5',
  tagline: live.tagline || 'UP Board • Nursery to Class 5',

  // Location details strictly adhering to factual inputs provided
  location: {
    village: live.village || 'Daulatyarpur',
    town: live.postOffice || 'Madhoganj',
    state: live.state || 'Uttar Pradesh',
    country: 'India',
    displayLocation: `${live.village || 'Daulatyarpur'}, ${live.postOffice || 'Madhoganj'}, ${live.state || 'Uttar Pradesh'}`,
  },

  // Configurable Principal WhatsApp Number (strictly digits only: 918429231617)
  principalWhatsAppNumber: getPrincipalWhatsAppDestination(live),

  // Official School Contact details
  contact: {
    phone: live.phone && !live.phone.includes('98765') ? live.phone : '+91 8429231617',
    email: live.email && !live.email.includes('ndrnvidyalaya.edu.in') ? live.email : 'ueyuwhw@gmail.com',
    phonePlaceholder: live.phone && !live.phone.includes('98765') ? live.phone : '+91 8429231617',
    emailPlaceholder: live.email && !live.email.includes('ndrnvidyalaya.edu.in') ? live.email : 'ueyuwhw@gmail.com',
    whatsapp: '918429231617',
    whatsappFormatted: '+91 8429231617',
    visitingHours: live.schoolHours || 'Monday – Saturday: 8:00 AM – 2:00 PM',
  },

  // Principal / Leadership
  leadership: {
    title: 'Principal / Director',
    name: live.principalName || 'D.K. Saini',
    namePlaceholder: live.principalName || 'D.K. Saini',
    designation: live.principalDesignation || 'Head of Institution, N.D.R.N. Vidyalaya',
    message: live.principalMessage ||
      'Welcome to N.D.R.N. Vidyalaya. We are dedicated to providing a nurturing, disciplined, and joyful educational environment for young learners from Nursery to Class 5 in Daulatyarpur, Madhoganj.',
    messagePlaceholder: live.principalMessage ||
      'Welcome to N.D.R.N. Vidyalaya. We are dedicated to providing a nurturing, disciplined, and joyful educational environment for young learners from Nursery to Class 5 in Daulatyarpur, Madhoganj.',
    image: '/images/principal-portrait.jpg',
  },

  // Official School Images
  images: {
    heroImage: '/images/school-campus.jpg',
    campusImage: '/images/school-campus.jpg',
    buildingImage: '/images/school-building.jpg',
    classroomImage: '/images/classroom-learning.jpg',
    sportsImage: '/images/sports-activities.jpg',
    logo: '/logo.png',
    schoolLogo: '/images/school-logo.png',
  },
};

export default SCHOOL_CONFIG;
