import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  UserCheck,
  Users,
  Lock,
  ArrowLeft,
  ShieldCheck,
  ArrowRight,
  GraduationCap,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import SchoolLogo from '../../components/common/SchoolLogo';
import Button from '../../components/common/Button';
import { useAuth, getDashboardRoute } from '../../context/AuthContext';

export default function Login() {
  const [role, setRole] = useState('student'); // 'student', 'parent', 'teacher', 'admin'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, error: authError, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleRoleTabChange = (selectedRole) => {
    setRole(selectedRole);
    setFormError(null);
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!identifier.trim()) {
      setFormError('Please enter your email, mobile number, or institutional ID');
      return;
    }

    if (!password || password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);
    const result = await login(identifier, password, role);
    setIsSubmitting(false);

    if (result.success) {
      const fromPath = location.state?.from?.pathname;
      const targetPath = fromPath || result.redirectTo || getDashboardRoute(result.user?.role || role);
      navigate(targetPath, { replace: true });
    } else {
      setFormError(result.error || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Navigation */}
      <div className="max-w-lg w-full mx-auto flex items-center justify-between mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-school-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Public Website</span>
        </Link>
        <span className="text-[11px] font-semibold text-slate-400">
          N.D.R.N. Vidyalaya • Secure Portal
        </span>
      </div>

      {/* Main Login Card */}
      <div className="max-w-lg w-full mx-auto bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-soft-lg">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <SchoolLogo size="md" to="/" showSubtitle={false} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Institutional Sign In
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sign in to access your portal, or use temporary offline demo credentials for evaluation.
          </p>
        </div>

        {/* Portal Role Tabs (4 Roles) */}
        <div className="grid grid-cols-4 bg-slate-100 p-1 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => handleRoleTabChange('student')}
            className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              role === 'student' ? 'bg-white text-school-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleTabChange('parent')}
            className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              role === 'parent' ? 'bg-white text-school-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Parent</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleTabChange('teacher')}
            className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              role === 'teacher' ? 'bg-white text-school-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Teacher</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleTabChange('admin')}
            className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              role === 'admin' ? 'bg-school-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>



        {/* Error Alert Banner */}
        {(formError || authError) && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Authentication Error: </span>
              <span>{formError || authError}</span>
            </div>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {role === 'student'
                ? 'Student Admission No. / Email'
                : role === 'parent'
                ? 'Parent Mobile / Registered Email'
                : role === 'teacher'
                ? 'Faculty Email / Staff ID'
                : 'Administrator Email / Key'}
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-school-600 focus:ring-1 focus:ring-school-600 font-medium"
              placeholder={
                role === 'student'
                  ? 'Enter Admission No. or email'
                  : role === 'parent'
                  ? 'Enter mobile number or email'
                  : role === 'teacher'
                  ? 'Enter faculty email or ID'
                  : 'Enter administrator email'
              }
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <span className="text-[11px] font-semibold text-school-600 hover:underline cursor-pointer">
                Forgot Password?
              </span>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-school-600 focus:ring-1 focus:ring-school-600 font-medium"
              placeholder="Enter your password"
            />
          </div>

          <Button
            type="submit"
            variant={role === 'admin' ? 'primary' : 'portal'}
            fullWidth
            size="md"
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In to {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
          </Button>
        </form>

        {/* Role Isolation Note */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
          <p>
            Role-Based Access Control: Each account can access only its authorized portal dashboard.
          </p>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-xs text-slate-400 mt-6">
        © 2026 N.D.R.N. Vidyalaya, Daulatyarpur, Madhoganj • Role-Based Authentication System
      </div>
    </div>
  );
}
