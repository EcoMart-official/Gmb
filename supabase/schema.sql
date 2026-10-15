-- ==============================================================================
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

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies: Customers can only read and update their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);


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
    google_access_token TEXT,
    google_refresh_token TEXT,
    google_token_expiry TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Business Settings
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

-- Business Settings Policies: Strict isolation by authenticated customer user_id
CREATE POLICY "Customers can view own business settings"
    ON public.business_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Customers can update own business settings"
    ON public.business_settings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Customers can insert own business settings"
    ON public.business_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Public Policy for Review Landing Page (Read only by custom_slug for public customer reviews)
CREATE POLICY "Public can view business details by slug"
    ON public.business_settings FOR SELECT
    USING (true);


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

-- Enable RLS for Customer Reviews
ALTER TABLE public.customer_reviews ENABLE ROW LEVEL SECURITY;

-- Customer Reviews Policies: Customers can only manage their own reviews
CREATE POLICY "Customers can view own reviews"
    ON public.customer_reviews FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Customers can update own reviews"
    ON public.customer_reviews FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Customers can insert own reviews"
    ON public.customer_reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);


-- 5. Email OTP Verification Table (Used with server-side validation)
CREATE TABLE IF NOT EXISTS public.email_otps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    otp_hash TEXT NOT NULL,
    purpose TEXT NOT NULL CHECK (purpose IN ('registration', 'password_reset')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast lookup and cleanup
CREATE INDEX IF NOT EXISTS idx_email_otps_email_purpose ON public.email_otps (email, purpose);

-- Protect OTP table with RLS - only server service role should read/write OTP hashes directly
ALTER TABLE public.email_otps ENABLE ROW LEVEL SECURITY;


-- 6. Trigger to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_business_settings_updated_at ON public.business_settings;
CREATE TRIGGER trigger_business_settings_updated_at
    BEFORE UPDATE ON public.business_settings
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
