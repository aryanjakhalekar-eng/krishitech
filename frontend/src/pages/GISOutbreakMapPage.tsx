import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedCrop, getLocalizedDisease } from '../utils/diseaseTranslations';
import { apiClient } from '../api/client';
import { OutbreakHotspot } from '../types';
import { GISMap } from '../components/GISMap';
import { Map, Filter, AlertTriangle, Layers, Sprout } from 'lucide-react';

export const GISOutbreakMapPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [hotspots, setHotspots] = useState<OutbreakHotspot[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHotspots = async () => {
      setLoading(true);
      try {
        let url = '/api/outbreaks/hotspots?';
        if (selectedCrop) url += `crop=${selectedCrop}&`;
        if (selectedDistrict) url += `district=${selectedDistrict}&`;
        if (selectedSeverity) url += `severity=${selectedSeverity}&`;

        const res = await apiClient.get(url);
        setHotspots(res.data);
      } catch (err) {
        console.error('Error loading GIS outbreak hotspots:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotspots();
  }, [selectedCrop, selectedDistrict, selectedSeverity]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <Map className="w-7 h-7 text-blue-600" />
            {t('gis.title', 'GIS Crop Outbreak Intelligence Map')}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {t('gis.subtitle', 'Real-time spatial outbreak detection across Maharashtra districts for proactive plant quarantine and pest containment.')}
          </p>
        </div>

        <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-200 text-xs font-bold text-blue-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-blue-600" />
          {hotspots.length} {language === 'mr' ? 'सक्रिय प्रादुर्भाव क्लस्टर्स' : 'Active Hotspot Clusters'}
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-5 rounded-2xl border border-earth-100 shadow-sm flex flex-wrap items-center gap-4 text-xs font-bold">
        <div className="flex items-center gap-1.5 text-gray-500">
          <Filter className="w-4 h-4" /> {language === 'mr' ? 'फिल्टर्स:' : 'Filters:'}
        </div>

        <div>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-600"
          >
            <option value="">{language === 'mr' ? 'सर्व जिल्हे' : 'All Districts'}</option>
            <option value="Pune">{language === 'mr' ? 'पुणे (Pune)' : 'Pune'}</option>
            <option value="Solapur">{language === 'mr' ? 'सोलापूर (Solapur)' : 'Solapur'}</option>
            <option value="Satara">{language === 'mr' ? 'सातारा (Satara)' : 'Satara'}</option>
            <option value="Nashik">{language === 'mr' ? 'नाशिक (Nashik)' : 'Nashik'}</option>
            <option value="Kolhapur">{language === 'mr' ? 'कोल्हापूर (Kolhapur)' : 'Kolhapur'}</option>
            <option value="Sangli">{language === 'mr' ? 'सांगली (Sangli)' : 'Sangli'}</option>
            <option value="Ahmednagar">{language === 'mr' ? 'अहमदनगर (Ahmednagar)' : 'Ahmednagar'}</option>
            <option value="Nanded">{language === 'mr' ? 'नांदेड (Nanded)' : 'Nanded'}</option>
          </select>
        </div>

        <div>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-600"
          >
            <option value="">{language === 'mr' ? 'सर्व पिके' : 'All Crops'}</option>
            <option value="Tomato">🍅 {language === 'mr' ? 'टोमॅटो (Tomato)' : 'Tomato'}</option>
            <option value="Soybean">🌱 {language === 'mr' ? 'सोयाबीन (Soybean)' : 'Soybean'}</option>
            <option value="Rice">🌾 {language === 'mr' ? 'भात (Rice)' : 'Rice'}</option>
            <option value="Grape">🍇 {language === 'mr' ? 'द्राक्ष (Grape)' : 'Grape'}</option>
            <option value="Potato">🥔 {language === 'mr' ? 'बटाटा (Potato)' : 'Potato'}</option>
            <option value="Cotton">⚪ {language === 'mr' ? 'कापूस (Cotton)' : 'Cotton'}</option>
          </select>
        </div>

        <div>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-600"
          >
            <option value="">{language === 'mr' ? 'सर्व तीव्रता' : 'All Severities'}</option>
            <option value="HIGH">{language === 'mr' ? 'उच्च तीव्रता (High)' : 'High Severity'}</option>
            <option value="MEDIUM">{language === 'mr' ? 'मध्यम तीव्रता (Medium)' : 'Medium Severity'}</option>
            <option value="LOW">{language === 'mr' ? 'कमी तीव्रता (Low)' : 'Low Severity'}</option>
          </select>
        </div>

        {(selectedCrop || selectedDistrict || selectedSeverity) && (
          <button
            onClick={() => { setSelectedCrop(''); setSelectedDistrict(''); setSelectedSeverity(''); }}
            className="text-xs text-red-600 hover:underline font-bold"
          >
            {language === 'mr' ? 'फिल्टर्स काढा' : 'Clear Filters'}
          </button>
        )}
      </div>

      {/* Interactive Leaflet Map */}
      <GISMap hotspots={hotspots} />

      {/* Hotspots Summary Table */}
      <div className="bg-white rounded-2xl border border-earth-100 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-base text-gray-900">
          {language === 'mr' ? 'जिल्हा व तालुका प्रादुर्भाव सारांश' : 'District & Taluka Hotspot Summary'}
        </h3>
        
        {hotspots.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                <tr>
                  <th className="p-3">{language === 'mr' ? 'जिल्हा' : 'District'}</th>
                  <th className="p-3">{language === 'mr' ? 'तालुका' : 'Taluka'}</th>
                  <th className="p-3">{language === 'mr' ? 'पीक' : 'Crop'}</th>
                  <th className="p-3">{language === 'mr' ? 'प्रादुर्भाव रोग' : 'Outbreak Disease'}</th>
                  <th className="p-3">{language === 'mr' ? 'तीव्रता' : 'Severity'}</th>
                  <th className="p-3">{language === 'mr' ? 'सक्रिय केसेस' : 'Active Cases'}</th>
                  <th className="p-3">{language === 'mr' ? 'धोका पातळी' : 'Risk Level'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {hotspots.map((h, i) => (
                  <tr key={i} className="hover:bg-gray-50/50">
                    <td className="p-3 font-bold text-gray-900">{h.district}</td>
                    <td className="p-3 font-medium text-gray-700">{h.taluka}</td>
                    <td className="p-3 font-medium text-emerald-800">{getLocalizedCrop(h.crop, language)}</td>
                    <td className="p-3 font-bold text-red-700">{getLocalizedDisease(h.crop, h.disease, language)}</td>
                    <td className="p-3 font-semibold">{h.severity}</td>
                    <td className="p-3 font-bold text-blue-900">{h.cases_count}</td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${h.risk_level === 'High' ? 'bg-red-600' : 'bg-amber-600'}`}>
                        {h.risk_level === 'High' 
                          ? (language === 'mr' ? 'उच्च' : 'High')
                          : (language === 'mr' ? 'मध्यम' : 'Moderate')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-gray-500 py-4 text-center">
            {language === 'mr' ? 'निवडलेल्या फिल्टर्सनुसार कोणतेही प्रादुर्भाव केंद्र आढळले नाही.' : 'No outbreak hotspots match the selected filters.'}
          </p>
        )}
      </div>

    </div>
  );
};
