import crypto from 'crypto';
import { CustomerUser, BusinessSettings, CustomerReview, OtpRecord, GoogleBusinessAccount } from '../src/types/index';

// Helper to hash passwords using pbkdf2
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, combinedHash: string): boolean {
  const [salt, originalHash] = combinedHash.split(':');
  if (!salt || !originalHash) return false;
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}

// Simple secure JWT implementation using HMAC SHA256
const JWT_SECRET = process.env.JWT_SECRET || 'repute-pulse-secure-secret-key-99218274';

export function createToken(payload: { userId: string; email: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(
    JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 })
  ).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');
    if (signature !== expectedSig) return null;
    const decoded = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return { userId: decoded.userId, email: decoded.email };
  } catch {
    return null;
  }
}

// In-Memory persistent data store (can be synced with Supabase when keys provided)
interface UserRecord extends CustomerUser {
  passwordHash: string;
}

import fs from 'fs';
import path from 'path';

const STORAGE_FILE = path.resolve('server/storage.json');

class DatabaseStore {
  private users: Map<string, UserRecord> = new Map();
  private otps: Map<string, OtpRecord> = new Map();
  private businessSettings: Map<string, BusinessSettings> = new Map();
  private googleAccounts: Map<string, GoogleBusinessAccount> = new Map();
  private reviews: Map<string, CustomerReview[]> = new Map();

  constructor() {
    this.seedDemoCustomer();
    this.loadFromDisk();
  }

