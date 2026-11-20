import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

type Mode = 'login' | 'forgotPassword';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      const user = await login(email, password);
      if (rememberMe) {
        localStorage.setItem('aura_remember_email', email);
      } else {
        localStorage.removeItem('aura_remember_email');
      }
      toast.success(`Welcome back, ${user.full_name || 'Patron'}!`);
      if (user.role === 'admin' && redirect === '/account') {
        navigate('/admin');
      } else {
        navigate(redirect);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    try {
      setLoading(true);
      await api.post('/auth/forgot-password', { email });
      setForgotSent(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot Password Mode ──────────────────────────────────────────────────
  if (mode === 'forgotPassword') {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center py-16 px-4 sm:px-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-cream-200 shadow-soft">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-full border border-gold-500 bg-onyx-950 text-gold-400 flex items-center justify-center mx-auto mb-3">
              <Mail className="w-6 h-6" />
            </div>
            <h1 className="font-serif text-3xl font-medium text-onyx-950">Reset Password</h1>
            <p className="text-stone-500 text-xs mt-1">
              Enter your email and we'll send you reset instructions.
            </p>
          </div>

          {forgotSent ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-sm text-green-800 font-semibold">Reset link sent!</p>
                <p className="text-xs text-green-700 mt-1">
                  Check your inbox at <strong>{email}</strong> for the password reset link.
                </p>
              </div>
              <button
                onClick={() => { setMode('login'); setForgotSent(false); }}
                className="text-gold-700 font-semibold text-xs hover:underline"
              >
                ← Back to Sign In
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
              <form onSubmit={handleForgotPassword} className="space-y-4 text-xs">
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Email Address</label>
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
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-onyx-950 text-cream-50 text-xs font-semibold uppercase tracking-widest rounded-lg hover:bg-gold-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
              <div className="mt-4 text-center">
                <button
                  onClick={() => { setMode('login'); setError(''); }}
                  className="text-xs text-gold-700 font-semibold hover:underline"
                >
                  ← Back to Sign In
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Login Mode ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center py-16 px-4 sm:px-6">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-cream-200 shadow-soft">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full border border-gold-500 bg-onyx-950 text-gold-400 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold-700 font-bold block mb-1">
            Maison d'Aura
          </span>
          <h1 className="font-serif text-3xl font-medium text-onyx-950">
            Sign In to the Atelier
          </h1>
          <p className="text-stone-500 text-xs mt-1">
            Access your order history, saved addresses, and private vault.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-stone-600 font-semibold mb-1">Email Address</label>
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

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-stone-600 font-semibold">Password</label>
              <button
                type="button"
                onClick={() => { setMode('forgotPassword'); setError(''); }}
                className="text-gold-700 hover:underline text-[11px]"
              >
                Forgot Password?
              </button>
            </div>
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
          </div>

          {/* Remember Me */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 accent-gold-600 rounded"
            />
            <span className="text-stone-500 text-[11px]">Remember me on this device</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-onyx-950 text-cream-50 text-xs font-semibold uppercase tracking-widest rounded-lg hover:bg-gold-600 transition-colors shadow-luxury disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-cream-200 text-center text-xs text-stone-600">
          <span>New to Aura Atelier? </span>
          <Link to={`/register?redirect=${redirect}`} className="text-gold-700 font-semibold hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};
