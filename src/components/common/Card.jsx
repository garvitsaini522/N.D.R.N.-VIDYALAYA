import React from 'react';
import { ArrowRight, Calendar, Clock, MapPin, AlertCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Base Card Component
 */
export function Card({
  children,
  className = '',
  hoverEffect = true,
  onClick,
  as: Component = 'div',
  ...props
}) {
  return (
    <Component
      className={`bg-white rounded-xl border border-brown-200/80 shadow-soft-sm transition-all duration-300 overflow-hidden ${
        hoverEffect
          ? 'hover:shadow-card-hover hover:border-gold-500/60 hover:-translate-y-1'
          : ''
      } ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * Notice Card Preset - for circulars and school announcements
 */
export function NoticeCard({
  title,
  date,
  category = 'General',
  priority = 'normal',
  summary,
  fileUrl,
  to,
  className = '',
}) {
  const priorityStyles = {
    urgent: 'bg-rose-50 text-rose-700 border-rose-200',
    high: 'bg-saffron-100 text-saffron-800 border-saffron-300',
    normal: 'bg-cream-200 text-saffron-700 border-gold-500/30',
    academic: 'bg-gold-100 text-gold-900 border-gold-300',
  };

  const badgeClass = priorityStyles[priority.toLowerCase()] || priorityStyles.normal;

  return (
    <Card className={`p-5 flex flex-col justify-between ${className}`}>
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeClass}`}>
            {category}
          </span>
          <span className="text-xs text-brown-500 font-medium flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-gold-600" />
            {date}
          </span>
        </div>
        <h3 className="text-base font-bold text-brown-800 group-hover:text-saffron-600 transition-colors line-clamp-2 mb-2">
          {title}
        </h3>
        {summary && (
          <p className="text-sm text-brown-600 line-clamp-2 leading-relaxed mb-4">
            {summary}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-cream-200 flex items-center justify-between text-xs font-semibold">
        {to ? (
          <Link
            to={to}
            className="text-saffron-600 hover:text-saffron-700 inline-flex items-center gap-1 transition-colors group"
          >
            Read Notice
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        ) : (
          <span className="text-brown-400">Official Circular</span>
        )}
        {fileUrl && (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brown-500 hover:text-saffron-600 inline-flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5 text-gold-600" />
            PDF
          </a>
        )}
      </div>
    </Card>
  );
}

/**
 * Event Card Preset - for school functions, sports, competitions
 */
export function EventCard({
  title,
  date,
  day,
  month,
  time,
  venue,
  description,
  to = '/events',
  className = '',
}) {
  const displayTitle = typeof title === 'string' ? title.replace(/\[Event Placeholder\]\s*/gi, '').trim() : title;

  let displayDay = day || date;
  let displayMonth = month;
  if (typeof date === 'string' && date.includes('-')) {
    try {
      const parsed = new Date(date);
      if (!isNaN(parsed.getTime())) {
        displayDay = day || String(parsed.getDate()).padStart(2, '0');
        if (!displayMonth) {
          displayMonth = parsed.toLocaleString('default', { month: 'short' }).toUpperCase();
        }
      }
    } catch {
      // Use existing values
    }
  }

  return (
    <Card className={`p-5 flex flex-col justify-between ${className}`}>
      <div className="flex items-start gap-4 mb-4">
        {/* Date Stamp Box */}
        <div className="flex-shrink-0 w-14 rounded-lg bg-cream-200 border border-gold-500/40 text-center py-2 shadow-2xs">
          <span className="block text-[11px] font-bold text-saffron-600 uppercase tracking-wider">
            {displayMonth || 'EVENT'}
          </span>
          <span className="block text-xl font-extrabold text-brown-800 leading-none">
            {displayDay}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-brown-800 line-clamp-1 mb-1.5">
            {displayTitle}
          </h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-brown-500 mb-2">
            {time && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-gold-600" />
                {time}
              </span>
            )}
            {venue && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gold-600" />
                {venue}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-brown-600 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-cream-200 flex items-center justify-end">
        <Link
          to={to}
          className="text-xs font-semibold text-saffron-600 hover:text-saffron-700 inline-flex items-center gap-1 transition-colors"
        >
          Event Details
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </Card>
  );
}

/**
 * Feature Card Preset - with icon header, for curriculum pillars, values, campus highlights
 */
export function FeatureCard({
  icon,
  title,
  description,
  to,
  linkText = 'Learn more',
  className = '',
}) {
  return (
    <Card className={`p-6 flex flex-col justify-between group ${className}`}>
      <div>
        <div className="w-12 h-12 rounded-xl bg-cream-200 border border-gold-500/30 text-saffron-600 flex items-center justify-center mb-5 group-hover:bg-saffron-500 group-hover:text-white transition-colors duration-300 shadow-2xs">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-brown-800 mb-2 group-hover:text-saffron-600 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-brown-600 leading-relaxed">
          {description}
        </p>
      </div>

      {to && (
        <div className="mt-5 pt-4 border-t border-cream-200">
          <Link
            to={to}
            className="text-xs font-bold text-saffron-600 hover:text-saffron-700 inline-flex items-center gap-1.5 transition-colors"
          >
            <span>{linkText}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      )}
    </Card>
  );
}

export default Card;
