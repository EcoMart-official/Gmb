import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquareCode,
  Sparkles,
  Plus,
  X,
  Store,
  SlidersHorizontal,
  Wrench,
  Save,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { BusinessSettings, LanguagePreference } from '../../types';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { LanguageDistributionManager } from './LanguageDistributionManager';

interface ReviewRepliesTabProps {
  settings: BusinessSettings;
  onUpdateSettings: (newSettings: BusinessSettings) => void;
}

export function ReviewRepliesTab({
  settings,
  onUpdateSettings,
}: ReviewRepliesTabProps) {
  const { showSuccess, showError } = useToast();

  // Services list
  const [servicesList, setServicesList] = useState<string[]>([]);
  const [newServiceInput, setNewServiceInput] = useState('');

  // Shop AI Details
  const [shopAiDetails, setShopAiDetails] = useState('');

  // Review Style & Rules (Unified single input box)
  const [reviewStyleAndRules, setReviewStyleAndRules] = useState('');

  // Language Preferences (Multi-language Indian distribution with percentages)
  const [languages, setLanguages] = useState<LanguagePreference[]>([]);

  const [savingConfig, setSavingConfig] = useState(false);

  // Auto-resize refs for textareas
  const shopDetailsRef = useRef<HTMLTextAreaElement>(null);
  const styleRulesRef = useRef<HTMLTextAreaElement>(null);

  const autoResizeTextarea = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, 110)}px`;
  };

  // Sync initial fields from settings
  useEffect(() => {
    if (settings) {
      if (settings.services && Array.isArray(settings.services) && settings.services.length > 0) {
        setServicesList(settings.services);
      } else if (settings.productsAndServices) {
        const parsed = settings.productsAndServices
          .split(/[,;\n]+/)
          .map((s) => s.trim())
          .filter(Boolean);
        setServicesList(parsed.length > 0 ? parsed : ['Computer Repair', 'Gaming PC Build']);
      } else {
        setServicesList(['Computer Repair', 'Gaming PC Build']);
      }

      const initialShopDetails = settings.shopAiDetails || '';
      setShopAiDetails(initialShopDetails);

      const initialRules = settings.reviewStyleAndRules || settings.reviewWritingRules || '';
      setReviewStyleAndRules(initialRules);

      if (
        settings.languagePreferences &&
        Array.isArray(settings.languagePreferences) &&
        settings.languagePreferences.length > 0
      ) {
        setLanguages(settings.languagePreferences);
      } else {
        setLanguages([
          { code: 'en', name: 'English (India)', percentage: 50 },
          { code: 'hi', name: 'Hindi (हिन्दी)', percentage: 30 },
          { code: 'bn', name: 'Bengali (বাংলা)', percentage: 20 },
        ]);
      }
    }
  }, [settings]);

  // Adjust height on initial render and content update
  useEffect(() => {
    autoResizeTextarea(shopDetailsRef.current);
  }, [shopAiDetails]);

  useEffect(() => {
    autoResizeTextarea(styleRulesRef.current);
  }, [reviewStyleAndRules]);

  // Service Management (Direct Type & Add, no quick suggestions)
  const handleAddService = () => {
    const s = newServiceInput.trim();
    if (!s) return;
    if (servicesList.some((existing) => existing.toLowerCase() === s.toLowerCase())) {
      showError(`"${s}" is already in your services list.`);
      return;
    }
    setServicesList((prev) => [...prev, s]);
    setNewServiceInput('');
  };

  const handleRemoveService = (indexToRemove: number) => {
    setServicesList((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Save Settings
  const handleSaveAiReviewConfiguration = async () => {
    // Validate language percentage allocation
    if (languages.length > 0) {
      const totalPct = languages.reduce((acc, l) => acc + (Number(l.percentage) || 0), 0);
      if (totalPct !== 100) {
        showError(
          `Language distribution must equal exactly 100% (currently ${totalPct}%). Please click 'Auto-Balance to 100%'.`
        );
        return;
      }
    }

    setSavingConfig(true);
    try {
      const joinedServices = servicesList.join(', ');
      const res = await api.updateBusinessSettings({
        services: servicesList,
        productsAndServices: joinedServices,
        shopAiDetails: shopAiDetails.trim(),
        reviewStyleAndRules: reviewStyleAndRules.trim(),
        reviewWritingRules: reviewStyleAndRules.trim(),
        languagePreferences: languages,
      });

      if (res.error) {
        showError(res.error);
      } else {
        showSuccess('AI Review settings, writing rules, and language percentages saved successfully!');
        if (res.settings) {
          onUpdateSettings(res.settings);
        }
      }
    } catch {
      showError('Failed to save AI Review settings. Please check your network connection.');
    } finally {
      setSavingConfig(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* 1. Header Info */}
      <div className="bg-white border border-[#dadce0] rounded-xl p-5 sm:p-7 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0 shadow-2xs">
            <MessageSquareCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#1a73e8] uppercase tracking-wider">
                AI Review Engine
              </span>
              <span className="text-[#dadce0]">&bull;</span>
              <span className="text-xs font-medium text-[#5f6368]">
                Gemini 3.8 Flash
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#202124] mt-0.5">
              AI Review Configuration
            </h2>
            <p className="text-xs sm:text-sm text-[#5f6368] mt-0.5 leading-relaxed">
              Configure services, shop background details, and custom review writing rules.
            </p>
          </div>
        </div>
      </div>

      {/* 2. ADD SERVICES */}
      <div className="bg-white border border-[#dadce0] rounded-xl p-5 sm:p-7 shadow-xs space-y-4">
        <div className="border-b border-[#dadce0] pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
              <Wrench className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[#202124]">
              Add Services
            </h3>
          </div>
          <span className="text-xs font-semibold text-[#1a73e8] bg-[#e8f0fe] px-3 py-1 rounded-full border border-[#d2e3fc]">
            {servicesList.length} Services Added
          </span>
        </div>

        <p className="text-xs text-[#5f6368] leading-relaxed">
          Add your business services below (e.g., <strong>Computer Repair</strong>, <strong>Gaming PC Build</strong>). When customers draft 5-star reviews or receive AI replies, Gemini will specifically highlight these offerings.
        </p>

        {/* Input & Add Button */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newServiceInput}
            onChange={(e) => setNewServiceInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddService();
              }
            }}
            placeholder="Enter service name (e.g., Computer Repair, Gaming PC Build...)"
            className="flex-1 px-3.5 py-2.5 bg-white border border-[#dadce0] rounded-lg text-xs sm:text-sm text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] shadow-2xs"
          />
          <button
            type="button"
            onClick={handleAddService}
            disabled={!newServiceInput.trim()}
            className="px-5 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white font-medium rounded-lg text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service</span>
          </button>
        </div>

        {/* Current Services List */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-[#5f6368] mb-2">
            Active Services List:
          </label>
          {servicesList.length === 0 ? (
            <div className="p-4 bg-[#f8f9fa] border border-dashed border-[#dadce0] rounded-xl text-center text-xs text-[#5f6368]">
              No services added yet. Type a service name above and click "Add Service".
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {servicesList.map((service, index) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc] rounded-lg text-xs font-medium shadow-2xs group"
                >
                  <span>{service}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveService(index)}
                    className="text-[#1a73e8] hover:text-[#d93025] p-0.5 rounded transition-colors cursor-pointer"
                    title={`Remove ${service}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. SHOP AI DETAILS (Auto-expanding textarea, no resize grip) */}
      <div className="bg-white border border-[#dadce0] rounded-xl p-5 sm:p-7 shadow-xs space-y-4">
        <div className="border-b border-[#dadce0] pb-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
            <Store className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-[#202124]">
            Shop AI Details
          </h3>
        </div>

        <p className="text-xs text-[#5f6368] leading-relaxed">
          Provide key background facts about your business, years of experience, specialized equipment, warranty policies, turnaround speed, or customer guarantees that Gemini AI should reference.
        </p>

        <div>
          <label className="block text-xs font-semibold text-[#5f6368] mb-1.5">
            Shop AI Details Description
          </label>
          <textarea
            ref={shopDetailsRef}
            rows={4}
            value={shopAiDetails}
            onChange={(e) => {
              setShopAiDetails(e.target.value);
              autoResizeTextarea(e.target);
            }}
            placeholder="e.g., We have over 8 years of trusted experience in desktop and laptop repairs. We specialize in custom gaming PC builds with 6 to 12 months official replacement warranty on all genuine components. Same-day diagnostics and friendly, honest turnaround available..."
            className="w-full p-3.5 bg-white border border-[#dadce0] rounded-lg text-xs sm:text-sm text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] shadow-2xs leading-relaxed resize-none overflow-hidden transition-[height] duration-75"
          />
          <div className="flex items-center justify-between text-[11px] text-[#5f6368] mt-1">
            <span>Tip: The more detailed this description is, the more personalized and authentic your AI reviews will be. (Auto-expands as you type)</span>
            <span>{shopAiDetails.length} characters</span>
          </div>
        </div>
      </div>

      {/* 4. REVIEW STYLE & RULES (Unified single auto-grow input box) */}
      <div className="bg-white border border-[#dadce0] rounded-xl p-5 sm:p-7 shadow-xs space-y-4">
        <div className="border-b border-[#dadce0] pb-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-[#202124]">
            Review Style &amp; Rules
          </h3>
        </div>

        <p className="text-xs text-[#5f6368] leading-relaxed">
          Instruct Gemini AI on your preferred review tone, formatting rules, customer perspectives, and guardrails when drafting Google reviews and owner responses.
        </p>

        <div>
          <label className="block text-xs font-semibold text-[#5f6368] mb-1.5">
            Review Style &amp; Writing Rules
          </label>
          <textarea
            ref={styleRulesRef}
            rows={4}
            value={reviewStyleAndRules}
            onChange={(e) => {
              setReviewStyleAndRules(e.target.value);
              autoResizeTextarea(e.target);
            }}
            placeholder="e.g.,&#10;• Maintain a warm, friendly, and authentic customer tone.&#10;• Always highlight the specific service received.&#10;• Avoid generic marketing slogans, buzzwords, or bot-like phrasing.&#10;• Keep reviews concise and realistic (2 to 4 sentences).&#10;• Mention fast turnaround time, honest pricing, and warranty coverage."
            className="w-full p-3.5 bg-white border border-[#dadce0] rounded-lg text-xs sm:text-sm text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] shadow-2xs leading-relaxed resize-none overflow-hidden transition-[height] duration-75"
          />
          <div className="flex items-center justify-between text-[11px] text-[#5f6368] mt-1">
            <span>Tone, perspective, and rules can all be entered here together. (Auto-expands as you type)</span>
            <span>{reviewStyleAndRules.length} characters</span>
          </div>
        </div>
      </div>

      {/* 5. CUSTOMER REVIEW LANGUAGES (Indian Regional Distribution with % Allocation) */}
      <LanguageDistributionManager
        languages={languages}
        onChange={setLanguages}
      />

      {/* 6. Save Button */}
      <div className="bg-white border border-[#dadce0] rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-[#5f6368] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#137333]" />
          <span>All services, shop details, review writing rules, and language percentages are saved directly to your cloud profile.</span>
        </div>

        <button
          type="button"
          onClick={handleSaveAiReviewConfiguration}
          disabled={savingConfig}
          className="w-full sm:w-auto px-7 py-3 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white font-medium rounded-lg text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          {savingConfig ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save AI Review Settings</span>
        </button>
      </div>
    </div>
  );
}
