import React from 'react';
import {
  LayoutDashboard,
  Sliders,
  QrCode,
} from 'lucide-react';

export type DashboardTab =
  | 'overview'
  | 'business_settings'
  | 'review_links';

interface DashboardNavProps {
  activeTab: DashboardTab;
  onChangeTab: (tab: DashboardTab) => void;
  pendingReviewsCount?: number;
}

export function DashboardNav({
  activeTab,
  onChangeTab,
}: DashboardNavProps) {
  const tabs = [
    {
      id: 'overview' as DashboardTab,
      label: 'Home & Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'business_settings' as DashboardTab,
      label: 'Business Profile',
      icon: Sliders,
    },
    {
      id: 'review_links' as DashboardTab,
      label: 'Review Link & QR',
      icon: QrCode,
    },
  ];

  return (
    <div className="bg-white border-b border-[#dadce0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className={`flex items-center gap-2 py-3.5 px-3 sm:px-4 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#1a73e8] text-[#1a73e8]'
                    : 'border-transparent text-[#5f6368] hover:text-[#202124] hover:border-[#dadce0]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#1a73e8]' : 'text-[#5f6368]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
