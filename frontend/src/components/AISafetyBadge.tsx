import React from 'react';
import { SafetyGateResult } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedSafetyGate } from '../utils/diseaseTranslations';
import { CheckCircle2, AlertTriangle, RefreshCw, UserCheck } from 'lucide-react';

interface Props {
  result: SafetyGateResult;
}

export const AISafetyBadge: React.FC<Props> = ({ result }) => {
  const { t, language } = useLanguage();
  const localized = getLocalizedSafetyGate(result.action, language);

  if (result.action === 'AUTOMATED_ADVISORY' || result.gate_passed) {
    return (
      <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="bg-emerald-500 text-white p-2.5 rounded-xl shadow">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-600 text-white text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                {localized.actionLabel || t('safetyGate.passedBadge', 'PASSED')}
              </span>
              <h4 className="text-base sm:text-lg font-bold text-emerald-950">
                {language === 'mr' ? localized.title : result.display_title}
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-emerald-800 mt-1 font-medium leading-relaxed">
              {language === 'mr' ? localized.message : result.display_message}
            </p>
            <div className="mt-2 text-[11px] text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-md font-mono inline-block">
              {language === 'mr' ? 'गेट मूल्यमापन: ' : 'Gate Evaluator: '}{result.reason}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (result.action === 'HUMAN_ESCALATION') {
    return (
      <div className="bg-amber-50 border-2 border-amber-500 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="bg-amber-500 text-white p-2.5 rounded-xl shadow">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-600 text-white text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                {localized.actionLabel || t('safetyGate.escalationBadge', 'HUMAN ESCALATION')}
              </span>
              <h4 className="text-base sm:text-lg font-bold text-amber-950">
                {language === 'mr' ? localized.title : result.display_title}
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-amber-900 mt-1 font-medium leading-relaxed">
              {language === 'mr' ? localized.message : result.display_message}
            </p>
            <div className="mt-2 text-[11px] text-amber-800 bg-amber-100 px-2.5 py-1 rounded-md font-mono inline-block">
              {language === 'mr' ? 'कारण: ' : 'Reason: '}{result.reason}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-4 sm:p-5 shadow-sm">
      <div className="flex items-start gap-3.5">
        <div className="bg-red-500 text-white p-2.5 rounded-xl shadow">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-red-600 text-white text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
              {localized.actionLabel || t('safetyGate.retryBadge', 'RETRY REQUIRED')}
            </span>
            <h4 className="text-base sm:text-lg font-bold text-red-950">
              {language === 'mr' ? localized.title : result.display_title}
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-red-900 mt-1 font-medium leading-relaxed">
            {language === 'mr' ? localized.message : result.display_message}
          </p>
        </div>
      </div>
    </div>
  );
};
