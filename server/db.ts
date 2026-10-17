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
    businessName?: string;
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

    // Initialize business settings for new user with separate businessName
    const chosenBusinessName = (userData.businessName || '').trim() || `${newUser.fullName}'s Business`;
    const baseSlug = chosenBusinessName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    const slug = (baseSlug || 'store') + '-' + id.slice(-4);

    this.businessSettings.set(id, {
      id: 'biz-' + id,
      userId: id,
      businessName: chosenBusinessName,
      businessLogo: '',
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

  public updateUserProfile(
    userId: string,
    data: { fullName?: string; mobileNumber?: string }
  ): UserRecord | undefined {
    const user = this.users.get(userId);
    if (!user) return undefined;
    if (data.fullName && typeof data.fullName === 'string' && data.fullName.trim()) {
      user.fullName = data.fullName.trim();
    }
    if (data.mobileNumber && typeof data.mobileNumber === 'string' && data.mobileNumber.trim()) {
      user.mobileNumber = data.mobileNumber.trim();
    }
    this.users.set(userId, user);
    this.saveToDisk();
    return user;
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
