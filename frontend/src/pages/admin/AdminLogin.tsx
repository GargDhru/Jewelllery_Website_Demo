import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AdminLogin: React.FC = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      const user = await login(email, password);
      if (user.role !== 'admin') {
        setError('Access denied. This portal is restricted to administrators only.');
        return;
      }
      toast.success(`Welcome back, ${user.full_name}!`);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-onyx-950 flex items-center justify-center py-16 px-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(212,175,114,0.05) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="max-w-md w-full relative">
        {/* Card */}
        <div className="bg-onyx-900 border border-gold-700/30 rounded-3xl p-8 sm:p-10 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl border border-gold-500/40 bg-onyx-950 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-gold-400" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold-500 font-bold block mb-2">
              Restricted Access
            </span>
            <h1 className="font-serif text-3xl font-medium text-cream-50">
              Admin Portal
            </h1>
            <p className="text-stone-400 text-xs mt-2">
              Aura Atelier — Administration Console
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-900/30 border border-red-700/50 text-red-300 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-onyx-950 border border-onyx-700 text-cream-100 text-sm rounded-xl focus:outline-none focus:border-gold-500 transition-colors placeholder-stone-600"
                  placeholder="admin@domain.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 bg-onyx-950 border border-onyx-700 text-cream-100 text-sm rounded-xl focus:outline-none focus:border-gold-500 transition-colors placeholder-stone-600"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-gold-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gold-600 hover:bg-gold-500 text-onyx-950 text-xs font-bold uppercase tracking-widest rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2 shadow-lg"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Access Admin Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Back link */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-xs text-stone-500 hover:text-stone-300 transition-colors"
            >
              ← Return to Storefront
            </Link>
          </div>
        </div>

        {/* Security notice */}
        <p className="text-center text-stone-600 text-[10px] mt-4 tracking-wide">
          🔒 This portal is monitored. Unauthorized access attempts are logged.
        </p>
      </div>
    </div>
  );
};

