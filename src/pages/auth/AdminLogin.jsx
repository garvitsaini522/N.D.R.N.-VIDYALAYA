import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  Key,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Zap,
  Info,
  Check,
  KeyRound
} from 'lucide-react';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { DEMO_ACCOUNTS } from '../../config/demoAccounts';

export default function AdminLogin() {
  const [empId, setEmpId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [filledFeedback, setFilledFeedback] = useState(false);

  const { user, isAuthenticated, login, loginAsDemoRole, logout, error: authError, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/admin/dashboard';
  const adminDemo = DEMO_ACCOUNTS.admin;

  // If already authenticated as administrator, navigate directly to dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleAutoFillDemo = () => {
    if (adminDemo) {
      setEmpId(adminDemo.email);
      setPassword(adminDemo.password);
      setErrorMsg(null);
      clearError();
      setFilledFeedback(true);
      setTimeout(() => setFilledFeedback(false), 2500);
    }
  };

  const handleQuickDemoEnter = async () => {
    setErrorMsg(null);
    clearError();
    setIsLoading(true);
    const result = loginAsDemoRole('admin');
    setIsLoading(false);

    if (result.success) {
      navigate(redirectPath, { replace: true });
    } else {
      setErrorMsg(result.error || 'Failed to initialize administrator demo session');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    clearError();

    if (!empId.trim()) {
      setErrorMsg('Please enter your administrator email or staff ID');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    const result = await login(empId, password, 'admin');
    setIsLoading(false);

    if (result.success) {
      // Enforce strict administrative authorization
      if (result.user?.role !== 'admin') {
        logout();
        setErrorMsg(
          `Institutional access restricted. The account for "${result.user?.name}" has role "${result.user?.role?.toUpperCase()}". Only authorized School Administrators may access the Admin Portal.`
        );
        return;
      }
      navigate(redirectPath, { replace: true });
    } else {
      setErrorMsg(result.error || 'Invalid administrator credentials');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 text-slate-100">
      {/* Top Header */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Public Website</span>
        </Link>
        <span className="text-[11px] font-semibold text-gold-400">
          Restricted Institutional Access
        </span>
      </div>

      {/* Admin Card */}
      <div className="max-w-md w-full mx-auto bg-slate-800/90 rounded-3xl border border-slate-700 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-gold-400/30 text-gold-400 flex items-center justify-center mx-auto mb-3 shadow-soft-sm">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Staff & Administrative Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dedicated portal for faculty, academic coordinators, and the Principal's secretariat.
          </p>
        </div>

        {/* Demo Administrator Credentials Card */}
        {adminDemo && (
          <div className="mb-5 p-4 rounded-2xl bg-slate-900/90 border border-gold-500/40 shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-gold-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-gold-400" />
                <span>Admin Demo Access</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-400/20 text-gold-300 border border-gold-400/30">
                Evaluation Mode
              </span>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-700 text-xs space-y-1 mb-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Account:</span>
                <span className="font-bold text-white">{adminDemo.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Email ID:</span>
                <code className="font-mono font-bold text-gold-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                  {adminDemo.email}
                </code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Password:</span>
                <code className="font-mono font-bold text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                  {adminDemo.password}
                </code>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAutoFillDemo}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {filledFeedback ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Credentials Filled!</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5 text-gold-400" />
                    <span>Auto-Fill</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleQuickDemoEnter}
                disabled={isLoading}
                className="flex-1 py-2 px-3 rounded-xl bg-gold-500 hover:bg-gold-600 text-slate-950 text-xs font-extrabold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>1-Click Enter</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-400 mt-2 leading-relaxed flex items-center gap-1">
              <Info className="w-3 h-3 text-gold-400 shrink-0" />
              <span>Offline temporary demo access. MongoDB server is not required.</span>
            </p>
          </div>
        )}

        {/* Error Alert Banner */}
        {(errorMsg || authError) && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <div className="flex-1">
              <span className="font-bold">Access Denied: </span>
              <span>{errorMsg || authError}</span>
            </div>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Staff / Administrator Email or ID
            </label>
            <input
              type="text"
              required
              value={empId}
              onChange={(e) => setEmpId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-700 bg-slate-900/80 text-white focus:outline-hidden focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
              placeholder="e.g. admin.demo@ndrn.local"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-300">Secret Password</label>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-700 bg-slate-900/80 text-white focus:outline-hidden focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
              placeholder="Enter password"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="md"
            isLoading={isLoading}
            className="bg-gold-500 hover:bg-gold-600 text-slate-950 font-black"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Authenticate Administrator
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-700/80 text-center text-xs text-slate-400">
          <p>
            Authorized personnel only. All access attempts are monitored and logged.
          </p>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-xs text-slate-500 mt-6">
        © 2026 N.D.R.N. Vidyalaya • Internal Administration & Management Console
      </div>
    </div>
  );
}
