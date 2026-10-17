import React, { useState } from 'react';
import {
  Globe,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Scale,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import { LanguagePreference } from '../../types';

export interface IndianLanguageOption {
  code: string;
  name: string;
  nativeName: string;
  region: string;
}

export const INDIAN_LANGUAGES: IndianLanguageOption[] = [
  { code: 'en', name: 'English (India)', nativeName: 'English', region: 'Pan-India & Business' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', region: 'North & Central India' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', region: 'West Bengal, Tripura, Assam' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', region: 'Maharashtra & Goa' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', region: 'Andhra Pradesh & Telangana' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', region: 'Tamil Nadu & Puducherry' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', region: 'Gujarat' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', region: 'Karnataka' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', region: 'Kerala & Lakshadweep' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', region: 'Punjab, Delhi, Haryana' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', region: 'Odisha' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', region: 'Assam & North East' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', region: 'Pan-India' },
  { code: 'hinglish', name: 'Hinglish (Hindi in English Script)', nativeName: 'Hinglish', region: 'Urban Youth & Retail' },
  { code: 'banglish', name: 'Banglish (Bengali in English Script)', nativeName: 'Banglish', region: 'Urban Youth & Retail' },
];

const SEGMENT_COLORS = [
  '#1a73e8', // Google Blue
  '#059669', // Emerald
  '#ea580c', // Amber / Orange
  '#7c3aed', // Purple
  '#db2777', // Pink
  '#0891b2', // Cyan
  '#4f46e5', // Indigo
  '#d97706', // Gold
  '#0284c7', // Sky Blue
  '#16a34a', // Green
];

interface LanguageDistributionManagerProps {
  languages: LanguagePreference[];
  onChange: (updatedLanguages: LanguagePreference[]) => void;
}

export function LanguageDistributionManager({
  languages,
  onChange,
}: LanguageDistributionManagerProps) {
  const [selectedCode, setSelectedCode] = useState<string>('hi');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>('');
  const [customNative, setCustomNative] = useState<string>('');

  // Calculate live total percentage
  const totalPercentage = languages.reduce(
    (sum, lang) => sum + (Number(lang.percentage) || 0),
    0
  );
  const isBalanced = totalPercentage === 100;
  const isUnder = totalPercentage < 100;
  const isOver = totalPercentage > 100;

  // Add standard language from Indian catalog
  const handleAddSelectedLanguage = () => {
    if (isCustomMode) {
      const trimmed = customName.trim();
      if (!trimmed) return;
      if (languages.some((l) => l.name.toLowerCase() === trimmed.toLowerCase())) {
        return;
      }
      const newCode = trimmed.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 10);
      const remaining = Math.max(0, 100 - totalPercentage);
      const newLang: LanguagePreference = {
        code: newCode,
        name: customNative.trim() ? `${trimmed} (${customNative.trim()})` : trimmed,
        percentage: remaining > 0 ? remaining : 0,
      };
      onChange([...languages, newLang]);
      setCustomName('');
      setCustomNative('');
      setIsCustomMode(false);
      return;
    }

    const opt = INDIAN_LANGUAGES.find((l) => l.code === selectedCode);
    if (!opt) return;
    if (languages.some((l) => l.code === opt.code)) return;

    const remaining = Math.max(0, 100 - totalPercentage);
    const newLang: LanguagePreference = {
      code: opt.code,
      name: opt.nativeName !== opt.name ? `${opt.name} (${opt.nativeName})` : opt.name,
      percentage: remaining > 0 ? remaining : 0,
    };

    onChange([...languages, newLang]);

    // Advance dropdown to next unadded language
    const nextUnadded = INDIAN_LANGUAGES.find(
      (cand) => cand.code !== opt.code && !languages.some((l) => l.code === cand.code)
    );
    if (nextUnadded) {
      setSelectedCode(nextUnadded.code);
    }
  };

  // Remove language
  const handleRemoveLanguage = (codeToRemove: string) => {
    if (languages.length <= 1) return;
    onChange(languages.filter((l) => l.code !== codeToRemove));
  };

  // Update specific language percentage
  const handlePercentageChange = (code: string, newPct: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(newPct)));
    const updated = languages.map((l) =>
      l.code === code ? { ...l, percentage: clamped } : l
    );
    onChange(updated);
  };

  // Adjust by increment
  const handleStepPercentage = (code: string, step: number) => {
    const current = languages.find((l) => l.code === code)?.percentage || 0;
    handlePercentageChange(code, current + step);
  };

  // Auto-Balance to 100%
  const handleAutoBalance = () => {
    if (languages.length === 0) return;
    if (languages.length === 1) {
      onChange([{ ...languages[0], percentage: 100 }]);
      return;
    }

    // If total is 0, distribute equally
    if (totalPercentage === 0) {
      handleDistributeEqually();
      return;
    }

    // Scale proportionally to sum to 100
    let runningSum = 0;
    const scaled = languages.map((lang, idx) => {
      if (idx === languages.length - 1) {
        // Last element gets exact remainder to guarantee sum === 100
        return {
          ...lang,
          percentage: Math.max(0, 100 - runningSum),
        };
      }
      const newPct = Math.max(0, Math.round((lang.percentage / totalPercentage) * 100));
      runningSum += newPct;
      return { ...lang, percentage: newPct };
    });

    onChange(scaled);
  };

  // Distribute equally across all active languages
  const handleDistributeEqually = () => {
    const count = languages.length;
    if (count === 0) return;
    const base = Math.floor(100 / count);
    const remainder = 100 % count;

    const distributed = languages.map((lang, idx) => ({
      ...lang,
      percentage: idx < remainder ? base + 1 : base,
    }));

    onChange(distributed);
  };

  // Presets
  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case 'all-india':
        onChange([
          { code: 'en', name: 'English (India)', percentage: 50 },
          { code: 'hi', name: 'Hindi (हिन्दी)', percentage: 30 },
          { code: 'bn', name: 'Bengali (বাংলা)', percentage: 20 },
        ]);
        break;
      case 'metro-dual':
        onChange([
          { code: 'en', name: 'English (India)', percentage: 60 },
          { code: 'hi', name: 'Hindi (हिन्दी)', percentage: 40 },
        ]);
        break;
      case 'bengal-east':
        onChange([
          { code: 'bn', name: 'Bengali (বাংলা)', percentage: 50 },
          { code: 'en', name: 'English (India)', percentage: 30 },
          { code: 'hi', name: 'Hindi (हिन्दी)', percentage: 20 },
        ]);
        break;
      case 'south-hub':
        onChange([
          { code: 'en', name: 'English (India)', percentage: 50 },
          { code: 'ta', name: 'Tamil (தமிழ்)', percentage: 25 },
          { code: 'te', name: 'Telugu (తెలుగు)', percentage: 25 },
        ]);
        break;
      case 'western-hub':
        onChange([
          { code: 'en', name: 'English (India)', percentage: 50 },
          { code: 'hi', name: 'Hindi (हिन्दी)', percentage: 30 },
          { code: 'mr', name: 'Marathi (मराठी)', percentage: 20 },
        ]);
        break;
      default:
        break;
    }
  };

  return (
    <div className="bg-white border border-[#dadce0] rounded-xl p-5 sm:p-7 shadow-xs space-y-5">
      {/* Header */}
      <div className="border-b border-[#dadce0] pb-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0 shadow-2xs">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-[#202124] flex items-center gap-2">
              <span>Customer Review Languages &amp; Percentage Distribution</span>
              <span className="text-[10px] font-semibold text-[#1a73e8] bg-[#e8f0fe] px-2 py-0.5 rounded-full border border-[#d2e3fc]">
                Indian Regional
              </span>
            </h3>
            <p className="text-xs text-[#5f6368] mt-0.5">
              Configure multiple languages spoken by your customers and set the exact percentage share for AI review generation.
            </p>
          </div>
        </div>

        {/* Status Indicator Pill */}
        <div className="shrink-0 flex items-center gap-2 self-start sm:self-auto">
          {isBalanced ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#e6f4ea] text-[#137333] border border-[#ceead6]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Total: 100% (Balanced)</span>
            </span>
          ) : isUnder ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fef7e0] text-[#b06000] border border-[#feefc3]">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Total: {totalPercentage}% (Remaining: {100 - totalPercentage}%)</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fce8e6] text-[#c5221f] border border-[#fad2cf]">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Total: {totalPercentage}% (Over by {totalPercentage - 100}%)</span>
            </span>
          )}
        </div>
      </div>

      {/* Multi-Segment Allocation Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#202124] flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#1a73e8]" />
            <span>Distribution Allocation Bar</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDistributeEqually}
              className="text-[11px] font-semibold text-[#1a73e8] hover:underline cursor-pointer flex items-center gap-1"
            >
              <Scale className="w-3 h-3" />
              <span>Distribute Equally</span>
            </button>
            <span className="text-[#dadce0]">&bull;</span>
            <button
              type="button"
              onClick={handleAutoBalance}
              disabled={isBalanced}
              className="text-[11px] font-semibold text-[#1a73e8] disabled:text-[#9aa0a6] hover:underline cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Auto-Balance to 100%</span>
            </button>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-3.5 bg-[#f1f3f4] rounded-full overflow-hidden flex border border-[#dadce0] p-0.5">
          {languages.map((lang, idx) => {
            const pct = Math.max(0, Math.min(100, Number(lang.percentage) || 0));
            if (pct <= 0) return null;
            const color = SEGMENT_COLORS[idx % SEGMENT_COLORS.length];
            return (
              <div
                key={lang.code}
                style={{
                  width: `${pct}%`,
                  backgroundColor: color,
                }}
                title={`${lang.name}: ${pct}%`}
                className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300 relative group"
              />
            );
          })}
        </div>
      </div>

      {/* Quick Regional Presets */}
      <div className="p-3 bg-[#f8f9fa] border border-[#dadce0] rounded-xl space-y-2">
        <span className="text-[11px] font-bold text-[#5f6368] uppercase tracking-wider block">
          Quick Regional Presets (1-Click 100% Balance):
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyPreset('all-india')}
            className="px-2.5 py-1 text-xs bg-white hover:bg-[#e8f0fe] hover:text-[#1a73e8] border border-[#dadce0] hover:border-[#1a73e8] rounded-lg transition-colors cursor-pointer shadow-2xs font-medium"
          >
            Pan-India (EN 50% • HI 30% • BN 20%)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('bengal-east')}
            className="px-2.5 py-1 text-xs bg-white hover:bg-[#e8f0fe] hover:text-[#1a73e8] border border-[#dadce0] hover:border-[#1a73e8] rounded-lg transition-colors cursor-pointer shadow-2xs font-medium"
          >
            Bengal &amp; East (BN 50% • EN 30% • HI 20%)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('metro-dual')}
            className="px-2.5 py-1 text-xs bg-white hover:bg-[#e8f0fe] hover:text-[#1a73e8] border border-[#dadce0] hover:border-[#1a73e8] rounded-lg transition-colors cursor-pointer shadow-2xs font-medium"
          >
            Metro Dual (EN 60% • HI 40%)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('south-hub')}
            className="px-2.5 py-1 text-xs bg-white hover:bg-[#e8f0fe] hover:text-[#1a73e8] border border-[#dadce0] hover:border-[#1a73e8] rounded-lg transition-colors cursor-pointer shadow-2xs font-medium"
          >
            South India (EN 50% • TA 25% • TE 25%)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('western-hub')}
            className="px-2.5 py-1 text-xs bg-white hover:bg-[#e8f0fe] hover:text-[#1a73e8] border border-[#dadce0] hover:border-[#1a73e8] rounded-lg transition-colors cursor-pointer shadow-2xs font-medium"
          >
            Western Hub (EN 50% • HI 30% • MR 20%)
          </button>
        </div>
      </div>

      {/* Languages List with Sliders and Percentage Inputs */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-[#5f6368]">
          Active Languages &amp; Specific Percentage Sliders:
        </label>

        <div className="space-y-2.5">
          {languages.map((lang, index) => {
            const color = SEGMENT_COLORS[index % SEGMENT_COLORS.length];
            const pct = Number(lang.percentage) || 0;
            return (
              <div
                key={lang.code}
                className="p-3.5 bg-white border border-[#dadce0] rounded-xl hover:border-[#b0b3b8] transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Left: Indicator, Name & Badge */}
                <div className="flex items-center gap-2.5 min-w-[200px] shrink-0">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                    style={{ backgroundColor: color }}
                  />
                  <div className="min-w-0">
                    <span className="font-bold text-xs sm:text-sm text-[#202124] block truncate">
                      {lang.name}
                    </span>
                    <span className="text-[10px] text-[#5f6368] font-mono uppercase">
                      Code: {lang.code}
                    </span>
                  </div>
                </div>

                {/* Center: Range Slider */}
                <div className="flex-1 flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={pct}
                    onChange={(e) => handlePercentageChange(lang.code, Number(e.target.value))}
                    className="w-full accent-[#1a73e8] h-2 bg-[#e8f0fe] rounded-lg cursor-pointer"
                  />
                </div>

                {/* Right: Quick Steps, Number Input & Delete */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleStepPercentage(lang.code, -5)}
                      className="w-6 h-6 rounded bg-[#f1f3f4] hover:bg-[#e8eaed] text-[#3c4043] font-bold text-xs flex items-center justify-center cursor-pointer transition-colors"
                      title="Decrease by 5%"
                    >
                      -5
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStepPercentage(lang.code, 5)}
                      className="w-6 h-6 rounded bg-[#f1f3f4] hover:bg-[#e8eaed] text-[#3c4043] font-bold text-xs flex items-center justify-center cursor-pointer transition-colors"
                      title="Increase by 5%"
                    >
                      +5
                    </button>
                  </div>

                  {/* Number Input Box with % Sign */}
                  <div className="relative w-20">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={pct}
                      onChange={(e) =>
                        handlePercentageChange(
                          lang.code,
                          e.target.value === '' ? 0 : Number(e.target.value)
                        )
                      }
                      className="w-full py-1.5 pl-2.5 pr-6 text-right font-bold text-xs sm:text-sm text-[#202124] border border-[#dadce0] rounded-lg focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-[#5f6368] pointer-events-none">
                      %
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveLanguage(lang.code)}
                    disabled={languages.length <= 1}
                    className="p-1.5 text-[#5f6368] hover:text-[#d93025] hover:bg-[#fce8e6] disabled:opacity-30 disabled:pointer-events-none rounded-lg transition-colors cursor-pointer shrink-0"
                    title={
                      languages.length <= 1
                        ? 'At least one language must remain'
                        : `Remove ${lang.name}`
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Another Language Section */}
      <div className="pt-2 border-t border-[#dadce0] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#202124]">
            Add Indian Language:
          </span>
          <button
            type="button"
            onClick={() => setIsCustomMode(!isCustomMode)}
            className="text-[11px] font-semibold text-[#1a73e8] hover:underline cursor-pointer"
          >
            {isCustomMode ? 'Choose from Indian Catalog' : '+ Add Custom Language'}
          </button>
        </div>

        {!isCustomMode ? (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <select
              value={selectedCode}
              onChange={(e) => setSelectedCode(e.target.value)}
              className="flex-1 p-2.5 bg-white border border-[#dadce0] rounded-lg text-xs sm:text-sm text-[#202124] focus:outline-none focus:border-[#1a73e8] cursor-pointer"
            >
              {INDIAN_LANGUAGES.map((opt) => {
                const alreadyAdded = languages.some((l) => l.code === opt.code);
                return (
                  <option
                    key={opt.code}
                    value={opt.code}
                    disabled={alreadyAdded}
                  >
                    {opt.name} ({opt.nativeName}) — {opt.region} {alreadyAdded ? ' [Already Added]' : ''}
                  </option>
                );
              })}
            </select>

            <button
              type="button"
              onClick={handleAddSelectedLanguage}
              disabled={languages.some((l) => l.code === selectedCode)}
              className="px-5 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Language</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              placeholder="e.g., Bhojpuri, Maithili, Konkani, Marwari"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="flex-1 p-2.5 bg-white border border-[#dadce0] rounded-lg text-xs sm:text-sm text-[#202124] focus:outline-none focus:border-[#1a73e8]"
            />
            <input
              type="text"
              placeholder="Native script (optional, e.g. भोजपुरी)"
              value={customNative}
              onChange={(e) => setCustomNative(e.target.value)}
              className="sm:w-44 p-2.5 bg-white border border-[#dadce0] rounded-lg text-xs sm:text-sm text-[#202124] focus:outline-none focus:border-[#1a73e8]"
            />
            <button
              type="button"
              onClick={handleAddSelectedLanguage}
              disabled={!customName.trim()}
              className="px-5 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
