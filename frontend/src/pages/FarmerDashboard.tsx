import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../api/client';
import { Farm, CropScan, DiseaseCase, WeatherInfo, AppNotification } from '../types';
import { Camera, Plus, CloudSun, AlertTriangle, CheckCircle, FileText, ChevronRight, Sprout } from 'lucide-react';

export const FarmerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [recentScans, setRecentScans] = useState<CropScan[]>([]);
  const [pendingCases, setPendingCases] = useState<DiseaseCase[]>([]);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [farmsRes, scansRes, casesRes, weatherRes, notifRes] = await Promise.all([
          apiClient.get('/api/farms'),
          apiClient.get('/api/scans'),
          apiClient.get('/api/cases?status_filter=PENDING'),
          apiClient.get(`/api/weather?district=${user?.district || 'Pune'}&taluka=${user?.taluka || 'Baramati'}`),
          apiClient.get('/api/notifications')
        ]);

        setFarms(farmsRes.data);
        setRecentScans(scansRes.data.slice(0, 5));
        setPendingCases(casesRes.data);
        setWeather(weatherRes.data);
        setNotifications(notifRes.data.slice(0, 3));
      } catch (err) {
        console.error("Error loading farmer dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner & Quick Scan Hero */}
      <div className="bg-gradient-to-r from-agri-900 via-agri-800 to-agri-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs text-emerald-300 font-semibold mb-2">
            📍 {user?.district}, {user?.taluka}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Namaste, {user?.full_name}!
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xl">
            Protect your crops today. Capture a photo to get instant AI disease detection or connect with your local Gram Sevak.
          </p>
        </div>

        {/* Large Prominent SCAN CROP Button */}
        <Link
          to="/scan"
          className="w-full md:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-lg rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 active:scale-95"
        >
          <Camera className="w-7 h-7" />
          <span>SCAN CROP NOW</span>
        </Link>
      </div>

      {/* Grid Layout: Weather, Cases, Farms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weather & Local Outbreak Risk */}
        <div className="bg-white rounded-2xl border border-earth-100 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <CloudSun className="w-5 h-5 text-amber-500" />
                Weather & Disease Risk
              </h3>
              <span className="text-[11px] font-bold text-gray-500">{weather?.district}</span>
            </div>

            {weather ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-amber-50/60 p-4 rounded-xl border border-amber-100">
                  <div>
                    <span className="text-3xl font-extrabold text-amber-900">{weather.temp_c}°C</span>
                    <p className="text-xs text-amber-800 font-medium">{weather.weather_condition}</p>
                  </div>
                  <div className="text-right text-xs text-gray-600 space-y-1">
                    <p>💧 Humidity: <span className="font-bold">{weather.humidity_percent}%</span></p>
                    <p>🌧️ Rainfall: <span className="font-bold">{weather.rainfall_mm} mm</span></p>
                  </div>
                </div>

                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-800 uppercase block">Local Outbreak Risk Level</span>
                    <span className={`text-base font-extrabold ${weather.contextual_risk_level === 'High' ? 'text-red-700' : 'text-emerald-700'}`}>
                      {weather.contextual_risk_level || 'Low'} Risk
                    </span>
                  </div>
                  <Sprout className="w-8 h-8 text-emerald-600" />
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500">Loading weather details...</p>
            )}
          </div>
        </div>

        {/* Pending Officer Cases */}
        <div className="bg-white rounded-2xl border border-earth-100 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Pending Officer Cases
              </h3>
              <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full">
                {pendingCases.length} Active
              </span>
            </div>

            {pendingCases.length > 0 ? (
              <div className="space-y-3">
                {pendingCases.map(c => (
                  <Link
                    key={c.id}
                    to="/cases"
                    className="block bg-amber-50/50 hover:bg-amber-50 p-3.5 rounded-xl border border-amber-200/60 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                      <span>Case #{c.id} — {c.crop}</span>
                      <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded">{c.status}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Suspected: {c.predicted_disease}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs text-gray-600 font-medium">No pending escalated cases.</p>
              </div>
            )}
          </div>
          
          <Link to="/cases" className="text-xs font-bold text-agri-800 hover:underline mt-4 flex items-center justify-end gap-1">
            View All Cases <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* My Farms Overview */}
        <div className="bg-white rounded-2xl border border-earth-100 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-600" />
                My Farms
              </h3>
              <Link to="/add-farm" className="text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add
              </Link>
            </div>

            {farms.length > 0 ? (
              <div className="space-y-3">
                {farms.map(f => (
                  <div key={f.id} className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                    <div className="flex justify-between items-center font-bold text-gray-900">
                      <span>{f.farm_name}</span>
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px]">{f.crop}</span>
                    </div>
                    <p className="text-gray-500 mt-1">{f.area_acres} Acres • {f.soil_type} • {f.district}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 py-4">No registered farms yet. Click Add to register your farm plot.</p>
            )}
          </div>

          <Link to="/farms" className="text-xs font-bold text-agri-800 hover:underline mt-4 flex items-center justify-end gap-1">
            Manage Farms <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

      {/* Recent Scan History List */}
      <div className="bg-white rounded-2xl border border-earth-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-gray-900">Recent Crop Scans</h3>
          <Link to="/scan-history" className="text-xs font-bold text-agri-800 hover:underline">
            View Full History
          </Link>
        </div>

        {recentScans.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {recentScans.map(s => (
              <div key={s.id} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center font-bold text-sm">
                    🌿
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{s.crop} — {s.predicted_disease}</h4>
                    <p className="text-xs text-gray-500">
                      Confidence: {(s.confidence * 100).toFixed(0)}% • Severity: {s.severity} ({s.affected_area_percent}%)
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.safety_gate_action === 'AUTOMATED_ADVISORY' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {s.safety_gate_action === 'AUTOMATED_ADVISORY' ? 'AI PASSED' : 'ESCALATED'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 py-4 text-center">No crop scans recorded yet. Tap "SCAN CROP NOW" to start.</p>
        )}
      </div>

    </div>
  );
};
