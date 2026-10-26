import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { X, UserCheck, Shield, ChevronRight, LogOut } from 'lucide-react';
import SchoolLogo from '../common/SchoolLogo';
import Button from '../common/Button';
import { useAuth, getDashboardRoute } from '../../context/AuthContext';
import { SCHOOL_CONFIG } from '../../config/schoolConfig';

/**
 * Mobile Navigation Drawer Component
 * Handles smooth opening/closing, accessibility, active links, and prominent authenticated actions.
 */
export default function MobileNav({
  isOpen,
  onClose,
  navLinks = [],
  onOpenLoginModal,
}) {
  const { user, isAuthenticated, logout } = useAuth();

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop overlay with blur */}
      <div
        className="fixed inset-0 bg-brown-950/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in panel */}
      <div
        className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl flex flex-col z-10 animate-slide-down"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
      >
        {/* Top Header of Drawer */}
        <div className="p-4 border-b border-cream-200 flex items-center justify-between">
          <SchoolLogo size="sm" showSubtitle={false} onClick={onClose} />
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-brown-600 hover:text-brown-900 hover:bg-cream-100 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-saffron-500"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Portal Action */}
        <div className="p-4 bg-cream-100/70 border-b border-cream-200 space-y-2">
          {isAuthenticated ? (
            <>
              <Button
                variant="primary"
                size="md"
                fullWidth
                to={getDashboardRoute(user?.role)}
                onClick={onClose}
                leftIcon={<UserCheck className="w-4 h-4 text-gold-400" />}
              >
                Go to Dashboard ({user?.role?.toUpperCase()})
              </Button>
              <button
                type="button"
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="w-full py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </>
          ) : (
            <Button
              variant="primary"
              size="md"
              fullWidth
              to="/login"
              onClick={onClose}
              leftIcon={<UserCheck className="w-4 h-4 text-gold-400" />}
            >
              Portal Login
            </Button>
          )}
        </div>

        {/* Navigation Links list */}
        <div className="flex-1 overflow-y-auto py-3 px-3">
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-cream-200 text-saffron-600 border-l-4 border-saffron-500 pl-3 font-bold'
                      : 'text-brown-800 hover:bg-cream-100 hover:text-saffron-600'
                  }`
                }
              >
                <span>{link.label}</span>
                <ChevronRight className="w-4 h-4 text-brown-400" />
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Drawer Footer: Contact & Subtle Admin Login */}
        <div className="p-4 border-t border-cream-200 bg-cream-50 space-y-3 text-xs">
          <div className="space-y-1 text-brown-700">
            <div className="flex items-center gap-2">
              <span className="font-bold text-brown-900">Campus:</span>
              <span className="font-medium">{SCHOOL_CONFIG.location.displayLocation}</span>
            </div>
            <div className="flex items-center gap-2 text-brown-500">
              <span>{SCHOOL_CONFIG.levels}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-cream-200 flex items-center justify-between">
            <NavLink
              to="/admin/login"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-brown-600 hover:text-brown-900 transition-colors py-1"
            >
              <Shield className="w-3.5 h-3.5 text-gold-500" />
              <span>Admin / Staff Portal</span>
            </NavLink>
            <span className="text-[11px] text-brown-400">UP Board</span>
          </div>
        </div>
      </div>
    </div>
  );
}
