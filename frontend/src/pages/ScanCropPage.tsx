import React, { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useOffline } from '../contexts/OfflineContext';
import { useLanguage } from '../contexts/LanguageContext';
import { apiClient } from '../api/client';
import { Camera, Upload, RefreshCw, CheckCircle2, AlertTriangle, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { getLocalizedCrop } from '../utils/diseaseTranslations';

export const ScanCropPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [searchParams] = useSearchParams();
  const [selectedCrop, setSelectedCrop] = useState<string>(searchParams.get('crop') || 'Tomato');
  const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>(
    searchParams.get('farm_id') ? parseInt(searchParams.get('farm_id')!) : undefined
  );
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const { isOnline, queueScanForSync } = useOffline();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Sample leaf generator for instant testing
  const handleSampleImage = (type: 'clear' | 'blurry' | 'ood') => {
    // Generate simple colored canvas base64 image
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (type === 'clear') {
        ctx.fillStyle = '#16a34a'; // Green leaf
        ctx.fillRect(0, 0, 400, 400);
        ctx.fillStyle = '#a16207'; // Brown spots
        ctx.beginPath();
        ctx.arc(200, 200, 50, 0, 2 * Math.PI);
        ctx.fill();
      } else if (type === 'blurry') {
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(0, 0, 400, 400);
      } else {
        ctx.fillStyle = '#3b82f6'; // Non-leaf OOD image
        ctx.fillRect(0, 0, 400, 400);
      }
    }
    setImageBase64(canvas.toDataURL('image/jpeg'));
  };

  const handleAnalyze = async () => {
    if (!imageBase64) {
      setError(t('scan.errorEmpty', 'Please capture or upload a crop leaf image.'));
      return;
    }

    setLoading(true);
    setError('');

    if (!isOnline) {
      // Offline mode: queue in IndexedDB
      await queueScanForSync({
        crop: selectedCrop,
        farm_id: selectedFarmId,
        image_base64: imageBase64
      });
      setLoading(false);
      alert(t('scan.offlineQueued', 'Offline mode active. Your scan has been saved locally and will auto-sync when internet returns.'));
      navigate('/dashboard');
      return;
    }

    try {
      const res = await apiClient.post('/api/scans/analyze', {
        crop: selectedCrop,
        farm_id: selectedFarmId,
        image_base64: imageBase64
      });

      // Navigate to Disease Result screen with state
      navigate('/scan-result', { state: { result: res.data } });
    } catch (err: any) {
      setError(err.response?.data?.detail || (language === 'mr' ? 'प्रतिमा विश्लेषण अयशस्वी झाले. कृपया पुन्हा प्रयत्न करा.' : 'Image analysis failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center justify-center gap-2">
          <Camera className="w-8 h-8 text-emerald-600" />
          {t('scan.title', 'Scan Crop Leaf')}
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
          {t('scan.subtitle', 'Take a clear photograph of the diseased crop leaf for instant AI Safety Gate classification & stepped IPM advisory.')}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-4 rounded-2xl font-semibold">
          {error}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-earth-100 shadow-xl p-6 sm:p-8 space-y-6">
        
        {/* Crop Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-gray-700 uppercase">
              {t('scan.selectCrop', 'Target Crop for Diagnosis')}
            </label>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              {t('scan.supportedCrops', 'Supported: Tomato, Rice, Soybean & Grape')}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['Tomato', 'Rice', 'Soybean', 'Grape'].map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCrop(c)}
                className={`py-3 px-4 rounded-2xl text-sm font-bold transition-all border flex items-center justify-center gap-2 ${selectedCrop === c ? 'bg-agri-800 text-white border-agri-800 shadow-md ring-2 ring-emerald-500/20' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
              >
                <span>{c === 'Tomato' ? '🍅' : c === 'Rice' ? '🌾' : c === 'Soybean' ? '🌱' : '🍇'}</span>
                <span>{getLocalizedCrop(c, language)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Image Dropzone / Camera View */}
        <div className="border-2 border-dashed border-emerald-200 bg-emerald-50/40 rounded-2xl p-6 text-center space-y-4 relative">
          {imageBase64 ? (
            <div className="relative inline-block max-w-xs mx-auto">
              <img src={imageBase64} alt="Crop Leaf Preview" className="rounded-2xl max-h-64 object-cover shadow-md border-2 border-emerald-500" />
              <button
                type="button"
                onClick={() => setImageBase64(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600"
                title={t('scan.removePhoto', 'Remove photo')}
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="py-6 space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900">{t('scan.uploadTitle', 'Upload or Snap Photo')}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t('scan.uploadSubtitle', 'JPEG, PNG up to 10MB')}</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all"
              >
                {t('scan.chooseBtn', 'Choose Image / Camera')}
              </button>
            </div>
          )}

          {/* Quick Demo Image Selectors */}
          <div className="pt-4 border-t border-emerald-100">
            <span className="text-[11px] font-bold text-gray-500 block mb-2">
              {t('scan.presetTitle', 'Preset Sample Leaf Photos:')}
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleSampleImage('clear')}
                className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-900 text-xs font-bold rounded-lg shadow-sm hover:bg-emerald-50"
              >
                {t('scan.clearPreset', '🌿 Clear Leaf (PASS Demo)')}
              </button>
              <button
                type="button"
                onClick={() => handleSampleImage('blurry')}
                className="px-3 py-1.5 bg-white border border-amber-300 text-amber-900 text-xs font-bold rounded-lg shadow-sm hover:bg-amber-50"
              >
                {t('scan.blurryPreset', '🌫️ Blurry Leaf (IQA Retry)')}
              </button>
              <button
                type="button"
                onClick={() => handleSampleImage('ood')}
                className="px-3 py-1.5 bg-white border border-blue-300 text-blue-900 text-xs font-bold rounded-lg shadow-sm hover:bg-blue-50"
              >
                {t('scan.oodPreset', '❓ Rare / OOD Sample')}
              </button>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          disabled={loading || !imageBase64}
          onClick={handleAnalyze}
          className={`w-full py-4 rounded-2xl font-extrabold text-base shadow-lg flex items-center justify-center gap-2 transition-all ${!imageBase64 || loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white transform hover:scale-[1.01]'}`}
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>{t('scan.analyzing', 'Analyzing Image Quality & AI Confidence...')}</span>
            </>
          ) : (
            <>
              <span>{t('scan.runAnalysis', 'Run AI Disease Analysis')}</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

      </div>
    </div>
  );
};
