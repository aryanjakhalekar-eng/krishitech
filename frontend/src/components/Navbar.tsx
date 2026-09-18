import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useOffline } from '../contexts/OfflineContext';
import {
  Globe,
  Bell,
  ChevronDown,
  Check,
  LogOut,
  User,
  Shield,
  Sprout,
  WifiOff,
  Menu,
  X,
  BarChart3,
  MapPin
} from 'lucide-react';
import { apiClient } from '../api/client';

export const Navbar: React.FC = () => {
  const { user, logout, login, isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { isOnline, pendingSyncCount } = useOffline();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const langRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQuickDemoLogin = async (email: string, pass: string) => {
    try {
      const res = await apiClient.post('/api/auth/login', { email, password: pass });
      const data = res.data;
      login(data.access_token, {
        id: data.user_id,
        full_name: data.full_name,
        email: data.email,
        role: data.role,
        district: data.district,
        taluka: data.taluka,
        created_at: new Date().toISOString()
      });
      setProfileMenuOpen(false);
      if (data.role === 'OFFICER') {
        navigate('/officer/queue');
      } else if (data.role === 'ADMIN') {
        navigate('/analytics');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Demo login error:', err);
    }
  };

  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: t('nav.home', language === 'mr' ? 'मुख्यपृष्ठ' : 'Home'), exact: true },
    { to: '/#about', label: t('nav.about', language === 'mr' ? 'आमच्याबद्दल' : 'About') },
    { to: '/#features', label: t('nav.features', language === 'mr' ? 'वैशिष्ट्ये' : 'Features') },
    { to: '/#crops', label: t('nav.crops', language === 'mr' ? 'पिके' : 'Crops') },
    { to: '/#contact', label: t('nav.contact', language === 'mr' ? 'संपर्क' : 'Contact') }
  ];

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40 select-none">
      {/* Offline Alert Bar */}
      {!isOnline && (
        <div className="bg-amber-500 text-white text-xs font-semibold px-4 py-1 text-center flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>
            {language === 'mr'
              ? `ऑफलाइन मोड सक्रिय आहे (${pendingSyncCount} स्कॅन प्रलंबित)`
              : `OFFLINE MODE active (${pendingSyncCount} scans pending sync)`}
          </span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 3C8 3 4.5 5.5 3 9c3.5 0 6.5 1.5 8 4.5 1.5-3 4.5-4.5 8-4.5-1.5-3.5-5-6-7-6z" fill="#15803D" />
                <path d="M12 12c-2.5 0-5 1.5-6 4 3 0 5 1 6 3 1-2 3-3 6-3-1-2.5-3.5-4-6-4z" fill="#16A34A" />
                <path d="M12 21c-.5-3-2-5-4.5-6 1.5 0 3-.5 4.5-1.5 1.5 1 3 1.5 4.5 1.5-2.5 1-4 3-4.5 6z" fill="#22C55E" />
              </svg>
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-gray-900 block leading-tight">
                KRISHIRAKSHAK <span className="text-emerald-600 font-black">AI</span>
              </span>
              <span className="text-[10px] text-gray-500 font-medium block -mt-0.5">
                {language === 'mr' ? 'AI च्या मदतीने निरोगी पिके' : 'AI for Healthy Crops'}
              </span>
            </div>
          </Link>

          {/* Desktop Center Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link, idx) => {
              const isActive = link.exact
                ? location.pathname === '/' && !location.hash
                : location.hash === link.to.replace('/', '');

              return (
                <Link
                  key={idx}
                  to={link.to}
                  className={`text-xs sm:text-sm font-semibold transition-all relative py-1 ${
                    isActive
                      ? 'text-emerald-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Section: Language Dropdown, Notification, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector Dropdown Matching Reference Image */}
            <div className="relative" ref={langRef}>
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 transition-all shadow-sm"
                aria-label="Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{language === 'mr' ? 'मराठी' : 'English'}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-32 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in-50 slide-in-from-top-1">
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('en');
                      setLangMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-left transition-colors ${
                      language === 'en'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>English</span>
                    {language === 'en' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('mr');
                      setLangMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-left transition-colors ${
                      language === 'mr'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>मराठी</span>
                    {language === 'mr' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/login');
                } else if (user?.role === 'OFFICER') {
                  navigate('/officer/queue');
                } else if (user?.role === 'ADMIN') {
                  navigate('/analytics');
                } else {
                  navigate('/cases');
                }
              }}
              className="relative p-2 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-50 border border-gray-200 transition-all"
              title={language === 'mr' ? 'सूचना' : 'Notifications'}
            >
              <Bell className="w-4 h-4" />
              {isAuthenticated && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            {/* User Profile / Dropdown */}
            <div className="relative" ref={profileRef}>
              {isAuthenticated && user ? (
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-left"
                >
                  <img
                    src="/assets/user_avatar.png"
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover border border-emerald-400"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-gray-900 leading-tight flex items-center gap-1">
                      {language === 'mr'
                        ? `नमस्कार, ${user.full_name?.split(' ')[0] || ''}`
                        : `Hello, ${user.full_name?.split(' ')[0] || ''}`}
                      <ChevronDown className="w-3 h-3 text-gray-400 inline" />
                    </p>
                    <p className="text-[10px] text-gray-500 font-medium leading-none">
                      {user.role === 'OFFICER'
                        ? (language === 'mr' ? 'कृषी अधिकारी' : 'Extension Officer')
                        : user.role === 'ADMIN'
                        ? (language === 'mr' ? 'प्रशासक' : 'Administrator')
                        : (language === 'mr' ? 'शेतकरी' : 'Farmer')}
                    </p>
                  </div>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all text-xs font-bold shadow-sm"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{language === 'mr' ? 'लॉगिन करा' : 'Login'}</span>
                </Link>
              )}

              {profileMenuOpen && isAuthenticated && user && (
                <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in-50 slide-in-from-top-1">
                  <div className="px-3 py-2 border-b border-gray-100 mb-1">
                    <p className="text-xs font-bold text-gray-900">{user.full_name}</p>
                    <p className="text-[10px] text-emerald-600 font-semibold">{user.district ? `${user.district}, Maharashtra` : 'Maharashtra'}</p>
                  </div>

                  {user.role === 'OFFICER' && (
                    <Link
                      to="/officer/queue"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <User className="w-4 h-4 text-amber-600" />
                      <span>{language === 'mr' ? 'अधिकारी कार्यकक्षा' : 'Officer Triage Queue'}</span>
                    </Link>
                  )}

                  {user.role === 'ADMIN' && (
                    <>
                      <Link
                        to="/analytics"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <BarChart3 className="w-4 h-4 text-blue-600" />
                        <span>{language === 'mr' ? 'प्रशासक विश्लेषण' : 'Admin Analytics'}</span>
                      </Link>
                      <Link
                        to="/gis-map"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <span>{language === 'mr' ? 'रोग नकाशा' : 'GIS Outbreak Map'}</span>
                      </Link>
                    </>
                  )}

                  {user.role === 'FARMER' && (
                    <>
                      <Link
                        to="/dashboard"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <User className="w-4 h-4 text-emerald-600" />
                        <span>{language === 'mr' ? 'माझा डॅशबोर्ड' : 'Farmer Dashboard'}</span>
                      </Link>
                      <Link
                        to="/scan"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Sprout className="w-4 h-4 text-emerald-600" />
                        <span>{language === 'mr' ? 'पिकाची तपासणी' : 'Scan Crop'}</span>
                      </Link>
                    </>
                  )}

                  <div className="border-t border-gray-100 my-1 pt-1">
                    <p className="px-3 py-1 text-[10px] uppercase font-bold text-gray-400">
                      {language === 'mr' ? 'खाते बदला' : 'Switch Demo Account'}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('farmer@krishirakshak.in', 'farmer123')}
                      className="w-full text-left px-3 py-1.5 text-xs text-gray-600 hover:bg-emerald-50 rounded-lg"
                    >
                      🧑‍🌾 {language === 'mr' ? 'शेतकरी (Farmer)' : 'Farmer (Pune)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('officer@krishirakshak.in', 'officer123')}
                      className="w-full text-left px-3 py-1.5 text-xs text-gray-600 hover:bg-amber-50 rounded-lg"
                    >
                      🛡️ {language === 'mr' ? 'कृषी अधिकारी (Officer)' : 'Extension Officer'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('admin@krishirakshak.in', 'admin123')}
                      className="w-full text-left px-3 py-1.5 text-xs text-gray-600 hover:bg-blue-50 rounded-lg"
                    >
                      📊 {language === 'mr' ? 'प्रशासक (Admin)' : 'Administrator'}
                    </button>
                  </div>

                  <div className="border-t border-gray-100 pt-1 mt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{language === 'mr' ? 'बाहेर पडा' : 'Logout'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-2 text-sm shadow-xl">
          {navLinks.map((link, idx) => (
            <Link
              key={idx}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-gray-700 font-semibold hover:text-emerald-600"
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-gray-100 pt-2 flex flex-col gap-2">
            {!isAuthenticated ? (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-center shadow flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>{language === 'mr' ? 'लॉगिन करा' : 'Sign In'}</span>
              </Link>
            ) : user?.role === 'OFFICER' ? (
              <>
                <Link
                  to="/officer/queue"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 bg-amber-600 text-white font-bold rounded-xl text-center shadow"
                >
                  🛡️ {language === 'mr' ? 'अधिकारी कार्यकक्षा' : 'Officer Triage Queue'}
                </Link>
                <button
                  type="button"
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="w-full py-2 bg-gray-100 text-red-600 font-bold rounded-xl text-center text-xs"
                >
                  {language === 'mr' ? 'बाहेर पडा' : 'Logout'}
                </button>
              </>
            ) : user?.role === 'ADMIN' ? (
              <>
                <Link
                  to="/analytics"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl text-center shadow"
                >
                  📊 {language === 'mr' ? 'प्रशासक विश्लेषण' : 'Admin Analytics'}
                </Link>
                <button
                  type="button"
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="w-full py-2 bg-gray-100 text-red-600 font-bold rounded-xl text-center text-xs"
                >
                  {language === 'mr' ? 'बाहेर पडा' : 'Logout'}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/scan"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-center shadow"
                >
                  📷 {language === 'mr' ? 'पिकाची तपासणी करा' : 'Scan Your Crop'}
                </Link>
                <button
                  type="button"
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="w-full py-2 bg-gray-100 text-red-600 font-bold rounded-xl text-center text-xs"
                >
                  {language === 'mr' ? 'बाहेर पडा' : 'Logout'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
