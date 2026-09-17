import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, resolveImageUrl } from '../api/client';
import { DiseaseCase } from '../types';
import { FileText, AlertTriangle, CheckCircle2, Clock, Search, Shield, Image as ImageIcon } from 'lucide-react';

export const OfficerDashboard: React.FC = () => {
  const [cases, setCases] = useState<DiseaseCase[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('PENDING');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOfficerQueue = async () => {
      try {
        const res = await apiClient.get(`/api/cases?status_filter=${filterStatus}`);
        setCases(res.data);
      } catch (err) {
        console.error('Error loading officer case queue:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOfficerQueue();
  }, [filterStatus]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-800 to-amber-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs bg-white/10 text-amber-200 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Extension Officer Web Console (Gram Sevak)
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">
            Human-in-the-Loop Triage Queue
          </h1>
          <p className="text-xs sm:text-sm text-amber-100/80 mt-1">
            Review low-confidence and Out-Of-Distribution crop disease scans before emitting farm-level guidance.
          </p>
        </div>

        <div className="bg-amber-950/60 p-4 rounded-2xl border border-amber-500/30 text-center min-w-[130px]">
          <span className="text-3xl font-extrabold text-amber-400">{cases.length}</span>
          <p className="text-[11px] text-amber-200 font-bold uppercase tracking-wider">Cases ({filterStatus})</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
        {['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'RESOLVED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterStatus === st ? 'bg-amber-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Case List */}
      {cases.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cases.map((c) => {
            const imgUrl = resolveImageUrl(c.image_url || c.scan?.image_url);
            return (
              <div key={c.id} className="bg-white rounded-2xl border border-earth-100 shadow-sm p-6 space-y-4 hover:border-amber-400 transition-all flex flex-col justify-between">
                
                <div>
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-gray-900 text-base">Case #{c.id}</span>
                      <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                        {c.status}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {/* Thumbnail Preview */}
                    <div className="col-span-1 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 h-24 flex items-center justify-center">
                      {imgUrl ? (
                        <img src={imgUrl} alt={c.crop} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-gray-300" />
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="col-span-2 space-y-1 text-xs text-gray-700">
                      <p>📍 Location: <span className="font-bold text-gray-900">{c.taluka}, {c.district}</span></p>
                      <p>🌱 Crop: <span className="font-bold text-emerald-800">{c.crop}</span></p>
                      <p>🤖 Prediction: <span className="font-bold text-red-700">{c.predicted_disease}</span></p>
                      <p>⚠️ Severity: <span className="font-bold text-amber-800">{c.severity}</span></p>
                    </div>
                  </div>

                  {c.escalation_reason && (
                    <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-amber-900 text-[11px] font-medium mt-3">
                      <strong>Reason:</strong> {c.escalation_reason}
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <Link
                    to={`/officer/review/${c.id}`}
                    className="block w-full text-center py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition-all"
                  >
                    Review & Verify Case #{c.id}
                  </Link>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 text-lg">No Cases Found ({filterStatus})</h3>
          <p className="text-xs text-gray-500 mt-1">All escalated crop scans in this category have been verified.</p>
        </div>
      )}

    </div>
  );
};
