import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';
import Button from './Button';

/**
 * Reusable Error State Display for sections or failed data queries
 */
export function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an unexpected error while loading this content. Please try again or reach out to the school administrative desk.',
  onRetry,
  showHomeLink = true,
  className = '',
}) {
  return (
    <div
      className={`p-8 sm:p-10 rounded-2xl bg-red-50/50 border border-red-200/80 text-center max-w-xl mx-auto my-8 ${className}`}
      role="alert"
    >
      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white border border-red-200 shadow-soft-sm flex items-center justify-center text-red-600">
        <AlertTriangle className="w-7 h-7" />
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-2">
        {title}
      </h3>

      <p className="text-sm text-slate-600 leading-relaxed mb-6 max-w-md mx-auto">
        {message}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <Button
            variant="primary"
            size="sm"
            onClick={onRetry}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Try Again
          </Button>
        )}
        {showHomeLink && (
          <Button
            variant="outline"
            size="sm"
            to="/"
            leftIcon={<Home className="w-3.5 h-3.5" />}
          >
            Back to Home
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          to="/contact"
          leftIcon={<Mail className="w-3.5 h-3.5" />}
        >
          Contact Support
        </Button>
      </div>
    </div>
  );
}

/**
 * React Error Boundary to catch render crashes across routes
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-soft-lg text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
              Application Error
            </h1>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              An unexpected error occurred while rendering this page. Our technical team has been notified.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="primary" onClick={this.handleReset}>
                Reload Application
              </Button>
              <Button variant="outline" to="/contact">
                Contact Helpdesk
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorState;
