import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth, getDashboardRoute } from '../../context/AuthContext';
import { PageLoader } from './LoadingState';
import Button from './Button';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader text="Verifying institutional access credentials..." />;
  }

  if (!isAuthenticated) {
    // If attempting to access admin routes, redirect to admin login
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    const userDashboard = getDashboardRoute(user?.role);

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-red-200 p-8 shadow-soft-lg text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Institutional Access Restricted
          </h2>

          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Your authenticated role is <span className="font-bold text-slate-900 uppercase">{user?.role}</span>.
            This section requires one of the following permissions:{' '}
            <span className="font-bold text-red-600 uppercase">{allowedRoles.join(' / ')}</span>.
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            <Button to={userDashboard} variant="primary" size="md" className="w-full justify-center">
              <span>Return to My Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>

            <button
              type="button"
              onClick={logout}
              className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 hover:text-red-700 hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out & Switch Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
