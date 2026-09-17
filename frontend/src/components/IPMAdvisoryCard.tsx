import React from 'react';
import { IPMAdvisory } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedAdvisory } from '../utils/diseaseTranslations';
import { Sprout, Bug, AlertTriangle, ShieldAlert } from 'lucide-react';

interface Props {
  advisory: IPMAdvisory;
  crop?: string;
  disease?: string;
}

export const IPMAdvisoryCard: React.FC<Props> = ({ advisory, crop = '', disease = '' }) => {
  const { t, language } = useLanguage();
  const localized = getLocalizedAdvisory(crop, disease, advisory, language);

  return (
    <div className="bg-white rounded-2xl border border-earth-100 shadow-md overflow-hidden">
      <div className="bg-agri-800 text-white px-5 py-3.5 flex items-center justify-between">
        <h3 className="font-bold text-base flex items-center gap-2">
          <Sprout className="w-5 h-5 text-emerald-300" />
          {t('ipm.title', 'WHAT SHOULD YOU DO? (Stepped IPM Advisory)')}
        </h3>
        <span className="text-xs bg-white/10 text-emerald-200 px-2.5 py-1 rounded-md font-mono">
          {t('ipm.verifiedBadge', 'Non-Generative Verified Data')}
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Step 1: Cultural Control */}
        <div className="border-l-4 border-emerald-500 pl-4 py-1">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs">{t('ipm.step1', 'Step 1')}</span>
            {t('ipm.culturalTitle', 'Cultural Control')}
          </div>
          <p className="text-xs sm:text-sm text-gray-700 mt-1 leading-relaxed whitespace-pre-line">
            {localized.cultural}
          </p>
        </div>

        {/* Step 2: Biological Control */}
        <div className="border-l-4 border-blue-500 pl-4 py-1">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">{t('ipm.step2', 'Step 2')}</span>
            {t('ipm.biologicalTitle', 'Biological Control')}
          </div>
          <p className="text-xs sm:text-sm text-gray-700 mt-1 leading-relaxed">
            {localized.biological}
          </p>
        </div>

        {/* Step 3: Approved Chemical Control */}
        <div className="border-l-4 border-purple-500 pl-4 py-1">
          <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
            <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs">{t('ipm.step3', 'Step 3')}</span>
            {t('ipm.chemicalTitle', 'Approved Chemical Control (CABC Registered)')}
          </div>
          <p className="text-xs sm:text-sm text-gray-700 mt-1 leading-relaxed font-semibold text-gray-900">
            {localized.chemical}
          </p>
        </div>

        {/* Safety Warning */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-3 text-red-900 text-xs">
          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-red-950 block mb-0.5">
              {t('ipm.safetyTitle', 'MANDATORY SAFETY WARNING & PPE')}
            </span>
            {localized.safety}
          </div>
        </div>
      </div>
    </div>
  );
};
