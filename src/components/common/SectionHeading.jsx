import React from 'react';

/**
 * Reusable Section Heading Component
 * Includes category badge pill, bold title with highlight accent, supportive subtitle, and alignment options.
 */
export default function SectionHeading({
  badge,
  badgeIcon,
  title,
  highlight,
  subtitle,
  align = 'center',
  action,
  className = '',
}) {
  const alignClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center mx-auto',
    right: 'text-right items-end ml-auto',
  };

  const currentAlign = alignClasses[align] || alignClasses.center;

  return (
    <div className={`flex flex-col mb-10 md:mb-14 ${currentAlign} max-w-3xl ${className}`}>
      {/* Eyebrow Badge */}
      {badge && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream-200 border border-gold-500/30 text-saffron-700 text-xs font-semibold tracking-wider uppercase mb-3 shadow-2xs">
          {badgeIcon && <span className="text-gold-600">{badgeIcon}</span>}
          <span>{badge}</span>
        </div>
      )}

      {/* Main Heading with Highlight */}
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brown-800 tracking-tight leading-tight">
        {title}
        {highlight && (
          <span className="relative inline-block ml-2 text-saffron-600">
            {highlight}
            <span className="absolute bottom-1 left-0 w-full h-1.5 bg-gold-400/30 -z-10 rounded-sm"></span>
          </span>
        )}
      </h2>

      {/* Subtitle / Descriptive text */}
      {subtitle && (
        <p className="mt-3 text-base sm:text-lg text-brown-600 leading-relaxed max-w-2xl">
          {subtitle}
        </p>
      )}

      {/* Optional Side Action */}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
