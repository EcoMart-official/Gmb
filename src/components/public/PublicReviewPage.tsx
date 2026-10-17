import React, { useState, useEffect } from 'react';
import {
  Star,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Globe,
  ChevronLeft,
} from 'lucide-react';
import { api } from '../../lib/api';

interface PublicReviewPageProps {
  slug: string;
  onBackToDashboard?: () => void;
}

interface PublicBusinessData {
  businessName: string;
  businessLogo?: string;
  category: string;
  customSlug: string;
  googleReviewUrl: string;
  productsAndServices: string;
  customerExperience: string;
  brandTone: string;
  targetKeywords: string[];
  languagePreferences: Array<{ code: string; name: string; percentage: number }>;
}

const DEFAULT_HIGHLIGHT_CHIPS = [
  'Friendly & Welcoming Staff',
  'Exceptional Quality',
  'Quick & Efficient Service',
  'Cozy & Clean Atmosphere',
  'Great Value for Money',
  'Highly Recommended',
  'Attention to Detail',
  'Delicious Offerings',
];

export function PublicReviewPage({ slug, onBackToDashboard }: PublicReviewPageProps) {
  const [business, setBusiness] = useState<PublicBusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [starRating, setStarRating] = useState<number>(5);
  const [selectedChips, setSelectedChips] = useState<string[]>([
    'Friendly & Welcoming Staff',
    'Exceptional Quality',
  ]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');

  const [generating, setGenerating] = useState<boolean>(false);
  const [generatedDraft, setGeneratedDraft] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.getPublicBusiness(slug)
      .then((data) => {
        if (!isMounted) return;
        if (data.error) {
          setError(data.error);
        } else {
          setBusiness(data);
          if (data.languagePreferences && data.languagePreferences.length > 0) {
            setSelectedLanguage(data.languagePreferences[0].name);
          }
        }
      })
      .catch(() => {
        if (isMounted) setError('Unable to load business details. Please try again.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const toggleChip = (chip: string) => {
    setSelectedChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  };

  const handleGenerateDraft = async () => {
    setGenerating(true);
    try {
      const res = await api.generateDraft({
        slug,
        businessName: business?.businessName,
        category: business?.category,
        starRating,
        highlightChips: selectedChips,
        language: selectedLanguage,
      });

      if (res.success && res.draft) {
        setGeneratedDraft(res.draft);
      }
    } catch {
      setGeneratedDraft(
        `I had a wonderful experience at ${business?.businessName || 'this business'}! ${
          selectedChips.length > 0 ? selectedChips.join(' and ') + ' really stood out.' : ''
        } Highly recommend them!`
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyAndRedirect = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(generatedDraft);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = generatedDraft;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
    } catch {
      setCopied(true);
    }

    const targetUrl =
      business?.googleReviewUrl ||
      'https://search.google.com/local/writereview';

    // Direct open without setTimeout so browser doesn't block the user gesture
    try {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } catch {
      // Handled via the direct link rendered below
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#1a73e8] animate-spin mx-auto" />
          <p className="text-sm font-medium text-[#5f6368]">
            Loading business review page...
          </p>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-[#dadce0] rounded-2xl p-6 text-center space-y-4 shadow-sm">
          <h2 className="text-lg font-bold text-[#202124]">
            Business Not Found
          </h2>
          <p className="text-xs text-[#5f6368]">
            {error || 'The requested review landing page does not exist or has been modified.'}
          </p>
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="px-4 py-2 bg-[#1a73e8] text-white rounded-md text-xs font-medium hover:bg-[#1557b0]"
            >
              Return to Customer Dashboard
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-6 px-4 sm:px-6 flex flex-col justify-between">
      {onBackToDashboard && (
        <div className="max-w-md mx-auto w-full mb-3 flex items-center justify-between text-xs">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1 text-[#5f6368] hover:text-[#202124] font-medium transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <span className="px-2.5 py-0.5 rounded-full bg-[#e8f0fe] text-[#1a73e8] font-medium text-[11px]">
            Mobile View Preview
          </span>
        </div>
      )}

      {/* Main Review Generator Card */}
      <div className="max-w-md mx-auto w-full bg-white border border-[#dadce0] rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
        {/* Business Branding */}
        <div className="text-center space-y-1.5 pb-4 border-b border-[#dadce0]">
          {business.businessLogo ? (
            <div className="w-16 h-16 rounded-2xl bg-white border border-[#dadce0] shadow-2xs flex items-center justify-center mx-auto mb-2 overflow-hidden p-1">
              <img
                src={business.businessLogo}
                alt={business.businessName}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-white border border-[#dadce0] shadow-2xs flex items-center justify-center mx-auto mb-2">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                <path d="M4 10V19C4 19.5523 4.44772 20 5 20H19C19.5523 20 20 19.5523 20 19V10" stroke="#1A73E8" strokeWidth="2" strokeLinecap="round"/>
                <path d="M2 7L4.5 4H19.5L22 7L20 10H4L2 7Z" fill="#1A73E8"/>
                <path d="M7 10C7 11.1046 6.10457 12 5 12C3.89543 12 3 11.1046 3 10" stroke="#EA4335" strokeWidth="2"/>
                <path d="M11 10C11 11.1046 10.1046 12 9 12C7.89543 12 7 11.1046 7 10" stroke="#FBBC04" strokeWidth="2"/>
                <path d="M15 10C15 11.1046 14.1046 12 13 12C11.8954 12 11 11.1046 11 10" stroke="#34A853" strokeWidth="2"/>
                <path d="M19 10C19 11.1046 18.1046 12 17 12C15.8954 12 15 11.1046 15 10" stroke="#1A73E8" strokeWidth="2"/>
                <path d="M9 20V14H15V20" stroke="#1A73E8" strokeWidth="2"/>
              </svg>
            </div>
          )}
          <h1 className="text-lg font-bold text-[#202124] tracking-tight">
            {business.businessName}
          </h1>
          <p className="text-xs text-[#5f6368] font-normal">
            {business.category || 'Google Business Profile'}
          </p>
        </div>

        {/* Step 1: Star Rating */}
        <div className="text-center space-y-2">
          <label className="block text-xs font-semibold text-[#202124]">
            How was your experience today?
          </label>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setStarRating(star)}
                className="p-1 rounded-md transition-transform hover:scale-110 cursor-pointer"
                aria-label={`${star} star rating`}
              >
                <Star
                  className={`w-9 h-9 ${
                    star <= starRating
                      ? 'fill-[#f9ab00] text-[#f9ab00]'
                      : 'text-[#dadce0]'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-xs font-medium text-[#b06000]">
            {starRating === 5 && '5 Stars &bull; Outstanding!'}
            {starRating === 4 && '4 Stars &bull; Great Experience'}
            {starRating === 3 && '3 Stars &bull; Average'}
            {starRating <= 2 && 'We appreciate your feedback'}
          </p>
        </div>

        {/* Step 2: What stood out most? */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[#202124]">
            What stood out the most? (Tap to select)
          </label>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_HIGHLIGHT_CHIPS.map((chip) => {
              const selected = selectedChips.includes(chip);
              return (
                <button
                  type="button"
                  key={chip}
                  onClick={() => toggleChip(chip)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
                    selected
                      ? 'bg-[#e8f0fe] border-[#1a73e8] text-[#1a73e8]'
                      : 'bg-white border-[#dadce0] text-[#3c4043] hover:bg-[#f8f9fa]'
                  }`}
                >
                  {selected && '✓ '}
                  {chip}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Preferred Language */}
        <div className="flex items-center justify-between pt-1">
          <label className="text-xs font-semibold text-[#202124] flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-[#1a73e8]" />
            <span>Review language</span>
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-2.5 py-1 text-xs font-medium bg-white border border-[#dadce0] rounded-md text-[#202124]"
          >
            {(business.languagePreferences && business.languagePreferences.length > 0
              ? business.languagePreferences
              : [
                  { code: 'en', name: 'English (India)' },
                  { code: 'hi', name: 'Hindi (हिन्दी)' },
                  { code: 'bn', name: 'Bengali (বাংলা)' },
                ]
            ).map((lang) => (
              <option key={lang.code} value={lang.name}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Action: Generate AI Review Draft */}
        {!generatedDraft ? (
          <button
            type="button"
            onClick={handleGenerateDraft}
            disabled={generating}
            className="w-full py-3 px-4 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white rounded-md font-medium text-sm shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating draft with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Review Draft</span>
              </>
            )}
          </button>
        ) : (
          /* Generated Draft Display Card */
          <div className="space-y-4">
            <div className="p-4 bg-[#f8f9fa] rounded-xl border border-[#dadce0] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1a73e8] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Your Review Draft</span>
                </span>
                <button
                  type="button"
                  onClick={handleGenerateDraft}
                  disabled={generating}
                  className="text-xs text-[#1a73e8] font-medium hover:underline flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${generating ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </button>
              </div>

              <textarea
                rows={4}
                value={generatedDraft}
                onChange={(e) => setGeneratedDraft(e.target.value)}
                className="w-full p-3 bg-white border border-[#dadce0] rounded-md text-xs sm:text-sm text-[#202124] leading-relaxed focus:outline-none focus:border-[#1a73e8]"
              />
            </div>

            {/* Direct 1-Click Copy & Google Redirect Action */}
            <button
              type="button"
              onClick={handleCopyAndRedirect}
              className={`w-full py-3 px-4 rounded-md font-medium text-sm shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                copied
                  ? 'bg-[#1e8e3e] text-white'
                  : 'bg-[#1a73e8] hover:bg-[#1557b0] text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied! Opening Google Maps...</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Review & Post on Google</span>
                  <ExternalLink className="w-4 h-4" />
                </>
              )}
            </button>

            {copied && (
              <div className="text-center">
                <a
                  href={business?.googleReviewUrl || 'https://search.google.com/local/writereview'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#1a73e8] hover:underline font-medium inline-flex items-center gap-1"
                >
                  <span>Did not open? Click here to open Google Maps Review box</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            <p className="text-[11px] text-center text-[#5f6368] leading-normal">
              1. Tap above to copy your draft.<br />
              2. Google Maps review dialog opens.<br />
              3. Paste and post!
            </p>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="text-center text-[11px] text-[#5f6368] py-4">
        Google Business Profile Review Assistant &bull; RANKORA
      </div>
    </div>
  );
}
