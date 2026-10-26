import React from 'react';
import { Home, ArrowLeft, Search, Compass, BookOpen } from 'lucide-react';
import Button from '../../components/common/Button';

export default function NotFound() {
  return (
    <div className="flex-1 min-h-[70vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-surface-subtle">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-cream-200 p-8 sm:p-12 text-center shadow-soft-md">
        <div className="w-16 h-16 rounded-2xl bg-cream-200 border border-gold-400/40 text-saffron-600 flex items-center justify-center mx-auto mb-5 font-mono text-xl font-black">
          404
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-brown-800 tracking-tight mb-2">
          Page Not Found
        </h1>

        <p className="text-sm text-brown-600 leading-relaxed mb-8 max-w-sm mx-auto">
          The page or document you requested might have been relocated, updated, or does not exist on the N.D.R.N. Vidyalaya website.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            to="/"
            variant="primary"
            size="md"
            leftIcon={<Home className="w-4 h-4" />}
          >
            Back to Homepage
          </Button>
          <Button
            to="/contact"
            variant="outline"
            size="md"
          >
            Contact Helpdesk
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t border-cream-200 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-brown-600 font-medium">
          <a href="/admissions" className="hover:text-saffron-600">Admissions</a>
          <span>•</span>
          <a href="/academics" className="hover:text-saffron-600">Academics</a>
          <span>•</span>
          <a href="/notices" className="hover:text-saffron-600">Notices</a>
          <span>•</span>
          <a href="/events" className="hover:text-saffron-600">Events</a>
        </div>
      </div>
    </div>
  );
}
