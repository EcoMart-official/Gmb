import React from 'react';
import { Menu, LogOut, CheckCircle2 } from 'lucide-react';
import { CustomerUser, GoogleBusinessAccount } from '../../types';
import { DashboardTab } from './DashboardNav';

interface DashboardHeaderProps {
  user: CustomerUser;
  googleAccount?: GoogleBusinessAccount;
  businessName: string;
  businessLogo?: string;
  activeTab?: DashboardTab;
  onToggleSidebar: () => void;
  onLogout: () => void;
  onNavigateToSettings?: () => void;
}

const TAB_TITLES: Record<DashboardTab, string> = {
  overview: 'Home & Overview',
  business_settings: 'Business Profile',
  review_links: 'Review Link & QR',
  review_replies: 'AI Review',
  docs: 'AI API',
};

export function DashboardHeader({
  user,
  businessName,
  businessLogo,
  activeTab = 'overview',
  onToggleSidebar,
  onLogout,
  onNavigateToSettings,
}: DashboardHeaderProps) {
  const currentTabName = TAB_TITLES[activeTab] || 'Dashboard';

  return (
    <header className="bg-white border-b border-[#dadce0] sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Left: 3-line Menu Hamburger Icon & Brand */}
          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
            {/* 3-line Menu Hamburger Icon Button */}
            <button
              type="button"
              onClick={onToggleSidebar}
              className="p-2 -ml-1 text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4] active:bg-[#e8f0fe] rounded-full transition-colors cursor-pointer shrink-0"
              aria-label="Open navigation menu"
              title="Menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Google Business Profile 4-color canopy icon */}
            <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white border border-[#dadce0] shadow-2xs shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 10V19C4 19.5523 4.44772 20 5 20H19C19.5523 20 20 19.5523 20 19V10" stroke="#1A73E8" strokeWidth="2" strokeLinecap="round"/>
                <path d="M2 7L4.5 4H19.5L22 7L20 10H4L2 7Z" fill="#1A73E8"/>
                <path d="M7 10C7 11.1046 6.10457 12 5 12C3.89543 12 3 11.1046 3 10" stroke="#EA4335" strokeWidth="2"/>
                <path d="M11 10C11 11.1046 10.1046 12 9 12C7.89543 12 7 11.1046 7 10" stroke="#FBBC04" strokeWidth="2"/>
                <path d="M15 10C15 11.1046 14.1046 12 13 12C11.8954 12 11 11.1046 11 10" stroke="#34A853" strokeWidth="2"/>
                <path d="M19 10C19 11.1046 18.1046 12 17 12C15.8954 12 15 11.1046 15 10" stroke="#1A73E8" strokeWidth="2"/>
                <path d="M9 20V14H15V20" stroke="#1A73E8" strokeWidth="2"/>
              </svg>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-semibold text-sm sm:text-base text-[#202124] tracking-tight truncate">
                  Google Business Profile
                </span>
                <span className="hidden md:inline-flex text-[11px] font-medium text-[#1a73e8] bg-[#e8f0fe] px-2 py-0.5 rounded-full border border-[#d2e3fc] shrink-0">
                  {currentTabName}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#5f6368] truncate max-w-[140px] xs:max-w-[190px] sm:max-w-xs md:max-w-md">
                {businessName || 'Review Automation & Replies'}
              </p>
            </div>
          </div>

          {/* Right: Status Pill & Account Menu */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {onNavigateToSettings && (
              <button
                type="button"
                onClick={onNavigateToSettings}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors bg-[#E6F4EA] border-[#CEEAD6] text-[#137333] hover:bg-[#CEEAD6] cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1E8E3E]" />
                <span>Review Link Configured</span>
              </button>
            )}

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-[#dadce0]">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-semibold text-[#202124] leading-tight truncate max-w-[120px]">
                  {user.fullName}
                </div>
                <div className="text-[11px] text-[#5f6368] truncate max-w-[130px]">
                  {user.email}
                </div>
              </div>

              {/* Business Profile Logo or Fallback User Initial Circle */}
              {businessLogo ? (
                <div
                  title={`${businessName || user.fullName} (${user.email})`}
                  onClick={onNavigateToSettings}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-[#dadce0] overflow-hidden shadow-2xs select-none shrink-0 cursor-pointer flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                  <img
                    src={businessLogo}
                    alt={businessName || user.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div
                  title={`${user.fullName} (${user.email})`}
                  onClick={onNavigateToSettings}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1A73E8] text-white flex items-center justify-center font-semibold text-xs sm:text-sm shadow-2xs select-none shrink-0 cursor-pointer"
                >
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
              )}

              <button
                onClick={onLogout}
                title="Sign out of account"
                className="p-1.5 sm:p-2 text-[#5f6368] hover:text-[#d93025] hover:bg-[#f1f3f4] rounded-full transition-colors cursor-pointer shrink-0"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
