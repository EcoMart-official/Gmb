import React from 'react';
import {
  Star,
  MessageSquare,
  Sparkles,
  QrCode,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { BusinessSettings, CustomerReview, GoogleBusinessAccount } from '../../types';
import { DashboardTab } from './DashboardNav';

interface OverviewTabProps {
  settings: BusinessSettings;
  googleAccount: GoogleBusinessAccount;
  reviews: CustomerReview[];
  onChangeTab: (tab: DashboardTab) => void;
  onOpenPublicPage: () => void;
}

export function OverviewTab({
  settings,
  googleAccount,
  reviews,
  onChangeTab,
  onOpenPublicPage,
}: OverviewTabProps) {
  const totalReviews = googleAccount.connected ? googleAccount.reviewCount || reviews.length : reviews.length;
  const avgRating = googleAccount.connected ? googleAccount.rating || 4.9 : 4.8;
  const automatedReplies = reviews.filter((r) => r.autoReplied || r.replyStatus === 'published').length;
  const pendingReplies = reviews.filter((r) => r.replyStatus === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Google Business Profile Welcome Card */}
      <div className="bg-white border border-[#dadce0] rounded-xl p-6 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#1a73e8] uppercase tracking-wider">
                Google Review Booster
              </span>
              <span className="text-[#dadce0]">&bull;</span>
              <span className="text-xs text-[#5f6368]">
                {settings.googleReviewUrl ? 'Review URL Linked' : 'Configuration Ready'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#202124] tracking-tight">
              {settings.businessName || 'Your Business Location'}
            </h1>

            <p className="text-sm text-[#5f6368] leading-relaxed">
              Automate customer review generation with in-store QR code stands and direct customers seamlessly to your Google Review submission page.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={onOpenPublicPage}
                className="px-4 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium rounded-md text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Open Review Landing Page</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onChangeTab('review_links')}
                className="px-4 py-2.5 bg-white hover:bg-[#f8f9fa] border border-[#dadce0] text-[#1a73e8] font-medium rounded-md text-xs sm:text-sm transition-colors flex items-center gap-2 cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-[#1a73e8]" />
                <span>Download QR Table Tent</span>
              </button>
            </div>
          </div>

          {/* Quick Rating Badge */}
          <div className="flex flex-col items-center justify-center p-5 bg-[#f8f9fa] border border-[#dadce0] rounded-xl text-center min-w-[180px] shrink-0">
            <div className="text-4xl font-extrabold text-[#202124]">
              {avgRating.toFixed(1)}
            </div>
            <div className="flex text-[#f9ab00] my-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="text-xs text-[#5f6368] font-medium">
              Google Maps Rating
            </span>
            <span className="text-[11px] text-[#1a73e8] mt-1 font-semibold">
              {totalReviews} verified reviews
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Star Rating */}
        <div className="bg-white border border-[#dadce0] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#5f6368]">
            <span>Average Score</span>
            <div className="w-8 h-8 rounded-full bg-[#fef7e0] text-[#b06000] flex items-center justify-center">
              <Star className="w-4 h-4 fill-current" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#202124] tracking-tight">
              {avgRating.toFixed(1)} / 5.0
            </span>
          </div>
          <p className="mt-1 text-xs text-[#5f6368]">
            Target store rating
          </p>
        </div>

        {/* Metric 2: Total Reviews */}
        <div className="bg-white border border-[#dadce0] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#5f6368]">
            <span>Total Reviews</span>
            <div className="w-8 h-8 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#202124] tracking-tight">
              {totalReviews}
            </span>
            <span className="text-xs text-[#137333] font-medium">+18 this month</span>
          </div>
          <p className="mt-1 text-xs text-[#5f6368]">Google review count</p>
        </div>

        {/* Metric 3: Google Review Submission URL */}
        <div className="bg-white border border-[#dadce0] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#5f6368]">
            <span>Google Review Link</span>
            <div className="w-8 h-8 rounded-full bg-[#e6f4ea] text-[#137333] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-base font-bold text-[#202124] tracking-tight truncate">
              {settings.googleReviewUrl ? 'Link Configured' : 'Needs Setup'}
            </span>
          </div>
          <p className="mt-1 text-xs text-[#5f6368] truncate">
            {settings.googleReviewUrl ? 'Redirect destination ready' : 'Configure in Business Profile'}
          </p>
        </div>

        {/* Metric 4: QR Review Stand */}
        <div className="bg-white border border-[#dadce0] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#5f6368]">
            <span>Review QR Status</span>
            <div className="w-8 h-8 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold text-[#1a73e8] tracking-tight">
              Active
            </span>
            <span className="text-xs text-[#137333] font-medium">Ready</span>
          </div>
          <p className="mt-1 text-xs text-[#5f6368]">Counter stands & sticker ready</p>
        </div>
      </div>

      {/* Action Cards & Architecture Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#202124]">
              Business Configuration & Review Setup
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div
              onClick={() => onChangeTab('business_settings')}
              className="p-4 bg-white border border-[#dadce0] rounded-xl hover:border-[#1a73e8] hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-lg bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                {settings.googleReviewUrl ? (
                  <span className="text-[11px] font-medium text-[#137333] bg-[#e6f4ea] px-2 py-0.5 rounded-full border border-[#ceead6]">
                    Configured
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-[#b06000] bg-[#fef7e0] px-2 py-0.5 rounded-full border border-[#feefc3]">
                    Action Needed
                  </span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-[#202124] group-hover:text-[#1a73e8]">
                Google Review Submission Link
              </h3>
              <p className="text-xs text-[#5f6368] mt-1">
                {settings.googleReviewUrl
                  ? 'Your direct Google review destination is active.'
                  : 'Enter your Google review link or Place ID.'}
              </p>
            </div>

            <div
              onClick={() => onChangeTab('review_links')}
              className="p-4 bg-white border border-[#dadce0] rounded-xl hover:border-[#1a73e8] hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-lg bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium text-[#137333] bg-[#e6f4ea] px-2 py-0.5 rounded-full border border-[#ceead6]">
                  Ready
                </span>
              </div>
              <h3 className="text-sm font-semibold text-[#202124] group-hover:text-[#1a73e8]">
                Review Landing Page & QR
              </h3>
              <p className="text-xs text-[#5f6368] mt-1">
                Unique slug: <code className="text-[#1a73e8] font-mono">/review/{settings.customSlug}</code>
              </p>
            </div>

            <div
              onClick={() => onChangeTab('business_settings')}
              className="p-4 bg-white border border-[#dadce0] rounded-xl hover:border-[#1a73e8] hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-lg bg-[#fef7e0] text-[#b06000] flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium text-[#1a73e8] bg-[#e8f0fe] px-2 py-0.5 rounded-full border border-[#d2e3fc]">
                  Tone: {settings.brandTone}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-[#202124] group-hover:text-[#1a73e8]">
                Business Context & Offerings
              </h3>
              <p className="text-xs text-[#5f6368] mt-1">
                Define products, atmosphere, and keywords for customer review guidance.
              </p>
            </div>

            <div
              onClick={onOpenPublicPage}
              className="p-4 bg-white border border-[#dadce0] rounded-xl hover:border-[#1a73e8] hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-lg bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium text-[#1a73e8] bg-[#e8f0fe] px-2 py-0.5 rounded-full border border-[#d2e3fc]">
                  Live Page
                </span>
              </div>
              <h3 className="text-sm font-semibold text-[#202124] group-hover:text-[#1a73e8]">
                Customer Review Experience
              </h3>
              <p className="text-xs text-[#5f6368] mt-1">
                Preview the interactive 5-star review draft page that your customers see.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Security & Data Isolation Notice */}
        <div className="bg-white border border-[#dadce0] rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-[#202124] font-bold text-sm mb-2.5">
              <ShieldCheck className="w-4 h-4 text-[#137333]" />
              <span>Customer Data Isolation</span>
            </div>
            <p className="text-xs text-[#5f6368] leading-relaxed mb-4">
              Your account is isolated using PostgreSQL Row Level Security (RLS). Only your authenticated session can access your business settings, private OAuth tokens, and review response logs.
            </p>

            <ul className="space-y-2.5 text-xs text-[#3c4043]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#137333] shrink-0" />
                <span>Strict Customer-Only Access (No Admin)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#137333] shrink-0" />
                <span>Encrypted Hashed Password & Single-Use OTPs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#137333] shrink-0" />
                <span>Server-Side Google OAuth Token Management</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#137333] shrink-0" />
                <span>Gemini 3.8 Flash Server Proxy (No Key Exposure)</span>
              </li>
            </ul>
          </div>

          <div className="mt-5 pt-4 border-t border-[#dadce0] text-[11px] text-[#5f6368] flex items-center justify-between">
            <span>RANKORA SaaS</span>
            <span className="text-[#137333] font-semibold">Active & Operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}
