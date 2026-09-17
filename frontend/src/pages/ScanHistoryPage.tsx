import React, { useState, useEffect } from 'react';
import { apiClient, resolveImageUrl } from '../api/client';
import { CropScan } from '../types';
import { Camera, Calendar, ShieldCheck, AlertTriangle, Image as ImageIcon } from 'lucide-react';

export const ScanHistoryPage: React.FC = () => {
  const [scans, setScans] = useState<CropScan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const res = await apiClient.get('/api/scans');
        setScans(res.data);
      } catch (err) {
        console.error('Error fetching scan history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchScans();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <Camera className="w-6 h-6 text-emerald-600" />
          Crop Scan History
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">Chronological record of all crop leaf scans and AI Safety Gate evaluations.</p>
      </div>

      {scans.length > 0 ? (
        <div className="bg-white rounded-2xl border border-earth-100 shadow-sm overflow-hidden divide-y divide-gray-100">
          {scans.map((s) => {
            const imgUrl = resolveImageUrl(s.image_url);
            return (
              <div key={s.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 flex items-center justify-center shrink-0">
                    {imgUrl ? (
                      <img src={imgUrl} alt={s.crop} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-300" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-gray-900">{s.crop}</span>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-mono">Scan #{s.id}</span>
                    </div>
                    <h4 className="font-bold text-sm text-emerald-800 mt-0.5">{s.predicted_disease}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Confidence: {(s.confidence * 100).toFixed(0)}% • Severity: {s.severity} ({s.affected_area_percent}%) • IQA: {s.iqa_status} ({s.iqa_score})
                    </p>
                  </div>
                </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 pt-2 sm:pt-0">
                <div className="text-right">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${s.safety_gate_action === 'AUTOMATED_ADVISORY' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {s.safety_gate_action === 'AUTOMATED_ADVISORY' ? 'AI PASSED' : 'HUMAN ESCALATED'}
                  </span>
                  <p className="text-[11px] text-gray-400 mt-1 flex items-center justify-end gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(s.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

            </div>
          );
        })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
          <Camera className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 text-lg">No Scans Available</h3>
          <p className="text-xs text-gray-500 mt-1">Scan a crop leaf photograph to record your first crop scan.</p>
        </div>
      )}
    </div>
  );
};
