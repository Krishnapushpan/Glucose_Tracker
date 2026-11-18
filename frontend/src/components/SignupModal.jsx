import { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, Info, Lock, Mail, User, X } from 'lucide-react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupModal({ isOpen, onClose, onSwitchToLogin }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState('');

  const fullNameInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    setFullName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setErrors({});
    setStatusMessage('');

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = setTimeout(() => {
      fullNameInputRef.current?.focus();
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
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      nextErrors.fullName = 'Please enter your full name.';
    } else if (trimmedName.length < 2) {
      nextErrors.fullName = 'Full name must be at least 2 characters.';
    }

    if (!trimmedEmail) {
      nextErrors.email = 'Please enter your email address.';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      nextErrors.password = 'Please create a password.';
    } else if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password.';
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'Passwords do not match.';
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
      'Form inputs are valid. Account creation will be connected once backend integration is added.'
    );
  }

  function handleFieldChange(field, value) {
    if (field === 'fullName') setFullName(value);
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    if (field === 'confirmPassword') setConfirmPassword(value);

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
        aria-labelledby="signup-modal-title"
        onClick={(event) => event.stopPropagation()}
        className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl border border-[#48a992]/25 bg-[#fafcf9] p-6 shadow-2xl shadow-[#1e6355]/20 sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sign up modal"
          className="absolute right-4 top-4 rounded-full p-2 text-[#6d8781] transition-colors hover:bg-[#e3f1eb] hover:text-[#267464] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#48a992]"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="mb-6">
          <h2
            id="signup-modal-title"
            className="font-display text-2xl font-bold tracking-tight text-[#267464]"
          >
            Create Your Account
          </h2>
          <p className="mt-1.5 text-sm text-[#5b7670]">
            Start organizing your daily glucose readings with Sweetly.
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
          {/* Full Name */}
          <div>
            <label
              htmlFor="signup-fullname"
              className="mb-1.5 block text-sm font-medium text-[#2d4742]"
            >
              Full Name
            </label>
            <div className="relative">
              <User
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d8781]"
                aria-hidden="true"
              />
              <input
                ref={fullNameInputRef}
                id="signup-fullname"
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder="Alex Morgan"
                value={fullName}
                onChange={(e) => handleFieldChange('fullName', e.target.value)}
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={
                  errors.fullName ? 'signup-fullname-error' : undefined
                }
                className={`w-full rounded-xl border py-2.5 pl-10 pr-3.5 text-sm text-[#2d4742] placeholder:text-[#8aa39d] transition-colors focus:outline-none focus:ring-2 ${
                  errors.fullName
                    ? 'border-[#ec4d43] bg-[#ec4d43]/5 focus:border-[#ec4d43] focus:ring-[#ec4d43]/20'
                    : 'border-[#48a992]/35 bg-white focus:border-[#48a992] focus:ring-[#48a992]/20'
                }`}
              />
            </div>
            {errors.fullName && (
              <p
                id="signup-fullname-error"
                className="mt-1.5 text-xs font-medium text-[#d63b32]"
              >
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="signup-email"
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
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'signup-email-error' : undefined}
                className={`w-full rounded-xl border py-2.5 pl-10 pr-3.5 text-sm text-[#2d4742] placeholder:text-[#8aa39d] transition-colors focus:outline-none focus:ring-2 ${
                  errors.email
                    ? 'border-[#ec4d43] bg-[#ec4d43]/5 focus:border-[#ec4d43] focus:ring-[#ec4d43]/20'
                    : 'border-[#48a992]/35 bg-white focus:border-[#48a992] focus:ring-[#48a992]/20'
                }`}
              />
            </div>
            {errors.email && (
              <p
                id="signup-email-error"
                className="mt-1.5 text-xs font-medium text-[#d63b32]"
              >
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="signup-password"
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
                id="signup-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? 'signup-password-error' : undefined
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
                id="signup-password-error"
                className="mt-1.5 text-xs font-medium text-[#d63b32]"
              >
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="signup-confirm-password"
              className="mb-1.5 block text-sm font-medium text-[#2d4742]"
            >
              Confirm Password
            </label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d8781]"
                aria-hidden="true"
              />
              <input
                id="signup-confirm-password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) =>
                  handleFieldChange('confirmPassword', e.target.value)
                }
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={
                  errors.confirmPassword
                    ? 'signup-confirm-password-error'
                    : undefined
                }
                className={`w-full rounded-xl border py-2.5 pl-10 pr-10 text-sm text-[#2d4742] placeholder:text-[#8aa39d] transition-colors focus:outline-none focus:ring-2 ${
                  errors.confirmPassword
                    ? 'border-[#ec4d43] bg-[#ec4d43]/5 focus:border-[#ec4d43] focus:ring-[#ec4d43]/20'
                    : 'border-[#48a992]/35 bg-white focus:border-[#48a992] focus:ring-[#48a992]/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={
                  showConfirmPassword
                    ? 'Hide confirm password'
                    : 'Show confirm password'
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#6d8781] transition-colors hover:text-[#267464] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#48a992]"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p
                id="signup-confirm-password-error"
                className="mt-1.5 text-xs font-medium text-[#d63b32]"
              >
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-full bg-[#48a992] px-4 py-2.5 text-sm font-semibold text-[#faf7f4] shadow-sm shadow-[#267464]/20 transition-all hover:bg-[#267464] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#267464] focus-visible:ring-offset-2"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#5b7670]">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="rounded font-semibold text-[#267464] transition-colors hover:text-[#48a992] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#48a992]"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
