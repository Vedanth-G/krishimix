import React from 'react';
import { Sun, CloudRain, Snowflake, MapPin } from 'lucide-react';

interface Step1Props {
  season: string;
  setSeason: (s: string) => void;
  location: string;
  setLocation: (loc: string) => void;
  zone: string;
  setZone: (z: string) => void;
}

export const Step1LocationSeason: React.FC<Step1Props> = ({
  season,
  setSeason,
  location,
  setLocation,
  zone,
  setZone
}) => {
  const seasons = [
    { id: 'Kharif', label: 'Kharif (Monsoon)', sub: 'June – October', icon: CloudRain, color: 'border-emerald-500 bg-emerald-50/50' },
    { id: 'Rabi', label: 'Rabi (Winter)', sub: 'October – February', icon: Snowflake, color: 'border-sky-500 bg-sky-50/50' },
    { id: 'Summer', label: 'Summer', sub: 'March – May', icon: Sun, color: 'border-amber-500 bg-amber-50/50' }
  ];

  const popularLocations = [
    { loc: 'Dharwad, Karnataka', z: 'Northern Transitional Zone' },
    { loc: 'Raichur, Karnataka', z: 'North-Eastern Dry Zone' },
    { loc: 'Bangalore Rural, Karnataka', z: 'Southern Dry Zone' },
    { loc: 'Anantapur, Andhra Pradesh', z: 'Rainfed Red Sandy Loam Belt' },
    { loc: 'Solapur, Maharashtra', z: 'Deccan Vertisols' }
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-black text-stone-900">Select Season & Location</h2>
        <p className="text-xs text-stone-500">
          Planting season dictates rainfall, day length, and maturity synchrony.
        </p>
      </div>

      {/* Season Cards */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">
          1. Choose Agricultural Season
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {seasons.map((s) => {
            const Icon = s.icon;
            const isSelected = season === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSeason(s.id)}
                className={`p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between h-28 shadow-xs ${
                  isSelected
                    ? `${s.color} border-emerald-600 ring-2 ring-emerald-500/20`
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <Icon className={`w-6 h-6 ${isSelected ? 'text-emerald-700' : 'text-stone-400'}`} />
                <div>
                  <div className="text-sm font-bold text-stone-900">{s.label}</div>
                  <div className="text-[11px] text-stone-500">{s.sub}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Location Input with Quick Suggestion Chips */}
      <div className="space-y-3 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">
          2. Farm Location & District
        </label>
        <div className="relative">
          <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-emerald-600" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Dharwad, Karnataka"
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="pt-2">
          <span className="text-[11px] font-semibold text-stone-500 block mb-1.5">
            Quick Select Common Research Station Regions:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {popularLocations.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setLocation(p.loc);
                  setZone(p.z);
                }}
                className="text-xs px-2.5 py-1 bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-800 rounded-lg transition font-medium"
              >
                {p.loc}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
