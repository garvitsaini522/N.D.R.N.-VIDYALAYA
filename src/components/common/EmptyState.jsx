import React from 'react';
import { FileQuestion } from 'lucide-react';
import Button from './Button';

/**
 * Reusable Empty State Component
 * Shown when lists (events, notices, search results, gallery albums) are empty or filtered out.
 */
export default function EmptyState({
  icon,
  title = 'No items found',
  description = 'There are currently no items matching your criteria. Please check back later or modify your search.',
  actionText,
  actionTo,
  onAction,
  actionVariant = 'primary',
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-slate-50/60 rounded-2xl border border-dashed border-slate-300 max-w-xl mx-auto my-6 ${className}`}
    >
      {/* Icon Circle */}
      <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200/90 shadow-soft-sm flex items-center justify-center text-slate-400 mb-4">
        {icon || <FileQuestion className="w-8 h-8 text-school-600/70" />}
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-slate-900 mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-600 leading-relaxed max-w-md mb-6">
        {description}
      </p>

      {/* Action Button */}
      {(actionText && (actionTo || onAction)) && (
        <Button
          variant={actionVariant}
          size="sm"
          to={actionTo}
          onClick={onAction}
        >
          {actionText}
        </Button>
      )}
    </div>
  );
}
