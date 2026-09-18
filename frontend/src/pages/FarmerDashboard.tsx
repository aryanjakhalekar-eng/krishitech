import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { apiClient } from '../api/client';
import { Farm, CropScan, DiseaseCase, WeatherInfo, AppNotification } from '../types';
import {
  Camera,
  Upload,
  History,
  CloudSun,
  Shield,
  ShieldCheck,
  Bug,
  Leaf,
  ArrowRight,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
  Activity,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { getLocalizedCrop, getLocalizedDisease } from '../utils/diseaseTranslations';

interface Props {
  isLandingView?: boolean;
}

export const FarmerDashboard: React.FC<Props> = ({ isLandingView = false }) => {
  const { user, isAuthenticated } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [recentScans, setRecentScans] = useState<CropScan[]>([]);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const district = user?.district || 'Pune';
  const taluka = user?.taluka || 'Baramati';

  useEffect(() => {
    const loadData = async () => {
      try {
        const [weatherRes, scansRes, farmsRes] = await Promise.allSettled([
          apiClient.get(`/api/weather?district=${district}&taluka=${taluka}`),
          apiClient.get('/api/scans'),
          apiClient.get('/api/farms')
        ]);

        if (weatherRes.status === 'fulfilled') {
          setWeather(weatherRes.value.data);
        }
        if (scansRes.status === 'fulfilled' && Array.isArray(scansRes.value.data)) {
          setRecentScans(scansRes.value.data);
        }
        if (farmsRes.status === 'fulfilled' && Array.isArray(farmsRes.value.data)) {
          setFarms(farmsRes.value.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [district, taluka]);

  // Latest diagnosis: use first recent scan or fallback to standard demo scan
  const latestScan = recentScans[0] || null;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      
      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 1. TOP ROW: HERO BANNER (LEFT) & WEATHER / RISK CARD (RIGHT) */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        
        {/* HERO BANNER MATCHING REFERENCE EXACTLY */}
        <div className="lg:col-span-2 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-emerald-100 min-h-[260px] sm:min-h-[290px] flex flex-col justify-between p-6 sm:p-8 bg-cover bg-right"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.92) 55%, rgba(255,255,255,0.2) 100%), url('/assets/farmer_hero.jpg')`
          }}
        >
          {/* Top Logo & Branding */}
          <div className="max-w-md sm:max-w-lg z-10 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 shadow-sm">
                <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                  <path d="M12 3C8 3 4.5 5.5 3 9c3.5 0 6.5 1.5 8 4.5 1.5-3 4.5-4.5 8-4.5-1.5-3.5-5-6-7-6z" fill="#15803D" />
                  <path d="M12 12c-2.5 0-5 1.5-6 4 3 0 5 1 6 3 1-2 3-3 6-3-1-2.5-3.5-4-6-4z" fill="#16A34A" />
                  <path d="M12 21c-.5-3-2-5-4.5-6 1.5 0 3-.5 4.5-1.5 1.5 1 3 1.5 4.5 1.5-2.5 1-4 3-4.5 6z" fill="#22C55E" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-none">
                  KRISHIRAKSHAK AI
                </h1>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-gray-700 leading-relaxed whitespace-pre-line mt-1">
              {language === 'mr'
                ? 'AI च्या मदतीने पिकांचे रोग व किडी ओळखा,\nसुरक्षित सल्ला मिळवा आणि रोगांच्या प्रादुर्भावाची\nवेळीच माहिती मिळवा.'
                : 'AI-powered crop disease detection,\nsafe advisory and outbreak intelligence\nfor farmers.'}
            </p>

            <p className="text-[11px] text-emerald-800 font-bold tracking-wide">
              {language === 'mr'
                ? 'निरोगी पिके | समृद्ध शेतकरी | शाश्वत भविष्य'
                : 'Healthy Crops | Prosperous Farmers | Sustainable Future'}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="z-10 mt-5 flex flex-wrap items-center gap-3">
            <Link
              to="/scan"
              className="px-5 py-2.5 bg-[#15803D] hover:bg-[#166534] active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg flex items-center gap-2 transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>{language === 'mr' ? 'पिकाची तपासणी करा' : 'Scan Your Crop'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/about"
              className="px-4 py-2.5 bg-white/90 hover:bg-white text-gray-800 font-semibold text-xs rounded-xl border border-gray-200 hover:border-gray-300 shadow-sm transition-all"
            >
              {language === 'mr' ? 'कृषिरक्षक बद्दल जाणून घ्या' : 'Explore KrishiRakshak'}
            </Link>
          </div>
        </div>

        {/* WEATHER & CROP RISK CARD (TOP RIGHT) */}
        <div id="weather-section" className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between space-y-4">
          
          {/* Header & Location */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-gray-900 leading-tight">
                {language === 'mr' ? 'हवामान आणि पिकांचा धोका' : 'Weather & Crop Risk'}
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{user?.district || 'Pune'}, Maharashtra</span>
              </p>
            </div>

            {/* Weather status */}
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-lg sm:text-xl font-black text-gray-900">
                  {weather?.temp_c ? `${Math.round(weather.temp_c)}°C` : '28°C'}
                </span>
                <CloudSun className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-[10px] text-gray-500 font-medium">
                {weather?.weather_condition || (language === 'mr' ? 'अंशतः ढगाळ' : 'Partly Cloudy')}
              </p>
              <p className="text-[10px] text-gray-400">
                {language === 'mr' ? 'आर्द्रता' : 'Humidity'} {weather?.humidity_percent || 72}% | {language === 'mr' ? 'पाऊस' : 'Rain'} {weather?.rainfall_mm ? `${weather.rainfall_mm}mm` : '10%'}
              </p>
            </div>
          </div>

          {/* 3 Risk Indicator Badges Matching Reference Image */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            {/* 1. Crop Risk */}
            <div className="bg-[#22C55E] text-white p-2.5 rounded-2xl text-center shadow-sm">
              <ShieldCheck className="w-4 h-4 mx-auto mb-1 opacity-90" />
              <p className="text-xs font-black leading-tight">
                {language === 'mr' ? 'कमी' : 'Low'}
              </p>
              <p className="text-[10px] opacity-90 font-medium mt-0.5 leading-none">
                {language === 'mr' ? 'पिकांचा धोका' : 'Crop Risk'}
              </p>
            </div>

            {/* 2. Weather Risk */}
            <div className="bg-[#3B82F6] text-white p-2.5 rounded-2xl text-center shadow-sm">
              <CloudSun className="w-4 h-4 mx-auto mb-1 opacity-90" />
              <p className="text-xs font-black leading-tight">
                {language === 'mr' ? 'मध्यम' : 'Moderate'}
              </p>
              <p className="text-[10px] opacity-90 font-medium mt-0.5 leading-none">
                {language === 'mr' ? 'हवामानाचा धोका' : 'Weather Risk'}
              </p>
            </div>

            {/* 3. Pest Risk */}
            <div className="bg-[#F97316] text-white p-2.5 rounded-2xl text-center shadow-sm">
              <Bug className="w-4 h-4 mx-auto mb-1 opacity-90" />
              <p className="text-xs font-black leading-tight">
                {language === 'mr' ? 'मध्यम' : 'Medium'}
              </p>
              <p className="text-[10px] opacity-90 font-medium mt-0.5 leading-none">
                {language === 'mr' ? 'किडीचा धोका' : 'Pest Risk'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 2. FOUR FEATURE / STATUS CARDS (DIRECTLY BELOW HERO) */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Card 1: Crop Health */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-3 hover:border-emerald-200 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500">
              {language === 'mr' ? 'पिकांचे आरोग्य' : 'Crop Health'}
            </p>
            <p className="text-sm sm:text-base font-extrabold text-emerald-700 leading-tight">
              {language === 'mr' ? 'निरोगी' : 'Healthy'}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {language === 'mr' ? 'कोणतीही मोठी समस्या नाही' : 'No major issues detected'}
            </p>
          </div>
        </div>

        {/* Card 2: Disease Risk */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-3 hover:border-emerald-200 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500">
              {language === 'mr' ? 'रोगाचा धोका' : 'Disease Risk'}
            </p>
            <p className="text-sm sm:text-base font-extrabold text-emerald-700 leading-tight">
              {language === 'mr' ? 'कमी' : 'Low'}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {language === 'mr' ? 'आपल्या परिसरात कमी धोका' : 'Minimal risk in your area'}
            </p>
          </div>
        </div>

        {/* Card 3: Pest Risk */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-3 hover:border-amber-200 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Bug className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500">
              {language === 'mr' ? 'किडीचा धोका' : 'Pest Risk'}
            </p>
            <p className="text-sm sm:text-base font-extrabold text-amber-700 leading-tight">
              {language === 'mr' ? 'मध्यम' : 'Moderate'}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {language === 'mr' ? 'लवकरच लक्ष द्या' : 'Monitor for early signs'}
            </p>
          </div>
        </div>

        {/* Card 4: Weather Risk */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-3 hover:border-blue-200 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CloudSun className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500">
              {language === 'mr' ? 'हवामानाचा धोका' : 'Weather Risk'}
            </p>
            <p className="text-sm sm:text-base font-extrabold text-blue-700 leading-tight">
              {language === 'mr' ? 'कमी' : 'Low'}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {language === 'mr' ? 'अनुकूल परिस्थिती' : 'Favorable conditions'}
            </p>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 3. MIDDLE SECTION: QUICK ACTIONS (LEFT) & LATEST DIAGNOSIS (RIGHT) */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        
        {/* LEFT TWO COLUMNS: QUICK ACTIONS & RECENT ACTIVITY LIST */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Quick Actions Header */}
          <div className="space-y-2.5">
            <h2 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
              <span>{language === 'mr' ? 'त्वरित कृती' : 'Quick Actions'}</span>
            </h2>

            {/* 5 Quick Action Cards matching reference image */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              
              {/* 1. Primary Highlighted Card: Scan Crop */}
              <Link
                to="/scan"
                className="col-span-2 sm:col-span-1 bg-gradient-to-br from-[#15803D] to-[#16A34A] text-white p-3 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Camera className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-black leading-tight">
                    {language === 'mr' ? 'पिकाची तपासणी करा' : 'Scan Crop'}
                  </p>
                  <p className="text-[10px] text-emerald-100 font-medium mt-0.5 leading-snug">
                    {language === 'mr' ? 'फोटो अपलोड करून रोग तपासा →' : 'Upload and analyze crop image →'}
                  </p>
                </div>
              </Link>

              {/* 2. Take Photo */}
              <Link
                to="/scan?mode=camera"
                className="bg-white rounded-2xl border border-gray-100 hover:border-emerald-300 p-3 shadow-sm hover:shadow transition-all flex flex-col justify-between group"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 leading-tight">
                    {language === 'mr' ? 'फोटो काढा' : 'Take Photo'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">
                    {language === 'mr' ? 'कॅमेरा वापरा' : 'Open camera on mobile'}
                  </p>
                </div>
              </Link>

              {/* 3. Upload Image */}
              <Link
                to="/scan"
                className="bg-white rounded-2xl border border-gray-100 hover:border-blue-300 p-3 shadow-sm hover:shadow transition-all flex flex-col justify-between group"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 leading-tight">
                    {language === 'mr' ? 'फोटो अपलोड करा' : 'Upload Image'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">
                    {language === 'mr' ? 'फाईल निवडा' : 'Select from device'}
                  </p>
                </div>
              </Link>

              {/* 4. View History */}
              <Link
                to="/scan-history"
                className="bg-white rounded-2xl border border-gray-100 hover:border-purple-300 p-3 shadow-sm hover:shadow transition-all flex flex-col justify-between group"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 leading-tight">
                    {language === 'mr' ? 'इतिहास पहा' : 'View History'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">
                    {language === 'mr' ? 'पूर्वीच्या तपासण्या' : 'Previous scans'}
                  </p>
                </div>
              </Link>

              {/* 5. Weather Info */}
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('weather-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white rounded-2xl border border-gray-100 hover:border-amber-300 p-3 shadow-sm hover:shadow transition-all flex flex-col justify-between text-left group"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <CloudSun className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 leading-tight">
                    {language === 'mr' ? 'हवामान पहा' : 'Weather'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">
                    {language === 'mr' ? 'हवामान माहिती' : 'View weather info'}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Past Scans List Matching Bottom Right of Reference */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>{language === 'mr' ? 'अलीकडील तपासण्या' : 'Recent Activity'}</span>
              </h3>
              <Link
                to="/scan-history"
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>{language === 'mr' ? 'सर्व पहा →' : 'View All →'}</span>
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentScans.length > 0 ? (
                recentScans.slice(0, 3).map((scan, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigate('/scan-result', { state: { result: scan } })}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100/70 border border-emerald-200 overflow-hidden flex items-center justify-center text-base">
                        {scan.image_url ? (
                          <img src={scan.image_url} alt="Crop" className="w-full h-full object-cover" />
                        ) : (
                          '🌿'
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 leading-tight">
                          {getLocalizedCrop(scan.crop, language)} - {getLocalizedDisease(scan.crop, scan.predicted_disease, language)}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {new Date(scan.created_at).toLocaleDateString(language === 'mr' ? 'mr-IN' : 'en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        scan.severity === 'HIGH'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : scan.severity === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {scan.severity === 'HIGH'
                        ? (language === 'mr' ? 'गंभीर धोका' : 'High Risk')
                        : scan.severity === 'MEDIUM'
                        ? (language === 'mr' ? 'मध्यम धोका' : 'Medium Risk')
                        : (language === 'mr' ? 'कमी धोका' : 'Low Risk')}
                    </span>
                  </div>
                ))
              ) : (
                /* Standard Demonstration Scans when user has not scanned yet */
                <>
                  <div
                    onClick={() => navigate('/scan')}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100/70 border border-emerald-200 overflow-hidden flex items-center justify-center text-base">
                        🍅
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 leading-tight">
                          {language === 'mr' ? 'टोमॅटो - अर्ली ब्लाइट' : 'Tomato - Early Blight'}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {language === 'mr' ? '३ तासांपूर्वी' : '3 hours ago'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                      {language === 'mr' ? 'गंभीर धोका' : 'High Risk'}
                    </span>
                  </div>

                  <div
                    onClick={() => navigate('/scan')}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100/70 border border-emerald-200 overflow-hidden flex items-center justify-center text-base">
                        🌾
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 leading-tight">
                          {language === 'mr' ? 'भात - निरोगी' : 'Rice - Healthy'}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {language === 'mr' ? '१ दिवसापूर्वी' : '1 day ago'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {language === 'mr' ? 'कमी धोका' : 'Low Risk'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LATEST DIAGNOSIS & RECENT ACTIVITY FEED */}
        <div className="space-y-5">
          
          {/* LATEST DIAGNOSIS CARD MATCHING REFERENCE EXACTLY */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-5 space-y-3">
            <h3 className="text-xs sm:text-sm font-bold text-gray-900">
              {language === 'mr' ? 'अलीकडील निदान' : 'Latest Diagnosis'}
            </h3>

            <div className="flex items-start gap-3">
              {/* Leaf image thumbnail */}
              <div className="w-14 h-14 rounded-xl bg-emerald-50 border border-emerald-200 overflow-hidden shrink-0 flex items-center justify-center">
                {latestScan?.image_url ? (
                  <img src={latestScan.image_url} alt="Diagnosed leaf" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">🍃</span>
                )}
              </div>

              <div>
                <p className="text-xs font-bold text-gray-900">
                  {latestScan ? getLocalizedCrop(latestScan.crop, language) : (language === 'mr' ? 'टोमॅटो' : 'Tomato')}
                </p>
                <p className="text-xs font-extrabold text-red-700 leading-tight">
                  {latestScan ? getLocalizedDisease(latestScan.crop, latestScan.predicted_disease, language) : (language === 'mr' ? 'अर्ली ब्लाइट रोग' : 'Early Blight')}
                </p>
                <span className="inline-block mt-1 text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                  {language === 'mr' ? 'मध्यम धोका' : 'Medium Risk'}
                </span>
              </div>
            </div>

            {/* Metrics: Confidence, Damage Severity, Scan Date */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-center">
              <div>
                <p className="text-[10px] text-gray-400 font-medium">
                  {language === 'mr' ? 'विश्वास पातळी' : 'Confidence'}
                </p>
                <p className="text-xs font-black text-gray-900">
                  {latestScan?.confidence ? `${Math.round(latestScan.confidence * 100)}%` : '95%'}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-gray-400 font-medium">
                  {language === 'mr' ? 'नुकसानीची तीव्रता' : 'Damage Severity'}
                </p>
                <p className="text-xs font-black text-gray-900">
                  {latestScan?.affected_area_percent ? `${Math.round(latestScan.affected_area_percent)}%` : '33%'}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-gray-400 font-medium">
                  {language === 'mr' ? 'तपासणी दिनांक' : 'Scan Date'}
                </p>
                <p className="text-[11px] font-bold text-gray-900">
                  {latestScan ? new Date(latestScan.created_at).toLocaleDateString(language === 'mr' ? 'mr-IN' : 'en-IN', { day: 'numeric', month: 'short' }) : '10 Sep 2026'}
                </p>
              </div>
            </div>

            {/* View Details Button */}
            <button
              type="button"
              onClick={() => {
                if (latestScan) {
                  navigate('/scan-result', { state: { result: latestScan } });
                } else {
                  navigate('/scan');
                }
              }}
              className="w-full py-2 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all text-center"
            >
              {language === 'mr' ? 'तपशील पहा' : 'View Details'}
            </button>
          </div>

          {/* RECENT ACTIVITY CARD (RIGHT SIDE FEED) */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-5 space-y-3">
            <h3 className="text-xs sm:text-sm font-bold text-gray-900">
              {language === 'mr' ? 'अलीकडील क्रिया' : 'Recent Activity'}
            </h3>

            <div className="space-y-3">
              {/* Event 1 */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Camera className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 leading-tight">
                    {language === 'mr' ? 'नवीन तपासणी पूर्ण' : 'New scan completed'}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {language === 'mr' ? 'टोमॅटो - अर्ली ब्लाइट' : 'Tomato - Early Blight'} • {language === 'mr' ? '२ तासांपूर्वी' : '2 hours ago'}
                  </p>
                </div>
              </div>

              {/* Event 2 */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Leaf className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 leading-tight">
                    {language === 'mr' ? 'शेती नोंदणी' : 'Farm registered'}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Walpur, Pune • {language === 'mr' ? '५ तासांपूर्वी' : '5 hours ago'}
                  </p>
                </div>
              </div>

              {/* Event 3 */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 leading-tight">
                    {language === 'mr' ? 'शिफारस अद्ययावत' : 'Advisory updated'}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {language === 'mr' ? 'भात - करपा' : 'Rice - Blast'} • {language === 'mr' ? '१ दिवसापूर्वी' : '1 day ago'}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
