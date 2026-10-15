import React from 'react';
import { LogOut, CheckCircle2, AlertTriangle, ExternalLink, MapPin } from 'lucide-react';
import { CustomerUser, GoogleBusinessAccount } from '../../types';

interface DashboardHeaderProps {
  user: CustomerUser;
  googleAccount?: GoogleBusinessAccount;
  businessName: string;
  onLogout: () => void;
  onNavigateToSettings?: () => void;
}

export function DashboardHeader({
  user,
  businessName,
  onLogout,
  onNavigateToSettings,
}: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-[#dadce0] sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand & Google Business Icon */}
          <div className="flex items-center gap-3.5">
            {/* Google Business Profile 4-color canopy icon */}
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-[#dadce0] shadow-xs">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Google Store Canopy Icon */}
                <path d="M4 10V19C4 19.5523 4.44772 20 5 20H19C19.5523 20 20 19.5523 20 19V10" stroke="#1A73E8" strokeWidth="2" strokeLinecap="round"/>
                <path d="M2 7L4.5 4H19.5L22 7L20 10H4L2 7Z" fill="#1A73E8"/>
                <path d="M7 10C7 11.1046 6.10457 12 5 12C3.89543 12 3 11.1046 3 10" stroke="#EA4335" strokeWidth="2"/>
                <path d="M11 10C11 11.1046 10.1046 12 9 12C7.89543 12 7 11.1046 7 10" stroke="#FBBC04" strokeWidth="2"/>
                <path d="M15 10C15 11.1046 14.1046 12 13 12C11.8954 12 11 11.1046 11 10" stroke="#34A853" strokeWidth="2"/>
                <path d="M19 10C19 11.1046 18.1046 12 17 12C15.8954 12 15 11.1046 15 10" stroke="#1A73E8" strokeWidth="2"/>
                <path d="M9 20V14H15V20" stroke="#1A73E8" strokeWidth="2"/>
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base sm:text-lg text-[#202124] tracking-tight">
                  Google Business Profile
                </span>
                <span className="text-[#5f6368] font-normal text-sm hidden sm:inline">
                  &bull; ReputePulse
                </span>
              </div>
              <p className="text-xs text-[#5f6368] truncate max-w-[200px] sm:max-w-md">
                {businessName || 'Review Automation & Replies'}
              </p>
            </div>
          </div>

          {/* Right: Status Pill & Account Menu */}
          <div className="flex items-center gap-3 sm:gap-4">
            {onNavigateToSettings && (
              <button
                type="button"
                onClick={onNavigateToSettings}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors bg-[#E6F4EA] border-[#CEEAD6] text-[#137333] hover:bg-[#CEEAD6] cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1E8E3E]" />
                <span>Review Link Configured</span>
              </button>
            )}

            {/* User Profile Pill */}
            <div className="flex items-center gap-3 pl-3 border-l border-[#dadce0]">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-semibold text-[#202124] leading-tight">
                  {user.fullName}
                </div>
                <div className="text-[11px] text-[#5f6368] truncate max-w-[140px]">
                  {user.email}
                </div>
              </div>

              {/* Google-style User Circle */}
              <div className="w-9 h-9 rounded-full bg-[#1A73E8] text-white flex items-center justify-center font-medium text-sm shadow-xs select-none">
                {user.fullName.charAt(0).toUpperCase()}
              </div>

              <button
                onClick={onLogout}
                title="Sign out of account"
                className="p-2 text-[#5f6368] hover:text-[#d93025] hover:bg-[#f1f3f4] rounded-full transition-colors cursor-pointer"
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
