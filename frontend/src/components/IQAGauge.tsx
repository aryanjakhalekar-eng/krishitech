import React from 'react';
import { IQAResult } from '../types';
import { Sparkles, Eye, AlertCircle } from 'lucide-react';

interface Props {
  iqa: IQAResult;
}

export const IQAGauge: React.FC<Props> = ({ iqa }) => {
  const isGood = iqa.is_usable;

  return (
    <div className={`p-4 rounded-xl border ${isGood ? 'bg-emerald-50/60 border-emerald-200' : 'bg-red-50/60 border-red-200'} transition-all`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isGood ? (
            <Sparkles className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span className="font-bold text-sm text-gray-900">
            Image Quality Assessment (IQA)
          </span>
        </div>
        <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${isGood ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
          {iqa.status}
        </span>
      </div>

      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Blur Variance: {iqa.blur_variance}</span>
          <span>Score: {(iqa.iqa_score * 100).toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full ${isGood ? 'bg-emerald-500' : 'bg-red-500'}`}
            style={{ width: `${Math.min(100, iqa.iqa_score * 100)}%` }}
          />
        </div>
      </div>
      <p className="text-xs text-gray-600 mt-2 italic">{iqa.message}</p>
    </div>
  );
};
