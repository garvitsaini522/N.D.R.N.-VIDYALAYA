import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/**
 * PageContainer Component
 * Provides standard responsiveness, container constraints, and optional institutional page hero banner.
 */
export default function PageContainer({
  children,
  title,
  subtitle,
  badge,
  breadcrumbs = [],
  action,
  className = '',
  noPadding = false,
}) {
  const hasHero = Boolean(title || breadcrumbs.length > 0);

  return (
    <div className="w-full flex-1">
      {/* Optional Institutional Page Hero Banner */}
      {hasHero && (
        <div className="relative bg-gradient-to-b from-cream-200 via-cream-100 to-white border-b border-cream-300 pt-8 pb-10 sm:py-12">
          {/* Subtle geometric background pattern in gold */}
          <div className="absolute inset-0 bg-[radial-gradient(#D4A017_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.06] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Breadcrumb Navigation */}
            {breadcrumbs.length > 0 && (
              <nav aria-label="Breadcrumb" className="mb-4">
                <ol className="flex items-center space-x-2 text-xs text-brown-600 font-medium">
                  <li>
                    <Link
                      to="/"
                      className="hover:text-saffron-600 transition-colors flex items-center gap-1"
                    >
                      <Home className="w-3.5 h-3.5" />
                      <span>Home</span>
                    </Link>
                  </li>
                  {breadcrumbs.map((crumb, idx) => {
                    const isLast = idx === breadcrumbs.length - 1;
                    return (
                      <li key={idx} className="flex items-center space-x-2">
                        <ChevronRight className="w-3 h-3 text-brown-400" />
                        {isLast || !crumb.to ? (
                          <span className="text-brown-800 font-bold" aria-current="page">
                            {crumb.label}
                          </span>
                        ) : (
                          <Link
                            to={crumb.to}
                            className="hover:text-saffron-600 transition-colors"
                          >
                            {crumb.label}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </nav>
            )}

            {/* Badge & Title */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="max-w-3xl">
                {badge && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cream-200 text-saffron-700 border border-gold-500/30 mb-2">
                    {badge}
                  </span>
                )}
                {title && (
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brown-800 tracking-tight leading-tight">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="mt-2 text-base text-brown-600 leading-relaxed max-w-2xl">
                    {subtitle}
                  </p>
                )}
              </div>

              {action && (
                <div className="flex-shrink-0">
                  {action}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${
          noPadding ? '' : 'py-8 sm:py-12'
        } ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
