import React, { useState, useRef } from 'react';
import {
  Building2,
  User,
  Mail,
  Phone,
  Upload,
  Image as ImageIcon,
  Trash2,
  Lock,
  Save,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  MapPin,
} from 'lucide-react';
import { BusinessSettings } from '../../types';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface BusinessSettingsTabProps {
  settings: BusinessSettings;
  onUpdateSettings: (newSettings: BusinessSettings) => void;
}

const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024; // 5 Megabytes

export function BusinessSettingsTab({
  settings,
  onUpdateSettings,
}: BusinessSettingsTabProps) {
  const { user, refreshUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [saving, setSaving] = useState(false);

  // 1. Business Identity
  const [businessName, setBusinessName] = useState(settings.businessName || '');
  const [businessLogo, setBusinessLogo] = useState(settings.businessLogo || '');
  const [logoFileName, setLogoFileName] = useState('');
  const [logoFileSize, setLogoFileSize] = useState('');
  const [logoError, setLogoError] = useState('');

  // 2. Owner Details
  const [ownerFullName, setOwnerFullName] = useState(user?.fullName || '');
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || '');
  const email = user?.email || '';

  // 3. Google Maps Integration
  const [googleReviewUrl, setGoogleReviewUrl] = useState(settings.googleReviewUrl || '');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Logo File Selection with 5MB validation
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoError('');

    if (!file.type.startsWith('image/')) {
      setLogoError('Invalid file type. Please upload an image file (PNG, JPG, WebP, SVG).');
      return;
    }

    if (file.size > MAX_LOGO_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setLogoError(`The selected file is ${sizeMb} MB, which exceeds the 5 MB limit. Please select an image under 5 MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setBusinessLogo(result);
      setLogoFileName(file.name);
      setLogoFileSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');
      showSuccess(`Logo loaded (${(file.size / (1024 * 1024)).toFixed(2)} MB). Click "Save Changes" below to apply.`);
    };
    reader.onerror = () => {
      setLogoError('Failed to read the image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setBusinessLogo('');
    setLogoFileName('');
    setLogoFileSize('');
    setLogoError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLogoError('');

    if (!businessName.trim()) {
      showError('Please enter a business name.');
      return;
    }

    if (!ownerFullName.trim()) {
      showError('Please enter owner full name.');
      return;
    }

    if (!mobileNumber.trim()) {
      showError('Please enter mobile number.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.updateBusinessSettings({
        businessName: businessName.trim(),
        businessLogo: businessLogo || undefined,
        fullName: ownerFullName.trim(),
        mobileNumber: mobileNumber.trim(),
        googleReviewUrl: googleReviewUrl.trim(),
      });

      if (res.error) {
        showError(res.error);
      } else {
        showSuccess('Business profile updated successfully!');
        if (res.settings) {
          onUpdateSettings(res.settings);
        }
        await refreshUser();
      }
    } catch {
      showError('Failed to save business settings. Please check your network connection.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* SECTION 1: BUSINESS IDENTITY (Logo & Business Name) */}
      <div className="bg-white border border-[#dadce0] rounded-xl p-5 sm:p-7 shadow-xs space-y-6">
        <div className="border-b border-[#dadce0] pb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0 shadow-2xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-[#202124] tracking-tight">
                Business Identity
              </h3>
              <p className="text-xs text-[#5f6368] truncate">
                Brand name and store logo for review stands and customer landing pages.
              </p>
            </div>
          </div>
        </div>

        {/* Business Logo Upload Section */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <label className="block text-xs font-bold text-[#202124]">
                Business Logo
              </label>
              <p className="text-[11px] text-[#5f6368]">
                Displayed on your QR stand templates, table tent cards, and customer review landing page.
              </p>
            </div>
            <span className="self-start sm:self-auto inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc]">
              Max 5MB &bull; PNG, JPG, SVG
            </span>
          </div>

          <div className="p-4 sm:p-5 bg-[#f8f9fa] border border-[#dadce0] rounded-xl flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Logo Preview Square */}
            <div className="relative w-28 h-28 rounded-xl border-2 border-dashed border-[#dadce0] bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-2xs group">
              {businessLogo ? (
                <>
                  <img
                    src={businessLogo}
                    alt={businessName || 'Business Logo'}
                    className="w-full h-full object-contain p-2"
                  />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#137333] text-white shadow-2xs">
                    Active
                  </span>
                </>
              ) : (
                <div className="text-center p-3">
                  <div className="w-10 h-10 rounded-full bg-[#f1f3f4] flex items-center justify-center mx-auto mb-1 text-[#5f6368]">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-medium text-[#5f6368] block leading-tight">
                    No Logo Uploaded
                  </span>
                </div>
              )}
            </div>

            {/* Logo Upload & Management Actions */}
            <div className="flex-1 w-full space-y-3 text-center sm:text-left">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                onChange={handleLogoFileChange}
                className="hidden"
                id="business-logo-input"
              />

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <label
                  htmlFor="business-logo-input"
                  className="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium text-xs rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{businessLogo ? 'Change Logo' : 'Upload Business Logo'}</span>
                </label>

                {businessLogo && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="px-3.5 py-2 bg-white hover:bg-[#fce8e6] border border-[#dadce0] hover:border-[#f5c2c7] text-[#c5221f] text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              {logoFileName ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#e6f4ea] border border-[#ceead6] text-[11px] font-medium text-[#137333]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1e8e3e]" />
                  <span>{logoFileName} {logoFileSize && `(${logoFileSize})`}</span>
                </div>
              ) : (
                <p className="text-[11px] text-[#5f6368] leading-relaxed">
                  Recommended: Transparent PNG or high-contrast JPG, square aspect ratio (500x500px). Maximum file size is strictly 5MB.
                </p>
              )}
            </div>
          </div>

          {logoError && (
            <div className="p-3 bg-[#fce8e6] border border-[#f5c2c7] rounded-lg text-xs text-[#c5221f] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{logoError}</span>
            </div>
          )}
        </div>

        {/* Business Name Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#202124]">
            Business Name *
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-[#5f6368] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g., Arventa Ventures / EcoMart Official"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#dadce0] rounded-lg text-sm font-semibold text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] shadow-2xs"
            />
          </div>
          <p className="text-[11px] text-[#5f6368]">
            This name represents your company, store, or agency independently from the owner's personal name.
          </p>
        </div>
      </div>

      {/* SECTION 2: OWNER ACCOUNT DETAILS */}
      <div className="bg-white border border-[#dadce0] rounded-xl p-5 sm:p-7 shadow-xs space-y-5">
        <div className="border-b border-[#dadce0] pb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0 shadow-2xs">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-[#202124] tracking-tight">
              Owner Account Information
            </h3>
            <p className="text-xs text-[#5f6368]">
              Account credentials provided during registration. Email is permanent for security.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Owner Full Name */}
          <div>
            <label className="block text-xs font-semibold text-[#5f6368] mb-1.5">
              Owner Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#5f6368] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={ownerFullName}
                onChange={(e) => setOwnerFullName(e.target.value)}
                placeholder="e.g., Jaydeb Jana"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#dadce0] rounded-lg text-sm text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] shadow-2xs"
              />
            </div>
            <p className="text-[11px] text-[#5f6368] mt-1">
              Personal name of the business owner or primary administrator.
            </p>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-semibold text-[#5f6368] mb-1.5">
              Mobile Number *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#5f6368] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="e.g., +91 8001608004"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#dadce0] rounded-lg text-sm text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] shadow-2xs"
              />
            </div>
            <p className="text-[11px] text-[#5f6368] mt-1">
              Registered contact phone number for administrative alerts.
            </p>
          </div>
        </div>

        {/* Registered Email (Strictly Non-Editable / Locked) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-[#5f6368] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#5f6368]" />
              <span>Registered Email Address</span>
            </label>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#137333] bg-[#e6f4ea] px-2.5 py-0.5 rounded-full border border-[#ceead6]">
              <Lock className="w-3 h-3 text-[#1e8e3e]" />
              <span>Non-Editable (Verified)</span>
            </span>
          </div>

          <div className="relative">
            <input
              type="email"
              disabled
              value={email}
              className="w-full pl-10 pr-10 py-2.5 bg-[#f1f3f4] border border-[#dadce0] rounded-lg text-sm font-medium text-[#5f6368] cursor-not-allowed select-all shadow-2xs"
            />
            <Mail className="w-4 h-4 text-[#5f6368] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Lock className="w-4 h-4 text-[#9aa0a6] absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <p className="text-[11px] text-[#5f6368] mt-1.5 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#137333]" />
            <span>Email is locked to maintain verified cryptographic session and account security integrity.</span>
          </p>
        </div>
      </div>

      {/* SECTION 3: GOOGLE MAPS REVIEW LINK */}
      <div className="bg-white border border-[#dadce0] rounded-xl p-5 sm:p-7 shadow-xs space-y-4">
        <div className="border-b border-[#dadce0] pb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0 shadow-2xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#202124] tracking-tight">
                Google Maps Review Link
              </h3>
              <p className="text-xs text-[#5f6368]">
                Where customers land to post their reviews directly onto Google Maps.
              </p>
            </div>
          </div>
          {googleReviewUrl && (
            <a
              href={googleReviewUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-[#1a73e8] hover:underline inline-flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>Test Link</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#5f6368] mb-1.5">
            Google Review Submission URL
          </label>
          <input
            type="url"
            value={googleReviewUrl}
            onChange={(e) => setGoogleReviewUrl(e.target.value)}
            placeholder="https://search.google.com/local/writereview?placeid=..."
            className="w-full px-3.5 py-2.5 bg-white border border-[#dadce0] rounded-lg text-sm text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] shadow-2xs"
          />
          <p className="text-[11px] text-[#5f6368] mt-1">
            Enter your Google Business Profile review link or Google Maps write-review URL.
          </p>
        </div>
      </div>

      {/* SECTION 4: SAVE CHANGES ACTION */}
      <div className="bg-white border border-[#dadce0] rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-[#202124]">
            Save Your Business Profile Updates
          </h4>
          <p className="text-xs text-[#5f6368] mt-0.5">
            Updates will instantly reflect across your customer review portal, QR stands, and account header.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto px-7 py-3 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white font-medium rounded-lg text-sm shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Changes</span>
        </button>
      </div>
    </form>
  );
}
