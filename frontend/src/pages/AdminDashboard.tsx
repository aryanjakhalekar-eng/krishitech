import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { apiClient } from '../api/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, Map, Users, ShieldCheck, Activity, AlertTriangle, Layers, Sprout } from 'lucide-react';

interface OverviewMetrics {
  total_farmers: number;
  total_farms: number;
  total_scans: number;
  total_cases: number;
  pending_cases: number;
  verified_cases: number;
  ai_escalation_rate: number;
  officer_verification_rate: number;
}

const COLORS = ['#16a34a', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

export const AdminDashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [districtData, setDistrictData] = useState<any[]>([]);
  const [cropData, setCropData] = useState<any[]>([]);
  const [diseaseData, setDiseaseData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [overviewRes, distRes, cropRes, disRes] = await Promise.all([
          apiClient.get('/api/analytics/overview'),
          apiClient.get('/api/analytics/districts'),
          apiClient.get('/api/analytics/crops'),
          apiClient.get('/api/analytics/diseases')
        ]);

        setMetrics(overviewRes.data);
        setDistrictData(distRes.data);
        setCropData(cropRes.data);
        setDiseaseData(disRes.data);
      } catch (err) {
        console.error('Error loading admin analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-purple-600" />
            {t('admin.title', 'State Agricultural Intelligence Dashboard')}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {t('admin.subtitle', 'Overview of statewide crop health surveillance, AI system diagnostics, and field outbreak metrics.')}
          </p>
        </div>

        <Link
          to="/gis-map"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 transition-all"
        >
          <Map className="w-4 h-4" /> {language === 'mr' ? 'महाराष्ट्र GIS नकाशा उघडा' : 'Open Maharashtra GIS Map'}
        </Link>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <div className="bg-white rounded-2xl border border-earth-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">
              {t('admin.totalFarmers', 'Total Registered Farmers')}
            </span>
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">{metrics?.total_farmers || 0}</div>
          <p className="text-[11px] text-gray-400 mt-0.5">{metrics?.total_farms || 0} {language === 'mr' ? 'नोंदणीकृत शेती भूखंड' : 'Registered Farms'}</p>
        </div>

        <div className="bg-white rounded-2xl border border-earth-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">
              {t('admin.totalScans', 'Scans Analyzed')}
            </span>
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">{metrics?.total_scans || 0}</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            {language === 'mr' ? 'स्वयंचलित दर' : 'Automated Rate'}: {(100 - (metrics?.ai_escalation_rate || 0)).toFixed(1)}%
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-earth-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">
              {language === 'mr' ? 'AI एस्केलेशन दर' : 'AI Escalation Rate'}
            </span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-700 mt-2">{metrics?.ai_escalation_rate || 0}%</div>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {metrics?.pending_cases || 0} {language === 'mr' ? 'प्रलंबित अधिकारी रांग' : 'Pending Officer Queue'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-earth-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">
              {t('admin.systemAccuracy', 'Safety Gate Verification Rate')}
            </span>
            <ShieldCheck className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-800 mt-2">{metrics?.officer_verification_rate || 0}%</div>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {metrics?.verified_cases || 0} {language === 'mr' ? 'सत्यापित केसेस' : 'Officer Verified'}
          </p>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* District Case Count Bar Chart */}
        <div className="bg-white rounded-2xl border border-earth-100 p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 text-base mb-4">
            {language === 'mr' ? 'महाराष्ट्र जिल्हावार प्रादुर्भाव प्रकरणे' : 'Outbreak Cases by Maharashtra District'}
          </h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtData}>
                <XAxis dataKey="district" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cases" fill="#16a34a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Crop Scans Breakdown */}
        <div className="bg-white rounded-2xl border border-earth-100 p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 text-base mb-4">
            {language === 'mr' ? 'पीकनिहाय स्कॅनिंग वितरण' : 'Crop Scanning Distribution'}
          </h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cropData}>
                <XAxis dataKey="crop" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="scans" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* AI Model Monitoring Panel */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-gray-700 pb-4">
          <div>
            <h3 className="font-extrabold text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              {language === 'mr' ? 'AI व एज व्हिजन मॉडेल कार्यक्षमता निरीक्षण' : 'AI & Edge Vision Model Performance Monitoring'}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">MobileNetV3-Small Classifier + Laplacian IQA + Mahalanobis OOD Engine</p>
          </div>
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono px-3 py-1 rounded-full font-bold">
            {language === 'mr' ? 'आरोग्य: उत्कृष्ट' : 'HEALTH: EXCELLENT'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-gray-800/80 p-4 rounded-xl border border-gray-700">
            <span className="text-gray-400 block font-semibold">
              {language === 'mr' ? 'IQA गुणवत्ता उत्तीर्ण दर' : 'IQA Pass Rate'}
            </span>
            <span className="text-2xl font-extrabold text-emerald-400">91.4%</span>
            <p className="text-[11px] text-gray-500 mt-1">Blur threshold: 100.0</p>
          </div>

          <div className="bg-gray-800/80 p-4 rounded-xl border border-gray-700">
            <span className="text-gray-400 block font-semibold">
              {language === 'mr' ? 'इन-डिस्ट्रिब्युशन मॅच' : 'In-Distribution Match'}
            </span>
            <span className="text-2xl font-extrabold text-blue-400">84.2%</span>
            <p className="text-[11px] text-gray-500 mt-1">OOD threshold D_M: 4.50</p>
          </div>

          <div className="bg-gray-800/80 p-4 rounded-xl border border-gray-700">
            <span className="text-gray-400 block font-semibold">
              {language === 'mr' ? 'टॅब्युलर ML अचूकता' : 'Tabular ML Accuracy'}
            </span>
            <span className="text-2xl font-extrabold text-purple-400">76.7%</span>
            <p className="text-[11px] text-gray-500 mt-1">Random Forest Risk Predictor</p>
          </div>
        </div>
      </div>

    </div>
  );
};
