import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

/**
 * Master Shell Layout Component
 * Wraps all public pages with sticky header, main content container, institutional footer,
 * automatic scroll reset on route changes, and a floating scroll-to-top button.
 */
export default function Layout() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const location = useLocation();

  // Scroll to hash element if provided, or top of page on route change
  useEffect(() => {
    if (location.hash) {
      const elementId = location.hash.replace('#', '');
      const attemptScroll = (attempts = 0) => {
        const target = document.getElementById(elementId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (attempts < 10) {
          setTimeout(() => attemptScroll(attempts + 1), 100);
        }
      };
      // Delay slightly for React rendering
      setTimeout(() => attemptScroll(0), 60);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash]);

  // Track window scroll for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-brown-800">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-saffron-500 focus:text-white focus:rounded-md shadow-lg"
      >
        Skip to main content
      </a>

      {/* Global Navigation Header */}
      <Header />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 flex flex-col focus:outline-hidden">
        <Outlet />
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-30 p-3 rounded-full bg-saffron-500 hover:bg-saffron-600 text-white shadow-soft-lg hover:shadow-soft-xl transition-all duration-300 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-saffron-500 focus-visible:ring-offset-2 active:scale-95"
          aria-label="Scroll back to top of page"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
