import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useOffline } from '../contexts/OfflineContext';
import { Shield, Camera, LayoutDashboard, Map, BarChart3, LogOut, Globe, Wifi, WifiOff, FileText, User, Bell } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { isOnline, pendingSyncCount } = useOffline();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-gradient-to-r from-agri-900 to-agri-800 text-white shadow-lg sticky top-0 z-50">
      {/* Online/Offline Banner */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs font-semibold px-4 py-1 text-center flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>OFFLINE MODE active. Scans will be queued locally ({pendingSyncCount} pending sync)</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-white/10 p-2 rounded-xl border border-white/20 group-hover:bg-white/20 transition-all">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                KrishiRakshak <span className="text-emerald-400">AI</span>
              </span>
              <span className="hidden sm:block text-[10px] text-emerald-200/80 -mt-1 font-medium">
                Safe Crop Triage & Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {isAuthenticated && (
              <>
                <Link to="/dashboard" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
                  <LayoutDashboard className="w-4 h-4 text-emerald-300" />
                  {t('nav.dashboard')}
                </Link>

                {user?.role === 'FARMER' && (
                  <>
                    <Link to="/scan" className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md transition-all">
                      <Camera className="w-4 h-4" />
                      {t('nav.scanCrop')}
                    </Link>

                    <Link to="/farms" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
                      {t('nav.myFarms')}
                    </Link>

                    <Link to="/cases" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
                      <FileText className="w-4 h-4 text-amber-300" />
                      {t('nav.cases')}
                    </Link>
                  </>
                )}

                {user?.role === 'OFFICER' && (
                  <Link to="/officer/queue" className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-md transition-all">
                    <FileText className="w-4 h-4" />
                    Officer Queue
                  </Link>
                )}

                {user?.role === 'ADMIN' && (
                  <>
                    <Link to="/gis-map" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
                      <Map className="w-4 h-4 text-blue-300" />
                      {t('nav.gisMap')}
                    </Link>
                    
                    <Link to="/analytics" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
                      <BarChart3 className="w-4 h-4 text-purple-300" />
                      {t('nav.analytics')}
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>

          {/* Right Controls: Language Selector & User Profile / Login */}
          <div className="hidden md:flex items-center gap-3">
            {/* Prominent Language Switcher */}
            <div className="flex items-center bg-white/10 hover:bg-white/15 rounded-xl p-1 border border-white/20 transition-all shadow-inner">
              <span className="flex items-center gap-1.5 px-2 text-xs font-bold text-emerald-200">
                <Globe className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden lg:inline">{language === 'mr' ? 'भाषा' : 'Language'}:</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    language === 'en'
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'text-emerald-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('mr')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    language === 'mr'
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'text-emerald-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  मराठी
                </button>
              </div>
            </div>

            {/* Auth Actions */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2 border-l border-white/20">
                <div className="text-right">
                  <p className="text-xs font-bold text-white">{user?.full_name}</p>
                  <p className="text-[10px] text-emerald-300 font-medium">
                    {t(`roles.${user?.role.toLowerCase()}`, user?.role)}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-emerald-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title={t('nav.logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white hover:bg-white/10 transition-colors">
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow transition-all">
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button & Mobile Language Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <div className="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/20 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded ${language === 'en' ? 'bg-emerald-500 text-white' : 'text-emerald-100'}`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('mr')}
                className={`px-2 py-0.5 rounded ${language === 'mr' ? 'bg-emerald-500 text-white' : 'text-emerald-100'}`}
              >
                मराठी
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-white hover:bg-white/10"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-agri-900 border-t border-white/10 px-4 pt-3 pb-4 space-y-2 text-sm font-medium">
          {isAuthenticated ? (
            <>
              <div className="pb-2 border-b border-white/10">
                <p className="font-bold text-white">{user?.full_name}</p>
                <p className="text-xs text-emerald-300">
                  {t(`roles.${user?.role.toLowerCase()}`, user?.role)} ({user?.district})
                </p>
              </div>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-white">
                {t('nav.dashboard')}
              </Link>
              {user?.role === 'FARMER' && (
                <>
                  <Link to="/scan" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-emerald-400 font-bold">
                    📷 {t('nav.scanCrop')}
                  </Link>
                  <Link to="/farms" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-white">
                    {t('nav.myFarms')}
                  </Link>
                  <Link to="/cases" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-white">
                    {t('nav.cases')}
                  </Link>
                </>
              )}
              {user?.role === 'OFFICER' && (
                <Link to="/officer/queue" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-amber-300 font-bold">
                  {t('nav.officerQueue')}
                </Link>
              )}
              {user?.role === 'ADMIN' && (
                <>
                  <Link to="/gis-map" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-white">
                    {t('nav.gisMap')}
                  </Link>
                  <Link to="/analytics" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-white">
                    {t('nav.analytics')}
                  </Link>
                </>
              )}
              <button onClick={() => { setMobileMenuOpen(false); handleLogout(); }} className="block w-full text-left py-2 text-red-300 font-bold">
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-white">
                {t('nav.login')}
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-emerald-400 font-bold">
                {t('nav.register')}
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};
