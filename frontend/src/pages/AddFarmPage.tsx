import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { apiClient } from '../api/client';
import { Sprout, MapPin, ArrowLeft } from 'lucide-react';

export const AddFarmPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [farmName, setFarmName] = useState('');
  const [district, setDistrict] = useState('Pune');
  const [taluka, setTaluka] = useState('Baramati');
  const [crop, setCrop] = useState('Tomato');
  const [variety, setVariety] = useState('');
  const [soilType, setSoilType] = useState('Black Soil');
  const [areaAcres, setAreaAcres] = useState(2.0);
  const [lat, setLat] = useState(18.1504);
  const [lng, setLng] = useState(74.5807);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiClient.post('/api/farms', {
        farm_name: farmName,
        district,
        taluka,
        crop,
        variety,
        soil_type: soilType,
        area_acres: areaAcres,
        latitude: lat,
        longitude: lng
      });
      navigate('/farms');
    } catch (err: any) {
      setError(err.response?.data?.detail || (language === 'mr' ? 'शेत जोडणे अयशस्वी झाले.' : 'Failed to add farm plot.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/farms')} className="text-xs font-bold text-gray-500 hover:text-gray-800 flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> {language === 'mr' ? 'माझ्या शेतांकडे परत जा' : 'Back to My Farms'}
      </button>

      <div className="bg-white rounded-3xl border border-earth-100 shadow-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center font-bold">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">
              {language === 'mr' ? 'नवीन शेत जोडा' : 'Add New Farm Plot'}
            </h2>
            <p className="text-xs text-gray-500">
              {language === 'mr' ? 'रोग ट्रॅकिंगसाठी शेत जमिनीची नोंदणी करा' : 'Register crop land for GIS disease tracking'}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl mb-4 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              {t('farms.farmName', 'Farm / Plot Name')}
            </label>
            <input
              type="text"
              required
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              placeholder="e.g. Baramati Grape Garden #1"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                {t('auth.districtLabel', 'District')}
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none"
              >
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
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                {t('auth.talukaLabel', 'Taluka')}
              </label>
              <input
                type="text"
                required
                value={taluka}
                onChange={(e) => setTaluka(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                {t('farms.cropType', 'Current Crop')}
              </label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none"
              >
                <option value="Tomato">🍅 {language === 'mr' ? 'टोमॅटो (Tomato)' : 'Tomato'}</option>
                <option value="Rice">🌾 {language === 'mr' ? 'भात (Rice)' : 'Rice'}</option>
                <option value="Soybean">🌱 {language === 'mr' ? 'सोयाबीन (Soybean)' : 'Soybean'}</option>
                <option value="Grape">🍇 {language === 'mr' ? 'द्राक्ष (Grape)' : 'Grape'}</option>
                <option value="Potato">🥔 {language === 'mr' ? 'बटाटा (Potato)' : 'Potato'}</option>
                <option value="Cotton">⚪ {language === 'mr' ? 'कापूस (Cotton)' : 'Cotton'}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                {language === 'mr' ? 'वाण (पर्यायी)' : 'Variety (Optional)'}
              </label>
              <input
                type="text"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                placeholder="e.g. Hybrid-T1"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                {t('farms.acreage', 'Area (Acres)')}
              </label>
              <input
                type="number"
                step="0.5"
                value={areaAcres}
                onChange={(e) => setAreaAcres(parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                {language === 'mr' ? 'अक्षांश (Lat)' : 'Latitude'}
              </label>
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                {language === 'mr' ? 'रेखांश (Lng)' : 'Longitude'}
              </label>
              <input
                type="number"
                step="0.0001"
                value={lng}
                onChange={(e) => setLng(parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition-all mt-4"
          >
            {loading ? t('farms.saving', 'Saving farm...') : t('farms.saveFarmBtn', 'Save Farm Plot')}
          </button>
        </form>
      </div>
    </div>
  );
};
