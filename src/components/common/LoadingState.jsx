import React from 'react';
import { Loader2 } from 'lucide-react';
import SchoolLogo from './SchoolLogo';

/**
 * Full Page or Container Loader with School Emblem pulse
 */
export function PageLoader({ text = 'Loading portal...', fullPage = true }) {
  const containerClass = fullPage
    ? 'fixed inset-0 z-50 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center p-4'
    : 'w-full py-20 flex flex-col items-center justify-center p-4';

  return (
    <div className={containerClass} role="status" aria-live="polite">
      <div className="relative flex flex-col items-center">
        {/* Pulsing Emblem */}
        <div className="animate-pulse-subtle mb-4">
          <SchoolLogo size="lg" to={null} showSubtitle={false} />
        </div>

        {/* Spinner */}
        <div className="flex items-center gap-2 text-school-700 text-sm font-semibold tracking-wide">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>{text}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact Inline Loader for sections or cards
 */
export function InlineLoader({ text = 'Loading...', className = '' }) {
  return (
    <div
      className={`flex items-center justify-center gap-2 py-8 text-sm text-slate-500 font-medium ${className}`}
      role="status"
    >
      <Loader2 className="w-4 h-4 animate-spin text-school-600" />
      <span>{text}</span>
    </div>
  );
}

/**
 * Skeleton Primitive
 */
export function Skeleton({ className = '', rounded = 'rounded-md' }) {
  return (
    <div
      className={`skeleton-shimmer bg-slate-200 ${rounded} ${className}`}
      aria-hidden="true"
    />
  );
}

/**
 * Skeleton Card Preset
 */
export function SkeletonCard({ hasImage = false, className = '' }) {
  return (
    <div className={`p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-4 ${className}`}>
      {hasImage && <Skeleton className="w-full h-40 rounded-lg" />}
      <div className="flex justify-between items-center">
        <Skeleton className="w-20 h-4 rounded-full" />
        <Skeleton className="w-16 h-3" />
      </div>
      <Skeleton className="w-3/4 h-5" />
      <div className="space-y-2">
        <Skeleton className="w-full h-3.5" />
        <Skeleton className="w-5/6 h-3.5" />
      </div>
      <div className="pt-3 border-t border-slate-100 flex justify-between">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-12 h-4" />
      </div>
    </div>
  );
}

export default PageLoader;
