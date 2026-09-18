import React from 'react';
import { useApp } from '../context/AppContext';
import { CivicPulseLogo } from './CivicPulseLogo';
import {
  User,
  HardHat,
  LayoutGrid,
  Bell,
  Settings,
  Globe,
} from 'lucide-react';
import type { UserRole } from '../types/multiRole';

export const RoleNavigationBar: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    unreadNotificationCount,
    isNotificationsOpen,
    setIsNotificationsOpen,
    setIsSettingsOpen,
    language,
    setLanguage,
    userProfile,
  } = useApp();

  const roles: { id: UserRole; label: string; icon: any }[] = [
    {
      id: 'citizen',
      label: language === 'hi' ? 'नागरिक पोर्टल' : 'Citizen Portal',
      icon: User,
    },
    {
      id: 'commander',
      label: language === 'hi' ? 'कमांड सेंटर' : 'Command Center',
      icon: LayoutGrid,
    },
    {
      id: 'field-worker',
      label: language === 'hi' ? 'फील्ड ऑप्स' : 'Field Operations',
      icon: HardHat,
    },
  ];

  return (
    <header className="w-full bg-[#090E16] border-b border-[#1E293B] px-4 sm:px-6 flex items-center justify-between z-40 select-none shrink-0 h-13">
      {/* ── Left: CivicPulse Branding ── */}
      <div className="flex items-center gap-3">
        <CivicPulseLogo size={28} />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white tracking-wider">
              CIVICPULSE
            </span>
            <span className="text-[11px] text-[#93A1B2]">
              Delhi NCR
            </span>
          </div>
          <span className="text-[10px] text-[#637184] -mt-0.5">
            Municipal Intelligence Platform
          </span>
        </div>
      </div>

      {/* ── Center: Role Navigation Switcher ── */}
      <nav className="flex items-center h-full gap-1">
        {roles.map((r) => {
          const Icon = r.icon;
          const isActive = currentRole === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setCurrentRole(r.id)}
              className={`h-full px-4 text-xs font-medium transition-all cursor-pointer flex items-center gap-2 relative ${
                isActive
                  ? 'text-white bg-[#131D2A] border-b-2 border-[#1597D4]'
                  : 'text-[#93A1B2] hover:text-white hover:bg-[#131D2A]/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#1597D4]' : 'text-[#637184]'}`} />
              <span>{r.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Right: Telemetry Status & System Controls ── */}
      <div className="flex items-center gap-3">
        {/* Live Operational Status */}
        <div className="hidden lg:flex items-center gap-2 mr-1">
          <span className="w-2 h-2 rounded-full bg-[#27A878] inline-block" />
          <div className="text-left">
            <div className="text-[11px] text-[#E8EDF3] font-medium leading-tight">System Operational</div>
            <div className="text-[9px] text-[#637184] leading-tight">Last updated 2 min ago</div>
          </div>
        </div>

        {/* Language selector */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          className="px-2.5 py-1.5 rounded bg-[#111A24] hover:bg-[#151F2A] text-[#93A1B2] hover:text-white border border-[#263342] text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          title="Toggle Language"
        >
          <Globe className="w-3.5 h-3.5 text-[#637184]" />
          <span>{language === 'en' ? 'EN' : 'HI'}</span>
        </button>

        {/* Notifications */}
        <button
          onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          className={`relative p-1.5 rounded bg-[#111A24] hover:bg-[#151F2A] border transition-colors cursor-pointer ${
            isNotificationsOpen
              ? 'border-[#1597D4] text-[#1597D4]'
              : 'border-[#263342] text-[#93A1B2] hover:text-white'
          }`}
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-3.5 h-3.5 px-0.5 rounded-full bg-[#D65A5A] text-white text-[9px] font-mono font-bold flex items-center justify-center">
              {unreadNotificationCount}
            </span>
          )}
        </button>

        {/* Settings */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-1.5 rounded bg-[#111A24] hover:bg-[#151F2A] text-[#93A1B2] hover:text-white border border-[#263342] transition-colors cursor-pointer"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User profile */}
        <div className="hidden md:flex items-center gap-2 pl-2 border-l border-[#263342]">
          <div className="w-6 h-6 rounded bg-[#1597D4]/20 text-[#1597D4] border border-[#1597D4]/40 flex items-center justify-center font-bold text-xs">
            {userProfile.name.charAt(0)}
          </div>
          <div className="text-left leading-none">
            <div className="font-medium text-white text-[11px]">{userProfile.name}</div>
            <div className="text-[10px] text-[#637184] mt-0.5">{userProfile.ward.split('—')[0]}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
