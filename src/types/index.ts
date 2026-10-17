export interface CustomerUser {
  id: string;
  email: string;
  fullName: string;
  mobileNumber: string;
  isVerified: boolean;
  createdAt: string;
}

export interface GoogleBusinessAccount {
  connected: boolean;
  accountId?: string;
  accountName?: string;
  locationId?: string;
  locationName?: string;
  placeId?: string;
  address?: string;
  rating?: number;
  reviewCount?: number;
  connectedAt?: string;
}

export interface LanguagePreference {
  code: string;
  name: string;
  percentage: number;
}

export interface BusinessSettings {
  id: string;
  userId: string;
  businessName: string;
  businessLogo?: string;
  category: string;
  placeId: string;
  googleReviewUrl: string;
  productsAndServices: string;
  services?: string[];
  shopAiDetails?: string;
  customerExperience: string;
  brandTone: 'friendly' | 'professional' | 'enthusiastic' | 'humble' | 'luxurious';
  targetKeywords: string[];
  customSlug: string;
  languagePreferences: LanguagePreference[];
  autoReplyEnabled: boolean;
  autoReplyMode: 'automatic' | 'approval';
  minStarRating: number;
  responseDelayMinutes: number;
  geminiApiKey?: string;
  reviewWritingRules?: string;
  reviewStyleAndRules?: string;
  updatedAt: string;
}

export interface CustomerReview {
  id: string;
  userId: string;
  authorName: string;
  authorPhoto?: string;
  starRating: number;
  reviewText: string;
  reviewDate: string;
  replyText?: string;
  replyStatus: 'pending' | 'drafted' | 'published';
  replyDate?: string;
  autoReplied: boolean;
  aiGeneratedTone?: string;
}

export interface OtpRecord {
  email: string;
  otpHash: string;
  purpose: 'registration' | 'password_reset';
  expiresAt: number;
  attempts: number;
  verified: boolean;
  pendingUserData?: {
    fullName: string;
    businessName?: string;
    mobileNumber: string;
    passwordHash: string;
  };
}

export interface AuthResponse {
  token: string;
  user: CustomerUser;
}

export type AuthMode = 'login' | 'register' | 'otp_verify' | 'forgot_password' | 'reset_password';
