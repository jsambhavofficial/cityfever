import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEMO_CITIZEN, DEMO_OFFICER } from '../data/authDemoData';
import {
  User,
  Shield,
  Smartphone,
  Lock,
  ArrowRight,
  Sparkles,
  Award,
  Radio,
  CheckCircle2,
  X,
  Building2,
} from 'lucide-react';

const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    loginAsCitizen,
    loginAsOfficer,
    loginCustom,
    currentUser,
    language,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'citizen' | 'officer'>('citizen');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Custom Citizen form state
  const [citizenPhone, setCitizenPhone] = useState('+91 98101 44321');
  const [citizenName, setCitizenName] = useState('Rahul Sharma');
  const [citizenOtp, setCitizenOtp] = useState('4209');

  // Custom Officer form state
  const [officerBadge, setOfficerBadge] = useState('DL-MCD-CMD-0984');
  const [officerName, setOfficerName] = useState('Inspector Vikram Malhotra');
  const [officerPin, setOfficerPin] = useState('••••');

  if (!isAuthModalOpen && currentUser) {
    return null;
  }

  const handleCitizenGoogleLogin = () => {
    setIsGoogleLoading(true);
    setTimeout(() => {
      setIsGoogleLoading(false);
      loginCustom({
        id: `CITIZEN-GGL-${Date.now().toString().slice(-4)}`,
        role: 'citizen',
        name: 'Rahul Sharma (Google)',
        email: 'rahul.sharma.delhi@gmail.com',
        phone: '+91 98101 44321',
        ward: 'Ward 14 — Rohini North',
        badge: 'Google Verified Citizen ✓',
        karmaPoints: 490,
        avatar: 'G',
      });
      showToast('Signed in successfully with Google (rahul.sharma.delhi@gmail.com)');
    }, 450);
  };

  const handleOfficerGoogleLogin = () => {
    setIsGoogleLoading(true);
    setTimeout(() => {
      setIsGoogleLoading(false);
      loginCustom({
        id: 'OFFICER-GGL-8840',
        role: 'officer',
        name: 'Insp. Vikram Malhotra (Govt SSO)',
        email: 'vikram.malhotra@delhigov.in',
        phone: '+91 11 2341 8899',
        designation: 'Field Incident Commander',
        department: 'Disaster & Civic Response MCD',
        badgeId: 'DL-GOV-GGL-8840',
        badge: 'Google Workspace Govt SSO • L4',
        clearanceLevel: 4,
        avatar: 'V',
      });
      showToast('Govt Google Workspace SSO Verified (vikram.malhotra@delhigov.in)');
    }, 450);
  };

  const handleCitizenCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginCustom({
      id: `CITIZEN-${Date.now().toString().slice(-4)}`,
      role: 'citizen',
      name: citizenName || 'Verified Citizen',
      email: `${citizenName.toLowerCase().replace(/\s+/g, '.')}@delhi.gov.in`,
      phone: citizenPhone,
      ward: 'Ward 14 — Rohini North',
      badge: 'Active Civic Contributor',
      karmaPoints: 340,
      avatar: citizenName.charAt(0) || 'C',
    });
  };

  const handleOfficerCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginCustom({
      id: `OFFICER-${officerBadge.slice(-4)}`,
      role: 'officer',
      name: officerName || 'Municipal Officer',
      email: `${officerName.toLowerCase().replace(/\s+/g, '.')}@mcd.delhigov.in`,
      phone: '+91 11 2341 8899',
      designation: 'Field Incident Commander',
      department: 'Disaster & Civic Response MCD',
      badgeId: officerBadge,
      badge: 'Municipal Authority • Level 4 Clearance',
      clearanceLevel: 4,
      avatar: officerName.charAt(0) || 'O',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05090F]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#0B131E] border border-[#1E293B] rounded-xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#111A24] via-[#0E1620] to-[#111A24] border-b border-[#263342] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1597D4]/15 border border-[#1597D4]/30 flex items-center justify-center text-[#1597D4]">
              {activeTab === 'citizen' ? <User className="w-5 h-5" /> : <Shield className="w-5 h-5 text-[#D49A32]" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  {language === 'hi' ? 'नागरिक एवं अधिकारी लॉगिन पोर्टल' : 'CivicPulse Access Gateway'}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1597D4]/20 text-[#1597D4] border border-[#1597D4]/30">
                  Dual Auth Active
                </span>
              </div>
              <p className="text-xs text-[#93A1B2] mt-0.5">
                {language === 'hi'
                  ? 'नागरिक शिकायत दर्ज करने या नगर निगम कमांड सेंटर नियंत्रण हेतु लॉगिन करें'
                  : 'Select your role to access Citizen Grievance Portal or Commander Control Center'}
              </p>
            </div>
          </div>

          {currentUser && (
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="p-1.5 text-[#637184] hover:text-white rounded-md hover:bg-[#1E293B] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Dual Role Selector Tabs */}
        <div className="grid grid-cols-2 border-b border-[#263342] bg-[#080D14]">
          <button
            onClick={() => setActiveTab('citizen')}
            className={`py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border-b-2 ${
              activeTab === 'citizen'
                ? 'border-[#1597D4] text-[#1597D4] bg-[#111A24]'
                : 'border-transparent text-[#637184] hover:text-[#93A1B2] hover:bg-[#0E1620]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{language === 'hi' ? 'नागरिक पोर्टल' : 'Citizen Portal'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1597D4]/15 text-[#1597D4] font-mono">
              Public
            </span>
          </button>

          <button
            onClick={() => setActiveTab('officer')}
            className={`py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border-b-2 ${
              activeTab === 'officer'
                ? 'border-[#D49A32] text-[#D49A32] bg-[#111A24]'
                : 'border-transparent text-[#637184] hover:text-[#93A1B2] hover:bg-[#0E1620]'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>{language === 'hi' ? 'नगर निगम अधिकारी' : 'Municipal Officer'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#D49A32]/15 text-[#D49A32] font-mono">
              Authority L4
            </span>
          </button>
        </div>

        {/* TAB 1: CITIZEN AUTH */}
        {activeTab === 'citizen' && (
          <div className="p-5 sm:p-6 space-y-5 bg-[#0B131E]">
            {/* 1-Click Demo Citizen Login Box */}
            <div className="bg-gradient-to-r from-[#1597D4]/10 to-[#111A24] border border-[#1597D4]/40 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#1597D4]" />
                    <span>Demo Citizen Account: {DEMO_CITIZEN.name}</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#27A878]/15 text-[#27A878] font-mono">
                    340 Karma
                  </span>
                </div>
                <p className="text-[11px] text-[#93A1B2]">
                  Ward 14 (Rohini North) • Instant access to File Grievances, Gemini Vision & Live Tracking.
                </p>
              </div>
              <button
                type="button"
                onClick={loginAsCitizen}
                className="px-4 py-2 rounded-[5px] bg-[#1597D4] hover:bg-[#1282B8] text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#1597D4]/25 shrink-0"
              >
                <span>Login as Citizen (Demo)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Google Citizen Sign-in Option */}
            <button
              type="button"
              onClick={handleCitizenGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-[#F8FAFC] active:bg-[#F1F5F9] text-[#1E293B] text-xs font-semibold transition-all flex items-center justify-between gap-3 shadow-md shadow-black/40 border border-slate-200 cursor-pointer group disabled:opacity-60"
            >
              <div className="flex items-center gap-2.5">
                <GoogleIcon className="w-4 h-4 shrink-0" />
                <span className="font-semibold text-slate-800">
                  {isGoogleLoading
                    ? (language === 'hi' ? 'गूगल से कनेक्ट हो रहा है...' : 'Connecting to Google Accounts...')
                    : (language === 'hi' ? 'Google के साथ लॉगिन करें' : 'Continue with Google')}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-mono border border-blue-200">
                  Google SSO
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-900 flex items-center gap-1">
                rahul.sharma.delhi@gmail.com
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>

            <div className="flex items-center gap-3 text-xs text-[#637184] font-mono">
              <div className="flex-1 h-px bg-[#263342]"></div>
              <span>OR ENTER CITIZEN DETAILS</span>
              <div className="flex-1 h-px bg-[#263342]"></div>
            </div>

            <form onSubmit={handleCitizenCustomSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#93A1B2] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-[#080D14] border border-[#263342] rounded-[5px] pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#1597D4]"
                  />
                  <User className="w-3.5 h-3.5 text-[#637184] absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#93A1B2] mb-1">
                    Mobile Number (for OTP)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={citizenPhone}
                      onChange={(e) => setCitizenPhone(e.target.value)}
                      placeholder="+91 98101 XXXXX"
                      className="w-full bg-[#080D14] border border-[#263342] rounded-[5px] pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#1597D4]"
                    />
                    <Smartphone className="w-3.5 h-3.5 text-[#637184] absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#93A1B2] mb-1">
                    OTP Verification
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={citizenOtp}
                      onChange={(e) => setCitizenOtp(e.target.value)}
                      placeholder="4-digit OTP"
                      className="w-full bg-[#080D14] border border-[#263342] rounded-[5px] pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#1597D4] font-mono tracking-widest"
                    />
                    <Lock className="w-3.5 h-3.5 text-[#637184] absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-[5px] bg-[#151F2A] hover:bg-[#1f2c3b] text-[#1597D4] border border-[#1597D4]/40 hover:border-[#1597D4] text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-1"
              >
                <span>Verify & Enter Citizen Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: OFFICER / COMMANDER AUTH */}
        {activeTab === 'officer' && (
          <div className="p-5 sm:p-6 space-y-5 bg-[#0B131E]">
            {/* 1-Click Demo Officer Login Box */}
            <div className="bg-gradient-to-r from-[#D49A32]/10 to-[#111A24] border border-[#D49A32]/40 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#D49A32]" />
                    <span>Demo Officer: {DEMO_OFFICER.name}</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#D49A32]/20 text-[#D49A32] font-mono">
                    Clearance L4
                  </span>
                </div>
                <p className="text-[11px] text-[#93A1B2]">
                  {DEMO_OFFICER.designation} • Direct access to 3D GIS Incident Command, Live Hotspots & Field Crew Dispatch.
                </p>
              </div>
              <button
                type="button"
                onClick={loginAsOfficer}
                className="px-4 py-2 rounded-[5px] bg-[#D49A32] hover:bg-[#BA8529] text-black font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#D49A32]/25 shrink-0"
              >
                <span>Login as Commander (Demo)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Google Workspace Officer Sign-in Option */}
            <button
              type="button"
              onClick={handleOfficerGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-[#F8FAFC] active:bg-[#F1F5F9] text-[#1E293B] text-xs font-semibold transition-all flex items-center justify-between gap-3 shadow-md shadow-black/40 border border-slate-200 cursor-pointer group disabled:opacity-60"
            >
              <div className="flex items-center gap-2.5">
                <GoogleIcon className="w-4 h-4 shrink-0" />
                <span className="font-semibold text-slate-800">
                  {isGoogleLoading
                    ? (language === 'hi' ? 'Google Workspace SSO सत्यापित कर रहा है...' : 'Verifying Google Workspace SSO...')
                    : (language === 'hi' ? 'Google Workspace (Govt SSO) से लॉगिन करें' : 'Sign in with Google Workspace (Govt SSO)')}
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#D49A32] font-bold bg-[#D49A32]/15 px-1.5 py-0.5 rounded border border-[#D49A32]/30 flex items-center gap-1">
                Govt L4 Clearance
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>

            <div className="flex items-center gap-3 text-xs text-[#637184] font-mono">
              <div className="flex-1 h-px bg-[#263342]"></div>
              <span>OR ENTER OFFICER CREDENTIALS</span>
              <div className="flex-1 h-px bg-[#263342]"></div>
            </div>

            <form onSubmit={handleOfficerCustomSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#93A1B2] mb-1">
                  Officer Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    placeholder="e.g. Insp. Vikram Malhotra"
                    className="w-full bg-[#080D14] border border-[#263342] rounded-[5px] pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#D49A32]"
                  />
                  <Building2 className="w-3.5 h-3.5 text-[#637184] absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#93A1B2] mb-1">
                    Municipal Badge ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={officerBadge}
                      onChange={(e) => setOfficerBadge(e.target.value)}
                      placeholder="DL-MCD-CMD-XXXX"
                      className="w-full bg-[#080D14] border border-[#263342] rounded-[5px] pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#D49A32] font-mono"
                    />
                    <Shield className="w-3.5 h-3.5 text-[#637184] absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#93A1B2] mb-1">
                    Security Clearance PIN
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={officerPin}
                      onChange={(e) => setOfficerPin(e.target.value)}
                      placeholder="••••"
                      className="w-full bg-[#080D14] border border-[#263342] rounded-[5px] pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#D49A32] font-mono tracking-widest"
                    />
                    <Lock className="w-3.5 h-3.5 text-[#637184] absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-[5px] bg-[#151F2A] hover:bg-[#1f2c3b] text-[#D49A32] border border-[#D49A32]/40 hover:border-[#D49A32] text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-1"
              >
                <span>Authorize & Enter Incident Command</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* Footer info */}
        <div className="px-6 py-3 bg-[#080D14] border-t border-[#263342] flex items-center justify-between text-[11px] text-[#637184]">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-[#27A878] animate-pulse" />
            <span>Delhi Civic Intelligence Grid v1.0 Connected</span>
          </span>
          <span className="font-mono">Govt. of NCT Delhi / MCD</span>
        </div>
      </div>
    </div>
  );
};
