import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';

/**
 * SchoolLogo component - Official N.D.R.N. Vidyalaya Crest & Typography
 * Designed to look prestigious, authentic, and institutional.
 * When enablePopup is true, clicking the logo displays ONLY the school logo image
 * in the exact center of the screen via a full-screen viewport portal overlay.
 */
export default function SchoolLogo({
  size = 'md',
  to = '/',
  showSubtitle = true,
  className = '',
  light = false,
  enablePopup = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const closeTimerRef = useRef(null);

  const sizeMap = {
    sm: {
      emblem: 'w-9 h-9',
      title: 'text-base font-extrabold tracking-tight',
      subtitle: 'text-[10px]',
    },
    md: {
      emblem: 'w-11 h-11',
      title: 'text-lg font-extrabold tracking-tight',
      subtitle: 'text-xs',
    },
    lg: {
      emblem: 'w-16 h-16',
      title: 'text-2xl font-extrabold tracking-tight',
      subtitle: 'text-xs md:text-sm',
    },
    xl: {
      emblem: 'w-24 h-24',
      title: 'text-3xl font-black tracking-tight',
      subtitle: 'text-sm md:text-base',
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const openPopup = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsOpen(true);
    // Request animation frame for smooth CSS transition entrance
    requestAnimationFrame(() => {
      setIsAnimating(true);
    });
  };

  const closePopup = () => {
    setIsAnimating(false);
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const handleLogoClick = (e) => {
    if (!enablePopup) return;
    e.preventDefault();
    e.stopPropagation();

    if (isOpen) {
      closePopup();
    } else {
      openPopup();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closePopup();
    }
  };

  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Escape key listener to close popup
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closePopup();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const content = (
    <div className={`flex items-center gap-3 select-none group ${className}`}>
      {/* Official Institutional Crest */}
      <div className={`relative flex-shrink-0 ${currentSize.emblem} rounded-full overflow-hidden shadow-soft-sm ring-2 ring-gold-500/40 group-hover:ring-gold-500/70 group-hover:scale-105 transition-all duration-300 bg-white p-0.5`}>
        <img
          src="/logo.png"
          alt="N.D.R.N. Vidyalaya Official Crest"
          className="w-full h-full object-contain rounded-full"
          onError={(e) => {
            // In case of any load error, fallback gracefully to SVG logo
            e.currentTarget.src = '/logo.svg';
          }}
        />
      </div>

      {/* School Name & Level Indicator */}
      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`font-sans ${currentSize.title} ${light ? 'text-white' : 'text-school-950'
              } font-extrabold tracking-tight group-hover:text-gold-500 transition-colors`}
          >
            N.D.R.N.
          </span>
          <span
            className={`font-sans ${currentSize.title} ${light ? 'text-gold-400' : 'text-school-700'
              } font-bold tracking-tight`}
          >
            VIDYALAYA
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`${currentSize.subtitle} font-medium ${light ? 'text-slate-300' : 'text-slate-500'
              } tracking-wider uppercase flex items-center gap-1 mt-0.5`}
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold-500 shrink-0"></span>
            UP Board • Nursery to Class 5
          </span>
        )}
      </div>
    </div>
  );

  // When popup is disabled, return normal logo link/markup
  if (!enablePopup) {
    if (to) {
      return (
        <Link
          to={to}
          className="inline-flex items-center focus:outline-hidden focus-visible:ring-2 focus-visible:ring-school-600 rounded-xl"
          aria-label="N.D.R.N. Vidyalaya Home"
        >
          {content}
        </Link>
      );
    }
    return content;
  }

  // When popup is enabled (Navbar Logo - click only, centered modal displaying only the logo image)
  return (
    <>
      <button
        type="button"
        onClick={handleLogoClick}
        className="inline-flex items-center focus:outline-hidden focus-visible:ring-2 focus-visible:ring-school-600 rounded-xl cursor-pointer text-left"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label="N.D.R.N. Vidyalaya Logo (Click to view emblem)"
      >
        {content}
      </button>

      {/* Centered Logo Popup (Only the school logo image) */}
      {isOpen &&
        createPortal(
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-200 ease-out cursor-pointer ${
              isAnimating ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-label="N.D.R.N. Vidyalaya Crest"
          >
            <div
              onClick={closePopup}
              className={`relative rounded-full bg-white p-2 shadow-2xl ring-4 ring-gold-500/50 transition-all duration-200 ease-out transform select-none cursor-pointer ${
                isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
              }`}
              title="Click to close"
            >
              <img
                src="/logo.png"
                alt="N.D.R.N. Vidyalaya Official Emblem"
                className="w-40 h-40 sm:w-48 sm:h-48 object-contain rounded-full aspect-square"
                onError={(e) => {
                  e.currentTarget.src = '/logo.svg';
                }}
              />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
