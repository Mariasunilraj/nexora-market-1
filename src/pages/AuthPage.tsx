import React, { useState, useEffect } from 'react';
import {
  LogOut,
  ArrowRight,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  User,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ArrowLeft,
  RefreshCw,
  Send,
} from 'lucide-react';
import { userDB, UserAccount } from '../services/userService';

interface AuthPageProps {
  initialView?: 'login' | 'register' | 'signed-out' | 'forgot-password';
  onAuthSuccess: (user: UserAccount) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialView = 'login',
  onAuthSuccess,
}) => {
  const [view, setView] = useState<'login' | 'register' | 'signed-out' | 'forgot-password'>(initialView);

  // Login form states
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form states
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Forgot Password / OTP states
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [otpTargetEmail, setOtpTargetEmail] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [confirmResetPassword, setConfirmResetPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<'email' | 'otp' | 'new-password'>('email');
  const [dispatchedOtpPreview, setDispatchedOtpPreview] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState<number>(0);

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  // Timer countdown for OTP resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!loginIdentifier.trim() || !loginPassword) {
      setErrorMsg('Please enter both your username/email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await userDB.login(loginIdentifier, loginPassword);
      if (res.success && res.user) {
        setSuccessMsg('Signed in to Cloud! Syncing multi-device portfolio...');
        setTimeout(() => {
          onAuthSuccess(res.user!);
        }, 500);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await userDB.register(regUsername, regEmail, regPassword);
      if (res.success && res.user) {
        const authenticatedUser = res.user;
        setSuccessMsg('Account registered in Supabase Cloud! Redirecting to trading station...');
        setTimeout(() => {
          onAuthSuccess(authenticatedUser);
        }, 800);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Registration error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Request OTP via registered email
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!forgotIdentifier.trim()) {
      setErrorMsg('Please enter your registered Gmail or Username.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await userDB.requestPasswordResetOtp(forgotIdentifier);
      if (res.success && res.email && res.otp) {
        setOtpTargetEmail(res.email);
        setDispatchedOtpPreview(res.otp);
        setSuccessMsg(res.message);
        setForgotStep('otp');
        setResendTimer(60);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to request reset OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Verify entered OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (enteredOtp.trim().length !== 6) {
      setErrorMsg('Please enter the full 6-digit OTP code.');
      return;
    }

    setSuccessMsg('OTP Code Verified! Please enter your new password.');
    setForgotStep('new-password');
  };

  // 3. Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newResetPassword.length < 4) {
      setErrorMsg('New password must be at least 4 characters long.');
      return;
    }

    if (newResetPassword !== confirmResetPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await userDB.resetPasswordWithOtp(otpTargetEmail, enteredOtp, newResetPassword);
      if (res.success && res.user) {
        setSuccessMsg('Password updated in Supabase Cloud! Logging you in...');
        setTimeout(() => {
          onAuthSuccess(res.user!);
        }, 1000);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    try {
      const res = await userDB.requestPasswordResetOtp(otpTargetEmail);
      if (res.success && res.otp) {
        setDispatchedOtpPreview(res.otp);
        setSuccessMsg(`A fresh 6-digit OTP was sent to ${otpTargetEmail}`);
        setResendTimer(60);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#121214] flex items-center justify-center p-4 relative overflow-hidden text-slate-900 dark:text-slate-100 font-sans">
      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-9 h-9 bg-blue-600 dark:bg-[#3B82F6] flex items-center justify-center text-white font-mono font-bold text-lg">
            N
          </div>
          <h1 className="text-xl font-bold tracking-widest text-slate-900 dark:text-white uppercase">NEXORA</h1>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Global Success Banner */}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. Signed Out View */}
        {view === 'signed-out' && (
          <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 p-8 shadow-none text-center space-y-6 animate-in fade-in duration-200">
            <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-600 dark:text-[#3B82F6]">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                You have signed out
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
                Your portfolio, orders, transactions, and settings have been safely preserved.
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center gap-2 text-xs text-slate-700 dark:text-zinc-300 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Data stored safely in database</span>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => { setView('login'); setErrorMsg(null); setSuccessMsg(null); }}
                className="w-full py-2.5 px-4 bg-blue-600 dark:bg-[#3B82F6] hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <span>Sign In to Your Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => { setView('register'); setErrorMsg(null); setSuccessMsg(null); }}
                className="w-full py-2.5 px-4 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 font-semibold text-xs uppercase tracking-wider transition-all"
              >
                Create New Trading Account
              </button>
            </div>
          </div>
        )}

        {/* 2. Registration View */}
        {view === 'register' && (
          <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 p-8 shadow-none space-y-6 animate-in fade-in duration-200">
            <div className="text-center space-y-1">
              <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Create Trading Account
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Register with your credentials to start paper trading US stocks
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                  Username
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="Choose a username"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 px-4 py-2 pl-10 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                  Gmail / Email Address
                </label>
                <div className="relative flex items-center">
                  <input
                    type="email"
                    required
                    placeholder="name@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 px-4 py-2 pl-10 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                  Password
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Create a secure password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 px-4 py-2 pl-10 pr-10 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-slate-400 hover:text-slate-200 absolute right-3"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter your password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 px-4 py-2 pl-10 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs uppercase tracking-wider transition-colors"
              >
                Register Account ($50,000 Free Cash)
              </button>
            </form>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Already have an account?{' '}
                <button
                  onClick={() => { setView('login'); setErrorMsg(null); setSuccessMsg(null); }}
                  className="text-blue-600 dark:text-[#3B82F6] hover:underline font-semibold uppercase tracking-wider"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        )}

        {/* 3. Login View */}
        {view === 'login' && (
          <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 p-8 shadow-none space-y-6 animate-in fade-in duration-200">
            <div className="text-center space-y-1">
              <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Sign In to NEXORA
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Enter your credentials to access your trading workstation
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                  Email Address or Username
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="Enter your email or username"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 px-4 py-2 pl-10 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setView('forgot-password');
                      setForgotStep('email');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                      setForgotIdentifier(loginIdentifier);
                    }}
                    className="text-[11px] text-blue-600 dark:text-[#3B82F6] hover:underline uppercase tracking-wider font-semibold"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 px-4 py-2 pl-10 pr-10 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-slate-400 hover:text-slate-200 absolute right-3"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 dark:bg-[#3B82F6] hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Don't have an account?{' '}
                <button
                  onClick={() => { setView('register'); setErrorMsg(null); setSuccessMsg(null); }}
                  className="text-blue-600 dark:text-[#3B82F6] hover:underline font-semibold uppercase tracking-wider"
                >
                  Register New Account
                </button>
              </p>
            </div>
          </div>
        )}

        {/* 4. Forgot Password & OTP Verification View */}
        {view === 'forgot-password' && (
          <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 p-8 shadow-none space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => { setView('login'); setErrorMsg(null); setSuccessMsg(null); }}
                className="p-1 -ml-1 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Sign In</span>
              </button>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-[#3B82F6] border border-blue-500/20">
                Step {forgotStep === 'email' ? '1 of 3' : forgotStep === 'otp' ? '2 of 3' : '3 of 3'}
              </span>
            </div>

            {/* STEP 1: Enter Registered Email */}
            {forgotStep === 'email' && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-600 dark:text-[#3B82F6] mb-3">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Reset Password
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Enter your registered Gmail ID or Username. We will dispatch a 6-digit OTP verification code to your email.
                  </p>
                </div>

                <form onSubmit={handleRequestOtp} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                      Registered Email or Username
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        required
                        placeholder="Enter your email or username"
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 px-4 py-2 pl-10 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 dark:bg-[#3B82F6] hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <span>Send Verification Code</span>
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* STEP 2: Enter 6-Digit OTP */}
            {forgotStep === 'otp' && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-500 mb-3">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Verify 6-Digit OTP
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    A 6-digit code has been sent to <strong className="text-blue-600 dark:text-[#3B82F6]">{otpTargetEmail}</strong>.
                  </p>
                </div>

                {/* Simulated High-Security Email Dispatch Alert */}
                {dispatchedOtpPreview && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 space-y-1 text-center animate-in fade-in">
                    <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 block">
                      📩 Email Dispatched to {otpTargetEmail}
                    </span>
                    <span className="text-2xl font-bold font-mono tracking-widest text-emerald-600 dark:text-emerald-400 block py-1">
                      {dispatchedOtpPreview}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">
                      (Valid for 5 minutes. Enter this code below to reset your password)
                    </span>
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5 text-center">
                      Enter 6-Digit Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="• • • • • •"
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 py-2.5 text-center text-2xl font-mono font-bold tracking-widest text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs uppercase tracking-wider transition-colors"
                  >
                    Verify Code
                  </button>
                </form>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500 dark:text-zinc-400">Didn't receive code?</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0}
                    className={`font-semibold uppercase tracking-wider flex items-center gap-1 ${
                      resendTimer > 0 ? 'text-slate-400 dark:text-zinc-600 cursor-not-allowed' : 'text-blue-600 dark:text-[#3B82F6] hover:underline'
                    }`}
                  >
                    <RefreshCw className={`w-3 h-3 ${resendTimer > 0 ? 'animate-spin' : ''}`} />
                    <span>{resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Enter New Password */}
            {forgotStep === 'new-password' && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-600 dark:text-[#3B82F6] mb-3">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Set New Password
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Create a strong password for your account
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                      New Password
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Enter new password"
                        value={newResetPassword}
                        onChange={(e) => setNewResetPassword(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 px-4 py-2 pl-10 pr-10 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 text-slate-400 hover:text-slate-200 absolute right-3"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Re-enter new password"
                        value={confirmResetPassword}
                        onChange={(e) => setConfirmResetPassword(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 px-4 py-2 pl-10 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 dark:bg-[#3B82F6] hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Reset Password & Sign In</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
