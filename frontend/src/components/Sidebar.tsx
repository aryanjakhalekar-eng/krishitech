import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  LayoutDashboard,
  ScanLine,
  History,
  CloudSun,
  Sprout,
  User,
  Settings
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { t, language } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      to: '/',
      label: t('nav.home', language === 'mr' ? 'मुख्यपृष्ठ' : 'Home'),
      icon: Home,
      exact: true
    },
    {
      to: '/dashboard',
      label: t('nav.dashboard', language === 'mr' ? 'डॅशबोर्ड' : 'Dashboard'),
      icon: LayoutDashboard,
      exact: false
    },
    {
      to: '/scan',
      label: t('nav.scanCrop', language === 'mr' ? 'पिकाची तपासणी' : 'Scan Crop'),
      icon: ScanLine,
      exact: false
    },
    {
      to: '/scan-history',
      label: t('nav.history', language === 'mr' ? 'इतिहास' : 'History'),
      icon: History,
      exact: false
    },
    {
      to: '#weather',
      label: t('nav.weather', language === 'mr' ? 'हवामान' : 'Weather'),
      icon: CloudSun,
      isAction: true,
      onClick: () => {
        const el = document.getElementById('weather-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          navigate('/dashboard');
        }
      }
    },
    {
      to: '/cases',
      label: t('nav.recommendations', language === 'mr' ? 'शिफारसी' : 'Recommendations'),
      icon: Sprout,
      exact: false
    },
    {
      to: '/farms',
      label: t('nav.profile', language === 'mr' ? 'प्रोफाइल' : 'Profile'),
      icon: User,
      exact: false
    },
    {
      to: '#settings',
      label: t('nav.settings', language === 'mr' ? 'सेटिंग्ज' : 'Settings'),
      icon: Settings,
      isAction: true,
      onClick: () => {
        alert(language === 'mr' ? 'सेटिंग्ज मेनू: आवृत्ती २.०' : 'KrishiRakshak AI Settings v2.0');
      }
    }
  ];

  return (
    <aside className="w-[210px] shrink-0 bg-white border-r border-gray-100/90 shadow-sm flex flex-col justify-between p-3 min-h-[calc(100vh-64px)] select-none">
      {/* Top Menu Links */}
      <nav className="space-y-1 pt-1">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? location.pathname === item.to
            : !item.isAction && location.pathname.startsWith(item.to);

          if (item.isAction) {
            return (
              <button
                key={idx}
                type="button"
                onClick={item.onClick}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50/80 transition-all text-left"
              >
                <Icon className="w-4 h-4 text-gray-400 group-hover:text-gray-600 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          }

          return (
            <NavLink
              key={idx}
              to={item.to}
              className={({ isActive: linkActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  linkActive || isActive
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80'
                }`
              }
            >
              {({ isActive: linkActive }) => (
                <>
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      linkActive || isActive ? 'text-emerald-600' : 'text-gray-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Promotional Card Matching Reference Image */}
      <div className="mt-6 mb-2 bg-gradient-to-b from-emerald-50/60 to-emerald-100/40 border border-emerald-100/80 rounded-2xl p-3 text-center flex flex-col items-center">
        <div className="w-16 h-16 flex items-center justify-center overflow-hidden mb-1.5">
          <img
            src="/assets/farmer_sidebar.png"
            alt="Farmer"
            className="w-full h-full object-contain filter drop-shadow-sm"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
        <p className="text-[11px] font-bold text-emerald-900 leading-tight">
          {language === 'mr'
            ? 'शेतकऱ्यांच्या उज्ज्वल भविष्यासाठी'
            : 'Empowering Farmers for a Better Tomorrow'}
        </p>
      </div>
    </aside>
  );
};
