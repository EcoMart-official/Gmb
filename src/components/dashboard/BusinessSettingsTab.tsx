import React, { useState } from 'react';
import {
  Sliders,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Sparkles,
  RefreshCw,
  Globe,
  Tag,
  ExternalLink,
} from 'lucide-react';
import { BusinessSettings, LanguagePreference } from '../../types';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

interface BusinessSettingsTabProps {
  settings: BusinessSettings;
  onUpdateSettings: (newSettings: BusinessSettings) => void;
}

const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'nl', name: 'Dutch' },
  { code: 'ja', name: 'Japanese' },
];

export function BusinessSettingsTab({
  settings,
  onUpdateSettings,
}: BusinessSettingsTabProps) {
  const { showSuccess, showError } = useToast();
  const [saving, setSaving] = useState(false);

  // Form states
  const [businessName, setBusinessName] = useState(settings.businessName || '');
  const [category, setCategory] = useState(settings.category || '');
  const [placeId, setPlaceId] = useState(settings.placeId || '');
  const [googleReviewUrl, setGoogleReviewUrl] = useState(settings.googleReviewUrl || '');
  const [productsAndServices, setProductsAndServices] = useState(settings.productsAndServices || '');
  const [customerExperience, setCustomerExperience] = useState(settings.customerExperience || '');
  const [brandTone, setBrandTone] = useState<BusinessSettings['brandTone']>(settings.brandTone || 'friendly');
  const [targetKeywords, setTargetKeywords] = useState<string[]>(settings.targetKeywords || []);
  const [newKeyword, setNewKeyword] = useState('');
  const [languages, setLanguages] = useState<LanguagePreference[]>(
    settings.languagePreferences && settings.languagePreferences.length > 0
      ? settings.languagePreferences
      : [{ code: 'en', name: 'English', percentage: 100 }]
  );

  const handleAddKeyword = () => {
    const trimmed = newKeyword.trim().toLowerCase();
    if (trimmed && !targetKeywords.includes(trimmed)) {
      setTargetKeywords([...targetKeywords, trimmed]);
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setTargetKeywords(targetKeywords.filter((k) => k !== keyword));
  };

  const handleLanguagePercentageChange = (code: string, newPercentage: number) => {
    setLanguages((prev) =>
      prev.map((l) => (l.code === code ? { ...l, percentage: Math.max(0, Math.min(100, newPercentage)) } : l))
    );
  };

  const handleAddLanguage = (code: string) => {
    const found = AVAILABLE_LANGUAGES.find((l) => l.code === code);
    if (found && !languages.some((l) => l.code === code)) {
      setLanguages([...languages, { code: found.code, name: found.name, percentage: 0 }]);
    }
  };

  const handleRemoveLanguage = (code: string) => {
    if (languages.length <= 1) {
      showError('At least one primary language must remain configured.');
      return;
    }
    setLanguages(languages.filter((l) => l.code !== code));
  };

  const totalPercentage = languages.reduce((acc, l) => acc + (Number(l.percentage) || 0), 0);
  const isPercentageValid = totalPercentage === 100;

  const handleAutoBalanceLanguages = () => {
    if (languages.length === 0) return;
    const base = Math.floor(100 / languages.length);
    const remainder = 100 - base * languages.length;
    setLanguages(
      languages.map((l, index) => ({
        ...l,
        percentage: index === 0 ? base + remainder : base,
      }))
    );
  };

  const handlePlaceIdChange = (newPlaceId: string) => {
    setPlaceId(newPlaceId);
    if (!googleReviewUrl || googleReviewUrl.includes('search.google.com/local/writereview?placeid=')) {
      setGoogleReviewUrl(
        newPlaceId.trim()
          ? `https://search.google.com/local/writereview?placeid=${newPlaceId.trim()}`
          : ''
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!businessName.trim()) {
      showError('Business name cannot be empty.');
      return;
    }

    if (!isPercentageValid) {
      showError(`Total language distribution must equal 100% (currently ${totalPercentage}%).`);
      return;
    }

    setSaving(true);
    try {
      const res = await api.updateBusinessSettings({
        businessName,
        category,
        placeId,
        googleReviewUrl,
        productsAndServices,
        customerExperience,
        brandTone,
        targetKeywords,
        languagePreferences: languages,
      });

      if (res.error) {
        showError(res.error);
      } else {
        showSuccess('Business profile settings saved.');
        onUpdateSettings(res.settings);
      }
    } catch {
      showError('Failed to save business settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Banner with Save Action */}
      <div className="bg-white border border-[#dadce0] rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#202124]">
            Business Profile & Review Link Setup
          </h2>
          <p className="text-xs sm:text-sm text-[#5f6368] mt-0.5">
            Configure your business details and Google Review submission URL. When customers scan your QR stand, they will be directed to this review link.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white font-medium rounded-md text-sm shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Business Profile */}
        <div className="bg-white border border-[#dadce0] rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-[#202124] border-b border-[#dadce0] pb-3">
            Core Business & Google Review Link
          </h3>

          <div>
            <label className="block text-xs font-semibold text-[#5f6368] mb-1.5">
              Official Business Name *
            </label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g., The Artisan Bakery & Cafe"
              className="w-full px-3.5 py-2.5 bg-white border border-[#dadce0] rounded-md text-sm text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5f6368] mb-1.5">
              Business Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Bakery & Cafe, Dental Clinic, Retail Store"
              className="w-full px-3.5 py-2.5 bg-white border border-[#dadce0] rounded-md text-sm text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5f6368] mb-1.5">
              Google Place ID
            </label>
            <input
              type="text"
              value={placeId}
              onChange={(e) => handlePlaceIdChange(e.target.value)}
              placeholder="e.g., ChIJN1t_tDeuEmsRUsoyG83frY4"
              className="w-full px-3.5 py-2.5 bg-white border border-[#dadce0] rounded-md text-sm font-mono text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
            />
            <p className="text-[11px] text-[#5f6368] mt-1">
              Entering your Place ID automatically generates your Google Review Submission URL below.
            </p>
          </div>

          <div className="p-3.5 bg-[#f8f9fa] border border-[#d2e3fc] rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#1a73e8]">
                Google Review Submission URL *
              </label>
              {googleReviewUrl && (
                <a
                  href={googleReviewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-[#1a73e8] hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Test Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <input
              type="url"
              required
              value={googleReviewUrl}
              onChange={(e) => setGoogleReviewUrl(e.target.value)}
              placeholder="https://search.google.com/local/writereview?placeid=..."
              className="w-full px-3.5 py-2.5 bg-white border border-[#dadce0] rounded-md text-sm text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
            />
            <p className="text-[11px] text-[#5f6368]">
              Your QR code and landing page direct customers straight to this link to leave their Google review.
            </p>
          </div>

          {/* Brand Tone Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#5f6368] mb-1.5">
              Brand Voice & AI Tone
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'friendly', label: 'Friendly & Warm' },
                { id: 'professional', label: 'Professional & Polished' },
                { id: 'enthusiastic', label: 'Enthusiastic & Vibrant' },
                { id: 'humble', label: 'Humble & Sincere' },
                { id: 'luxurious', label: 'Luxurious & Refined' },
              ].map((tone) => (
                <button
                  type="button"
                  key={tone.id}
                  onClick={() => setBrandTone(tone.id as BusinessSettings['brandTone'])}
                  className={`p-2 rounded-md border text-xs font-medium text-center transition-colors cursor-pointer ${
                    brandTone === tone.id
                      ? 'bg-[#e8f0fe] border-[#1a73e8] text-[#1a73e8] font-semibold'
                      : 'border-[#dadce0] text-[#3c4043] hover:bg-[#f8f9fa]'
                  }`}
                >
                  {tone.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Context */}
        <div className="bg-white border border-[#dadce0] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#dadce0] pb-3">
            <h3 className="font-bold text-sm text-[#202124]">
              AI Context & Products
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] text-[#1a73e8] font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fed into Gemini 3.8 Flash</span>
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5f6368] mb-1.5">
              Products, Services & Offerings
            </label>
            <textarea
              rows={3}
              value={productsAndServices}
              onChange={(e) => setProductsAndServices(e.target.value)}
              placeholder="e.g., Sourdough loaves, French croissants, organic espresso, seasonal fruit tarts..."
              className="w-full px-3.5 py-2.5 bg-white border border-[#dadce0] rounded-md text-sm text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
            />
            <p className="text-[11px] text-[#5f6368] mt-1">
              List popular offerings so customer review drafts sound specific and authentic.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5f6368] mb-1.5">
              Customer Experience & Atmosphere
            </label>
            <textarea
              rows={3}
              value={customerExperience}
              onChange={(e) => setCustomerExperience(e.target.value)}
              placeholder="e.g., Cozy seating, warm morning bakery aroma, fast checkout, welcoming baristas, clean facilities..."
              className="w-full px-3.5 py-2.5 bg-white border border-[#dadce0] rounded-md text-sm text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
            />
            <p className="text-[11px] text-[#5f6368] mt-1">
              Mention atmosphere, staff friendliness, cleanliness, or location perks.
            </p>
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-xs font-semibold text-[#5f6368] mb-1.5">
              Target SEO Keywords for Google Maps
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddKeyword();
                  }
                }}
                placeholder="Add keyword (e.g. sourdough, best espresso)"
                className="flex-1 px-3 py-2 bg-white border border-[#dadce0] rounded-md text-xs text-[#202124] focus:outline-none focus:border-[#1a73e8]"
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                className="px-3.5 py-2 bg-[#f1f3f4] hover:bg-[#e8eaed] text-[#3c4043] rounded-md text-xs font-medium flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {targetKeywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc]"
                >
                  <Tag className="w-3 h-3" />
                  <span>{kw}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(kw)}
                    className="hover:text-[#c5221f] transition-colors"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Multilingual Review Distribution Card */}
      <div className="bg-white border border-[#dadce0] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#dadce0] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#1a73e8]" />
              <h3 className="font-bold text-sm text-[#202124]">
                Multilingual Review Language Distribution
              </h3>
            </div>
            <p className="text-xs text-[#5f6368] mt-0.5">
              Configure supported languages for reviews. The percentage sum must equal exactly 100%.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                isPercentageValid
                  ? 'bg-[#e6f4ea] text-[#137333] border border-[#ceead6]'
                  : 'bg-[#fce8e6] text-[#c5221f] border border-[#f5c2c7]'
              }`}
            >
              Total: {totalPercentage}% {isPercentageValid ? '✓ Valid' : '✗ Must equal 100%'}
            </span>

            {!isPercentageValid && (
              <button
                type="button"
                onClick={handleAutoBalanceLanguages}
                className="text-xs text-[#1a73e8] hover:underline font-semibold cursor-pointer"
              >
                Auto-balance to 100%
              </button>
            )}

            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddLanguage(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="px-3 py-1 text-xs font-medium bg-white border border-[#dadce0] rounded-md text-[#3c4043]"
            >
              <option value="" disabled>
                + Add Language
              </option>
              {AVAILABLE_LANGUAGES.filter((al) => !languages.some((l) => l.code === al.code)).map((al) => (
                <option key={al.code} value={al.code}>
                  {al.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {languages.map((lang) => (
            <div
              key={lang.code}
              className="p-3 bg-[#f8f9fa] border border-[#dadce0] rounded-lg flex items-center justify-between gap-3"
            >
              <div>
                <span className="font-medium text-xs text-[#202124]">
                  {lang.name}
                </span>
                <span className="text-[10px] text-[#5f6368] ml-1 font-mono uppercase">
                  ({lang.code})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={lang.percentage}
                  onChange={(e) => handleLanguagePercentageChange(lang.code, parseInt(e.target.value, 10) || 0)}
                  className="w-16 px-2 py-1 text-center font-bold text-xs bg-white border border-[#dadce0] rounded-md text-[#202124]"
                />
                <span className="text-xs font-medium text-[#5f6368]">%</span>
                {languages.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveLanguage(lang.code)}
                    className="text-[#5f6368] hover:text-[#c5221f] p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
