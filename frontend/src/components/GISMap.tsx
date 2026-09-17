import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import { OutbreakHotspot } from '../types';
import L from 'leaflet';

// Fix default marker icon issue in Leaflet + Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Props {
  hotspots: OutbreakHotspot[];
  selectedDistrict?: string;
  onSelectHotspot?: (hotspot: OutbreakHotspot) => void;
}

export const GISMap: React.FC<Props> = ({ hotspots, onSelectHotspot }) => {
  // Center of Maharashtra
  const maharashtraCenter: [number, number] = [18.8, 75.8];

  return (
    <div className="w-full h-[450px] sm:h-[550px] relative rounded-2xl overflow-hidden border border-earth-100 shadow-md">
      <MapContainer center={maharashtraCenter} zoom={7} scrollWheelZoom={true} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {hotspots.map((spot, idx) => (
          <React.Fragment key={idx}>
            {/* Heatmap effect circle */}
            <CircleMarker
              center={[spot.lat, spot.lng]}
              radius={Math.min(35, 12 + spot.cases_count * 4)}
              pathOptions={{
                color: spot.risk_level === 'High' ? '#ef4444' : '#f59e0b',
                fillColor: spot.risk_level === 'High' ? '#f87171' : '#fbbf24',
                fillOpacity: 0.35,
              }}
            />
            {/* Pin Marker */}
            <Marker position={[spot.lat, spot.lng]}>
              <Popup>
                <div className="p-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-sm text-gray-900">{spot.district}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${spot.risk_level === 'High' ? 'bg-red-600' : 'bg-amber-600'}`}>
                      {spot.risk_level} Risk
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">Taluka: <span className="font-bold text-gray-800">{spot.taluka}</span></p>
                  <p className="text-xs text-gray-600 font-medium">Crop: <span className="font-bold text-emerald-700">{spot.crop}</span></p>
                  <p className="text-xs text-gray-600 font-medium">Disease: <span className="font-bold text-red-700">{spot.disease}</span></p>
                  <div className="pt-1.5 border-t border-gray-200 flex justify-between items-center text-xs font-bold text-gray-800">
                    <span>Active Cases:</span>
                    <span className="text-agri-800 bg-agri-100 px-2 py-0.5 rounded-full">{spot.cases_count}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  );
};
