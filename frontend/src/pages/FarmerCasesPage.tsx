import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, resolveImageUrl } from '../api/client';
import { DiseaseCase } from '../types';
import { FileText, AlertCircle, CheckCircle2, Clock, ChevronRight, Shield, Image as ImageIcon } from 'lucide-react';

export const FarmerCasesPage: React.FC = () => {
  const [cases, setCases] = useState<DiseaseCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFarmerCases = async () => {
      try {
        const res = await apiClient.get('/api/cases');
        setCases(res.data);
      } catch (err) {
        console.error('Error loading farmer cases:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFarmerCases();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-agri-900 to-agri-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs bg-white/10 text-emerald-300 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Farmer Case Tracking
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">
            My Escalated Crop Scans
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 mt-1">
            Track status updates and physical verification notes from your local Gram Sevak / Agricultural Extension Officer.
          </p>
        </div>

        <div className="bg-white/10 p-4 rounded-2xl border border-white/20 text-center min-w-[130px]">
          <span className="text-3xl font-extrabold text-emerald-400">{cases.length}</span>
          <p className="text-[11px] text-emerald-200 font-bold uppercase tracking-wider">Total Cases</p>
        </div>
      </div>

      {/* Case List */}
      {cases.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cases.map((c) => {
            const imgUrl = resolveImageUrl(c.image_url || c.scan?.image_url);
            return (
              <div key={c.id} className="bg-white rounded-2xl border border-earth-100 shadow-sm p-6 space-y-4 hover:border-emerald-500 transition-all">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-gray-900 text-base">Case #{c.id}</span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      c.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                      c.status === 'UNDER_REVIEW' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 h-24 flex items-center justify-center">
                    {imgUrl ? (
                      <img src={imgUrl} alt={c.crop} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-300" />
                    )}
                  </div>
                  <div className="col-span-2 space-y-1 text-xs text-gray-700">
                    <p>🌱 Crop: <span className="font-bold text-emerald-800">{c.crop}</span></p>
                    <p>🤖 Suspected: <span className="font-bold text-red-700">{c.predicted_disease}</span></p>
                    {c.verified_disease && (
                      <p>✅ Verified: <span className="font-bold text-emerald-700">{c.verified_disease}</span></p>
                    )}
                    <p>⚠️ Severity: <span className="font-bold text-amber-800">{c.severity}</span></p>
                  </div>
                </div>

                {c.officer_notes && (
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-900 text-xs mt-2">
                    <strong>Gram Sevak Officer Notes:</strong>
                    <p className="mt-0.5">{c.officer_notes}</p>
                  </div>
                )}
                {c.escalation_reason && !c.officer_notes && (
                  <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-amber-900 text-[11px] font-medium mt-2">
                    <strong>Escalation Reason:</strong> {c.escalation_reason}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 text-lg">No Escalated Cases</h3>
          <p className="text-xs text-gray-500 mt-1">All your crop disease scans passed automated verification or none are pending review.</p>
        </div>
      )}
    </div>
  );
};
