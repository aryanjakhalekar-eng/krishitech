import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ScanAnalysisResponse } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { AISafetyBadge } from '../components/AISafetyBadge';
import { IQAGauge } from '../components/IQAGauge';
import { IPMAdvisoryCard } from '../components/IPMAdvisoryCard';
import { ArrowLeft, AlertTriangle, ShieldCheck, Activity, Volume2, VolumeX } from 'lucide-react';
import { getLocalizedCrop, getLocalizedDisease, getLocalizedSeverity, getLocalizedAdvisory } from '../utils/diseaseTranslations';

export const DiseaseResultPage: React.FC = () => {
  const { t, language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const result: ScanAnalysisResponse = location.state?.result;
  const [speaking, setSpeaking] = useState(false);

  // Stop speech when navigating away
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!result) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-gray-900">{t('results.noResultTitle', 'No Analysis Result Available')}</h3>
        <p className="text-xs text-gray-500 mt-1 mb-6">{t('results.noResultDesc', 'Please scan a crop leaf image first.')}</p>
        <Link to="/scan" className="px-6 py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow">
          {t('results.goToScan', 'Go to Scan Page')}
        </Link>
      </div>
    );
  }

  const {
    crop,
    predicted_disease,
    confidence_percentage,
    iqa,
    ood,
    severity,
    safety_gate,
    advisory,
    escalated_case_id,
    inference_note
  } = result;

  const currentCrop = result.detected_crop || crop;
  const localizedCropName = getLocalizedCrop(currentCrop, language);
  const localizedDiseaseName = getLocalizedDisease(currentCrop, predicted_disease || '', language);

  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert(language === 'mr' ? 'आपल्या ब्राउझरमध्ये आवाज वाचन समर्थित नाही.' : 'Text-to-speech not supported in this browser.');
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const localizedAdv = getLocalizedAdvisory(currentCrop, predicted_disease || '', advisory, language);
    let speechText = '';
    if (language === 'mr') {
      speechText = `पिकाचे नाव: ${localizedCropName}. रोग निदान: ${localizedDiseaseName}. ` +
        `मशागती पद्धती: ${localizedAdv.cultural}. ` +
        `जैविक नियंत्रण: ${localizedAdv.biological}. ` +
        `रासायनिक नियंत्रण: ${localizedAdv.chemical}. ` +
        `सुरक्षा सूचना: ${localizedAdv.safety}`;
    } else {
      speechText = `Target Crop: ${localizedCropName}. Disease Diagnosis: ${localizedDiseaseName}. ` +
        `Cultural Control: ${localizedAdv.cultural}. ` +
        `Biological Control: ${localizedAdv.biological}. ` +
        `Approved Chemical Control: ${localizedAdv.chemical}. ` +
        `Safety Warning: ${localizedAdv.safety}`;
    }

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = language === 'mr' ? 'mr-IN' : 'en-IN';
    utterance.rate = 0.92;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/scan')} className="text-xs font-bold text-gray-500 hover:text-gray-800 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> {t('results.backToScan', 'Scan Another Crop')}
        </button>

        {/* Farmer Accessibility: Read Aloud Voice Button */}
        <button
          onClick={handleToggleSpeech}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border shadow-sm transition-all ${
            speaking
              ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
              : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
          }`}
          title={speaking ? t('results.stopAudio', 'Stop Audio') : t('results.readAloud', 'Listen (Read Aloud)')}
        >
          {speaking ? <VolumeX className="w-4 h-4 text-amber-700" /> : <Volume2 className="w-4 h-4 text-emerald-700" />}
          <span>{speaking ? (t('results.stopAudio', 'Stop Audio')) : (t('results.readAloud', 'Listen (Read Aloud)'))}</span>
        </button>
      </div>

      {/* Crop Mismatch Auto-Correction Notice */}
      {result.crop_mismatch && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 bg-amber-200/90 px-2.5 py-0.5 rounded-full">
                  {t('results.cropMismatchBadge', 'Crop Auto-Corrected')}
                </span>
                <span className="text-xs font-bold text-amber-900">
                  {((result.crop_classifier_confidence || 0.99) * 100).toFixed(1)}% {t('results.leafMatch', 'Leaf Match')}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-amber-950 mt-1">
                {t('results.cropMismatchTitle', 'Crop Mismatch Detected — Routed to')} {getLocalizedCrop(result.detected_crop || '', language)}
              </h3>
              <p className="text-xs font-medium text-amber-900 mt-1 max-w-xl leading-relaxed">
                {language === 'mr'
                  ? `आपण ${getLocalizedCrop(result.selected_crop || '', 'mr')} निवडले होते, परंतु हे छायाचित्र ${getLocalizedCrop(result.detected_crop || '', 'mr')} पिकाचे पान असल्याचे AI ने ओळखले आहे. सिस्टीमने स्वयंचलितपणे योग्य वर्गीकरण व IPM सल्ला लागू केला आहे.`
                  : (result.mismatch_message || `This image was identified as a ${result.detected_crop} leaf, although ${result.selected_crop} was selected. The AI has automatically applied the ${result.detected_crop} disease classifier and IPM advisory.`)}
              </p>
              <div className="flex items-center gap-2 mt-2 text-[11px] font-bold">
                <span className="bg-white border border-amber-200 text-gray-700 px-2.5 py-0.5 rounded-md">
                  {t('results.selected', 'Selected')}: <span className="text-red-700">{getLocalizedCrop(result.selected_crop || '', language)}</span>
                </span>
                <span className="bg-white border border-emerald-300 text-emerald-800 px-2.5 py-0.5 rounded-md">
                  {t('results.aiVerified', 'AI Verified')}: <span className="text-emerald-700">{getLocalizedCrop(result.detected_crop || '', language)}</span>
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate(`/scan?crop=${result.detected_crop}`)}
            className="whitespace-nowrap px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow transition-all self-end sm:self-center"
          >
            {language === 'mr' ? `पुढील स्कॅनसाठी ${getLocalizedCrop(result.detected_crop || '', 'mr')} निवडा →` : `Set ${result.detected_crop} for Next Scan →`}
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-earth-100 shadow-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                {t('results.target', 'Target')}: {getLocalizedCrop(result.selected_crop || crop, language)}
              </span>
              <span className={`text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full ${result.detected_crop === (result.selected_crop || crop) ? 'text-blue-800 bg-blue-100' : 'text-amber-900 bg-amber-200'}`}>
                {t('results.detected', 'Detected')}: {getLocalizedCrop(result.detected_crop || crop, language)}
              </span>
              {result.domain_status && (
                <span className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-md ${result.domain_status.includes('MISMATCH') || result.domain_status.includes('OOD') ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
                  {result.domain_status}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
              {localizedDiseaseName}
            </h1>
            <p className="text-xs text-gray-500 font-mono">{inference_note}</p>
          </div>

          <div className="text-right sm:text-right bg-emerald-50/80 p-4 rounded-2xl border border-emerald-100 min-w-[140px]">
            <span className="text-3xl font-extrabold text-emerald-800">{confidence_percentage}%</span>
            <p className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider">{t('results.confidenceScore', 'AI Confidence Score')}</p>
          </div>
        </div>

        {/* 1. CORE FEATURE: AI SAFETY GATE BADGE */}
        {safety_gate && <AISafetyBadge result={safety_gate} />}

        {/* 2. Key Metrics Grid: IQA, OOD Distance, Severity % */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* IQA */}
          {iqa && <IQAGauge iqa={iqa} />}

          {/* OOD Score */}
          {ood && (
            <div className="p-4 rounded-xl border bg-blue-50/60 border-blue-200">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-blue-600" />
                  {t('ood.title', 'OOD Mahalanobis Distance')}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${ood.is_ood ? 'bg-amber-200 text-amber-900' : 'bg-blue-200 text-blue-900'}`}>
                  {ood.status}
                </span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-extrabold text-blue-950">{ood.mahalanobis_distance}</div>
                <p className="text-[11px] text-blue-800 mt-0.5">{t('ood.threshold', 'Threshold')}: {ood.ood_threshold}</p>
              </div>
            </div>
          )}

          {/* Damage Severity */}
          {severity && (
            <div className="p-4 rounded-xl border bg-amber-50/60 border-amber-200">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  {t('severity.title', 'Damage Severity')}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                  {getLocalizedSeverity(severity.severity_level, language)}
                </span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-extrabold text-amber-950">{severity.affected_area_percent}%</div>
                <p className="text-[11px] text-amber-800 mt-0.5">{t('severity.estimatedArea', 'Estimated Leaf Lesion Area')}</p>
              </div>
            </div>
          )}

        </div>

        {/* 3. STEPPED IPM ADVISORY CARD */}
        {advisory && <IPMAdvisoryCard advisory={advisory} crop={currentCrop} disease={predicted_disease} />}

        {/* Case Escalation Button if Safety Gate Failed */}
        {escalated_case_id && (
          <div className="bg-amber-100/70 border border-amber-300 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-sm text-amber-950">
                #{escalated_case_id} — {t('results.officerEscalatedTitle', 'Case Sent to Agricultural Officer')}
              </h4>
              <p className="text-xs text-amber-900 mt-0.5">
                {t('results.officerEscalatedDesc', 'Your local Gram Sevak will inspect this scan and issue verified guidance.')}
              </p>
            </div>
            <Link
              to="/cases"
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow transition-all whitespace-nowrap"
            >
              {t('results.trackCaseBtn', 'Track Case Status')}
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};
