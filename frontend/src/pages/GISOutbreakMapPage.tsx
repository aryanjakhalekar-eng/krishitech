import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { OutbreakHotspot } from '../types';
import { GISMap } from '../components/GISMap';
import { Map, Filter, AlertTriangle, Layers, Sprout } from 'lucide-react';

export const GISOutbreakMapPage: React.FC = () => {
  const [hotspots, setHotspots] = useState<OutbreakHotspot[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHotspots = async () => {
      setLoading(true);
      try {
        let url = '/api/outbreaks/hotspots?';
        if (selectedCrop) url += `crop=${selectedCrop}&`;
        if (selectedDistrict) url += `district=${selectedDistrict}&`;
        if (selectedSeverity) url += `severity=${selectedSeverity}&`;

        const res = await apiClient.get(url);
        setHotspots(res.data);
      } catch (err) {
        console.error('Error loading GIS outbreak hotspots:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotspots();
  }, [selectedCrop, selectedDistrict, selectedSeverity]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <Map className="w-7 h-7 text-blue-600" />
            Maharashtra District GIS Outbreak Intelligence Map
          </h1>
          <p className="text-xs text-gray-500 mt-1">Real-time disease outbreak hotspots, active case clusters, and micro-climate risk mapping.</p>
        </div>

        <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-200 text-xs font-bold text-blue-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-blue-600" />
          {hotspots.length} Active Hotspot Clusters
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-5 rounded-2xl border border-earth-100 shadow-sm flex flex-wrap items-center gap-4 text-xs font-bold">
        <div className="flex items-center gap-1.5 text-gray-500">
          <Filter className="w-4 h-4" /> Filters:
        </div>

        <div>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-600"
          >
            <option value="">All Districts</option>
            <option value="Pune">Pune</option>
            <option value="Solapur">Solapur</option>
            <option value="Satara">Satara</option>
            <option value="Nashik">Nashik</option>
            <option value="Kolhapur">Kolhapur</option>
            <option value="Sangli">Sangli</option>
            <option value="Ahmednagar">Ahmednagar</option>
            <option value="Nanded">Nanded</option>
          </select>
        </div>

        <div>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-600"
          >
            <option value="">All Crops</option>
            <option value="Tomato">Tomato</option>
            <option value="Soybean">Soybean</option>
            <option value="Rice">Rice</option>
            <option value="Grapes">Grapes</option>
            <option value="Potato">Potato</option>
            <option value="Cotton">Cotton</option>
          </select>
        </div>

        <div>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-600"
          >
            <option value="">All Severities</option>
            <option value="HIGH">High Severity</option>
            <option value="MEDIUM">Medium Severity</option>
            <option value="LOW">Low Severity</option>
          </select>
        </div>

        {(selectedCrop || selectedDistrict || selectedSeverity) && (
          <button
            onClick={() => { setSelectedCrop(''); setSelectedDistrict(''); setSelectedSeverity(''); }}
            className="text-xs text-red-600 hover:underline font-bold"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Interactive Leaflet Map */}
      <GISMap hotspots={hotspots} />

      {/* Hotspots Summary Table */}
      <div className="bg-white rounded-2xl border border-earth-100 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-base text-gray-900">District & Taluka Hotspot Summary</h3>
        
        {hotspots.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                <tr>
                  <th className="p-3">District</th>
                  <th className="p-3">Taluka</th>
                  <th className="p-3">Crop</th>
                  <th className="p-3">Outbreak Disease</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Active Cases</th>
                  <th className="p-3">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {hotspots.map((h, i) => (
                  <tr key={i} className="hover:bg-gray-50/50">
                    <td className="p-3 font-bold text-gray-900">{h.district}</td>
                    <td className="p-3 font-medium text-gray-700">{h.taluka}</td>
                    <td className="p-3 font-medium text-emerald-800">{h.crop}</td>
                    <td className="p-3 font-bold text-red-700">{h.disease}</td>
                    <td className="p-3 font-semibold">{h.severity}</td>
                    <td className="p-3 font-bold text-blue-900">{h.cases_count}</td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${h.risk_level === 'High' ? 'bg-red-600' : 'bg-amber-600'}`}>
                        {h.risk_level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-gray-500 py-4 text-center">No outbreak hotspots match the selected filters.</p>
        )}
      </div>

    </div>
  );
};
