import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

/**
 * Reusable Button Component for N.D.R.N Vidyalaya
 * Supports multiple variants, sizes, icon slots, loading states, and polymorphic Link/button rendering.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  to,
  href,
  onClick,
  disabled = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 select-none rounded-lg focus:outline-hidden focus-visible:ring-2 focus-visible:ring-school-600 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none';

  const variants = {
    primary:
      'bg-school-700 hover:bg-school-800 text-white shadow-soft-sm hover:shadow-soft-md ring-1 ring-school-900/10',
    secondary:
      'bg-school-50 hover:bg-school-100 text-school-800 border border-school-200 hover:border-school-300',
    gold:
      'bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-slate-950 font-semibold shadow-soft-sm hover:shadow-soft-md border border-amber-300/60',
    outline:
      'bg-white hover:bg-slate-50 text-slate-700 hover:text-school-800 border border-slate-300 hover:border-school-400 shadow-2xs',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-700 hover:text-school-700',
    danger:
      'bg-red-600 hover:bg-red-700 text-white shadow-soft-sm',
    portal:
      'bg-gradient-to-r from-school-800 to-school-700 hover:from-school-900 hover:to-school-800 text-white border border-school-600/40 shadow-soft-sm hover:shadow-soft-md',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[32px]',
    md: 'text-sm px-4 py-2 gap-2 min-h-[40px]',
    lg: 'text-base px-6 py-2.5 gap-2.5 min-h-[46px]',
  };

  const combinedClasses = [
    baseStyles,
    variants[variant] || variants.primary,
    sizes[size] || sizes.md,
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </>
  );

  if (to && !disabled) {
    return (
      <Link to={to} className={combinedClasses} {...props}>
        {content}
      </Link>
    );
  }

  if (href && !disabled) {
    return (
      <a href={href} className={combinedClasses} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={combinedClasses}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {content}
    </button>
  );
}
