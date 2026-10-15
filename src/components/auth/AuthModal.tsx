import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

type AuthMode = 'login' | 'register' | 'otp_verify' | 'forgot_password' | 'reset_password';

interface AuthModalProps {
  initialMode?: AuthMode;
  onSuccess?: () => void;
}

export function AuthModal({ initialMode = 'login', onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [otpCode, setOtpCode] = useState('');
  const [otpPurpose, setOtpPurpose] = useState<'registration' | 'password_reset'>('registration');
  const [cooldown, setCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);
  const passwordsMatch = password && confirmPassword ? password === confirmPassword : true;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (mode === 'otp_verify' && cooldown > 0) {
      setCanResend(false);
      timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (cooldown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [mode, cooldown]);

  const handleQuickDemoFill = () => {
    setEmail('demo@business.com');
    setPassword('DemoPass123!');
    setErrorMessage('');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName || !email || !mobileNumber || !password || !confirmPassword) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (!hasMinLength) {
      setErrorMessage('Password must contain at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.register({
        fullName,
        email,
        mobileNumber,
        password,
        confirmPassword,
      });

      if (res.error) {
        setErrorMessage(res.error);
      } else {
        showSuccess(res.message || 'Verification code sent to your email.');
        if (res.debugOtp) {
          setDevOtpHint(res.debugOtp);
        }
        setOtpPurpose('registration');
        setCooldown(60);
        setMode('otp_verify');
      }
    } catch {
      setErrorMessage('An unexpected network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login({ email, password });
      if (res.error) {
        setErrorMessage(res.error);
      } else if (res.token && res.user) {
        login(res.token, res.user);
        showSuccess(`Welcome back, ${res.user.fullName}!`);
        if (onSuccess) onSuccess();
      }
    } catch {
      setErrorMessage('Network connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!otpCode || otpCode.trim().length !== 6) {
      setErrorMessage('Please enter the full 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.verifyOtp({
        email,
        otpCode: otpCode.trim(),
        purpose: otpPurpose,
      });

      if (res.error) {
        setErrorMessage(res.error);
      } else {
        if (otpPurpose === 'registration') {
          login(res.token, res.user);
          showSuccess('Account successfully verified. Welcome!');
          if (onSuccess) onSuccess();
        } else if (otpPurpose === 'password_reset') {
          showSuccess('Verification code confirmed. Set your new password.');
          setMode('reset_password');
        }
      }
    } catch {
      setErrorMessage('Failed to verify code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || loading) return;
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await api.resendOtp({ email, purpose: otpPurpose });
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        showSuccess('A fresh verification code has been dispatched.');
        if (res.debugOtp) {
          setDevOtpHint(res.debugOtp);
        }
        setCooldown(60);
        setCanResend(false);
      }
    } catch {
      setErrorMessage('Failed to resend verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.forgotPassword(email);
      showSuccess(res.message);
      if (res.debugOtp) {
        setDevOtpHint(res.debugOtp);
      }
      setOtpPurpose('password_reset');
      setCooldown(60);
      setMode('otp_verify');
    } catch {
      setErrorMessage('Error initiating password reset.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!password || !confirmPassword) {
      setErrorMessage('Please enter and confirm your new password.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters in length.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.resetPassword({
        email,
        otpCode,
        newPassword: password,
        confirmPassword,
      });

      if (res.error) {
        setErrorMessage(res.error);
      } else {
        showSuccess(res.message || 'Password reset successfully.');
        setPassword('');
        setConfirmPassword('');
        setOtpCode('');
        setMode('login');
      }
    } catch {
      setErrorMessage('Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-[#dadce0] p-6 sm:p-8">
      {/* Brand Header */}
      <div className="text-center mb-6">
        {/* Google Store Canopy Icon */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white border border-[#dadce0] shadow-2xs mb-3">
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
        <h2 className="text-xl font-bold text-[#202124] tracking-tight">
          {mode === 'login' && 'Sign in'}
          {mode === 'register' && 'Create account'}
          {mode === 'otp_verify' && 'Verify your email'}
          {mode === 'forgot_password' && 'Account recovery'}
          {mode === 'reset_password' && 'Set new password'}
        </h2>
        <p className="text-xs text-[#5f6368] mt-1">
          {mode === 'login' && 'to continue to Google Business Profile Manager'}
          {mode === 'register' && 'with verified email OTP authentication'}
          {mode === 'otp_verify' && `Enter the 6-digit code sent to ${email}`}
          {mode === 'forgot_password' && 'Enter your registered email address'}
          {mode === 'reset_password' && 'Create a strong new password for your account'}
        </p>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-[#fce8e6] border border-[#f5c2c7] rounded-lg text-[#c5221f] text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="flex-1">{errorMessage}</span>
        </div>
      )}

      {/* Dev OTP Helper */}
      {devOtpHint && mode === 'otp_verify' && (
        <div className="mb-4 p-2.5 bg-[#e8f0fe] border border-[#d2e3fc] rounded-lg text-[#1a73e8] text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#1a73e8]" />
            <span>Dev code hint: <strong className="font-mono text-sm tracking-wider">{devOtpHint}</strong></span>
          </div>
          <button
            type="button"
            onClick={() => setOtpCode(devOtpHint)}
            className="text-[#1a73e8] font-semibold underline hover:text-[#1557b0]"
          >
            Auto-fill
          </button>
        </div>
      )}

      {/* ---------------- LOGIN FORM ---------------- */}
      {mode === 'login' && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#5f6368] mb-1">
              Email address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#5f6368] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#dadce0] rounded-md text-sm text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#5f6368]">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  setMode('forgot_password');
                }}
                className="text-xs text-[#1a73e8] hover:underline font-medium"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#5f6368] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-2.5 bg-white border border-[#dadce0] rounded-md text-sm text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5f6368] hover:text-[#202124]"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#5f6368]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-[#1a73e8] rounded border-[#dadce0] focus:ring-[#1a73e8]"
              />
              Stay signed in
            </label>
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="text-xs text-[#1a73e8] hover:underline"
            >
              Demo credentials
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white rounded-md font-medium text-sm shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign in</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center pt-3 border-t border-[#dadce0] text-xs text-[#5f6368]">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setErrorMessage('');
                setMode('register');
              }}
              className="text-[#1a73e8] font-semibold hover:underline"
            >
              Create account
            </button>
          </div>
        </form>
      )}

      {/* ---------------- REGISTER FORM ---------------- */}
      {mode === 'register' && (
        <form onSubmit={handleRegister} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#5f6368] mb-1">
              Full name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#5f6368] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Sarah Jenkins"
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#dadce0] rounded-md text-sm text-[#202124] focus:outline-none focus:border-[#1a73e8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5f6368] mb-1">
              Email address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#5f6368] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@business.com"
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#dadce0] rounded-md text-sm text-[#202124] focus:outline-none focus:border-[#1a73e8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5f6368] mb-1">
              Mobile number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#5f6368] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="+1 (555) 234-5678"
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#dadce0] rounded-md text-sm text-[#202124] focus:outline-none focus:border-[#1a73e8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5f6368] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#5f6368] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full pl-10 pr-11 py-2 bg-white border border-[#dadce0] rounded-md text-sm text-[#202124] focus:outline-none focus:border-[#1a73e8]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5f6368]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5f6368] mb-1">
              Confirm password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#5f6368] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type password"
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#dadce0] rounded-md text-sm text-[#202124] focus:outline-none focus:border-[#1a73e8]"
              />
            </div>
            {!passwordsMatch && (
              <p className="text-xs text-[#c5221f] mt-1">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white rounded-md font-medium text-sm shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Send verification code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center pt-2.5 border-t border-[#dadce0] text-xs text-[#5f6368]">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setErrorMessage('');
                setMode('login');
              }}
              className="text-[#1a73e8] font-semibold hover:underline"
            >
              Sign in
            </button>
          </div>
        </form>
      )}

      {/* ---------------- OTP VERIFICATION FORM ---------------- */}
      {mode === 'otp_verify' && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#5f6368]">
                Enter 6-digit verification code
              </label>
              <button
                type="button"
                onClick={async () => {
                  try {
                    if (navigator.clipboard && navigator.clipboard.readText) {
                      const text = await navigator.clipboard.readText();
                      const cleaned = text.replace(/\D/g, '').slice(0, 6);
                      if (cleaned) {
                        setOtpCode(cleaned);
                        setErrorMessage('');
                      }
                    }
                  } catch {
                    // Clipboard permission rejected
                  }
                }}
                className="text-xs text-[#1a73e8] font-medium hover:underline flex items-center gap-1"
              >
                <span>Paste from clipboard</span>
              </button>
            </div>

            {/* Visual 6-digit boxes display */}
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                autoFocus
                value={otpCode}
                onChange={(e) => {
                  setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setErrorMessage('');
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                  if (pastedData) {
                    setOtpCode(pastedData);
                    setErrorMessage('');
                  }
                }}
                placeholder="000000"
                className="w-full text-center text-3xl font-mono tracking-[0.5em] py-3.5 bg-white border-2 border-[#1a73e8] rounded-xl text-[#202124] focus:outline-none shadow-xs font-bold"
              />
              {otpCode.length > 0 && (
                <button
                  type="button"
                  onClick={() => setOtpCode('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#5f6368] hover:text-[#202124] px-1.5 py-0.5 rounded bg-[#f1f3f4]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Individual digit preview pills */}
            <div className="flex justify-center gap-2 mt-2">
              {[0, 1, 2, 3, 4, 5].map((index) => {
                const char = otpCode[index] || '';
                return (
                  <div
                    key={index}
                    className={`w-9 h-10 rounded-lg flex items-center justify-center font-mono text-lg font-bold border ${
                      char
                        ? 'border-[#1a73e8] bg-[#e8f0fe] text-[#1a73e8]'
                        : 'border-[#dadce0] bg-[#f8f9fa] text-transparent'
                    }`}
                  >
                    {char || '·'}
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-center text-[#5f6368] mt-2">
              Code expires in 10 minutes. Check your email inbox carefully.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || otpCode.length !== 6}
            className="w-full py-2.5 px-4 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white rounded-md font-medium text-sm shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Confirm & Complete'}
          </button>

          <div className="flex items-center justify-between pt-1 text-xs text-[#5f6368]">
            <span>Didn't get the code?</span>
            {canResend ? (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="font-semibold text-[#1a73e8] hover:underline"
              >
                Resend code
              </button>
            ) : (
              <span className="text-[#5f6368]">
                Resend in {cooldown}s
              </span>
            )}
          </div>

          <div className="text-center pt-2.5 border-t border-[#dadce0] text-xs">
            <button
              type="button"
              onClick={() => {
                setErrorMessage('');
                setMode(otpPurpose === 'registration' ? 'register' : 'forgot_password');
              }}
              className="text-[#5f6368] hover:text-[#202124] underline"
            >
              Back to edit email
            </button>
          </div>
        </form>
      )}

      {/* ---------------- FORGOT PASSWORD FORM ---------------- */}
      {mode === 'forgot_password' && (
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#5f6368] mb-1">
              Registered email address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#5f6368] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#dadce0] rounded-md text-sm text-[#202124] focus:outline-none focus:border-[#1a73e8]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white rounded-md font-medium text-sm shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Send recovery code'}
          </button>

          <div className="text-center pt-3 border-t border-[#dadce0] text-xs text-[#5f6368]">
            <button
              type="button"
              onClick={() => {
                setErrorMessage('');
                setMode('login');
              }}
              className="text-[#1a73e8] font-semibold hover:underline"
            >
              Back to sign in
            </button>
          </div>
        </form>
      )}

      {/* ---------------- RESET PASSWORD FORM ---------------- */}
      {mode === 'reset_password' && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#5f6368] mb-1">
              New password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#5f6368] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full pl-10 pr-11 py-2.5 bg-white border border-[#dadce0] rounded-md text-sm text-[#202124] focus:outline-none focus:border-[#1a73e8]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5f6368]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5f6368] mb-1">
              Confirm new password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#5f6368] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#dadce0] rounded-md text-sm text-[#202124] focus:outline-none focus:border-[#1a73e8]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white rounded-md font-medium text-sm shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Update password'}
          </button>
        </form>
      )}
    </div>
  );
}
