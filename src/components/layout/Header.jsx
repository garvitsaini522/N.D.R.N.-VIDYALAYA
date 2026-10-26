import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, Phone, Mail, Shield, UserCheck, Bell } from 'lucide-react';
import SchoolLogo from '../common/SchoolLogo';
import Button from '../common/Button';
import MobileNav from './MobileNav';
import { useAuth, getDashboardRoute } from '../../context/AuthContext';

export const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Academics', to: '/academics' },
  { label: 'Admissions', to: '/admissions' },
  { label: 'Faculty', to: '/faculty' },
  { label: 'Events', to: '/events' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Notices', to: '/notices' },
  { label: 'Contact', to: '/contact' },
];

/**
 * Global Header / Navigation Component
 * Features top institutional utility strip, sticky navigation bar, active link indicators,
 * clear Student/Parent login button, subtle admin login link, and mobile navigation trigger.
 */
export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const location = useLocation();

  // Scroll detection for sticky shadow/compactness
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile nav on route change
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header className="w-full z-40">
        {/* 1. Institutional Top Utility Bar (Hidden on small screens for cleanliness) */}
        <div className="hidden md:block bg-brown-900 text-cream-100 text-xs py-2 px-4 sm:px-6 lg:px-8 border-b border-brown-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Left: Location & School Type info */}
            <div className="flex items-center space-x-6">
              <span className="flex items-center gap-1.5 text-cream-100 font-medium">
                <span className="text-gold-400 font-bold">Location:</span>
                <span>Daulatyarpur, Madhoganj, Uttar Pradesh</span>
              </span>
              <span className="text-cream-200/80 hidden lg:inline-block">
                UP Board • Nursery to Class 5
              </span>
            </div>

            {/* Right: Announcement Badge & Subtle Admin Login */}
            <div className="flex items-center space-x-4">
              <Link
                to="/admissions"
                className="inline-flex items-center gap-1 text-gold-300 hover:text-gold-200 transition-colors font-medium"
              >
                <span className="w-2 h-2 rounded-full bg-saffron-500 animate-ping inline-block"></span>
                <span>Admissions Open 2026-27</span>
              </Link>
              <span className="text-brown-700">|</span>
              {/* Subtle Admin Login option */}
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-1 text-cream-200/70 hover:text-white transition-colors py-0.5 px-2 rounded hover:bg-brown-800"
                title="School Administration & Staff Portal"
              >
                <Shield className="w-3.5 h-3.5 text-gold-400" />
                <span>Staff & Admin</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 2. Main Sticky Navigation Bar */}
        <div
          className={`sticky top-0 z-40 transition-all duration-300 bg-white/95 backdrop-blur-md border-b ${
            isScrolled
              ? 'shadow-header border-cream-300 py-2.5'
              : 'border-cream-200 py-3.5'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            {/* Logo */}
            <SchoolLogo size={isScrolled ? 'sm' : 'md'} enablePopup={true} />

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2" aria-label="Main Navigation">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-2.5 py-1.5 xl:px-3 text-xs xl:text-sm font-semibold rounded-lg transition-colors relative ${
                      isActive
                        ? 'text-saffron-600 bg-cream-200 font-bold'
                        : 'text-brown-800 hover:text-saffron-600 hover:bg-cream-100'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span>{link.label}</span>
                      {isActive && (
                        <span className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-saffron-500 rounded-full" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Right Actions: Admissions CTA, Portal Login & Mobile Menu Toggle */}
            <div className="flex items-center space-x-3">
              {/* Saffron CTA Button for Admissions */}
              <Button
                to="/admissions"
                variant="primary"
                size="sm"
                className="hidden md:inline-flex font-bold shadow-soft-xs"
              >
                Admissions
              </Button>

              {/* Portal Login or Dashboard Button */}
              <div className="hidden sm:flex items-center gap-2">
                {isAuthenticated ? (
                  <>
                    <Button
                      to={getDashboardRoute(user?.role)}
                      variant="portal"
                      size="sm"
                      className="font-bold shadow-soft-xs"
                      leftIcon={<UserCheck className="w-4 h-4 text-gold-400" />}
                    >
                      <span>Dashboard ({user?.name?.split(' ')[0] || user?.role?.toUpperCase()})</span>
                    </Button>
                    <button
                      type="button"
                      onClick={logout}
                      className="text-xs font-semibold text-brown-600 hover:text-red-600 px-2 py-1 transition-colors"
                      title="Log out"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Button
                    to="/login"
                    variant="outline"
                    size="sm"
                    className="font-semibold text-brown-800 border-brown-200 hover:border-saffron-500"
                    leftIcon={<UserCheck className="w-4 h-4 text-gold-500" />}
                  >
                    Portal Login
                  </Button>
                )}
              </div>

              {/* Mobile Hamburger Menu Button */}
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(true)}
                className="lg:hidden p-2 rounded-lg text-brown-800 hover:text-saffron-600 hover:bg-cream-100 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-saffron-500"
                aria-label="Open navigation menu"
                aria-expanded={isMobileNavOpen}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        navLinks={NAV_LINKS}
      />
    </>
  );
}