  private saveToDisk() {
    try {
      const data = {
        users: Array.from(this.users.entries()),
        otps: Array.from(this.otps.entries()),
        businessSettings: Array.from(this.businessSettings.entries()),
        googleAccounts: Array.from(this.googleAccounts.entries()),
        reviews: Array.from(this.reviews.entries()),
      };
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database to disk:', err);
    }
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(STORAGE_FILE)) {
        const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (data.users) this.users = new Map(data.users);
        if (data.otps) this.otps = new Map(data.otps);
        if (data.businessSettings) this.businessSettings = new Map(data.businessSettings);
        if (data.googleAccounts) this.googleAccounts = new Map(data.googleAccounts);
        if (data.reviews) this.reviews = new Map(data.reviews);
      }
    } catch (err) {
      console.error('Failed to load database from disk:', err);
    }
  }

  private seedDemoCustomer() {
    const demoUserId = 'demo-user-101';
    const demoEmail = 'demo@business.com';
    const pwdHash = hashPassword('DemoPass123!');

    this.users.set(demoUserId, {
      id: demoUserId,
      email: demoEmail,
      fullName: 'Sarah Jenkins',
      mobileNumber: '+1 (555) 234-5678',
      isVerified: true,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      passwordHash: pwdHash,
    });

    const slug = 'artisan-bakery-co';
    this.businessSettings.set(demoUserId, {
      id: 'biz-' + demoUserId,
      userId: demoUserId,
      businessName: 'The Artisan Bakery & Cafe',
      category: 'Bakery & Espresso Bar',
      placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
      googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
      productsAndServices: 'Handcrafted sourdough breads, French pastries, seasonal pies, specialty espresso drinks, artisanal sandwiches, gluten-friendly treats.',
      customerExperience: 'Cozy rustic ambiance, friendly baristas, freshly baked goods right out of the stone oven every morning, fast checkout, clean seating.',
      brandTone: 'friendly',
      targetKeywords: ['sourdough', 'pastries', 'fresh espresso', 'cozy atmosphere', 'best bakery'],
      customSlug: slug,
      languagePreferences: [
        { code: 'en', name: 'English', percentage: 70 },
        { code: 'es', name: 'Spanish', percentage: 20 },
        { code: 'fr', name: 'French', percentage: 10 },
      ],
      autoReplyEnabled: true,
      autoReplyMode: 'approval',
      minStarRating: 4,
      responseDelayMinutes: 5,
      updatedAt: new Date().toISOString(),
    });

    this.googleAccounts.set(demoUserId, {
      connected: true,
      accountId: 'accounts/1094829104921',
      accountName: 'Sarah Jenkins (Owner)',
      locationId: 'locations/8827361920',
      locationName: 'The Artisan Bakery & Cafe - Main Street',
      placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
      address: '742 Evergreen Terrace, Springfield, OR',
      rating: 4.9,
      reviewCount: 142,
      connectedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    });

    const demoReviews: CustomerReview[] = [
      {
        id: 'rev-01',
        userId: demoUserId,
        authorName: 'Michael Chang',
        authorPhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces',
        starRating: 5,
        reviewText: 'Hands down the best sourdough and almond croissants in town! The staff is always so welcoming and cheerful in the mornings. You have to try their vanilla bean latte.',
        reviewDate: new Date(Date.now() - 2 * 86400000).toISOString(),
        replyText: 'Thank you so much Michael! We are thrilled to hear you enjoyed our almond croissants and vanilla bean latte. The morning crew loves serving you and cannot wait to welcome you back!',
        replyStatus: 'published',
        replyDate: new Date(Date.now() - 1 * 86400000).toISOString(),
        autoReplied: true,
        aiGeneratedTone: 'friendly',
      },
      {
        id: 'rev-02',
        userId: demoUserId,
        authorName: 'Elena Rostova',
        authorPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
        starRating: 5,
        reviewText: 'Ordered a custom birthday tart for our family gathering. The presentation was stunning and the flavor was out of this world! Worth every penny.',
        reviewDate: new Date(Date.now() - 4 * 86400000).toISOString(),
        replyText: 'Dear Elena, we are so delighted our custom tart was part of your special family celebration! Crafting delicious moments is what keeps our passion burning. See you again soon!',
        replyStatus: 'drafted',
        replyDate: undefined,
        autoReplied: false,
        aiGeneratedTone: 'friendly',
      },
      {
        id: 'rev-03',
        userId: demoUserId,
        authorName: 'David Miller',
        starRating: 4,
        reviewText: 'Great coffee and delicious cinnamon rolls. The line was a bit long on Saturday morning, but the team handled the crowd quickly and efficiently.',
        reviewDate: new Date(Date.now() - 6 * 86400000).toISOString(),
        replyText: '',
        replyStatus: 'pending',
        replyDate: undefined,
        autoReplied: false,
      },
    ];

    this.reviews.set(demoUserId, demoReviews);
  }

  // User management
  public findUserByEmail(email: string): UserRecord | undefined {
    const normalized = email.toLowerCase().trim();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === normalized) {
        return user;
      }
    }
    return undefined;
  }

  public findUserById(id: string): UserRecord | undefined {
    return this.users.get(id);
  }

  public createUser(userData: {
    email: string;
    fullName: string;
    mobileNumber: string;
    passwordHash: string;
    isVerified?: boolean;
  }): UserRecord {
    const id = 'usr_' + crypto.randomUUID();
    const newUser: UserRecord = {
      id,
      email: userData.email.toLowerCase().trim(),
      fullName: userData.fullName.trim(),
      mobileNumber: userData.mobileNumber.trim(),
      passwordHash: userData.passwordHash,
      isVerified: userData.isVerified ?? true,
      createdAt: new Date().toISOString(),
    };
    this.users.set(id, newUser);

    // Initialize blank business settings for new user
    const slug = newUser.fullName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + id.slice(-4);
    this.businessSettings.set(id, {
      id: 'biz-' + id,
      userId: id,
      businessName: `${newUser.fullName}'s Business`,
      category: 'Local Service & Retail',
      placeId: '',
      googleReviewUrl: '',
      productsAndServices: '',
      customerExperience: '',
      brandTone: 'friendly',
      targetKeywords: [],
      customSlug: slug,
      languagePreferences: [{ code: 'en', name: 'English', percentage: 100 }],
      autoReplyEnabled: false,
      autoReplyMode: 'approval',
      minStarRating: 4,
      responseDelayMinutes: 5,
      updatedAt: new Date().toISOString(),
    });

    this.googleAccounts.set(id, { connected: false });
    this.reviews.set(id, []);
    this.saveToDisk();

    return newUser;
  }

  public updateUserPassword(userId: string, newPasswordHash: string): boolean {
    const user = this.users.get(userId);
    if (!user) return false;
    user.passwordHash = newPasswordHash;
    this.users.set(userId, user);
    this.saveToDisk();
    return true;
  }

  // OTP management
  public saveOtp(record: OtpRecord): void {
    this.otps.set(record.email.toLowerCase().trim(), record);
    this.saveToDisk();
  }

  public getOtp(email: string): OtpRecord | undefined {
    return this.otps.get(email.toLowerCase().trim());
  }

  public deleteOtp(email: string): void {
    this.otps.delete(email.toLowerCase().trim());
    this.saveToDisk();
  }

  // Business settings
  public getBusinessSettings(userId: string): BusinessSettings {
    let settings = this.businessSettings.get(userId);
    if (!settings) {
      settings = {
        id: 'biz-' + userId,
        userId,
        businessName: 'My Business',
        category: 'Services',
        placeId: '',
        googleReviewUrl: '',
        productsAndServices: '',
        customerExperience: '',
        brandTone: 'friendly',
        targetKeywords: [],
        customSlug: 'store-' + userId.slice(-6),
        languagePreferences: [{ code: 'en', name: 'English', percentage: 100 }],
        autoReplyEnabled: false,
        autoReplyMode: 'approval',
        minStarRating: 4,
        responseDelayMinutes: 5,
        updatedAt: new Date().toISOString(),
      };
      this.businessSettings.set(userId, settings);
    }

    // Guard against missing or undefined customSlug
    if (!settings.customSlug || settings.customSlug === 'undefined') {
      const baseName = settings.businessName
        ? settings.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-')
        : 'store';
      settings.customSlug = baseName || 'arventa-ventures';
      this.businessSettings.set(userId, settings);
      this.saveToDisk();
    }

    return settings;
  }

  public findBusinessBySlug(slug: string): BusinessSettings | undefined {
    const rawTarget = String(slug || '').toLowerCase().trim();

    // Fallback if client requests 'undefined', empty, or 'default'
    if (!rawTarget || rawTarget === 'undefined' || rawTarget === 'null') {
      const all = Array.from(this.businessSettings.values());
      return all[all.length - 1];
    }

    for (const settings of this.businessSettings.values()) {
      if (settings.customSlug && settings.customSlug.toLowerCase() === rawTarget) {
        return settings;
      }
    }

    // Try finding by business name slug or userId
    for (const settings of this.businessSettings.values()) {
      if (settings.businessName) {
        const nameSlug = settings.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        if (nameSlug === rawTarget || nameSlug.includes(rawTarget)) {
          return settings;
        }
      }
      if (settings.userId && settings.userId.toLowerCase().includes(rawTarget)) {
        return settings;
      }
    }

    return undefined;
  }

  public updateBusinessSettings(userId: string, updates: Partial<BusinessSettings>): BusinessSettings {
    const existing = this.getBusinessSettings(userId);
    
    // Clean updates to never overwrite existing fields with undefined
    const cleanUpdates: Partial<BusinessSettings> = {};
    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) {
        (cleanUpdates as any)[key] = val;
      }
    }

    const updated = {
      ...existing,
      ...cleanUpdates,
      customSlug: cleanUpdates.customSlug || existing.customSlug || 'arventa-ventures',
      updatedAt: new Date().toISOString(),
    };
    this.businessSettings.set(userId, updated);
    this.saveToDisk();
    return updated;
  }

  // Google account
  public getGoogleAccount(userId: string): GoogleBusinessAccount {
    return this.googleAccounts.get(userId) || { connected: false };
  }

  public updateGoogleAccount(userId: string, account: GoogleBusinessAccount): void {
    this.googleAccounts.set(userId, account);
    this.saveToDisk();
  }

  // Reviews
  public getReviews(userId: string): CustomerReview[] {
    return this.reviews.get(userId) || [];
  }

  public addReview(userId: string, review: Omit<CustomerReview, 'id' | 'userId'>): CustomerReview {
    const list = this.getReviews(userId);
    const newRev: CustomerReview = {
      id: 'rev_' + crypto.randomUUID(),
      userId,
      ...review,
    };
    list.unshift(newRev);
    this.reviews.set(userId, list);
    this.saveToDisk();
    return newRev;
  }

  public updateReview(userId: string, reviewId: string, updates: Partial<CustomerReview>): CustomerReview | null {
    const list = this.getReviews(userId);
    const index = list.findIndex((r) => r.id === reviewId);
    if (index === -1) return null;
    list[index] = { ...list[index], ...updates };
    this.reviews.set(userId, list);
    this.saveToDisk();
    return list[index];
  }
}

export const db = new DatabaseStore();
