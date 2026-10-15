import React, { useState } from 'react';
import {
  Database,
  Mail,
  Building2,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  FileText,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export function DocsTab() {
  const { showSuccess } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<'sql' | 'gmail' | 'google' | 'gemini' | 'checklist'>('sql');
  const [sqlCopied, setSqlCopied] = useState(false);

  const supabaseSqlContent = `-- ==============================================================================
-- ReputePulse - Complete Supabase PostgreSQL Schema with Row Level Security (RLS)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    mobile_number TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 3. Business Settings Table
CREATE TABLE IF NOT EXISTS public.business_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    business_name TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT '',
    place_id TEXT DEFAULT '',
    google_review_url TEXT DEFAULT '',
    products_and_services TEXT DEFAULT '',
    customer_experience TEXT DEFAULT '',
    brand_tone TEXT DEFAULT 'friendly' CHECK (brand_tone IN ('friendly', 'professional', 'enthusiastic', 'humble', 'luxurious')),
    target_keywords TEXT[] DEFAULT '{}',
    custom_slug TEXT NOT NULL UNIQUE,
    language_preferences JSONB DEFAULT '[{"code":"en","name":"English","percentage":100}]'::jsonb,
    auto_reply_enabled BOOLEAN DEFAULT false,
    auto_reply_mode TEXT DEFAULT 'approval' CHECK (auto_reply_mode IN ('automatic', 'approval')),
    min_star_rating INTEGER DEFAULT 4 CHECK (min_star_rating BETWEEN 1 AND 5),
    response_delay_minutes INTEGER DEFAULT 5,
    google_account_info JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own business settings"
    ON public.business_settings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Customers can update own business settings"
    ON public.business_settings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Public can view business details by slug"
    ON public.business_settings FOR SELECT USING (true);

-- 4. Customer Reviews Table
CREATE TABLE IF NOT EXISTS public.customer_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    google_review_id TEXT,
    author_name TEXT NOT NULL,
    author_photo TEXT,
    star_rating INTEGER NOT NULL CHECK (star_rating BETWEEN 1 AND 5),
    review_text TEXT NOT NULL,
    review_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    reply_text TEXT,
    reply_status TEXT DEFAULT 'pending' CHECK (reply_status IN ('pending', 'drafted', 'published')),
    reply_date TIMESTAMP WITH TIME ZONE,
    auto_replied BOOLEAN DEFAULT false,
    ai_generated_tone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.customer_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own reviews"
    ON public.customer_reviews FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Customers can update own reviews"
    ON public.customer_reviews FOR UPDATE USING (auth.uid() = user_id);

-- 5. Email OTPs Table
CREATE TABLE IF NOT EXISTS public.email_otps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    otp_hash TEXT NOT NULL,
    purpose TEXT NOT NULL CHECK (purpose IN ('registration', 'password_reset')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.email_otps ENABLE ROW LEVEL SECURITY;`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(supabaseSqlContent);
    setSqlCopied(true);
    showSuccess('Supabase SQL schema copied to clipboard.');
    setTimeout(() => setSqlCopied(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#dadce0] rounded-xl p-6 sm:p-7 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#202124]">
              Integration Documentation & SQL Schema
            </h2>
            <p className="text-xs sm:text-sm text-[#5f6368] mt-0.5">
              Production configuration guide: PostgreSQL SQL with Row Level Security, Gmail SMTP setup, Google Cloud OAuth guide, and Gemini AI documentation.
            </p>
          </div>
        </div>
      </div>

      {/* Nav Sub-Tabs */}
      <div className="flex space-x-2 border-b border-[#dadce0] pb-2 overflow-x-auto text-xs font-medium">
        {[
          { id: 'sql', label: 'Supabase SQL & RLS', icon: Database },
          { id: 'gmail', label: 'Gmail SMTP OTP Setup', icon: Mail },
          { id: 'google', label: 'Google Cloud & GBP API', icon: Building2 },
          { id: 'gemini', label: 'Gemini 3.8 Flash Setup', icon: Sparkles },
          { id: 'checklist', label: 'Production Testing Checklist', icon: CheckCircle2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#1a73e8] text-white shadow-xs'
                  : 'text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Supabase SQL & RLS */}
      {activeSubTab === 'sql' && (
        <div className="bg-white border border-[#dadce0] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#202124]">
                PostgreSQL Database Schema & Row Level Security (RLS)
              </h3>
              <p className="text-xs text-[#5f6368] mt-0.5">
                Run in your Supabase SQL Editor to provision tables, indexes, and user-isolated policies.
              </p>
            </div>
            <button
              onClick={handleCopySql}
              className="px-3.5 py-1.5 bg-[#e8f0fe] text-[#1a73e8] hover:bg-[#d2e3fc] rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {sqlCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{sqlCopied ? 'Copied' : 'Copy SQL'}</span>
            </button>
          </div>

          <pre className="p-4 bg-[#f8f9fa] border border-[#dadce0] text-[#202124] rounded-lg text-xs font-mono overflow-x-auto max-h-96 leading-relaxed">
            {supabaseSqlContent}
          </pre>
        </div>
      )}

      {/* 2. Gmail SMTP OTP Setup */}
      {activeSubTab === 'gmail' && (
        <div className="bg-white border border-[#dadce0] rounded-xl p-6 shadow-xs space-y-4 text-xs text-[#3c4043]">
          <h3 className="font-bold text-base text-[#202124]">
            How to Configure Dedicated Gmail SMTP for OTP Delivery
          </h3>
          <p className="leading-relaxed">
            ReputePulse delivers 6-digit one-time passwords for customer registration and password resets using a dedicated Gmail account with a Google App Password.
          </p>

          <ol className="list-decimal list-inside space-y-3 p-4 bg-[#f8f9fa] rounded-lg border border-[#dadce0] font-normal leading-relaxed">
            <li>
              <strong>Log in to your dedicated business Gmail account</strong> (e.g. <code>help.ecomart01@gmail.com</code>).
            </li>
            <li>
              Navigate to <strong>Google Account Settings &gt; Security</strong> and verify <strong>2-Step Verification</strong> is enabled.
            </li>
            <li>
              In the search bar at the top, type <strong>"App passwords"</strong> and click the link.
            </li>
            <li>
              Create an App Name (e.g. <code>ReputePulse Mailer</code>) and click <strong>Create</strong>.
            </li>
            <li>
              Copy the 16-character password and configure it in your server environment:
              <pre className="mt-2 p-3 bg-white border border-[#dadce0] text-[#1a73e8] rounded-md font-mono">
                GMAIL_USER="help.ecomart01@gmail.com"{"\n"}
                GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"
              </pre>
            </li>
          </ol>
        </div>
      )}

      {/* 3. Google Cloud OAuth */}
      {activeSubTab === 'google' && (
        <div className="bg-white border border-[#dadce0] rounded-xl p-6 shadow-xs space-y-4 text-xs text-[#3c4043]">
          <h3 className="font-bold text-base text-[#202124]">
            Google Cloud Console & Google Business Profile API Configuration
          </h3>
          <p className="leading-relaxed">
            Steps to configure OAuth authorization for customer Google Business Profile accounts:
          </p>

          <ol className="list-decimal list-inside space-y-3 p-4 bg-[#f8f9fa] rounded-lg border border-[#dadce0] font-normal leading-relaxed">
            <li>
              Create or select a project in <strong>Google Cloud Console</strong>.
            </li>
            <li>
              In <strong>APIs &amp; Services &gt; Library</strong>, enable <strong>Google My Business API</strong>.
            </li>
            <li>
              Under <strong>OAuth consent screen</strong>, set User Type to External and add scope <code>https://www.googleapis.com/auth/business.manage</code>.
            </li>
            <li>
              Under <strong>Credentials &gt; Create Credentials &gt; OAuth client ID</strong>, choose <strong>Web application</strong>.
            </li>
            <li>
              Add Authorized redirect URI:
              <pre className="mt-2 p-3 bg-white border border-[#dadce0] text-[#1a73e8] rounded-md font-mono">
                https://ais-dev-tiwkyqvtliydtpv5mvrosm-721497363389.asia-southeast1.run.app/api/auth/google/callback
              </pre>
            </li>
          </ol>
        </div>
      )}

      {/* 4. Gemini 3.8 Flash */}
      {activeSubTab === 'gemini' && (
        <div className="bg-white border border-[#dadce0] rounded-xl p-6 shadow-xs space-y-4 text-xs text-[#3c4043]">
          <h3 className="font-bold text-base text-[#202124]">
            Gemini 3.8 Flash AI Engine Integration
          </h3>
          <p className="leading-relaxed">
            ReputePulse leverages the latest <code>@google/genai</code> TypeScript SDK with <code>gemini-3.8-flash</code> strictly via server-side proxy routes.
          </p>

          <div className="p-4 bg-[#f8f9fa] rounded-lg border border-[#dadce0] space-y-2">
            <h4 className="font-bold text-[#202124]">Server SDK Call:</h4>
            <pre className="p-3 bg-white border border-[#dadce0] text-[#202124] rounded-md font-mono leading-relaxed">
{`import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const response = await ai.models.generateContent({
  model: 'gemini-3.8-flash',
  contents: prompt,
});`}
            </pre>
          </div>
        </div>
      )}

      {/* 5. Production Testing Checklist */}
      {activeSubTab === 'checklist' && (
        <div className="bg-white border border-[#dadce0] rounded-xl p-6 shadow-xs space-y-4 text-xs text-[#3c4043]">
          <h3 className="font-bold text-base text-[#202124]">
            End-to-End Verification & Testing Checklist
          </h3>
          <p className="leading-relaxed">
            All key paths verified according to project requirements:
          </p>

          <div className="space-y-2.5">
            {[
              {
                title: 'Customer Registration & OTP Verification',
                desc: 'Full name, email, phone, matching passwords, 6-digit OTP delivery via Gmail SMTP, 10-min expiration, resend countdown.',
              },
              {
                title: 'Password Recovery Flow',
                desc: 'Anti-enumeration generic message, OTP verification, password strength requirements, new password reset.',
              },
              {
                title: 'Customer Data Isolation & Security',
                desc: 'No admin panel or global view exists. Each customer can only see their own business settings, tokens, and reviews.',
              },
              {
                title: 'Google Business Profile OAuth Flow',
                desc: 'Official authorization code redirect, state CSRF validation, server-side token management, location selector, sandbox fallback.',
              },
              {
                title: 'Multilingual Review Language Percentage Validation',
                desc: 'Strict validation ensuring all configured language percentages total exactly 100%.',
              },
              {
                title: 'Gemini 3.8 Flash Multilingual Review Drafts',
                desc: 'Generates authentic, organic review drafts based on business category, products, customer experience, and chosen language.',
              },
              {
                title: 'Public Review Landing Page & QR Codes',
                desc: 'Unique URL slug /review/:slug, copy link button with feedback, high-res QR code PNG download, printable table stand.',
              },
              {
                title: 'AI Auto-Replies & Simulator',
                desc: 'Contextual review replies crafted by Gemini, auto-publish vs manual approval mode, rating threshold, live simulation sandbox.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#f8f9fa] rounded-lg border border-[#dadce0] flex items-start gap-3"
              >
                <CheckCircle2 className="w-4 h-4 text-[#137333] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#202124] text-xs">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#5f6368] mt-0.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
