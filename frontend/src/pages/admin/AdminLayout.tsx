import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Package, FolderTree, Tag, MessageSquare,
  Users, Image as ImageIcon, ArrowLeft, LogOut, ShieldCheck, Sparkles, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Protect admin route
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl border border-cream-300 shadow-soft max-w-md">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-onyx-950 mb-2">
            Administrator Access Required
          </h2>
          <p className="text-xs text-stone-500 mb-6 leading-relaxed">
            You must be logged in as an authorized atelier administrator to access administrative operations.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/admin/login"
              className="px-5 py-2.5 bg-onyx-950 text-cream-50 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-gold-600"
            >
              Admin Login
            </Link>
            <Link
              to="/"
              className="px-5 py-2.5 border border-cream-300 text-stone-700 rounded-lg text-xs font-semibold hover:bg-cream-100"
            >
              Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard Analytics', path: '/admin', icon: LayoutDashboard },
    { name: 'Products Management', path: '/admin/products', icon: ShoppingBag },
    { name: 'Orders & Tracking', path: '/admin/orders', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Coupons & Discounts', path: '/admin/coupons', icon: Tag },
    { name: 'Customer Reviews', path: '/admin/reviews', icon: MessageSquare },
    { name: 'Registered Customers', path: '/admin/customers', icon: Users },
    { name: 'Homepage Banners', path: '/admin/banners', icon: ImageIcon },
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-onyx-950 text-cream-100 flex flex-col justify-between shrink-0 border-r border-stone-800">
        <div>
          {/* Brand Logo */}
          <div className="p-6 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full border border-gold-400 bg-onyx-900 flex items-center justify-center text-gold-400">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-serif tracking-[0.25em] text-lg font-bold uppercase text-cream-50 block leading-tight">
                  AURA
                </span>
                <span className="text-[8px] tracking-[0.3em] uppercase text-gold-400 block -mt-1 font-semibold">
                  ADMIN ATELIER
                </span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-gold-500/20 text-gold-400 text-[10px] font-bold">
              v1.0
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 text-xs font-medium">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gold-500 text-onyx-950 font-bold shadow-sm'
                      : 'text-stone-400 hover:text-white hover:bg-stone-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-stone-800 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-3.5 py-2 text-xs text-stone-400 hover:text-white rounded-lg hover:bg-stone-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Storefront</span>
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-red-400 hover:text-red-300 rounded-lg hover:bg-red-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content View */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Authenticated as <strong>{user.full_name || 'Master Admin'}</strong> ({user.email})</span>
          </div>

          <Link
            to="/shop"
            target="_blank"
            className="text-xs text-gold-700 hover:underline font-semibold"
          >
            View Live Store ↗
          </Link>
        </header>

        {/* Child Page Content */}
        <div className="p-6 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

