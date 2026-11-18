import { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, Info, Lock, Mail, X } from 'lucide-react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginModal({ isOpen, onClose, onSwitchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState('');

  const emailInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    setEmail('');
    setPassword('');
    setShowPassword(false);
    setErrors({});
    setStatusMessage('');

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = setTimeout(() => {
      emailInputRef.current?.focus();
    }, 0);

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function validate() {
    const nextErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      nextErrors.email = 'Please enter your email address.';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      nextErrors.password = 'Please enter your password.';
    } else if (password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.';
    }

    return nextErrors;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setStatusMessage('');
      return;
    }

    setErrors({});
    setStatusMessage(
      'Form inputs are valid. Authentication will be connected once backend integration is added.'
    );
  }

  function handleFieldChange(field, value) {
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (statusMessage) {
      setStatusMessage('');
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e4038]/45 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl border border-[#48a992]/25 bg-[#fafcf9] p-6 shadow-2xl shadow-[#1e6355]/20 sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close login modal"
          className="absolute right-4 top-4 rounded-full p-2 text-[#6d8781] transition-colors hover:bg-[#e3f1eb] hover:text-[#267464] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#48a992]"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="mb-6">
          <h2
            id="login-modal-title"
            className="font-display text-2xl font-bold tracking-tight text-[#267464]"
          >
            Welcome Back
          </h2>
          <p className="mt-1.5 text-sm text-[#5b7670]">
            Sign in to continue tracking your glucose readings with Sweetly.
          </p>
        </div>

        {statusMessage && (
          <div
            role="status"
            className="mb-5 flex items-start gap-2.5 rounded-2xl border border-[#48a992]/35 bg-[#e3f1eb] px-3.5 py-3 text-sm text-[#1e6355]"
          >
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#267464]" aria-hidden="true" />
            <span>{statusMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Email */}
          <div>
            <label
              htmlFor="login-email"
              className="mb-1.5 block text-sm font-medium text-[#2d4742]"
            >
              Email
            </label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d8781]"
                aria-hidden="true"
              />
              <input
                ref={emailInputRef}
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'login-email-error' : undefined}
                className={`w-full rounded-xl border py-2.5 pl-10 pr-3.5 text-sm text-[#2d4742] placeholder:text-[#8aa39d] transition-colors focus:outline-none focus:ring-2 ${
                  errors.email
                    ? 'border-[#ec4d43] bg-[#ec4d43]/5 focus:border-[#ec4d43] focus:ring-[#ec4d43]/20'
                    : 'border-[#48a992]/35 bg-white focus:border-[#48a992] focus:ring-[#48a992]/20'
                }`}
              />
            </div>
            {errors.email && (
              <p id="login-email-error" className="mt-1.5 text-xs font-medium text-[#d63b32]">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="login-password"
              className="mb-1.5 block text-sm font-medium text-[#2d4742]"
            >
              Password
            </label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d8781]"
                aria-hidden="true"
              />
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? 'login-password-error' : undefined
                }
                className={`w-full rounded-xl border py-2.5 pl-10 pr-10 text-sm text-[#2d4742] placeholder:text-[#8aa39d] transition-colors focus:outline-none focus:ring-2 ${
                  errors.password
                    ? 'border-[#ec4d43] bg-[#ec4d43]/5 focus:border-[#ec4d43] focus:ring-[#ec4d43]/20'
                    : 'border-[#48a992]/35 bg-white focus:border-[#48a992] focus:ring-[#48a992]/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#6d8781] transition-colors hover:text-[#267464] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#48a992]"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.password && (
              <p
                id="login-password-error"
                className="mt-1.5 text-xs font-medium text-[#d63b32]"
              >
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-full bg-[#48a992] px-4 py-2.5 text-sm font-semibold text-[#faf7f4] shadow-sm shadow-[#267464]/20 transition-all hover:bg-[#267464] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#267464] focus-visible:ring-offset-2"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#5b7670]">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="rounded font-semibold text-[#267464] transition-colors hover:text-[#48a992] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#48a992]"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
