import React from 'react';
import { Star, CheckCircle2, ShieldCheck, Sparkles, Coffee, Award, Heart, Zap } from 'lucide-react';
import { BusinessSettings } from '../../types';
import { StandTemplate } from './ReviewLinkTab';
import { GOOGLE_QR_CENTER_LOGO } from '../../constants/qrLogo';

interface StandPreviewCardProps {
  template: StandTemplate;
  settings: BusinessSettings;
  qrDataUrl: string;
}

export function StandPreviewCard({ template, settings, qrDataUrl }: StandPreviewCardProps) {
  const bizName = settings.businessName || 'Your Business Name';
  const logo = settings.businessLogo;

  // 1. OFFICIAL GOOGLE CANOPY & CARD
  if (template.layoutType === 'official-google') {
    return (
      <div className="w-full max-w-xs mx-auto bg-white rounded-2xl shadow-xl border-2 border-[#dadce0] overflow-hidden text-center relative transition-all duration-300">
        {/* Google 4-color top stripe */}
        <div className="h-2 w-full flex">
          <span className="w-1/4 bg-[#4285f4]" />
          <span className="w-1/4 bg-[#ea4335]" />
          <span className="w-1/4 bg-[#fbbc05]" />
          <span className="w-1/4 bg-[#34a853]" />
        </div>

        <div className="p-6 space-y-3.5">
          {/* Official Google Canopy Header Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f0fe] border border-[#d2e3fc] text-[#1a73e8]">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M4 10V19C4 19.5523 4.44772 20 5 20H19C19.5523 20 20 19.5523 20 19V10" stroke="#1A73E8" strokeWidth="2" strokeLinecap="round"/>
              <path d="M2 7L4.5 4H19.5L22 7L20 10H4L2 7Z" fill="#1A73E8"/>
              <path d="M7 10C7 11.1046 6.10457 12 5 12C3.89543 12 3 11.1046 3 10" stroke="#EA4335" strokeWidth="2"/>
              <path d="M11 10C11 11.1046 10.1046 12 9 12C7.89543 12 7 11.1046 7 10" stroke="#FBBC04" strokeWidth="2"/>
              <path d="M15 10C15 11.1046 14.1046 12 13 12C11.8954 12 11 11.1046 11 10" stroke="#34A853" strokeWidth="2"/>
              <path d="M19 10C19 11.1046 18.1046 12 17 12C15.8954 12 15 11.1046 15 10" stroke="#1A73E8" strokeWidth="2"/>
            </svg>
            <span className="text-[11px] font-bold tracking-wide uppercase">Google Business Reviews</span>
          </div>

          {/* Logo if present */}
          {logo && (
            <div className="w-14 h-14 mx-auto rounded-xl border border-[#dadce0] p-1 bg-white flex items-center justify-center overflow-hidden shadow-2xs">
              <img src={logo} alt={bizName} className="w-full h-full object-contain" />
            </div>
          )}

          {/* Business Name with Verified checkmark */}
          <div className="flex items-center justify-center gap-1.5 px-2">
            <h4 className="font-extrabold text-base text-[#202124] leading-tight line-clamp-1">{bizName}</h4>
            <CheckCircle2 className="w-4 h-4 text-[#1a73e8] shrink-0 fill-current text-white" />
          </div>

          {/* 5-Star Rating Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#fef7e0] border border-[#feefc3] rounded-full">
            <div className="flex text-[#fbbc04]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <span className="text-[11px] font-bold text-[#b06000]">5.0 Rating</span>
          </div>

          {/* QR Code Container with Center Logo */}
          {qrDataUrl && (
            <div className="relative inline-block p-2 bg-white rounded-xl border border-[#dadce0] shadow-sm">
              <img src={qrDataUrl} alt="QR Code" className="w-36 h-36 rounded-lg" />
            </div>
          )}

          <div className="space-y-0.5 pt-1">
            <p className="text-xs font-bold text-[#202124]">Scan with your phone to review us!</p>
            <p className="text-[10px] text-[#5f6368]">Quick AI review drafts in 10 seconds &bull; Direct Google Maps</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. MODERN SPLIT-HERO PODIUM
  if (template.layoutType === 'split-hero') {
    return (
      <div className="w-full max-w-xs mx-auto rounded-2xl shadow-xl overflow-hidden border border-[#334155] bg-white text-center transition-all duration-300">
        {/* Dark Top Banner (40%) */}
        <div className="bg-[#0b1120] text-white p-5 pb-8 relative">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/30 text-cyan-400 text-[10px] font-bold tracking-widest uppercase mb-2">
            <Zap className="w-3 h-3" />
            <span>AI REVIEW PORTAL</span>
          </div>
          <h4 className="font-extrabold text-base text-white leading-tight px-2">{bizName}</h4>
          <div className="flex justify-center text-[#38bdf8] gap-1 mt-1.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-current" />
            ))}
          </div>
        </div>

        {/* Floating Pedestal QR overlapping boundary */}
        <div className="relative -mt-6 px-4 pb-5 pt-0">
          <div className="bg-white rounded-2xl p-3 shadow-lg border border-[#e2e8f0] inline-block">
            {qrDataUrl && <img src={qrDataUrl} alt="QR Code" className="w-36 h-36 rounded-xl" />}
          </div>

          <div className="mt-3 space-y-0.5">
            <p className="text-xs font-bold text-[#0f172a]">Point Camera to Review</p>
            <p className="text-[10px] text-[#64748b]">Instant AI Draft &bull; Verified Google Reviews</p>
          </div>
        </div>
      </div>
    );
  }

  // 3. LUXURY GOLD CREST & ORNATE FRAME
  if (template.layoutType === 'luxury-crest') {
    return (
      <div className="w-full max-w-xs mx-auto bg-[#0a1128] text-white rounded-2xl shadow-xl border-4 border-[#d97706] p-5 text-center relative overflow-hidden transition-all duration-300">
        {/* Ornate corner brass accents */}
        <div className="absolute top-1 left-1 text-[#f59e0b] text-[10px]">⚜</div>
        <div className="absolute top-1 right-1 text-[#f59e0b] text-[10px]">⚜</div>
        <div className="absolute bottom-1 left-1 text-[#f59e0b] text-[10px]">⚜</div>
        <div className="absolute bottom-1 right-1 text-[#f59e0b] text-[10px]">⚜</div>

        {/* Thin inner gold hairline */}
        <div className="border border-[#b45309]/50 rounded-xl p-4 space-y-3">
          <div className="text-[9px] font-bold tracking-[0.2em] text-[#fbbf24] uppercase border-b border-[#d97706]/40 pb-1.5 flex items-center justify-center gap-1">
            <span>EXCELLENCE &amp; REPUTATION</span>
          </div>

          {logo ? (
            <div className="w-12 h-12 mx-auto rounded-full border-2 border-[#d97706] p-1 bg-white flex items-center justify-center shadow-md">
              <img src={logo} alt={bizName} className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-10 h-10 mx-auto rounded-full border border-[#f59e0b] bg-[#1e293b] flex items-center justify-center text-[#f59e0b]">
              <Award className="w-5 h-5" />
            </div>
          )}

          <h4 className="font-serif font-bold text-base text-white tracking-wide">{bizName}</h4>

          <div className="flex justify-center items-center gap-1 text-[#f59e0b]">
            <span>—</span>
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-current" />
            ))}
            <span>—</span>
          </div>

          {/* Luxury gold framed QR container */}
          {qrDataUrl && (
            <div className="p-2 bg-white rounded-xl inline-block border-2 border-[#d97706] shadow-md">
              <img src={qrDataUrl} alt="QR Code" className="w-32 h-32 rounded-lg" />
            </div>
          )}

          <div className="space-y-0.5 pt-1">
            <p className="text-xs font-semibold text-[#fde68a]">Your Experience is Our Honor</p>
            <p className="text-[10px] text-[#94a3b8]">Scan with phone &bull; 10s AI Feedback</p>
          </div>
        </div>
      </div>
    );
  }

  // 4. SCANDINAVIAN ARCHITECTURAL NOIR
  if (template.layoutType === 'scandi-minimal') {
    return (
      <div className="w-full max-w-xs mx-auto bg-white rounded-2xl shadow-xl border-4 border-black p-5 text-center relative transition-all duration-300">
        <div className="border border-black/40 rounded-xl p-4 space-y-3">
          {/* Monospace coordinates tag */}
          <div className="text-[9px] font-mono font-bold tracking-widest text-zinc-500 uppercase">
            [ RATE YOUR EXPERIENCE ]
          </div>

          {logo && (
            <div className="w-12 h-12 mx-auto border-2 border-black p-1 bg-white flex items-center justify-center">
              <img src={logo} alt={bizName} className="w-full h-full object-contain grayscale" />
            </div>
          )}

          <h4 className="font-extrabold text-lg text-black uppercase tracking-tight">{bizName}</h4>

          {/* Solid black stars */}
          <div className="flex justify-center text-black gap-1.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-current" />
            ))}
          </div>

          {/* Stark camera focus frame */}
          {qrDataUrl && (
            <div className="relative p-2 bg-white border-2 border-black inline-block">
              {/* L-brackets on 4 corners */}
              <span className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-black" />
              <span className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-black" />
              <span className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-black" />
              <span className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-black" />
              <img src={qrDataUrl} alt="QR Code" className="w-32 h-32" />
            </div>
          )}

          <div className="pt-1">
            <p className="text-xs font-mono font-bold text-black uppercase">Instant Mobile Review</p>
            <p className="text-[10px] font-mono text-zinc-500">Fast AI Assistant &bull; Direct Google Maps</p>
          </div>
        </div>
      </div>
    );
  }

  // 5. EMERALD ECO & WELLNESS CAPSULE
  if (template.layoutType === 'emerald-wellness') {
    return (
      <div className="w-full max-w-xs mx-auto bg-[#f0fdf4] text-[#064e3b] rounded-3xl shadow-xl border-2 border-[#86efac] p-5 text-center relative overflow-hidden transition-all duration-300">
        {/* Soft wave background tint */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold tracking-wider uppercase">VERIFIED CLIENT CARE</span>
          </div>

          {logo && (
            <div className="w-14 h-14 mx-auto rounded-2xl border border-[#86efac] p-1 bg-white flex items-center justify-center shadow-xs">
              <img src={logo} alt={bizName} className="w-full h-full object-contain" />
            </div>
          )}

          <h4 className="font-extrabold text-base text-[#064e3b] leading-tight px-2">{bizName}</h4>

          <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-white border border-[#bbf7d0] shadow-2xs">
            <div className="flex text-[#10b981]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <span className="text-[10px] font-bold text-[#047857]">Trusted Care</span>
          </div>

          {/* Pebble smooth QR container */}
          {qrDataUrl && (
            <div className="p-2.5 bg-white rounded-2xl border-2 border-[#86efac] inline-block shadow-sm">
              <img src={qrDataUrl} alt="QR Code" className="w-32 h-32 rounded-xl" />
            </div>
          )}

          <div className="space-y-0.5">
            <p className="text-xs font-bold text-[#064e3b]">Share Your Wellness Experience</p>
            <p className="text-[10px] text-[#047857]">Scan with your smartphone camera</p>
          </div>
        </div>
      </div>
    );
  }

  // 6. VINTAGE BISTRO & WOODCRAFT STITCH
  if (template.layoutType === 'artisan-vintage') {
    return (
      <div className="w-full max-w-xs mx-auto bg-[#fefce8] text-[#422006] rounded-2xl shadow-xl border-2 border-[#ca8a04] p-5 text-center relative transition-all duration-300">
        {/* Dashed stitched vintage border */}
        <div className="border-2 border-dashed border-[#ca8a04]/60 rounded-xl p-4 space-y-3">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#fef08a] border border-[#eab308] text-[#854d0e] text-[10px] font-bold uppercase tracking-wider">
            <Coffee className="w-3 h-3" />
            <span>ARTISAN CRAFT &amp; SERVICE</span>
          </div>

          {logo && (
            <div className="w-12 h-12 mx-auto rounded-full border-2 border-[#ca8a04] p-1 bg-white flex items-center justify-center shadow-xs">
              <img src={logo} alt={bizName} className="w-full h-full object-contain" />
            </div>
          )}

          <h4 className="font-serif font-extrabold text-base text-[#422006] leading-tight">{bizName}</h4>

          <div className="flex justify-center items-center gap-1.5 text-[#ca8a04]">
            <span className="font-bold">—</span>
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-current" />
            ))}
            <span className="font-bold">—</span>
          </div>

          {qrDataUrl && (
            <div className="p-2 bg-white rounded-xl border-2 border-[#ca8a04] inline-block shadow-xs">
              <img src={qrDataUrl} alt="QR Code" className="w-32 h-32 rounded-lg" />
            </div>
          )}

          <div className="space-y-0.5 pt-1">
            <p className="text-xs font-bold text-[#422006]">Loved Your Visit? Review Us!</p>
            <p className="text-[10px] text-[#713f12]">We appreciate your local community support</p>
          </div>
        </div>
      </div>
    );
  }

  // 7. CYBERPUNK HUD & NEON TERMINAL
  if (template.layoutType === 'cyber-hud') {
    return (
      <div className="w-full max-w-xs mx-auto bg-[#070b14] text-white rounded-2xl shadow-xl border-2 border-cyan-400 p-5 text-center relative overflow-hidden transition-all duration-300">
        {/* Top Tech HUD Banner */}
        <div className="flex items-center justify-between text-[9px] font-mono text-cyan-400 border-b border-cyan-400/30 pb-2 mb-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            HUD // ONLINE
          </span>
          <span>GEMINI 3.8 AI</span>
        </div>

        {logo && (
          <div className="w-12 h-12 mx-auto rounded-lg border-2 border-cyan-400 p-1 bg-[#0b1120] flex items-center justify-center mb-2">
            <img src={logo} alt={bizName} className="w-full h-full object-contain" />
          </div>
        )}

        <h4 className="font-mono font-extrabold text-base text-cyan-300 tracking-wider mb-2">{bizName}</h4>

        <div className="flex justify-center text-cyan-400 gap-1.5 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-current" />
          ))}
        </div>

        {/* Holographic QR box with corner neon brackets */}
        {qrDataUrl && (
          <div className="relative p-2 bg-white rounded-xl inline-block border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <img src={qrDataUrl} alt="QR Code" className="w-32 h-32 rounded-lg" />
          </div>
        )}

        <div className="mt-3 space-y-0.5">
          <p className="text-xs font-mono font-bold text-cyan-300 tracking-wide">SCAN TO INITIALIZE REVIEW</p>
          <p className="text-[10px] font-mono text-slate-400">Target Google Review Submission</p>
        </div>
      </div>
    );
  }

  // 8. ROSE VELVET & GLAMOUR ARCH
  if (template.layoutType === 'rose-boutique') {
    return (
      <div className="w-full max-w-xs mx-auto bg-[#fdf2f8] text-[#831843] rounded-3xl shadow-xl border-2 border-[#f472b6] p-5 text-center relative overflow-hidden transition-all duration-300">
        {/* Arch header canopy */}
        <div className="w-full border-b border-[#fbcfe8] pb-2 mb-3">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#db2777] tracking-wider uppercase">
            <Heart className="w-3 h-3 fill-current" />
            <span>Love Your Experience?</span>
          </span>
        </div>

        {logo && (
          <div className="w-12 h-12 mx-auto rounded-full border-2 border-[#f472b6] p-1 bg-white flex items-center justify-center shadow-xs mb-2">
            <img src={logo} alt={bizName} className="w-full h-full object-contain" />
          </div>
        )}

        <h4 className="font-serif font-bold text-base text-[#831843] mb-1.5">{bizName}</h4>

        <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-white border border-[#fbcfe8] shadow-2xs mb-3">
          <div className="flex text-[#f59e0b]">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-current" />
            ))}
          </div>
        </div>

        {qrDataUrl && (
          <div className="p-2 bg-white rounded-2xl border-2 border-[#f472b6] inline-block shadow-sm">
            <img src={qrDataUrl} alt="QR Code" className="w-32 h-32 rounded-xl" />
          </div>
        )}

        <div className="mt-3 space-y-0.5">
          <p className="text-xs font-bold text-[#9d174d]">Scan to Share Your Glow</p>
          <p className="text-[10px] text-[#db2777]">AI review suggestions in seconds</p>
        </div>
      </div>
    );
  }

  // 9. DYNAMIC SUNSET BURST (ANGLED HEADER)
  if (template.layoutType === 'dynamic-burst') {
    return (
      <div className="w-full max-w-xs mx-auto bg-white rounded-2xl shadow-xl border-2 border-[#fdba74] overflow-hidden text-center relative transition-all duration-300">
        {/* Dynamic diagonal angled banner */}
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 text-white p-4 pb-6 transform -skew-y-2 -mt-2">
          <div className="transform skew-y-2 pt-1 space-y-1">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-black/25 text-white text-[10px] font-extrabold uppercase tracking-wider">
              🔥 GREAT EXPERIENCE? 🔥
            </span>
            <h4 className="font-extrabold text-base leading-tight px-1">{bizName}</h4>
          </div>
        </div>

        <div className="p-4 pt-3 space-y-3">
          <div className="flex justify-center text-[#f59e0b] gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current drop-shadow-xs" />
            ))}
          </div>

          {qrDataUrl && (
            <div className="p-2 bg-white rounded-xl border-2 border-[#ea580c] inline-block shadow-md">
              <img src={qrDataUrl} alt="QR Code" className="w-34 h-34 rounded-lg" />
            </div>
          )}

          <div className="space-y-0.5">
            <p className="text-xs font-extrabold text-[#c2410c]">Tap or Scan to Review</p>
            <p className="text-[10px] text-[#7c2d12]">Draft your 5-star review in 10 seconds!</p>
          </div>
        </div>
      </div>
    );
  }

  // 10. CORPORATE COBALT EXECUTIVE (VERTICAL STRIPE PLAQUE)
  return (
    <div className="w-full max-w-xs mx-auto bg-white rounded-2xl shadow-xl border border-[#dadce0] overflow-hidden text-left relative flex transition-all duration-300">
      {/* Left Vertical Cobalt Accent Stripe */}
      <div className="w-4 bg-[#1e3a8a] shrink-0 border-r border-[#172554]" />

      <div className="p-5 flex-1 text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#e0e7ff] text-[#1e3a8a] text-[10px] font-bold tracking-wider uppercase">
          <ShieldCheck className="w-3.5 h-3.5 text-[#1e3a8a]" />
          <span>CLIENT SATISFACTION INDEX</span>
        </div>

        {logo && (
          <div className="w-12 h-12 mx-auto rounded-lg border border-[#cbd5e1] p-1 bg-white flex items-center justify-center shadow-2xs">
            <img src={logo} alt={bizName} className="w-full h-full object-contain" />
          </div>
        )}

        <h4 className="font-bold text-base text-[#0f172a] leading-tight">{bizName}</h4>

        <div className="flex justify-center text-[#1e3a8a] gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-current text-[#f59e0b]" />
          ))}
        </div>

        {qrDataUrl && (
          <div className="p-2 bg-white rounded-lg border-2 border-[#1e3a8a] inline-block shadow-sm">
            <img src={qrDataUrl} alt="QR Code" className="w-32 h-32 rounded" />
          </div>
        )}

        <div className="space-y-0.5 pt-1">
          <p className="text-xs font-bold text-[#0f172a]">Verified Client Feedback</p>
          <p className="text-[10px] text-[#64748b]">Direct Submission to Google Maps</p>
        </div>
      </div>
    </div>
  );
}
