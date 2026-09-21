import React, { useState, useRef } from 'react';
import {
  RotateCcw,
  Download,
  FileSpreadsheet,
  KeyRound,
  LogOut,
  User,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Shield,
  ShieldCheck,
  Smartphone,
  Laptop,
  Lock,
  Eye,
  EyeOff,
  QrCode,
  Check,
  Camera,
  Upload,
  Trash2,
} from 'lucide-react';
import { useTrading } from '../context/TradingContext';
import { userDB } from '../services/userService';
import { Modal } from '../components/common/Modal';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { STOCK_MARKET_AVATARS } from '../data/stockMarketAvatars';

interface AccountPageProps {
  onNavigateToSettings?: () => void;
  onLogout?: () => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  onLogout,
}) => {
  const {
    userProfile,
    totalPortfolioValue,
    buyingPower,
    virtualCash,
    totalPnL,
    totalPnLPercent,
    depositVirtualCash,
    withdrawVirtualCash,
    resetAccount,
    updateProfile,
    transactions,
  } = useTrading();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'Profile' | 'Plan & Billing' | 'Security'>('Profile');

  // Modals
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [isAvatarPickerModalOpen, setIsAvatarPickerModalOpen] = useState(false);

  // Avatar Picker State
  const [avatarGenderFilter, setAvatarGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [tempSelectedAvatar, setTempSelectedAvatar] = useState<string | null>(userProfile.avatarUrl || null);

  // Profile Form States
  const [depositAmount, setDepositAmount] = useState<number>(10000);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(1000);
  const [editName, setEditName] = useState(userProfile.name);
  const [editEmail, setEditEmail] = useState(userProfile.email);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Plan & Billing States
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState<string>('Institutional Elite');
  const [currentPlanName, setCurrentPlanName] = useState<string>(userProfile.plan || 'Paper Trading Pro');

  // Security States
  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean>(false);
  const [authCode, setAuthCode] = useState<string>('');
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newSecurityPassword, setNewSecurityPassword] = useState<string>('');
  const [confirmSecurityPassword, setConfirmSecurityPassword] = useState<string>('');
  const [showSecurityPassword, setShowSecurityPassword] = useState<boolean>(false);
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null);

  // Active Sessions
  const [activeSessions, setActiveSessions] = useState([
    {
      id: 'sess-1',
      device: 'Windows 11 • Chrome 124',
      type: 'desktop',
      ip: '10.11.1.160',
      location: 'Mumbai, India',
      status: 'Current Session',
      isCurrent: true,
    },
    {
      id: 'sess-2',
      device: 'iPhone 15 Pro • Safari iOS',
      type: 'mobile',
      ip: '172.25.120.215',
      location: 'Chennai, India',
      status: 'Active 2 hours ago',
      isCurrent: false,
    },
  ]);

  // Photo Upload Handler (Canvas Smart-Compressor, Transparency Protection, 10MB Support)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPEG, WEBP, GIF).');
      return;
    }

    // 10MB limit per photo
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit. Please choose a photo smaller than 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const TARGET_SIZE = 512;
        canvas.width = TARGET_SIZE;
        canvas.height = TARGET_SIZE;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clean white/transparent-safe base to prevent black background rendering
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, TARGET_SIZE, TARGET_SIZE);

        // Center square crop
        const width = img.width;
        const height = img.height;
        let sx = 0;
        let sy = 0;
        let sw = width;
        let sh = height;

        if (width > height) {
          sx = (width - height) / 2;
          sw = height;
        } else if (height > width) {
          sy = (height - width) / 2;
          sh = width;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, TARGET_SIZE, TARGET_SIZE);

        // Export high-quality 512x512 avatar data URL (~40KB)
        const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
        updateProfile({ avatarUrl: optimizedDataUrl });
        setActionNotice('Profile photo (10MB supported) processed and saved successfully!');
        setTimeout(() => setActionNotice(null), 4000);
      };

      img.onerror = () => {
        alert('Failed to process image. Please try another photo.');
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      alert('Failed to read photo file. Please try again.');
    };

    reader.readAsDataURL(file);
  };

  const handleApplyMarketAvatar = () => {
    if (tempSelectedAvatar) {
      updateProfile({ avatarUrl: tempSelectedAvatar });
      setIsAvatarPickerModalOpen(false);
      setActionNotice('Stock market trader avatar applied to your profile!');
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleRemovePhoto = () => {
    updateProfile({ avatarUrl: undefined });
    setTempSelectedAvatar(null);
    setActionNotice('Profile photo removed.');
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleDeposit = () => {
    if (depositAmount > 0) {
      depositVirtualCash(depositAmount);
      setIsDepositModalOpen(false);
      setActionNotice(`Successfully added +$${depositAmount.toLocaleString()} to Virtual Cash.`);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleWithdraw = () => {
    if (withdrawAmount > 0) {
      const res = withdrawVirtualCash(withdrawAmount);
      if (res.success) {
        setIsWithdrawModalOpen(false);
        setActionNotice(res.message);
        setTimeout(() => setActionNotice(null), 4000);
      } else {
        alert(res.message);
      }
    }
  };

  const handleReset = () => {
    resetAccount(50000);
    setIsResetModalOpen(false);
    setActionNotice('Paper Trading Account reset to initial $50,000 balance.');
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name: editName, email: editEmail });
    setIsEditProfileModalOpen(false);
    setActionNotice('Profile updated successfully.');
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleConfirmPlanUpgrade = () => {
    const res = userDB.updateUserPlan(selectedUpgradePlan);
    if (res.success) {
      setCurrentPlanName(selectedUpgradePlan);
      updateProfile({ plan: selectedUpgradePlan });
      setIsUpgradeModalOpen(false);
      setActionNotice(`Your account has been upgraded to ${selectedUpgradePlan}!`);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordNotice(null);

    if (!currentPassword || !newSecurityPassword) {
      setPasswordNotice('Please enter both your current and new password.');
      return;
    }

    if (newSecurityPassword.length < 4) {
      setPasswordNotice('New password must be at least 4 characters long.');
      return;
    }

    if (newSecurityPassword !== confirmSecurityPassword) {
      setPasswordNotice('New passwords do not match.');
      return;
    }

    const currentUser = userDB.getActiveUser();
    if (currentUser) {
      userDB.register(currentUser.username, currentUser.email, newSecurityPassword);
      setPasswordNotice('Password updated and encrypted successfully in the database!');
      setCurrentPassword('');
      setNewSecurityPassword('');
      setConfirmSecurityPassword('');
      setTimeout(() => setPasswordNotice(null), 4000);
    }
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (authCode.length === 6) {
      setIs2FAEnabled(true);
      setIs2FAModalOpen(false);
      setAuthCode('');
      setActionNotice('Two-Factor Authentication (2FA) is now active and protecting your account.');
      setTimeout(() => setActionNotice(null), 4000);
    } else {
      alert('Please enter a valid 6-digit Authenticator verification code.');
    }
  };

  const handleRevokeSession = (sessionId: string) => {
    setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
    setActionNotice('Remote session terminated successfully.');
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleDownloadStatement = () => {
    const content = `================================================
NEXORA INSTITUTIONAL PAPER TRADING STATEMENT
Account Holder: ${userProfile.name}
Email: ${userProfile.email}
Plan: ${currentPlanName}
Date Generated: ${new Date().toLocaleString()}
================================================
Virtual Equity: $${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
Buying Power: $${buyingPower.toLocaleString(undefined, { minimumFractionDigits: 2 })}
Virtual Cash: $${virtualCash.toLocaleString(undefined, { minimumFractionDigits: 2 })}
Total Realized & Unrealized P&L: $${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${totalPnLPercent.toFixed(2)}%)
================================================
Recent Transactions:
${transactions.slice(0, 10).map(t => `${t.date} | ${t.type.padEnd(8)} | ${t.description.padEnd(30)} | $${t.amount}`).join('\n')}
================================================`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexora_statement_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered Stock Market Avatars
  const filteredAvatars = STOCK_MARKET_AVATARS.filter(
    a => avatarGenderFilter === 'all' || a.gender === avatarGenderFilter
  );

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-200 dark:bg-zinc-700 text-slate-400' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: 'Weak', color: 'bg-rose-500 text-rose-500' };
      case 2:
        return { score: 50, label: 'Medium', color: 'bg-amber-500 text-amber-500' };
      case 3:
        return { score: 75, label: 'Strong', color: 'bg-blue-500 dark:bg-[#3B82F6] text-blue-500 dark:text-[#3B82F6]' };
      case 4:
        return { score: 100, label: 'Institutional Grade', color: 'bg-emerald-500 text-emerald-500' };
      default:
        return { score: 15, label: 'Too Short', color: 'bg-rose-500 text-rose-500' };
    }
  };

  const strength = getPasswordStrength(newSecurityPassword);

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Top Tabs */}
      <div className="border-b border-slate-200 dark:border-zinc-800">
        <div className="flex space-x-6">
          {(['Profile', 'Plan & Billing', 'Security'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 border-b-2 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === tab
                  ? 'border-blue-600 dark:border-[#3B82F6] text-blue-600 dark:text-[#3B82F6]'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              {tab === 'Profile' && <User className="w-4 h-4" />}
              {tab === 'Plan & Billing' && <CreditCard className="w-4 h-4" />}
              {tab === 'Security' && <Shield className="w-4 h-4" />}
              <span>{tab}</span>
            </button>
          ))}
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-3 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-500" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/png, image/jpeg, image/webp, image/gif"
        className="hidden"
      />

      {/* ======================================================== */}
      {/* 1. PROFILE TAB                                           */}
      {/* ======================================================== */}
      {activeTab === 'Profile' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Information & Avatar Card */}
            <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 p-6 flex flex-col items-start justify-between">
              <div className="w-full">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-5 flex items-center justify-between">
                  <span>Profile Information</span>
                  <span className="text-[11px] font-mono font-normal text-slate-400 dark:text-zinc-500">ID: NX-{userProfile.name?.substring(0, 3).toUpperCase() || 'USR'}</span>
                </h4>

                <div className="flex flex-col items-start space-y-4">
                  {/* Avatar with Upload & Overlay Badge */}
                  <div className="relative group">
                    <div className="w-20 h-20 overflow-hidden bg-blue-600 dark:bg-[#3B82F6] border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-white font-bold text-3xl">
                      {userProfile.avatarUrl ? (
                        <img
                          src={userProfile.avatarUrl}
                          alt={userProfile.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span>{userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}</span>
                      )}
                    </div>

                    {/* Quick Camera Trigger */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      title="Upload custom photo"
                      className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 dark:bg-[#3B82F6] text-white border border-white dark:border-[#18181B] hover:opacity-90 transition-opacity"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Avatar Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-1 w-full">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-1.5 px-2.5 text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 transition-colors flex items-center justify-center gap-1.5 uppercase tracking-wider"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                    </button>

                    <button
                      onClick={() => {
                        setTempSelectedAvatar(userProfile.avatarUrl || null);
                        setIsAvatarPickerModalOpen(true);
                      }}
                      className="flex-1 py-1.5 px-2.5 text-xs font-semibold bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-[#3B82F6] hover:bg-blue-100 dark:hover:bg-zinc-700 border border-blue-200 dark:border-zinc-700 transition-colors flex items-center justify-center gap-1.5 uppercase tracking-wider"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Avatars</span>
                    </button>

                    {userProfile.avatarUrl && (
                      <button
                        onClick={handleRemovePhoto}
                        title="Remove photo"
                        className="py-1.5 px-2 text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {userProfile.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      {userProfile.email}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                      Member since {userProfile.memberSince}
                    </p>
                  </div>

                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-[#3B82F6] border border-blue-500/20">
                      <Sparkles className="w-3 h-3 fill-current" />
                      {currentPlanName}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsEditProfileModalOpen(true)}
                className="w-full mt-6 py-2 px-4 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-[#3B82F6] border border-blue-600 dark:border-[#3B82F6] hover:bg-blue-50 dark:hover:bg-[#3B82F6]/10 transition-colors"
              >
                Edit Profile Information
              </button>
            </div>

            {/* Account Summary */}
            <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 p-6 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-5">
                  Account Summary
                </h4>

                <div className="space-y-4 text-xs font-medium">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                    <span className="text-slate-500 dark:text-zinc-400">Account Type</span>
                    <span className="text-slate-900 dark:text-white font-bold">Paper Trading</span>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                    <span className="text-slate-500 dark:text-zinc-400">Virtual Equity</span>
                    <span className="text-slate-900 dark:text-white font-mono font-bold">
                      {formatCurrency(totalPortfolioValue)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                    <span className="text-slate-500 dark:text-zinc-400">Buying Power</span>
                    <span className="text-slate-900 dark:text-white font-mono font-bold">
                      {formatCurrency(buyingPower)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">Total P&L</span>
                    <span className={`font-mono font-bold ${totalPnL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {formatCurrency(totalPnL, true)} ({formatPercent(totalPnLPercent)})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 p-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
                Quick Actions
              </h4>

              <div className="space-y-1 font-medium text-xs">
                <button
                  onClick={() => setIsResetModalOpen(true)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-[#3B82F6] transition-colors text-left border border-transparent hover:border-slate-200 dark:hover:border-zinc-700"
                >
                  <RotateCcw className="w-4 h-4 text-blue-500 dark:text-[#3B82F6]" />
                  <span>Reset Paper Account</span>
                </button>

                <button
                  onClick={handleDownloadStatement}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-[#3B82F6] transition-colors text-left border border-transparent hover:border-slate-200 dark:hover:border-zinc-700"
                >
                  <Download className="w-4 h-4 text-blue-500 dark:text-[#3B82F6]" />
                  <span>Download Statement</span>
                </button>

                <button
                  onClick={() => setActiveTab('Plan & Billing')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-[#3B82F6] transition-colors text-left border border-transparent hover:border-slate-200 dark:hover:border-zinc-700"
                >
                  <Sparkles className="w-4 h-4 text-blue-500 dark:text-[#3B82F6]" />
                  <span>Upgrade Subscription Plan</span>
                </button>

                <button
                  onClick={() => setActiveTab('Security')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-[#3B82F6] transition-colors text-left border border-transparent hover:border-slate-200 dark:hover:border-zinc-700"
                >
                  <KeyRound className="w-4 h-4 text-emerald-500" />
                  <span>Security & 2FA Setup</span>
                </button>

                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left border border-transparent hover:border-rose-200 dark:hover:border-rose-800/50"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Virtual Cash Balance Card */}
          <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Virtual Cash Balance
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Available Cash for Trading:
              </p>
              <p className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                ${buyingPower.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setIsDepositModalOpen(true)}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs uppercase tracking-wider transition-colors"
              >
                Deposit (Virtual)
              </button>
              <button
                onClick={() => setIsWithdrawModalOpen(true)}
                className="flex-1 sm:flex-none px-5 py-2.5 text-blue-600 dark:text-[#3B82F6] border border-blue-600 dark:border-[#3B82F6] font-semibold text-xs uppercase tracking-wider hover:bg-blue-50 dark:hover:bg-[#3B82F6]/10 transition-colors"
              >
                Withdraw (Virtual)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. PLAN & BILLING TAB                                    */}
      {/* ======================================================== */}
      {activeTab === 'Plan & Billing' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Active Plan Overview */}
          <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-[#3B82F6] flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {currentPlanName}
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  Renews on <strong className="text-slate-800 dark:text-zinc-200 font-medium">August 31, 2026</strong> • Virtual Institutional Simulation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsUpgradeModalOpen(true)}
                className="px-4 py-2 bg-blue-600 dark:bg-[#3B82F6] hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-semibold text-xs uppercase tracking-wider transition-colors"
              >
                Change or Upgrade Plan
              </button>
            </div>
          </div>

          {/* Billing Cycle Switcher */}
          <div className="flex items-center justify-center gap-3 my-4">
            <span className={`text-xs font-semibold uppercase tracking-wider ${billingCycle === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-zinc-500'}`}>
              Monthly Billing
            </span>
            <button
              onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
              className="w-12 h-6 bg-slate-200 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 p-0.5 transition-colors relative flex items-center"
            >
              <div
                className={`w-4 h-4 bg-blue-600 dark:bg-[#3B82F6] transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${billingCycle === 'yearly' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-zinc-500'}`}>
              <span>Annual Billing</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                SAVE 20%
              </span>
            </span>
          </div>

          {/* 3 Tier Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free Starter Plan */}
            <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 p-6 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Free Starter</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Essential paper trading tools</p>
                <div className="my-4">
                  <span className="text-3xl font-mono font-bold text-slate-900 dark:text-white">$0</span>
                  <span className="text-xs text-slate-400 font-medium"> / forever</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-zinc-300 font-medium border-t border-slate-100 dark:border-zinc-800 pt-4">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>$25,000 Virtual Starting Cash</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Delayed 15m Market Quotes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Basic Candlestick Chart</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Up to 5 Watchlist Items</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => {
                  userDB.updateUserPlan('Free Starter');
                  setCurrentPlanName('Free Starter');
                  updateProfile({ plan: 'Free Starter' });
                  setActionNotice('Switched to Free Starter plan.');
                }}
                disabled={currentPlanName === 'Free Starter'}
                className="w-full mt-6 py-2.5 border border-slate-200 dark:border-zinc-700 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-50"
              >
                {currentPlanName === 'Free Starter' ? 'Current Plan' : 'Downgrade to Free'}
              </button>
            </div>

            {/* Paper Trading Pro */}
            <div className="bg-white dark:bg-[#18181B] border-2 border-blue-600 dark:border-[#3B82F6] p-6 relative flex flex-col justify-between">
              <span className="absolute -top-3 left-4 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-600 dark:bg-[#3B82F6] text-white">
                Most Popular
              </span>

              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Paper Trading Pro</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Real-time charts & full indicators</p>
                <div className="my-4">
                  <span className="text-3xl font-mono font-bold text-slate-900 dark:text-white">
                    {billingCycle === 'monthly' ? '$29' : '$279'}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {billingCycle === 'monthly' ? ' / month' : ' / year'}
                  </span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-zinc-300 font-medium border-t border-slate-100 dark:border-zinc-800 pt-4">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>$100,000 Virtual Starting Cash</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Real-Time Finnhub Live Quotes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>700px TradingView Institutional Chart</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>50+ Technical Momentum Indicators</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Unlimited Watchlists & Export Data</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => {
                  userDB.updateUserPlan('Paper Trading Pro');
                  setCurrentPlanName('Paper Trading Pro');
                  updateProfile({ plan: 'Paper Trading Pro' });
                  setActionNotice('Activated Paper Trading Pro plan.');
                }}
                disabled={currentPlanName === 'Paper Trading Pro'}
                className="w-full mt-6 py-2.5 bg-blue-600 dark:bg-[#3B82F6] hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-semibold text-xs uppercase tracking-wider disabled:opacity-50"
              >
                {currentPlanName === 'Paper Trading Pro' ? 'Current Plan' : 'Select Pro Plan'}
              </button>
            </div>

            {/* Institutional Elite */}
            <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 p-6 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Institutional Elite</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Algorithmic & Level 2 execution</p>
                <div className="my-4">
                  <span className="text-3xl font-mono font-bold text-slate-900 dark:text-white">
                    {billingCycle === 'monthly' ? '$79' : '$759'}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {billingCycle === 'monthly' ? ' / month' : ' / year'}
                  </span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-zinc-300 font-medium border-t border-slate-100 dark:border-zinc-800 pt-4">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Unlimited Virtual Simulation Cash</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Level 2 Depth of Market (DOM)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Algorithmic Backtesting Suite</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Priority REST/WebSocket Finnhub API</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Dedicated Institutional Account Manager</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => {
                  setSelectedUpgradePlan('Institutional Elite');
                  setIsUpgradeModalOpen(true);
                }}
                disabled={currentPlanName === 'Institutional Elite'}
                className="w-full mt-6 py-2.5 bg-slate-900 dark:bg-zinc-800 text-white font-semibold text-xs uppercase tracking-wider hover:bg-slate-800 dark:hover:bg-zinc-700 disabled:opacity-50 border border-slate-700 dark:border-zinc-700"
              >
                {currentPlanName === 'Institutional Elite' ? 'Current Plan' : 'Upgrade to Elite'}
              </button>
            </div>
          </div>

          {/* Payment Method & Invoices Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Method */}
            <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 p-6 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600 dark:text-[#3B82F6]" />
                Payment Method
              </h4>

              <div className="p-4 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-7 bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] uppercase">
                    VISA
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Visa ending in 4242</p>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500">Expires 12/28 • Default</p>
                  </div>
                </div>
                <button
                  onClick={() => alert('Payment method updated!')}
                  className="text-xs text-blue-600 dark:text-[#3B82F6] font-semibold uppercase tracking-wider hover:underline"
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Billing Invoices */}
            <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 p-6 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                Recent Invoices
              </h4>

              <div className="space-y-2 text-xs">
                {[
                  { id: 'INV-2025-0814', date: 'Aug 14, 2025', amt: '$29.00', status: 'Paid' },
                  { id: 'INV-2025-0714', date: 'Jul 14, 2025', amt: '$29.00', status: 'Paid' },
                ].map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-zinc-800/60 last:border-none">
                    <div>
                      <p className="font-mono font-bold text-slate-800 dark:text-zinc-200">{inv.id}</p>
                      <p className="text-[10px] text-slate-400 dark:text-zinc-500">{inv.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{inv.amt}</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. SECURITY TAB                                          */}
      {/* ======================================================== */}
      {activeTab === 'Security' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Two-Factor Authentication (2FA) */}
          <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 ${
                  is2FAEnabled ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                }`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Two-Factor Authentication (2FA)
                    </h4>
                    <span className={`px-2 py-0.2 text-[10px] font-bold uppercase tracking-wider ${
                      is2FAEnabled
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    }`}>
                      {is2FAEnabled ? 'Protected' : 'Recommended'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                    Add an additional layer of biometric or authenticator app protection when signing in to your trading station.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (is2FAEnabled) {
                    setIs2FAEnabled(false);
                    setActionNotice('2FA disabled.');
                  } else {
                    setIs2FAModalOpen(true);
                  }
                }}
                className={`px-4 py-2 font-semibold text-xs uppercase tracking-wider transition-all ${
                  is2FAEnabled
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA Protection'}
              </button>
            </div>
          </div>

          {/* Change Password & Security Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Change Password Form */}
            <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 p-6 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600 dark:text-[#3B82F6]" />
                Change Password
              </h4>

              {passwordNotice && (
                <div className="p-3 bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-500/20">
                  {passwordNotice}
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 px-3.5 py-2 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                    New Password
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showSecurityPassword ? 'text' : 'password'}
                      required
                      placeholder="Create a strong password"
                      value={newSecurityPassword}
                      onChange={(e) => setNewSecurityPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 px-3.5 py-2 pr-10 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecurityPassword(!showSecurityPassword)}
                      className="p-1 text-slate-400 hover:text-slate-200 absolute right-3"
                    >
                      {showSecurityPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Strength Bar */}
                  {newSecurityPassword && (
                    <div className="mt-2 space-y-1">
                      <div className="h-1 w-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className={`h-full ${strength.color} transition-all`}
                          style={{ width: `${strength.score}%` }}
                        />
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${strength.color}`}>
                        Strength: {strength.label}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter new password"
                    value={confirmSecurityPassword}
                    onChange={(e) => setConfirmSecurityPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 px-3.5 py-2 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 dark:bg-[#3B82F6] hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-semibold text-xs uppercase tracking-wider transition-colors mt-2"
                >
                  Update & Encrypt Password
                </button>
              </form>
            </div>

            {/* Active Sessions & Devices */}
            <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-emerald-500" />
                  Active Device Sessions
                </h4>
                <button
                  onClick={() => {
                    setActiveSessions(prev => prev.filter(s => s.isCurrent));
                    setActionNotice('Logged out of all other remote devices.');
                  }}
                  className="text-[11px] font-semibold uppercase tracking-wider text-rose-500 hover:underline"
                >
                  Log Out Others
                </button>
              </div>

              <div className="space-y-3">
                {activeSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500/10 text-blue-600 dark:text-[#3B82F6] flex items-center justify-center">
                        {session.type === 'desktop' ? <Laptop className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{session.device}</p>
                          {session.isCurrent && (
                            <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 mt-0.5">
                          {session.ip} • {session.location} • {session.status}
                        </p>
                      </div>
                    </div>

                    {!session.isCurrent && (
                      <button
                        onClick={() => handleRevokeSession(session.id)}
                        className="text-[11px] font-semibold uppercase tracking-wider text-rose-500 hover:underline"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                <span>Database Encryption: SHA-256 Salted</span>
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Protected
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODALS                                                   */}
      {/* ======================================================== */}

      {/* Stock Market Avatar Picker Modal */}
      <Modal
        isOpen={isAvatarPickerModalOpen}
        onClose={() => setIsAvatarPickerModalOpen(false)}
        title="Choose Stock Market Trader Avatar"
      >
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Select a specialized stock market persona for your trading workstation:
          </p>

          {/* Gender Filter Tabs */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
            {[
              { key: 'all', label: 'All Avatars (8)' },
              { key: 'male', label: 'Men Traders (4)' },
              { key: 'female', label: 'Women Traders (4)' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setAvatarGenderFilter(tab.key as any)}
                className={`flex-1 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                  avatarGenderFilter === tab.key
                    ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-[#3B82F6] border border-slate-200 dark:border-zinc-700'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Avatar Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
            {filteredAvatars.map((avatar) => {
              const isSelected = tempSelectedAvatar === avatar.avatarSvg;
              return (
                <div
                  key={avatar.id}
                  onClick={() => setTempSelectedAvatar(avatar.avatarSvg)}
                  className={`p-3 border transition-all cursor-pointer flex flex-col items-center text-center relative ${
                    isSelected
                      ? 'border-blue-600 dark:border-[#3B82F6] bg-blue-50/50 dark:bg-[#3B82F6]/10'
                      : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-blue-600 dark:bg-[#3B82F6] text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}

                  {/* Avatar SVG Preview */}
                  <div className="w-16 h-16 overflow-hidden my-1 border border-slate-200 dark:border-zinc-700">
                    <img
                      src={avatar.avatarSvg}
                      alt={avatar.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h5 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">
                    {avatar.name}
                  </h5>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    {avatar.role}
                  </p>

                  <span className="mt-2 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-white dark:bg-[#18181B] text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                    {avatar.badge}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setIsAvatarPickerModalOpen(false)}
              className="flex-1 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyMarketAvatar}
              disabled={!tempSelectedAvatar}
              className="flex-1 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-blue-600 dark:bg-[#3B82F6] hover:bg-blue-700 dark:hover:bg-blue-500 disabled:opacity-50"
            >
              Apply Avatar
            </button>
          </div>
        </div>
      </Modal>

      {/* 2FA Setup Modal */}
      <Modal
        isOpen={is2FAModalOpen}
        onClose={() => setIs2FAModalOpen(false)}
        title="Set Up Two-Factor Authentication"
      >
        <form onSubmit={handleVerify2FA} className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Scan this QR code with your Authenticator app (Google Authenticator, Microsoft Authenticator, or Authy):
          </p>

          <div className="w-40 h-40 mx-auto bg-white p-3 border border-slate-200 dark:border-zinc-700 flex flex-col items-center justify-center text-slate-900">
            <QrCode className="w-28 h-28" />
            <span className="text-[9px] font-mono font-bold tracking-widest mt-1">NX-8834-A79B</span>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1 text-center">
              Enter 6-Digit Authenticator Code
            </label>
            <input
              type="text"
              maxLength={6}
              required
              placeholder="e.g. 123456"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 py-2.5 text-center text-xl font-mono font-bold tracking-widest text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs uppercase tracking-wider transition-colors"
          >
            Verify & Activate 2FA
          </button>
        </form>
      </Modal>

      {/* Plan Upgrade Modal */}
      <Modal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        title={`Upgrade to ${selectedUpgradePlan}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Confirm your subscription change to <strong className="text-slate-900 dark:text-white">{selectedUpgradePlan}</strong>:
          </p>

          <div className="p-4 bg-blue-500/10 border border-blue-500/20 space-y-2">
            <div className="flex justify-between text-xs font-bold text-blue-900 dark:text-blue-300">
              <span>{selectedUpgradePlan} ({billingCycle})</span>
              <span className="font-mono">{billingCycle === 'monthly' ? '$79/month' : '$759/year'}</span>
            </div>
            <p className="text-[11px] text-blue-700 dark:text-blue-400">
              Includes unlimited simulation funds, institutional DOM Level 2, and dedicated API capacity.
            </p>
          </div>

          <button
            onClick={handleConfirmPlanUpgrade}
            className="w-full py-2.5 bg-blue-600 dark:bg-[#3B82F6] hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-semibold text-xs uppercase tracking-wider transition-colors"
          >
            Confirm & Upgrade Subscription
          </button>
        </div>
      </Modal>

      {/* Deposit Modal */}
      <Modal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        title="Deposit Virtual Funds"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Select or enter the amount of virtual USD to add to your paper trading balance:
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[5000, 10000, 25000].map((amt) => (
              <button
                key={amt}
                onClick={() => setDepositAmount(amt)}
                className={`py-2 text-xs font-mono font-bold border transition-all ${
                  depositAmount === amt
                    ? 'border-emerald-600 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300'
                }`}
              >
                +${amt.toLocaleString()}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
              Custom Amount ($)
            </label>
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 px-4 py-2 font-mono text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleDeposit}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs uppercase tracking-wider transition-colors"
          >
            Confirm Deposit
          </button>
        </div>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        title="Withdraw Virtual Funds"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
              Amount to Withdraw ($)
            </label>
            <input
              type="number"
              max={buyingPower}
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 px-4 py-2 font-mono text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
            <p className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 mt-1">Available: ${buyingPower.toLocaleString()}</p>
          </div>

          <button
            onClick={handleWithdraw}
            className="w-full py-2.5 bg-blue-600 dark:bg-[#3B82F6] hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-semibold text-xs uppercase tracking-wider transition-colors"
          >
            Confirm Withdrawal
          </button>
        </div>
      </Modal>

      {/* Reset Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset Paper Trading Account"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="text-xs font-semibold">
              Warning: Resetting your account will clear all current holdings, orders, and reset virtual equity to $50,000.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsResetModalOpen(false)}
              className="flex-1 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500"
            >
              Yes, Reset
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        title="Edit Profile"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 px-4 py-2 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 px-4 py-2 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 dark:bg-[#3B82F6] hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-semibold text-xs uppercase tracking-wider transition-colors"
          >
            Save Profile
          </button>
        </form>
      </Modal>
    </div>
  );
};
