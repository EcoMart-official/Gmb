import React, { useState, useEffect } from 'react';
import {
  Link as LinkIcon,
  Copy,
  Check,
  QrCode,
  Download,
  Printer,
  Smartphone,
  Star,
  RefreshCw,
} from 'lucide-react';
import { BusinessSettings } from '../../types';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

interface ReviewLinkTabProps {
  settings: BusinessSettings;
  onOpenPublicPage: () => void;
  onUpdateSlug: (newSlug: string) => void;
}

export function ReviewLinkTab({
  settings,
  onOpenPublicPage,
  onUpdateSlug,
}: ReviewLinkTabProps) {
  const { showSuccess, showError } = useToast();
  const [copied, setCopied] = useState(false);
  const [slug, setSlug] = useState(settings.customSlug || 'my-store');
  const [editingSlug, setEditingSlug] = useState(false);
  const [savingSlug, setSavingSlug] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loadingQr, setLoadingQr] = useState<boolean>(true);

  const fullReviewUrl = `${window.location.origin}/review/${settings.customSlug}`;

  useEffect(() => {
    let isMounted = true;
    setLoadingQr(true);
    api.getQrCode(fullReviewUrl)
      .then((data) => {
        if (isMounted && data.qrDataUrl) {
          setQrDataUrl(data.qrDataUrl);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoadingQr(false);
      });

    return () => {
      isMounted = false;
    };
  }, [fullReviewUrl]);

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullReviewUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = fullReviewUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      showSuccess('Review landing page URL copied to clipboard.');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      showError('Unable to copy to clipboard.');
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${settings.customSlug || 'business'}-review-qr-code.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showSuccess('QR code image downloaded.');
  };

  const handlePrintTent = () => {
    window.print();
  };

  const handleSaveSlug = async () => {
    const sanitized = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
    if (!sanitized) {
      showError('Slug cannot be empty.');
      return;
    }

    setSavingSlug(true);
    try {
      const res = await api.updateBusinessSettings({ customSlug: sanitized });
      if (res.error) {
        showError(res.error);
      } else {
        showSuccess('Custom review URL slug updated.');
        setEditingSlug(false);
        onUpdateSlug(sanitized);
      }
    } catch {
      showError('Failed to update URL slug.');
    } finally {
      setSavingSlug(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white border border-[#dadce0] rounded-xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#202124]">
                Review Landing Page Link & QR Code
              </h2>
              <p className="text-xs sm:text-sm text-[#5f6368] mt-0.5">
                Share this dedicated link or print counter QR stands for customer tables. Visitors generate customized review drafts with Gemini before posting to Google Maps.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom URL Card */}
      <div className="bg-white border border-[#dadce0] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#5f6368] uppercase tracking-wider">
            Your Dedicated Customer Review Landing Page
          </span>
          <button
            onClick={() => setEditingSlug(!editingSlug)}
            className="text-xs text-[#1a73e8] font-medium hover:underline cursor-pointer"
          >
            {editingSlug ? 'Cancel' : 'Edit URL Slug'}
          </button>
        </div>

        {editingSlug ? (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center px-3 py-2 bg-[#f1f3f4] rounded-md text-xs text-[#5f6368] font-mono">
              {window.location.origin}/review/
            </div>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="flex-1 px-3 py-2 bg-white border border-[#dadce0] rounded-md text-sm font-medium font-mono text-[#202124] focus:outline-none focus:border-[#1a73e8]"
            />
            <button
              onClick={handleSaveSlug}
              disabled={savingSlug}
              className="px-4 py-2 bg-[#1a73e8] text-white rounded-md text-xs font-medium hover:bg-[#1557b0]"
            >
              {savingSlug ? 'Saving...' : 'Save Slug'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-[#f8f9fa] rounded-lg border border-[#dadce0]">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <LinkIcon className="w-4 h-4 text-[#1a73e8] shrink-0" />
              <span className="text-sm font-mono font-medium text-[#202124] truncate">
                {fullReviewUrl}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopyLink}
                className={`px-4 py-2 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                  copied
                    ? 'bg-[#1e8e3e] text-white'
                    : 'bg-[#1a73e8] hover:bg-[#1557b0] text-white'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Link'}</span>
              </button>

              <button
                onClick={onOpenPublicPage}
                className="px-3.5 py-2 bg-white hover:bg-[#f1f3f4] border border-[#dadce0] text-[#3c4043] rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#5f6368]" />
                <span>Test Page</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* QR Code and Printable Table Stand Card Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code Preview & Direct Download */}
        <div className="bg-white border border-[#dadce0] rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#202124] mb-1.5">
              High-Resolution QR Code (Digital)
            </h3>
            <p className="text-xs text-[#5f6368] mb-6 leading-relaxed">
              Scan with your mobile camera to test the experience immediately. Optimized for high contrast and indoor store lighting.
            </p>

            <div className="flex justify-center p-6 bg-[#f8f9fa] rounded-xl border border-[#dadce0] max-w-xs mx-auto">
              {loadingQr ? (
                <div className="w-48 h-48 flex items-center justify-center text-[#5f6368]">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                <img
                  src={qrDataUrl}
                  alt={`QR code for ${settings.businessName}`}
                  className="w-52 h-52 rounded-md shadow-xs bg-white p-2"
                />
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#dadce0] flex items-center justify-between">
            <span className="text-xs text-[#5f6368]">Format: PNG (1024x1024px)</span>
            <button
              onClick={handleDownloadQr}
              disabled={!qrDataUrl}
              className="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-md text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG Image</span>
            </button>
          </div>
        </div>

        {/* Printable Table Tent Display Preview */}
        <div className="bg-white border border-[#dadce0] rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="font-bold text-sm text-[#202124]">
                Printable Counter Tent / Table Stand
              </h3>
              <span className="text-[11px] font-medium text-[#1a73e8] bg-[#e8f0fe] px-2 py-0.5 rounded-md">
                In-Store Ready
              </span>
            </div>
            <p className="text-xs text-[#5f6368] mb-4 leading-relaxed">
              Formatted counter display you can print and place directly beside point-of-sale terminals or tables.
            </p>

            {/* Tent Card Preview Container */}
            <div className="border border-[#dadce0] rounded-xl p-6 bg-white text-center max-w-xs mx-auto shadow-xs">
              <div className="text-xs font-bold text-[#1a73e8] uppercase tracking-wider mb-1">
                Google Business Reviews
              </div>
              <h4 className="font-extrabold text-base text-[#202124] leading-tight mb-2">
                {settings.businessName || 'Our Business'}
              </h4>

              <div className="flex justify-center gap-1 text-[#f9ab00] mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>

              {qrDataUrl && (
                <div className="bg-white p-2 rounded-lg inline-block mb-3 border border-[#dadce0]">
                  <img src={qrDataUrl} alt="QR Code" className="w-32 h-32" />
                </div>
              )}

              <p className="text-[11px] text-[#5f6368] font-medium">
                Scan with your phone to create your review draft in 10 seconds!
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#dadce0] flex items-center justify-between">
            <span className="text-xs text-[#5f6368]">Standard 4x6" table tent format</span>
            <button
              onClick={handlePrintTent}
              className="px-4 py-2 bg-white hover:bg-[#f8f9fa] border border-[#dadce0] text-[#1a73e8] rounded-md text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Table Card</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
