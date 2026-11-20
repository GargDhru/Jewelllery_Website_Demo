import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Lock, Mail, User, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface PasswordStrength {
  hasLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
}

const checkPasswordStrength = (pwd: string): PasswordStrength => ({
  hasLength: pwd.length >= 8,
  hasUpper: /[A-Z]/.test(pwd),
  hasLower: /[a-z]/.test(pwd),
  hasNumber: /[0-9]/.test(pwd),
});

export const Register: React.FC = () => {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const strength = checkPasswordStrength(password);
  const allStrong = strength.hasLength && strength.hasUpper && strength.hasLower && strength.hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!fullName.trim()) {
      setError('Full Name is required.');
      return;
    }
    if (!allStrong) {
      setError('Password does not meet the strength requirements below.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    try {
      setLoading(true);
      const user = await register(fullName.trim(), email, password);
      toast.success(`Welcome to the Atelier, ${user.full_name}! Your membership is active.`);
      navigate(redirect);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. This email may already be registered.');
    } finally {
      setLoading(false);
    }
  };

  const StrengthItem = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center gap-1.5 ${met ? 'text-green-600' : 'text-stone-400'}`}>
      <CheckCircle className="w-3 h-3 shrink-0" />
      <span>{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center py-16 px-4 sm:px-6">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-cream-200 shadow-soft">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full border border-gold-500 bg-onyx-950 text-gold-400 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold-700 font-bold block mb-1">
            New Patron Membership
          </span>
          <h1 className="font-serif text-3xl font-medium text-onyx-950">
            Create an Account
          </h1>
          <p className="text-stone-500 text-xs mt-1">
            Enjoy priority access, first-order vouchers, and express checkout.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Full Name */}
          <div>
            <label className="block text-stone-600 font-semibold mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none focus:border-gold-500"
                placeholder="Princess Maya"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-stone-600 font-semibold mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none focus:border-gold-500"
                placeholder="patron@domain.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-stone-600 font-semibold mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none focus:border-gold-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-onyx-700 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength indicators */}
            {password.length > 0 && (
              <div className="mt-2 p-2.5 bg-cream-50 border border-cream-200 rounded-lg grid grid-cols-2 gap-1">
                <StrengthItem met={strength.hasLength} text="At least 8 characters" />
                <StrengthItem met={strength.hasUpper} text="Uppercase letter" />
                <StrengthItem met={strength.hasLower} text="Lowercase letter" />
                <StrengthItem met={strength.hasNumber} text="A number (0–9)" />
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-stone-600 font-semibold mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full pl-9 pr-10 py-2.5 bg-cream-50 border rounded-lg focus:outline-none transition-colors ${
                  confirmPassword && password !== confirmPassword
                    ? 'border-red-400 focus:border-red-400'
                    : confirmPassword && password === confirmPassword
                    ? 'border-green-400 focus:border-green-400'
                    : 'border-cream-300 focus:border-gold-500'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-onyx-700 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Passwords do not match
              </p>
            )}
            {confirmPassword && password === confirmPassword && (
              <p className="text-green-600 text-[11px] mt-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Passwords match
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-onyx-950 text-cream-50 text-xs font-semibold uppercase tracking-widest rounded-lg hover:bg-gold-600 transition-colors shadow-luxury disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span>Creating Membership...</span>
            ) : (
              <>
                <span>Register Membership</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-cream-200 text-center text-xs text-stone-600">
          <span>Already registered? </span>
          <Link to={`/login?redirect=${redirect}`} className="text-gold-700 font-semibold hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
