import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Shield,
  ExternalLink,
} from 'lucide-react';
import SchoolLogo from '../common/SchoolLogo';
import { SCHOOL_CONFIG } from '../../config/schoolConfig';

/**
 * Global Institutional Footer Component for N.D.R.N Vidyalaya
 * Reflects factual details: Daulatyarpur, Madhoganj, Uttar Pradesh • Nursery to Class 5
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();
  const location = useLocation();

  const handleNavClick = (route, sectionId) => (e) => {
    if (location.pathname === route) {
      if (sectionId) {
        e.preventDefault();
        const target = document.getElementById(sectionId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          window.history.pushState(null, '', `${route}#${sectionId}`);
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-brown-800 text-cream-100 border-t border-brown-900">
      {/* Main Footer Links & Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 xl:gap-12">
          {/* Column 1: School Identity (Span 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-3 bg-white/5 rounded-xl inline-block border border-gold-500/20">
              <SchoolLogo
                size="md"
                showSubtitle={true}
                light={true}
              />
            </div>
            <p className="text-sm text-cream-200/80 leading-relaxed max-w-sm">
              N.D.R.N Vidyalaya is a UP Board school in Daulatyarpur, Madhoganj, Uttar Pradesh, dedicated to providing balanced, nurturing, and foundational education from Nursery to Class 5.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-gold-400 font-semibold tracking-wide">
              <span>Foundation:</span>
              <span className="text-cream-100 font-normal">Nursery to Class 5 • Daulatyarpur, Madhoganj</span>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h4 className="text-white text-sm font-bold tracking-wider uppercase mb-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400"></span>
              Explore School
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  to="/"
                  onClick={handleNavClick('/', null)}
                  className="text-cream-200/80 hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  onClick={handleNavClick('/about', null)}
                  className="text-cream-200/80 hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/academics"
                  onClick={handleNavClick('/academics', null)}
                  className="text-cream-200/80 hover:text-white transition-colors"
                >
                  Academics (Nursery – Class 5)
                </Link>
              </li>
              <li>
                <Link
                  to="/admissions#enquiry-form"
                  onClick={handleNavClick('/admissions', 'enquiry-form')}
                  className="text-cream-200/80 hover:text-white transition-colors"
                >
                  Admission Enquiry
                </Link>
              </li>
              <li>
                <Link
                  to="/admissions#fee-structure"
                  onClick={handleNavClick('/admissions', 'fee-structure')}
                  className="text-cream-200/80 hover:text-white transition-colors"
                >
                  Fee Structure
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Highlights & Updates */}
          <div>
            <h4 className="text-white text-sm font-bold tracking-wider uppercase mb-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-saffron-500"></span>
              Campus & Updates
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  to="/notices"
                  onClick={handleNavClick('/notices', null)}
                  className="text-cream-200/80 hover:text-white transition-colors"
                >
                  Notices & Circulars
                </Link>
              </li>
              <li>
                <Link
                  to="/events"
                  onClick={handleNavClick('/events', null)}
                  className="text-cream-200/80 hover:text-white transition-colors"
                >
                  Upcoming Events
                </Link>
              </li>
              <li>
                <Link
                  to="/gallery"
                  onClick={handleNavClick('/gallery', null)}
                  className="text-cream-200/80 hover:text-white transition-colors"
                >
                  Campus Gallery
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  onClick={handleNavClick('/contact', null)}
                  className="text-cream-200/80 hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-gold-400 hover:text-gold-300 font-semibold transition-colors flex items-center gap-1 pt-1"
                >
                  <span>Student & Parent Portal</span>
                  <ExternalLink className="w-3 h-3 text-gold-400" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Campus Location & Placeholders */}
          <div>
            <h4 className="text-white text-sm font-bold tracking-wider uppercase mb-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400"></span>
              School Campus
            </h4>
            <address className="not-italic space-y-2.5 text-xs text-cream-200/80">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
                <span>
                  {SCHOOL_CONFIG.name}, {SCHOOL_CONFIG.location.displayLocation}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <a
                  href={`tel:${(SCHOOL_CONFIG.contact.phone || '+918429231617').replace(/\s+/g, '')}`}
                  className="hover:text-gold-400 transition-colors"
                >
                  {SCHOOL_CONFIG.contact.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <a
                  href={`mailto:${SCHOOL_CONFIG.contact.email || 'ueyuwhw@gmail.com'}`}
                  className="hover:text-gold-400 transition-colors"
                >
                  {SCHOOL_CONFIG.contact.email}
                </a>
              </div>
              <div className="flex items-start gap-2 pt-1 border-t border-brown-900">
                <Clock className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
                <span>{SCHOOL_CONFIG.contact.visitingHours}</span>
              </div>
            </address>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Subtle Admin Portal Link */}
      <div className="bg-brown-900 py-5 border-t border-brown-950 text-xs text-cream-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            © {currentYear} {SCHOOL_CONFIG.name}. {SCHOOL_CONFIG.location.displayLocation}.
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-cream-200/60">UP Board • Nursery to Class 5</span>
            <span>•</span>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1 hover:text-white transition-colors text-cream-200/60 group"
              title="Restricted Staff & Admin Portal"
            >
              <Shield className="w-3.5 h-3.5 text-gold-500 group-hover:text-gold-400" />
              <span>Staff & Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
