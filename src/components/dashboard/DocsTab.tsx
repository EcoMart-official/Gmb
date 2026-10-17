import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  Sparkles,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

export function DocsTab() {
  const { showSuccess, showError } = useToast();

  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [maskedKey, setMaskedKey] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Load current API key status
  const loadKeyStatus = async () => {
    setLoading(true);
    try {
      const res = await api.getGeminiApiKey();
      setIsConfigured(Boolean(res.configured));
      if (res.maskedKey) {
        setMaskedKey(res.maskedKey);
      }
      if (res.key) {
        setApiKey(res.key);
      }
    } catch (err) {
      console.error('Failed to load Gemini API key status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKeyStatus();
  }, []);

  // Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      showError('Please enter your Gemini API key before saving.');
      return;
    }

    setSaving(true);
    setTestResult(null);
    try {
      const res = await api.saveGeminiApiKey(apiKey.trim());
      if (res.error) {
        showError(res.error);
      } else {
        showSuccess('Gemini API Key saved and activated successfully.');
        setIsConfigured(true);
        await loadKeyStatus();
      }
    } catch {
      showError('Failed to save API key. Please check your network connection.');
    } finally {
      setSaving(false);
    }
  };

  // Handle Test Connection
  const handleTestConnection = async () => {
    const keyToTest = apiKey.trim();
    if (!keyToTest && !isConfigured) {
      showError('Please enter or save an API key first.');
      return;
    }

    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.testGeminiApiKey(keyToTest || undefined);
      if (res.success) {
        setTestResult({
          success: true,
          message: res.message || 'Connected to Gemini 3.8 Flash successfully!',
        });
        showSuccess('Gemini API test passed successfully!');
      } else {
        setTestResult({
          success: false,
          message: res.error || 'Failed to authenticate with Gemini API.',
        });
        showError(res.error || 'Gemini API test failed.');
      }
    } catch {
      setTestResult({
        success: false,
        message: 'Network request error while testing API key.',
      });
      showError('Network error while testing API key.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Page Header */}
      <div className="bg-white border border-[#dadce0] rounded-xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0 shadow-2xs">
              <Sparkles className="w-6 h-6 text-[#1a73e8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#1a73e8] uppercase tracking-wider">
                  Google AI Studio
                </span>
                <span className="text-[#dadce0]">&bull;</span>
                <span className="text-xs font-medium text-[#5f6368]">
                  Gemini 3.8 Flash
                </span>
              </div>
              <h2 className="text-xl font-bold text-[#202124] mt-0.5">
                Gemini AI API Configuration
              </h2>
              <p className="text-xs sm:text-sm text-[#5f6368] mt-0.5 leading-relaxed">
                Configure your Gemini API key to power organic review draft generation and automatic customer review replies.
              </p>
            </div>
          </div>

          {/* Real-time Status Badge */}
          <div className="shrink-0">
            {loading ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#f1f3f4] text-[#5f6368]">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Checking...</span>
              </span>
            ) : isConfigured ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#e6f4ea] text-[#137333] border border-[#ceead6]">
                <CheckCircle2 className="w-4 h-4 text-[#1e8e3e]" />
                <span>API Key Active</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#fef7e0] text-[#b06000] border border-[#feefc3]">
                <AlertCircle className="w-4 h-4 text-[#b06000]" />
                <span>Key Not Configured</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* API Key Input & Save Card */}
      <div className="bg-white border border-[#dadce0] rounded-xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="border-b border-[#dadce0] pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#1a73e8]" />
            <h3 className="font-bold text-sm text-[#202124]">
              Gemini API Key
            </h3>
          </div>

          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-[#1a73e8] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Get Key from Google AI Studio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#5f6368] mb-1.5">
              Enter your Gemini API Key
            </label>

            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#5f6368] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showKey ? 'text' : 'password'}
                required
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setTestResult(null);
                }}
                placeholder={maskedKey || 'Paste your Gemini API key here (e.g., AIzaSy... or AQ.Ab8...)'}
                className="w-full pl-10 pr-24 py-3 bg-white border border-[#dadce0] rounded-lg text-sm font-mono text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors shadow-2xs"
              />

              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {apiKey && (
                  <button
                    type="button"
                    onClick={() => setApiKey('')}
                    className="p-1.5 text-xs text-[#5f6368] hover:text-[#202124] rounded hover:bg-[#f1f3f4]"
                    title="Clear input"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1.5 text-[#5f6368] hover:text-[#202124] rounded hover:bg-[#f1f3f4] cursor-pointer"
                  title={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-[#5f6368] mt-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#137333]" />
              <span>Your API key is securely stored server-side and never exposed to public website visitors.</span>
            </p>
          </div>

          {/* Action Buttons: Save Key & Test Connection */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing || (!apiKey.trim() && !isConfigured)}
              className="px-4 py-2.5 bg-white hover:bg-[#f8f9fa] border border-[#dadce0] text-[#1a73e8] font-medium rounded-lg text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Test API Connection</span>
            </button>

            <button
              type="submit"
              disabled={saving || !apiKey.trim()}
              className="px-6 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white font-medium rounded-lg text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save API Key</span>
            </button>
          </div>

          {/* Test Connection Output */}
          {testResult && (
            <div
              className={`p-3.5 rounded-lg border text-xs flex items-start gap-2.5 mt-2 ${
                testResult.success
                  ? 'bg-[#e6f4ea] border-[#ceead6] text-[#137333]'
                  : 'bg-[#fce8e6] border-[#f5c2c7] text-[#c5221f]'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#1e8e3e]" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#c5221f]" />
              )}
              <div className="flex-1 font-medium">{testResult.message}</div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
