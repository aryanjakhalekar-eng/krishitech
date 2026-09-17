import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Farm } from '../types';
import { Sprout, Plus, MapPin, Layers } from 'lucide-react';

export const MyFarmsPage: React.FC = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const res = await apiClient.get('/api/farms');
        setFarms(res.data);
      } catch (err) {
        console.error("Error fetching farms:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFarms();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Sprout className="w-6 h-6 text-emerald-600" />
            My Farms & Plots
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage your registered crop land for location-based disease risk intelligence.</p>
        </div>

        <Link
          to="/add-farm"
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Farm Plot
        </Link>
      </div>

      {farms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((f) => (
            <div key={f.id} className="bg-white rounded-2xl border border-earth-100 shadow-sm p-6 space-y-3 hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-base text-gray-900">{f.farm_name}</span>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {f.crop}
                </span>
              </div>

              <div className="text-xs text-gray-600 space-y-1.5 pt-2 border-t border-gray-100">
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>{f.taluka}, {f.district} ({f.latitude.toFixed(4)}°, {f.longitude.toFixed(4)}°)</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-gray-400" />
                  <span>{f.area_acres} Acres • {f.soil_type} • Variety: {f.variety || 'N/A'}</span>
                </p>
              </div>

              <div className="pt-2">
                <Link
                  to={`/scan?farm_id=${f.id}&crop=${f.crop}`}
                  className="block w-full text-center py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-colors"
                >
                  📷 Scan Crop for this Farm
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
          <Sprout className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 text-lg">No Farms Registered</h3>
          <p className="text-xs text-gray-500 mt-1 mb-4">Add your farm plots to get localized micro-climate advisories.</p>
          <Link to="/add-farm" className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow">
            Add Farm Now
          </Link>
        </div>
      )}
    </div>
  );
};
