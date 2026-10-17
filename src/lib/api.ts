import {
  AuthResponse,
  CustomerUser,
  BusinessSettings,
  GoogleBusinessAccount,
  CustomerReview,
} from '../types';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('rankora_token') || localStorage.getItem('reputepulse_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Auth
  async register(data: {
    fullName: string;
    businessName: string;
    email: string;
    mobileNumber: string;
    password: string;
    confirmPassword: string;
  }) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async verifyOtp(data: { email: string; otpCode: string; purpose: 'registration' | 'password_reset' }) {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async resendOtp(data: { email: string; purpose: string }) {
    const res = await fetch('/api/auth/resend-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async login(data: { email: string; password: string }): Promise<{ success?: boolean; token?: string; user?: CustomerUser; error?: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async forgotPassword(email: string) {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  async resetPassword(data: { email: string; otpCode: string; newPassword: string; confirmPassword: string }) {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getMe(): Promise<{ user?: CustomerUser; error?: string }> {
    const res = await fetch('/api/auth/me', {
      headers: { ...getAuthHeader() },
    });
    return res.json();
  },

  // Business Settings
  async getBusinessSettings(): Promise<{ settings: BusinessSettings }> {
    const res = await fetch('/api/business/settings', {
      headers: { ...getAuthHeader() },
    });
    return res.json();
  },

  async updateBusinessSettings(
    settings: Partial<BusinessSettings> & { fullName?: string; mobileNumber?: string }
  ): Promise<{ success: boolean; settings: BusinessSettings; user?: CustomerUser; error?: string; message?: string }> {
    const res = await fetch('/api/business/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(settings),
    });
    return res.json();
  },

  // Gemini API Key Management
  async getGeminiApiKey(): Promise<{ configured: boolean; maskedKey?: string; key?: string }> {
    const res = await fetch('/api/settings/gemini-key', {
      headers: { ...getAuthHeader() },
    });
    return res.json();
  },

  async saveGeminiApiKey(apiKey: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const res = await fetch('/api/settings/gemini-key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ apiKey }),
    });
    return res.json();
  },

  async testGeminiApiKey(apiKey?: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const res = await fetch('/api/settings/gemini-key/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ apiKey }),
    });
    return res.json();
  },

  // Google Profile
  async getGoogleAccount(): Promise<{ account: GoogleBusinessAccount }> {
    const res = await fetch('/api/business/google', {
      headers: { ...getAuthHeader() },
    });
    return res.json();
  },

  async getGoogleAuthUrl(origin?: string): Promise<{ configured: boolean; url?: string; message?: string; redirectUri?: string; clientId?: string }> {
    const query = origin ? `?origin=${encodeURIComponent(origin)}` : '';
    const res = await fetch(`/api/auth/google/url${query}`, {
      headers: { ...getAuthHeader() },
    });
    return res.json();
  },

  async simulateGoogleConnect(data: {
    locationName?: string;
    address?: string;
    placeId?: string;
    rating?: number;
    reviewCount?: number;
  }): Promise<{ success: boolean; account: GoogleBusinessAccount }> {
    const res = await fetch('/api/business/google/simulate-connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async disconnectGoogle(): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/business/google/disconnect', {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    return res.json();
  },

  // Reviews
  async getReviews(): Promise<{ reviews: CustomerReview[] }> {
    const res = await fetch('/api/reviews', {
      headers: { ...getAuthHeader() },
    });
    return res.json();
  },

  async generateReply(data: { authorName: string; starRating: number; reviewText: string; tone?: string }): Promise<{ success: boolean; reply: string; error?: string }> {
    const res = await fetch('/api/reviews/generate-reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async submitReply(reviewId: string, replyText: string, action: 'publish' | 'draft'): Promise<{ success: boolean; review: CustomerReview }> {
    const res = await fetch(`/api/reviews/${reviewId}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ replyText, action }),
    });
    return res.json();
  },

  async testIncomingReview(data: { authorName?: string; starRating?: number; reviewText?: string }): Promise<{ success: boolean; message: string; review: CustomerReview }> {
    const res = await fetch('/api/reviews/test-incoming', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // QR Code
  async getQrCode(url: string, color?: string): Promise<{ qrDataUrl: string }> {
    const params = new URLSearchParams({ url });
    if (color) params.append('color', color);
    const res = await fetch(`/api/qr/code?${params.toString()}`);
    return res.json();
  },

  // Public Landing Page API
  async getPublicBusiness(slug: string) {
    const res = await fetch(`/api/business/public/${encodeURIComponent(slug)}`);
    return res.json();
  },

  async generateDraft(data: {
    slug?: string;
    businessName?: string;
    category?: string;
    starRating: number;
    highlightChips: string[];
    language?: string;
  }): Promise<{ success: boolean; draft: string; error?: string }> {
    const res = await fetch('/api/reviews/generate-draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
