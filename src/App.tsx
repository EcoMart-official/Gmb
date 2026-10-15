import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AuthModal } from './components/auth/AuthModal';
import { DashboardHeader } from './components/dashboard/DashboardHeader';
import { DashboardNav, DashboardTab } from './components/dashboard/DashboardNav';
import { OverviewTab } from './components/dashboard/OverviewTab';
import { BusinessSettingsTab } from './components/dashboard/BusinessSettingsTab';
import { ReviewLinkTab } from './components/dashboard/ReviewLinkTab';
import { PublicReviewPage } from './components/public/PublicReviewPage';
import { BusinessSettings, CustomerReview, GoogleBusinessAccount } from './types';
import { api } from './lib/api';
import {
  Building2,
  Sparkles,
  QrCode,
  MessageSquare,
  Lock,
  RefreshCw,
  Star,
  CheckCircle2,
} from 'lucide-react';

function CustomerPortalContent() {
  const { user, token, isLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  const [businessSettings, setBusinessSettings] = useState<BusinessSettings | null>(null);
  const [googleAccount, setGoogleAccount] = useState<GoogleBusinessAccount>({ connected: false });
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(false);

  const [previewReviewPage, setPreviewReviewPage] = useState<boolean>(false);

  const currentPath = window.location.pathname;
  const isDirectReviewRoute = currentPath.startsWith('/review/');
  const directSlug = isDirectReviewRoute ? currentPath.replace('/review/', '') : null;

  const loadCustomerData = async () => {
    if (!token) return;
    setLoadingData(true);
    try {
      const [settingsRes, googleRes, reviewsRes] = await Promise.all([
        api.getBusinessSettings(),
        api.getGoogleAccount(),
        api.getReviews(),
      ]);

      if (settingsRes.settings) {
        setBusinessSettings(settingsRes.settings);
      }
      if (googleRes.account) {
        setGoogleAccount(googleRes.account);
      }
      if (reviewsRes.reviews) {
        setReviews(reviewsRes.reviews);
      }
    } catch (err) {
      console.error('Error loading customer dashboard data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      loadCustomerData();
    }
  }, [user, token]);

  // Handle OAuth redirect or query callbacks
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('google_connected') === 'true') {
      if (token) loadCustomerData();
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [token]);

  const currentSettings: BusinessSettings = businessSettings || {
    id: user ? 'biz-' + user.id : 'biz-default',
    userId: user ? user.id : 'default-user',
    businessName: user ? `${user.fullName}'s Business` : 'My Business',
    category: 'Local Business',
    placeId: '',
    googleReviewUrl: '',
    productsAndServices: '',
    customerExperience: '',
    brandTone: 'friendly',
    targetKeywords: [],
    customSlug: user ? 'biz-' + user.id.slice(-6) : 'my-business',
    languagePreferences: [{ code: 'en', name: 'English', percentage: 100 }],
    autoReplyEnabled: false,
    autoReplyMode: 'approval',
    minStarRating: 4,
    responseDelayMinutes: 5,
    updatedAt: new Date().toISOString(),
  };

  if (directSlug) {
    return <PublicReviewPage slug={directSlug} />;
  }

  if (previewReviewPage) {
    return (
      <PublicReviewPage
        slug={currentSettings.customSlug}
        onBackToDashboard={() => setPreviewReviewPage(false)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#1a73e8] animate-spin mx-auto" />
          <p className="text-sm font-medium text-[#5f6368]">
            Loading customer portal...
          </p>
        </div>
      </div>
    );
  }

  // Unauthenticated: Google-styled Clean White Login & Value Proposition
  if (!user || !token) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
        {/* Top Header */}
        <header className="max-w-7xl mx-auto w-full flex items-center justify-between pb-6 sm:pb-8 border-b border-[#dadce0]">
          <div className="flex items-center gap-3">
            {/* Google Store Canopy Icon */}
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-[#dadce0] shadow-2xs">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
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
              <div className="font-bold text-lg text-[#202124] tracking-tight">
                Google Business Profile Manager
              </div>
              <div className="text-[11px] font-medium text-[#5f6368]">
                Review Automation & AI Replies by ReputePulse
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#5f6368]">
            <Lock className="w-3.5 h-3.5 text-[#137333]" />
            <span>Customer Isolated Session &bull; Row Level Security</span>
          </div>
        </header>

        {/* Hero & Authentication Form */}
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto py-8">
          {/* Left Column: Google-styled value proposition */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8f0fe] text-[#1a73e8] text-xs font-semibold border border-[#d2e3fc]">
              <Sparkles className="w-3.5 h-3.5 text-[#1a73e8]" />
              <span>Google Business Profile Review Automation</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#202124] tracking-tight leading-tight">
              Grow Your Business with{' '}
              <span className="text-[#1a73e8]">
                5-Star Google Reviews
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#5f6368] max-w-xl leading-relaxed">
              Create unique review landing pages and counter QR stands. Our integrated Gemini 3.8 Flash engine crafts authentic multilingual review drafts in seconds and automatically posts owner replies on Google Maps.
            </p>

            {/* Feature Cards in Google White Aesthetic */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-lg mx-auto lg:mx-0 pt-2 text-left">
              <div className="p-4 bg-white rounded-xl border border-[#dadce0] shadow-2xs flex items-start gap-3">
                <Building2 className="w-5 h-5 text-[#1a73e8] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-[#202124]">
                    Official Google OAuth
                  </h3>
                  <p className="text-[11px] text-[#5f6368] mt-0.5">
                    Connect verified Google Business locations via OAuth 2.0.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-[#dadce0] shadow-2xs flex items-start gap-3">
                <QrCode className="w-5 h-5 text-[#1a73e8] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-[#202124]">
                    Custom QR Stands
                  </h3>
                  <p className="text-[11px] text-[#5f6368] mt-0.5">
                    Printable table tent cards and high-res QR codes.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-[#dadce0] shadow-2xs flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#f9ab00] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-[#202124]">
                    Gemini 3.8 Flash AI
                  </h3>
                  <p className="text-[11px] text-[#5f6368] mt-0.5">
                    Multilingual organic drafts matched to your business offerings.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-[#dadce0] shadow-2xs flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-[#137333] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-[#202124]">
                    Automated Owner Replies
                  </h3>
                  <p className="text-[11px] text-[#5f6368] mt-0.5">
                    Auto-respond to reviews or approve AI drafts before publishing.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Customer Auth Form with Email OTP */}
          <div className="lg:col-span-5 flex justify-center">
            <AuthModal />
          </div>
        </div>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto w-full pt-6 text-center text-xs text-[#5f6368] border-t border-[#dadce0]">
          Google Business Profile Review Automation &bull; ReputePulse &bull; Customer Portal
        </footer>
      </div>
    );
  }

  const pendingCount = reviews.filter((r) => r.replyStatus === 'pending').length;

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-between">
      <div>
        <DashboardHeader
          user={user}
          googleAccount={googleAccount}
          businessName={currentSettings.businessName}
          onLogout={logout}
          onNavigateToSettings={() => setActiveTab('business_settings')}
        />

        <DashboardNav
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          pendingReviewsCount={pendingCount}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {activeTab === 'overview' && (
            <OverviewTab
              settings={currentSettings}
              googleAccount={googleAccount}
              reviews={reviews}
              onChangeTab={setActiveTab}
              onOpenPublicPage={() => setPreviewReviewPage(true)}
            />
          )}

          {activeTab === 'business_settings' && (
            <BusinessSettingsTab
              settings={currentSettings}
              onUpdateSettings={(newSettings) => setBusinessSettings(newSettings)}
            />
          )}

          {activeTab === 'review_links' && (
            <ReviewLinkTab
              settings={currentSettings}
              onOpenPublicPage={() => setPreviewReviewPage(true)}
              onUpdateSlug={(newSlug) => {
                setBusinessSettings((prev) => (prev ? { ...prev, customSlug: newSlug } : null));
              }}
            />
          )}
        </main>
      </div>

      <footer className="bg-white border-t border-[#dadce0] py-4 text-center text-xs text-[#5f6368]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Google Business Profile Management &bull; Customer Data Isolation Active (RLS)
          </span>
          <span className="font-mono text-[11px] text-[#5f6368]">
            Customer: {user.email}
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CustomerPortalContent />
      </AuthProvider>
    </ToastProvider>
  );
}
