import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useOffline } from '../contexts/OfflineContext';
import { useLanguage } from '../contexts/LanguageContext';
import { apiClient } from '../api/client';
import {
  Camera,
  Upload,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  HelpCircle,
  FileImage,
  ArrowRight
} from 'lucide-react';
import { getLocalizedCrop } from '../utils/diseaseTranslations';

export const ScanCropPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'upload' | 'camera'>(
    searchParams.get('mode') === 'camera' ? 'camera' : 'upload'
  );
  const [selectedCrop, setSelectedCrop] = useState<string>(searchParams.get('crop') || 'Tomato');
  const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>(
    searchParams.get('farm_id') ? parseInt(searchParams.get('farm_id')!) : undefined
  );
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);

  const { isOnline, queueScanForSync } = useOffline();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const supportedCrops = [
    { id: 'Tomato', icon: '🍅', en: 'Tomato', mr: 'टोमॅटो' },
    { id: 'Rice', icon: '🌾', en: 'Rice', mr: 'भात / धान' },
    { id: 'Soybean', icon: '🌱', en: 'Soybean', mr: 'सोयाबीन' },
    { id: 'Grape', icon: '🍇', en: 'Grape', mr: 'द्राक्ष' }
  ];

  const pipelineSteps = [
    {
      id: 1,
      en: '1. Image Quality Assessment',
      mr: '१. प्रतिमा गुणवत्ता तपासणी',
      descEn: 'Laplacian blur variance & illumination analysis',
      descMr: 'अंधुकपणा व प्रकाश तपासणी'
    },
    {
      id: 2,
      en: '2. Plant Verification',
      mr: '२. पिकाची पडताळणी',
      descEn: 'Validating green foliage & botanical leaf tissue',
      descMr: 'पानाचे अस्तित्व व हिरवेपणा पडताळणी'
    },
    {
      id: 3,
      en: '3. Crop Identification',
      mr: '३. पिकाची ओळख',
      descEn: 'Checking selected vs. detected crop domain',
      descMr: 'पिकाचा प्रकार व बदल तपासणी'
    },
    {
      id: 4,
      en: '4. Disease Detection',
      mr: '४. रोगाचे निदान',
      descEn: 'Deep learning MobileNetV3 multi-class inference',
      descMr: 'एआय द्वारे अचूक रोग वर्गीकरण'
    },
    {
      id: 5,
      en: '5. OOD & Safety Check',
      mr: '५. OOD आणि सुरक्षितता तपासणी',
      descEn: 'Mahalanobis distance distribution safety gating',
      descMr: 'सुरक्षितता व महालानोबिस चाचणी'
    },
    {
      id: 6,
      en: '6. Advisory Generation',
      mr: '६. सल्ला तयार करणे',
      descEn: 'Synthesizing stepped non-hallucinatory IPM measures',
      descMr: 'सेंद्रिय व रासायनिक सुरक्षित सल्ला'
    }
  ];

  const handleFile = (file: File) => {
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError(language === 'mr' ? 'कृपया वैध प्रतिमा फाईल निवडा.' : 'Please select a valid image file.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Instant sample leaf generator for rapid demo testing
  const handleSampleImage = (type: 'clear' | 'blurry' | 'ood') => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (type === 'clear') {
        ctx.fillStyle = '#16a34a'; // Green leaf
        ctx.fillRect(0, 0, 400, 400);
        ctx.fillStyle = '#92400e'; // Brown spot
        ctx.beginPath();
        ctx.arc(200, 200, 65, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#ca8a04';
        ctx.beginPath();
        ctx.arc(190, 190, 30, 0, 2 * Math.PI);
        ctx.fill();
      } else if (type === 'blurry') {
        ctx.fillStyle = '#86efac';
        ctx.fillRect(0, 0, 400, 400);
      } else {
        ctx.fillStyle = '#3b82f6'; // Blue object
        ctx.fillRect(0, 0, 400, 400);
      }
    }
    setImageBase64(canvas.toDataURL('image/jpeg'));
    setError('');
  };

  const handleAnalyze = async () => {
    if (!imageBase64) {
      setError(language === 'mr' ? 'कृपया पिकाच्या पानाचा फोटो अपलोड करा किंवा काढा.' : 'Please upload or take a crop leaf photo.');
      return;
    }

    setLoading(true);
    setError('');
    setCurrentStepIndex(1);

    // Simulate animated step progression through the 6 real AI pipeline steps
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < 6) return prev + 1;
        return prev;
      });
    }, 450);

    if (!isOnline) {
      clearInterval(stepInterval);
      await queueScanForSync({
        crop: selectedCrop,
        farm_id: selectedFarmId,
        image_base64: imageBase64
      });
      setLoading(false);
      alert(language === 'mr' ? 'ऑफलाइन मोड: फोटो सेव्ह झाला आहे आणि नेटवर्क आल्यावर विश्लेषित केला जाईल.' : 'Offline Mode: Scan saved locally and will auto-analyze when internet returns.');
      navigate('/dashboard');
      return;
    }

    try {
      const res = await apiClient.post('/api/scans/analyze', {
        crop: selectedCrop,
        farm_id: selectedFarmId,
        image_base64: imageBase64
      });

      clearInterval(stepInterval);
      setCurrentStepIndex(6);

      // Brief delay to let user see completed pipeline
      setTimeout(() => {
        navigate('/scan-result', { state: { result: res.data } });
      }, 500);
    } catch (err: any) {
      clearInterval(stepInterval);
      const isNet = err.code === 'ERR_NETWORK' || !err.response;
      if (isNet) {
        setError(language === 'mr' ? 'कृषिरक्षक AI सर्व्हरशी संपर्क होऊ शकला नाही. कृपया पुन्हा प्रयत्न करा.' : 'Unable to connect to KrishiRakshak AI server. Please try again.');
      } else {
        setError(err.response?.data?.detail || (language === 'mr' ? 'प्रतिमा विश्लेषण अयशस्वी झाले. कृपया पुन्हा प्रयत्न करा.' : 'Image analysis failed. Please try again.'));
      }
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Top Header matching reference: ← Scan Crop */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'mr' ? 'मागे जा' : 'Back'}</span>
        </button>

        <h1 className="text-base sm:text-lg font-black text-gray-900">
          {language === 'mr' ? 'पिकाची तपासणी करा' : 'Scan Crop'}
        </h1>

        <div className="w-12" />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-4 rounded-2xl flex items-center gap-2.5 font-semibold">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Upload/Camera (Left) & Vertical AI Pipeline (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN (Span 7): Upload/Camera Area */}
        <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-7 space-y-5">
          
          {/* Tabs: Upload Image / Take Photo */}
          <div className="flex items-center gap-2 p-1 bg-gray-100/80 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'upload'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>{language === 'mr' ? 'फोटो अपलोड करा' : 'Upload Image'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('camera');
                cameraInputRef.current?.click();
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'camera'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Camera className="w-4 h-4 text-emerald-600" />
              <span>{language === 'mr' ? 'फोटो काढा' : 'Take Photo'}</span>
            </button>
          </div>

          {/* Supported Crop Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              {language === 'mr' ? 'पिकाचा प्रकार निवडा:' : 'Select Crop:'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {supportedCrops.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCrop(c.id)}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    selectedCrop === c.id
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 font-bold shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <span className="text-xl block mb-0.5">{c.icon}</span>
                  <span className="text-[11px] block leading-tight">{language === 'mr' ? c.mr : c.en}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Large Upload / Dropzone matching reference design */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] ${
              isDragOver
                ? 'border-emerald-500 bg-emerald-50/50'
                : imageBase64
                ? 'border-emerald-400 bg-emerald-50/20'
                : 'border-gray-200 hover:border-emerald-400 bg-gray-50/50 hover:bg-emerald-50/10'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            {imageBase64 ? (
              <div className="space-y-3">
                <img
                  src={imageBase64}
                  alt="Selected Leaf"
                  className="max-h-48 mx-auto rounded-xl object-contain shadow-sm border border-emerald-200"
                />
                <p className="text-xs text-emerald-700 font-semibold">
                  {language === 'mr' ? 'फोटो यशस्वीरित्या लोड झाला. बदलण्यासाठी क्लिक करा.' : 'Photo ready. Click to change.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-gray-800">
                    {language === 'mr'
                      ? 'पिकाचा फोटो येथे ओढा किंवा अपलोड करण्यासाठी क्लिक करा'
                      : 'Drag & drop your image here or click to upload'}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {language === 'mr' ? 'JPG, PNG किंवा WebP (१० MB पर्यंत)' : 'JPG, PNG or WebP (up to 10 MB)'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 shadow-sm transition-colors"
                >
                  {language === 'mr' ? 'फोटो निवडा' : 'Choose Image'}
                </button>
              </div>
            )}
          </div>

          {/* Quick Demo Test Presets */}
          <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-3">
            <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">
              {language === 'mr' ? 'चाचणीसाठी नमुना पाने:' : 'Demo Leaf Samples:'}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSampleImage('clear')}
                className="py-1.5 px-2 bg-white hover:bg-emerald-50 text-emerald-800 border border-gray-200 text-[11px] font-bold rounded-lg shadow-sm"
              >
                🌿 {language === 'mr' ? 'स्पष्ट रोगट पान' : 'Clear Leaf'}
              </button>
              <button
                type="button"
                onClick={() => handleSampleImage('blurry')}
                className="py-1.5 px-2 bg-white hover:bg-amber-50 text-amber-800 border border-gray-200 text-[11px] font-bold rounded-lg shadow-sm"
              >
                🌫️ {language === 'mr' ? 'अंधुक पान (IQA)' : 'Blurry Leaf'}
              </button>
              <button
                type="button"
                onClick={() => handleSampleImage('ood')}
                className="py-1.5 px-2 bg-white hover:bg-blue-50 text-blue-800 border border-gray-200 text-[11px] font-bold rounded-lg shadow-sm"
              >
                ❓ {language === 'mr' ? 'इतर वस्तू (OOD)' : 'Non-Plant'}
              </button>
            </div>
          </div>

          {/* Analyze CTA Button */}
          <button
            type="button"
            disabled={!imageBase64 || loading}
            onClick={handleAnalyze}
            className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
              !imageBase64 || loading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[#15803D] hover:bg-[#166534] active:scale-95 text-white shadow-emerald-700/20'
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{language === 'mr' ? 'AI विश्लेषण सुरू आहे...' : 'Analyzing with AI Pipeline...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{language === 'mr' ? 'रोग निदान सुरू करा' : 'Start Disease Diagnosis'}</span>
              </>
            )}
          </button>
        </div>

        {/* RIGHT COLUMN (Span 5): Vertical AI Analysis Pipeline matching section 14 */}
        <div className="lg:col-span-5 bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{language === 'mr' ? 'AI विश्लेषण प्रक्रिया' : 'AI Analysis Pipeline'}</span>
            </h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              6 Stages
            </span>
          </div>

          <div className="space-y-3 relative">
            {pipelineSteps.map((step) => {
              const isDone = currentStepIndex >= step.id;
              const isCurrent = currentStepIndex === step.id && loading;

              return (
                <div
                  key={step.id}
                  className={`p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                    isCurrent
                      ? 'border-emerald-500 bg-emerald-50/60 shadow-sm'
                      : isDone
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-gray-100 bg-gray-50/50 opacity-70'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-emerald-500 text-white animate-pulse'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                  </div>

                  <div>
                    <p
                      className={`text-xs font-bold ${
                        isDone || isCurrent ? 'text-gray-900' : 'text-gray-600'
                      }`}
                    >
                      {language === 'mr' ? step.mr : step.en}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                      {language === 'mr' ? step.descMr : step.descEn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3 text-[11px] text-emerald-900 font-medium leading-relaxed">
            🛡️ {language === 'mr'
              ? 'एआय सुरक्षा चाळणी: कोणतीही चूक टाळण्यासाठी ६-टप्प्यांची कडक तपासणी केली जाते.'
              : 'AI Safety Gate: 6-stage verification prevents false positives and ensures safe agriculture.'}
          </div>
        </div>

      </div>

    </div>
  );
};
