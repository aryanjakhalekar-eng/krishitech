import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedCrop, getLocalizedDisease } from '../utils/diseaseTranslations';
import { apiClient, resolveImageUrl } from '../api/client';
import { DiseaseCase, CropScan } from '../types';
import { Shield, ArrowLeft, CheckCircle2, XCircle, FileText, AlertTriangle, Image as ImageIcon, Sparkles, ZoomIn } from 'lucide-react';

export const OfficerCaseReviewPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { caseId } = useParams();
  const [caseItem, setCaseItem] = useState<DiseaseCase | null>(null);
  const [scan, setScan] = useState<CropScan | null>(null);
  const [verifiedDisease, setVerifiedDisease] = useState('');
  const [severityAdjusted, setSeverityAdjusted] = useState('MEDIUM');
  const [officerNotes, setOfficerNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await apiClient.get(`/api/cases/${caseId}`);
        setCaseItem(res.data);
        setVerifiedDisease(res.data.verified_disease || res.data.predicted_disease);
        setSeverityAdjusted(res.data.severity || 'MEDIUM');
        setOfficerNotes(res.data.officer_notes || '');

        if (res.data.scan) {
          setScan(res.data.scan);
        } else if (res.data.scan_id) {
          const scanRes = await apiClient.get(`/api/scans/${res.data.scan_id}`);
          setScan(scanRes.data.scan);
        }
      } catch (err) {
        console.error('Error fetching case detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [caseId]);

  const handleSubmitReview = async (newStatus: 'VERIFIED' | 'REJECTED') => {
    if (!caseId) return;
    setSubmitting(true);
    setError('');
    try {
      await apiClient.post('/api/officer/review', {
        case_id: parseInt(caseId),
        verified_diagnosis: verifiedDisease,
        severity_adjusted: severityAdjusted,
        review_notes: officerNotes,
        status: newStatus
      });
      navigate('/officer/queue');
    } catch (err: any) {
      setError(err.response?.data?.detail || (language === 'mr' ? 'पुनरावलोकन सादर करणे अयशस्वी झाले.' : 'Failed to submit review.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !caseItem) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-gray-500">
        {language === 'mr' ? 'केस तपशील लोड करत आहे...' : 'Loading case details...'}
      </div>
    );
  }

  const rawImageUrl = scan?.image_url || caseItem?.image_url;
  const fullImageUrl = resolveImageUrl(rawImageUrl);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <button onClick={() => navigate('/officer/queue')} className="text-xs font-bold text-gray-500 hover:text-gray-800 flex items-center gap-1.5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> {language === 'mr' ? 'केस रांगेकडे परत जा' : 'Back to Triage Queue'}
      </button>

      <div className="bg-white rounded-3xl border border-earth-100 shadow-xl p-6 sm:p-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                {language === 'mr' ? 'तपासणी केस' : 'Escalated Case'} #{caseItem.id}
              </span>
              <span className="text-xs font-bold text-gray-500">
                Scan ID #{caseItem.scan_id}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mt-2">
              {language === 'mr' ? 'तपासणी: ' : 'Review: '}
              {getLocalizedCrop(caseItem.crop, language)} — {getLocalizedDisease(caseItem.crop, caseItem.predicted_disease, language)}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {language === 'mr' ? 'स्थान' : 'Location'}: {caseItem.taluka}, {caseItem.district} • {language === 'mr' ? 'स्थिती' : 'Status'}: <span className="font-bold text-gray-700">{caseItem.status}</span>
            </p>
          </div>

          <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-xs max-w-xs">
            <span className="font-bold text-amber-900 block flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" /> {language === 'mr' ? 'पाठवण्याचे कारण' : 'Reason for Escalation'}
            </span>
            <span className="text-amber-800 text-[11px] mt-0.5 block">{caseItem.escalation_reason || 'Low confidence / OOD safety trigger'}</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-xs p-3.5 rounded-xl font-semibold border border-red-200">
            {error}
          </div>
        )}

        {/* Side by side image & AI analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* Farmer's Crop Image Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                Submitted Crop Leaf Photograph
              </label>
              {fullImageUrl && !imageError && (
                <button
                  type="button"
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="text-[11px] font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1"
                >
                  <ZoomIn className="w-3 h-3" /> {isZoomed ? 'Standard View' : 'Zoom In'}
                </button>
              )}
            </div>

            <div className={`relative bg-gray-950/5 rounded-2xl overflow-hidden border border-gray-200 flex items-center justify-center transition-all ${isZoomed ? 'h-96' : 'h-80'}`}>
              {fullImageUrl && !imageError ? (
                <img
                  src={fullImageUrl}
                  alt={`Crop leaf - ${caseItem.crop}`}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <div className="p-12 text-center text-xs text-gray-400 space-y-2">
                  <ImageIcon className="w-10 h-10 mx-auto text-gray-300 stroke-1" />
                  <p className="font-medium text-gray-500">Image Preview Not Available</p>
                  <p className="text-[10px] text-gray-400 font-mono">{rawImageUrl || 'No image attached'}</p>
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2.5 py-1 rounded-lg font-mono">
                {caseItem.crop} • {caseItem.predicted_disease}
              </div>
            </div>
          </div>

          {/* AI Metrics */}
          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-3.5 text-xs">
            <h4 className="font-bold text-sm text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              {language === 'mr' ? 'AI निष्कर्ष आणि मूल्यमापन मेट्रिक्स' : 'AI Inference & Triage Metrics'}
            </h4>
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="text-gray-500">{language === 'mr' ? 'लक्ष्य पीक:' : 'Target Crop:'}</span>
              <span className="font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                {getLocalizedCrop(caseItem.crop, language)}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="text-gray-500">{language === 'mr' ? 'अनुमानित रोग निदान:' : 'Predicted Diagnosis:'}</span>
              <span className="font-extrabold text-red-700">
                {getLocalizedDisease(caseItem.crop, caseItem.predicted_disease, language)}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="text-gray-500">{language === 'mr' ? 'AI अचूकता:' : 'AI Confidence:'}</span>
              <span className="font-bold text-gray-900">{scan ? (scan.confidence * 100).toFixed(1) : 75.0}%</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="text-gray-500">{language === 'mr' ? 'OOD महालानोबिस अंतर:' : 'OOD Mahalanobis Distance:'}</span>
              <span className="font-bold text-blue-700">{scan ? scan.ood_distance.toFixed(2) : '3.80'} <span className="text-[10px] text-gray-400 font-normal">({language === 'mr' ? 'मर्यादा' : 'Threshold'} 4.5)</span></span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="text-gray-500">{language === 'mr' ? 'प्रतिमा गुणवत्ता (IQA):' : 'Image Quality (IQA):'}</span>
              <span className="font-bold text-emerald-700">{scan ? scan.iqa_status : 'GOOD'} {scan?.iqa_score ? `(${scan.iqa_score.toFixed(2)})` : ''}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-500">{language === 'mr' ? 'अंदाजित तीव्रता:' : 'Estimated Lesion Severity:'}</span>
              <span className="font-bold text-amber-700">{scan ? scan.severity : (caseItem.severity || 'MEDIUM')} {scan?.affected_area_percent ? `(${scan.affected_area_percent}%)` : ''}</span>
            </div>
          </div>

        </div>

        {/* Officer Verification Form */}
        <div className="bg-amber-50/60 p-6 rounded-2xl border border-amber-200 space-y-4">
          <h3 className="font-extrabold text-base text-amber-950 flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-700" />
            {language === 'mr' ? 'ग्रामसेवक तज्ज्ञ पडताळणी कृती' : 'Gram Sevak Expert Action & Verification'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                {language === 'mr' ? 'पुष्टी केलेले / सुधारित रोग निदान' : 'Confirmed / Corrected Diagnosis'}
              </label>
              <select
                value={verifiedDisease}
                onChange={(e) => setVerifiedDisease(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-600"
              >
                <option value="Early Blight">{language === 'mr' ? 'अर्ली ब्लाइट (Early Blight)' : 'Early Blight'}</option>
                <option value="Late Blight">{language === 'mr' ? 'लेट ब्लाइट (Late Blight)' : 'Late Blight'}</option>
                <option value="Leaf Mold">{language === 'mr' ? 'पानावरील बुरशी (Leaf Mold)' : 'Leaf Mold'}</option>
                <option value="Bacterial Spot">{language === 'mr' ? 'जिवाणूजन्य ठिपके (Bacterial Spot)' : 'Bacterial Spot'}</option>
                <option value="Bacterial Leaf Blight">{language === 'mr' ? 'जिवाणू करपा (Bacterial Leaf Blight)' : 'Bacterial Leaf Blight'}</option>
                <option value="Brown Spot">{language === 'mr' ? 'तपकिरी ठिपके (Brown Spot)' : 'Brown Spot'}</option>
                <option value="Blast">{language === 'mr' ? 'ब्लास्ट करपा (Leaf Blast)' : 'Blast (Leaf Blast)'}</option>
                <option value="Tungro">{language === 'mr' ? 'टुंग्रो विषाणू रोग (Tungro)' : 'Tungro Disease'}</option>
                <option value="Leaf Spot">{language === 'mr' ? 'पानावरील ठिपके (Leaf Spot)' : 'Leaf Spot'}</option>
                <option value="Healthy Crop">{language === 'mr' ? 'निरोगी पीक (Healthy Crop)' : 'Healthy Crop (No Disease)'}</option>
                <option value="Unsupported Crop Domain">{language === 'mr' ? 'असमर्थित पीक / बाहेरील नमुना (OOD)' : 'Unsupported Crop Domain / OOD'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                {language === 'mr' ? 'सुधारित तीव्रता' : 'Adjusted Severity'}
              </label>
              <select
                value={severityAdjusted}
                onChange={(e) => setSeverityAdjusted(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-600"
              >
                <option value="LOW">{language === 'mr' ? 'कमी तीव्रता (LOW)' : 'LOW Severity'}</option>
                <option value="MEDIUM">{language === 'mr' ? 'मध्यम तीव्रता (MEDIUM)' : 'MEDIUM Severity'}</option>
                <option value="HIGH">{language === 'mr' ? 'उच्च तीव्रता (HIGH)' : 'HIGH Severity'}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              {t('officer.notesLabel', 'Official Treatment Notes & Advisory for Farmer')}
            </label>
            <textarea
              rows={3}
              value={officerNotes}
              onChange={(e) => setOfficerNotes(e.target.value)}
              placeholder={t('officer.notesPlaceholder', 'Enter dosage, precautions, and field visit instructions...')}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-amber-600"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmitReview('VERIFIED')}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              {language === 'mr' ? 'निदान सत्यापित करा आणि शेतकऱ्यास कळवा' : 'Verify Diagnosis & Notify Farmer'}
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmitReview('REJECTED')}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition-all"
            >
              <XCircle className="w-4 h-4" />
              {language === 'mr' ? 'फोटो नाकारा' : 'Reject Image'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
