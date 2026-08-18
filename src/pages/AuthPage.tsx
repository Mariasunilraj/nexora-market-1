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
  Sparkles,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ArrowLeft,
  RefreshCw,
  Send,
  ShieldAlert,
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

  // Login form states (clean, no default pre-fill)
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

  // Timer countdown for OTP resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!loginIdentifier.trim() || !loginPassword) {
      setErrorMsg('Please enter both your username/email and password.');
      return;
    }

    const res = userDB.login(loginIdentifier, loginPassword);
    if (res.success && res.user) {
      onAuthSuccess(res.user);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    const res = userDB.register(regUsername, regEmail, regPassword);
    if (res.success && res.user) {
      const authenticatedUser = res.user;
      setSuccessMsg('Account registered successfully! Redirecting to trading station...');
      setTimeout(() => {
        onAuthSuccess(authenticatedUser);
      }, 1000);
    } else {
      setErrorMsg(res.message);
    }
  };

  // 1. Request OTP via registered email
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!forgotIdentifier.trim()) {
      setErrorMsg('Please enter your registered Gmail or Username.');
      return;
    }

    const res = userDB.requestPasswordResetOtp(forgotIdentifier);
    if (res.success && res.email && res.otp) {
      setOtpTargetEmail(res.email);
      setDispatchedOtpPreview(res.otp);
      setSuccessMsg(res.message);
      setForgotStep('otp');
      setResendTimer(60);
    } else {
      setErrorMsg(res.message);
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

    const res = userDB.verifyOtp(otpTargetEmail, enteredOtp);
    if (res.success) {
      setSuccessMsg('OTP Code Verified! Please enter your new password.');
      setForgotStep('new-password');
    } else {
      setErrorMsg(res.message);
    }
  };

  // 3. Reset Password
  const handleResetPassword = (e: React.FormEvent) => {
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

    const res = userDB.resetPasswordWithOtp(otpTargetEmail, enteredOtp, newResetPassword);
    if (res.success && res.user) {
      setSuccessMsg('Password updated successfully! Logging you in...');
      setTimeout(() => {
        onAuthSuccess(res.user!);
      }, 1200);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleResendOtp = () => {
    if (resendTimer > 0) return;
    const res = userDB.requestPasswordResetOtp(otpTargetEmail);
    if (res.success && res.otp) {
      setDispatchedOtpPreview(res.otp);
      setSuccessMsg(`A fresh 6-digit OTP was sent to ${otpTargetEmail}`);
      setResendTimer(60);
    }
  };

  return (
    <div className="min-h-screen bg-[#070D1F] flex items-center justify-center p-4 relative overflow-hidden text-slate-100 font-sans">
      {/* Background Decorative Lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center shadow-xl shadow-emerald-500/20">
            <div className="w-full h-full bg-[#0B132B] rounded-[14px] flex items-center justify-center">
              <span className="text-emerald-400 font-black text-xl tracking-tighter">m</span>
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-widest text-white">NEXORA</h1>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Global Success Banner */}
        {successMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. Signed Out View */}
        {view === 'signed-out' && (
          <div className="bg-[#0B132B] border border-[#1C2951] rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400 shadow-inner">
              <LogOut className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                You have signed out
              </h2>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                Your portfolio, orders, transactions, and settings have been safely preserved in the database.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111C3A] border border-[#1C2951] flex items-center justify-center gap-2 text-xs text-slate-300 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Data stored safely in database</span>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => { setView('login'); setErrorMsg(null); setSuccessMsg(null); }}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
              >
                <span>Sign In to Your Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => { setView('register'); setErrorMsg(null); setSuccessMsg(null); }}
                className="w-full py-3 px-4 bg-[#111C3A] hover:bg-[#16244C] text-slate-200 border border-[#1C2951] font-semibold text-xs rounded-xl transition-all"
              >
                Create New Trading Account
              </button>
            </div>
          </div>
        )}

        {/* 2. Registration View */}
        {view === 'register' && (
          <div className="bg-[#0B132B] border border-[#1C2951] rounded-3xl p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Create Trading Account
              </h2>
              <p className="text-xs text-slate-400">
                Register with your credentials to start paper trading US stocks
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Username
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="Choose a username"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full bg-[#111C3A] border border-[#1C2951] rounded-xl px-4 py-2.5 pl-10 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Gmail / Email Address
                </label>
                <div className="relative flex items-center">
                  <input
                    type="email"
                    required
                    placeholder="name@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-[#111C3A] border border-[#1C2951] rounded-xl px-4 py-2.5 pl-10 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Create a secure password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-[#111C3A] border border-[#1C2951] rounded-xl px-4 py-2.5 pl-10 pr-10 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
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
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter your password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full bg-[#111C3A] border border-[#1C2951] rounded-xl px-4 py-2.5 pl-10 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all"
              >
                Register Account ($50,000 USD Free)
              </button>
            </form>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-400">
                Already have an account?{' '}
                <button
                  onClick={() => { setView('login'); setErrorMsg(null); setSuccessMsg(null); }}
                  className="text-blue-400 hover:underline font-bold"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        )}

        {/* 3. Login View (with Forgot Password & OTP integration) */}
        {view === 'login' && (
          <div className="bg-[#0B132B] border border-[#1C2951] rounded-3xl p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Sign In to NEXORA
              </h2>
              <p className="text-xs text-slate-400">
                Enter your credentials to access your trading workstation
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Username or Gmail ID
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="e.g. mariasunilraj8@gmail.com"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full bg-[#111C3A] border border-[#1C2951] rounded-xl px-4 py-2.5 pl-10 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
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
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold hover:underline"
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
                    className="w-full bg-[#111C3A] border border-[#1C2951] rounded-xl px-4 py-2.5 pl-10 pr-10 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
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
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-400">
                Don't have an account?{' '}
                <button
                  onClick={() => { setView('register'); setErrorMsg(null); setSuccessMsg(null); }}
                  className="text-emerald-400 hover:underline font-bold"
                >
                  Register New Account
                </button>
              </p>
            </div>
          </div>
        )}

        {/* 4. Forgot Password & OTP Verification View */}
        {view === 'forgot-password' && (
          <div className="bg-[#0B132B] border border-[#1C2951] rounded-3xl p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => { setView('login'); setErrorMsg(null); setSuccessMsg(null); }}
                className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Sign In</span>
              </button>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-950/60 text-blue-400 border border-blue-800/60">
                Step {forgotStep === 'email' ? '1 of 3' : forgotStep === 'otp' ? '2 of 3' : '3 of 3'}
              </span>
            </div>

            {/* STEP 1: Enter Registered Email */}
            {forgotStep === 'email' && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400 mb-3">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Reset Password
                  </h2>
                  <p className="text-xs text-slate-400">
                    Enter your registered Gmail ID or Username. We will dispatch a 6-digit OTP verification code to your email.
                  </p>
                </div>

                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Registered Email or Username
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        required
                        placeholder="e.g. mariasunilraj8@gmail.com"
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        className="w-full bg-[#111C3A] border border-[#1C2951] rounded-xl px-4 py-2.5 pl-10 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
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
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 mb-3">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Verify 6-Digit OTP
                  </h2>
                  <p className="text-xs text-slate-400">
                    A 6-digit code has been sent to <strong className="text-blue-400">{otpTargetEmail}</strong>.
                  </p>
                </div>

                {/* Simulated High-Security Email Dispatch Alert */}
                {dispatchedOtpPreview && (
                  <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/40 space-y-1 text-center animate-in fade-in">
                    <span className="text-[11px] font-semibold text-blue-300 block">
                      📩 Email Dispatched to {otpTargetEmail}
                    </span>
                    <span className="text-2xl font-black font-mono tracking-widest text-emerald-400 block py-1">
                      {dispatchedOtpPreview}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      (Valid for 5 minutes. Enter this code below to reset your password)
                    </span>
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-center">
                      Enter 6-Digit Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="• • • • • •"
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-[#111C3A] border border-[#1C2951] rounded-xl py-3 text-center text-2xl font-mono font-bold tracking-widest text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all"
                  >
                    Verify Code
                  </button>
                </form>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">Didn't receive code?</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0}
                    className={`font-bold flex items-center gap-1 ${
                      resendTimer > 0 ? 'text-slate-500 cursor-not-allowed' : 'text-blue-400 hover:underline'
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
                  <div className="w-12 h-12 rounded-2xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400 mb-3">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Set New Password
                  </h2>
                  <p className="text-xs text-slate-400">
                    Create a strong password for your account
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      New Password
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Enter new password"
                        value={newResetPassword}
                        onChange={(e) => setNewResetPassword(e.target.value)}
                        className="w-full bg-[#111C3A] border border-[#1C2951] rounded-xl px-4 py-2.5 pl-10 pr-10 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
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
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Re-enter new password"
                        value={confirmResetPassword}
                        onChange={(e) => setConfirmResetPassword(e.target.value)}
                        className="w-full bg-[#111C3A] border border-[#1C2951] rounded-xl px-4 py-2.5 pl-10 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
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
