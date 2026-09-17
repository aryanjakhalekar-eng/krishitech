import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Camera, Users, Map, CheckCircle2, AlertTriangle, Cpu, Globe, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { apiClient } from '../api/client';

export const LandingPage: React.FC = () => {
  const { login } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const handleQuickDemoLogin = async (email: string, pass: string, targetPath: string) => {
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
      navigate(targetPath);
    } catch (err) {
      console.error("Demo login error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-earth-50 text-gray-900 flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-agri-900 via-agri-800 to-agri-900 text-white overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-emerald-300 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
            <Zap className="w-4 h-4 text-amber-400" />
            {t('hero.badge')}
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto">
            {t('hero.title')} <span className="text-emerald-400">{t('hero.ai')}</span>
          </h1>

          <p className="text-lg sm:text-2xl text-emerald-100/90 font-medium max-w-3xl mx-auto mt-4 leading-relaxed">
            "{t('hero.subtitle')}"
          </p>

          <p className="text-xs sm:text-sm text-emerald-200/70 max-w-2xl mx-auto mt-3">
            {t('hero.desc')}
          </p>

          {/* Call-to-action buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/scan"
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Camera className="w-5 h-5" />
              {t('hero.scanBtn')}
            </Link>

            <Link
              to="/gis-map"
              className="w-full sm:w-auto px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/25 flex items-center justify-center gap-2 transition-all"
            >
              <Map className="w-5 h-5 text-blue-300" />
              {t('hero.exploreMapBtn')}
            </Link>
          </div>

          {/* Quick Login Cards */}
          <div className="mt-12 max-w-3xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-left shadow-2xl">
            <h3 className="text-sm font-extrabold text-amber-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              {t('hero.quickLoginTitle')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              <button
                onClick={() => handleQuickDemoLogin("farmer@krishirakshak.in", "farmer123", "/dashboard")}
                className="bg-emerald-800/80 hover:bg-emerald-700 p-3.5 rounded-xl border border-emerald-500/40 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-emerald-200">
                    1. {language === 'mr' ? 'शेतकरी डॅशबोर्ड' : 'Farmer Dashboard'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[11px] text-emerald-300/80 mt-1">
                  {language === 'mr' ? 'रमेश पाटील (बारामती)' : 'Ramesh Patil (Baramati)'}
                </p>
              </button>

              <button
                onClick={() => handleQuickDemoLogin("officer@krishirakshak.in", "officer123", "/officer/queue")}
                className="bg-amber-800/80 hover:bg-amber-700 p-3.5 rounded-xl border border-amber-500/40 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-amber-200">
                    2. {language === 'mr' ? 'कृषी विस्तार अधिकारी' : 'Extension Officer'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[11px] text-amber-300/80 mt-1">
                  {language === 'mr' ? 'ग्रामसेवक सुरेश कुलकर्णी' : 'Gram Sevak Suresh Kulkarni'}
                </p>
              </button>

              <button
                onClick={() => handleQuickDemoLogin("admin@krishirakshak.in", "admin123", "/gis-map")}
                className="bg-blue-800/80 hover:bg-blue-700 p-3.5 rounded-xl border border-blue-500/40 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-blue-200">
                    3. {language === 'mr' ? 'प्रशासक व नकाशा' : 'Admin & GIS Map'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[11px] text-blue-300/80 mt-1">
                  {language === 'mr' ? 'डॉ. अनन्या देशमुख' : 'Dr. Ananya Deshmukh'}
                </p>
              </button>

            </div>
          </div>

        </div>
      </section>

      {/* Problem vs Solution Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-red-50/70 border border-red-200 rounded-3xl p-8 shadow-sm">
            <div className="w-12 h-12 bg-red-500 text-white rounded-2xl flex items-center justify-center mb-4 font-bold text-xl shadow">
              !
            </div>
            <h3 className="text-2xl font-bold text-red-950 mb-3">
              {language === 'mr' ? 'शेतकऱ्यांची मुख्य समस्या' : 'THE AGRICULTURAL PROBLEM'}
            </h3>
            <p className="text-sm text-red-900/90 leading-relaxed space-y-2">
              {language === 'mr'
                ? 'महाराष्ट्रातील शेतकऱ्यांचे पिकांवरील रोगांमुळे दरवर्षी अतोनात नुकसान होते. ग्रामीण भागात इंटरनेट नसताना साधे अ‍ॅप्स चुकीची रासायनिक औषधे सुचवतात, ज्यामुळे पिके जळतात आणि पैशांचे मोठे नुकसान होते.'
                : 'Crop diseases cause devastating yields loss for farmers in Maharashtra. In rural areas with poor 2G/3G connectivity, generic AI apps provide wrong or unsafe chemical dosing recommendations without expert oversight, causing crop burning and chemical hazards.'}
            </p>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-8 shadow-sm">
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mb-4 font-bold text-xl shadow">
              ✓
            </div>
            <h3 className="text-2xl font-bold text-emerald-950 mb-3">
              {language === 'mr' ? 'कृषिरक्षक AI चा सुरक्षित उपाय' : 'THE KRISHIRAKSHAK SOLUTION'}
            </h3>
            <p className="text-sm text-emerald-900/90 leading-relaxed">
              {language === 'mr'
                ? 'कृषिरक्षक AI मध्ये फोटोची गुणवत्ता तपासणी (IQA), वेगवान मोबाईल मॉडेल, एआय सुरक्षा चाळणी (Safety Gate), स्थानिक ग्रामसेवकांचे मार्गदर्शन, इंटरनेटविना ऑफलाइन कार्यक्षमता आणि प्रमाणित एकात्मिक कीड सल्ला (IPM) समाविष्ट आहे.'
                : 'KrishiRakshak AI combines on-device Image Quality Assessment (IQA), MobileNetV3 edge classifier, Out-Of-Distribution (OOD) Mahalanobis distance, a strict AI Safety Gate, human expert escalation to local Gram Sevaks, offline IndexedDB sync, and stepped IPM advisory.'}
            </p>
          </div>

        </div>
      </section>

      {/* Core Operational Pillar Flowchart */}
      <section className="py-12 bg-white border-y border-earth-100 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900">
              {language === 'mr' ? 'सुरक्षित पीक तपासणीची कार्यपद्धती' : 'End-to-End Operational Triage Architecture'}
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              {language === 'mr'
                ? 'फोटो तपासणी, एआय सुरक्षा मूल्यांकन आणि कृषी अधिकाऱ्यांची जोड'
                : 'On-device image filtering, AI Safety Gate evaluation, and human-in-the-loop escalation'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
            
            <div className="bg-earth-50 p-5 rounded-2xl border border-earth-200 shadow-sm flex flex-col items-center">
              <div className="w-10 h-10 bg-agri-800 text-white rounded-xl flex items-center justify-center font-bold mb-3">1</div>
              <h4 className="font-bold text-sm text-gray-900">
                {language === 'mr' ? 'फोटो काढणे' : 'Photo Capture'}
              </h4>
              <p className="text-xs text-gray-600 mt-1">
                {language === 'mr' ? 'साध्या मोबाईल कॅमेऱ्याने पानावरील फोटो' : 'Low-cost Android device camera / upload'}
              </p>
            </div>

            <div className="bg-earth-50 p-5 rounded-2xl border border-earth-200 shadow-sm flex flex-col items-center">
              <div className="w-10 h-10 bg-agri-800 text-white rounded-xl flex items-center justify-center font-bold mb-3">2</div>
              <h4 className="font-bold text-sm text-gray-900">
                {language === 'mr' ? 'गुणवत्ता तपासणी (IQA)' : 'On-Device IQA Check'}
              </h4>
              <p className="text-xs text-gray-600 mt-1">
                {language === 'mr' ? 'फोटो अंधुक किंवा खराब असल्यास इशारा' : 'Laplacian Variance blur detection threshold'}
              </p>
            </div>

            <div className="bg-earth-50 p-5 rounded-2xl border border-earth-200 shadow-sm flex flex-col items-center">
              <div className="w-10 h-10 bg-agri-800 text-white rounded-xl flex items-center justify-center font-bold mb-3">3</div>
              <h4 className="font-bold text-sm text-gray-900">
                {language === 'mr' ? 'एआय रोग निदान' : 'Model Inference'}
              </h4>
              <p className="text-xs text-gray-600 mt-1">
                {language === 'mr' ? 'रोग ओळख व अचूकता पडताळणी' : 'Calculate Confidence C(x) & OOD Distance'}
              </p>
            </div>

            <div className="bg-amber-50 p-5 rounded-2xl border border-amber-300 shadow-sm flex flex-col items-center">
              <div className="w-10 h-10 bg-amber-600 text-white rounded-xl flex items-center justify-center font-bold mb-3">4</div>
              <h4 className="font-bold text-sm text-amber-950">
                {language === 'mr' ? 'सुरक्षा चाळणी (Safety Gate)' : 'AI Safety Gate'}
              </h4>
              <p className="text-xs text-amber-900 mt-1">
                {language === 'mr' ? 'पास: सुरक्षित सल्ला\nनापास: ग्रामसेवकांकडे वर्ग' : 'Pass: Auto IPM Advisory\nFail: Extension Officer Queue'}
              </p>
            </div>

            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-300 shadow-sm flex flex-col items-center">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold mb-3">5</div>
              <h4 className="font-bold text-sm text-blue-950">
                {language === 'mr' ? 'प्रादुर्भाव नियंत्रण नकाशा' : 'GIS Intelligence'}
              </h4>
              <p className="text-xs text-blue-900 mt-1">
                {language === 'mr' ? 'तालुकानिहाय रोगांच्या प्रसारावर देखरेख' : 'District/Taluka hotspot outbreak tracking'}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-agri-900 text-white py-8 px-4 text-center border-t border-white/10">
        <p className="text-xs text-emerald-200 font-medium">
          {t('footer.tagline')}
        </p>
        <p className="text-[11px] text-emerald-400/60 mt-1">
          {t('footer.privacy')}
        </p>
      </footer>
    </div>
  );
};

