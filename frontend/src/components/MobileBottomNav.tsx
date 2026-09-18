import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Home, ScanLine, History, Sprout, User } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { t, language } = useLanguage();
  const location = useLocation();

  const items = [
    {
      to: '/',
      label: t('mobileNav.home', language === 'mr' ? 'मुख्यपृष्ठ' : 'Home'),
      icon: Home,
      exact: true
    },
    {
      to: '/scan',
      label: t('mobileNav.scan', language === 'mr' ? 'तपासणी' : 'Scan'),
      icon: ScanLine,
      exact: false
    },
    {
      to: '/scan-history',
      label: t('mobileNav.history', language === 'mr' ? 'इतिहास' : 'History'),
      icon: History,
      exact: false
    },
    {
      to: '/farms',
      label: t('mobileNav.farms', language === 'mr' ? 'शेती' : 'Farms'),
      icon: Sprout,
      exact: false
    },
    {
      to: '/dashboard',
      label: t('mobileNav.profile', language === 'mr' ? 'प्रोफाइल' : 'Profile'),
      icon: User,
      exact: false
    }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-2 py-1.5 flex items-center justify-around safe-bottom">
      {items.map((item, idx) => {
        const Icon = item.icon;
        const isActive = item.exact
          ? location.pathname === item.to
          : location.pathname.startsWith(item.to);

        return (
          <NavLink
            key={idx}
            to={item.to}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              isActive ? 'text-emerald-700 font-bold' : 'text-gray-500 hover:text-gray-800 font-medium'
            }`}
          >
            <div className={`p-1 rounded-lg transition-colors ${isActive ? 'bg-emerald-50 text-emerald-600' : ''}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 leading-none">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
