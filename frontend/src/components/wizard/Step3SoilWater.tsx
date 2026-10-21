import React from 'react';
import { useTranslation } from 'react-i18next';
import { Droplets, Layers } from 'lucide-react';

interface Step3Props {
  soilType: string;
  setSoilType: (st: string) => void;
  soilPh: number;
  setSoilPh: (ph: number) => void;
  irrigation: string;
  setIrrigation: (irr: string) => void;
}

export const Step3SoilWater: React.FC<Step3Props> = ({
  soilType,
  setSoilType,
  soilPh,
  setSoilPh,
  irrigation,
  setIrrigation
}) => {
  const { t } = useTranslation();

  const soils = [
    { name: 'Red Sandy Loam', desc: 'Free draining, ideal for groundnut & millets', color: 'border-amber-400 bg-amber-50/50' },
    { name: 'Black Clay (Vertisol)', desc: 'High moisture retention, ideal for cotton & jowar', color: 'border-stone-500 bg-stone-100/50' },
    { name: 'Alluvial Loam', desc: 'Fertile river basin silt, suitable for diverse cereals', color: 'border-emerald-400 bg-emerald-50/50' },
    { name: 'Medium Black Soil', desc: 'Balanced loam-clay transition zone', color: 'border-yellow-500 bg-yellow-50/50' }
  ];

  const waterSources = [
    { name: 'Rainfed (Dryland)', desc: 'Entirely reliant on seasonal monsoon showers' },
    { name: 'Borewell / Drip', desc: 'Supplemental drip or furrow irrigation available' },
    { name: 'Canal Irrigation', desc: 'Periodic flood/furrow release from canal network' },
    { name: 'Sprinkler System', desc: 'Pressurized overhead spray delivery' }
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-black text-stone-900">{t('step3.title')}</h2>
        <p className="text-xs text-stone-500">
          {t('step3.desc')}
        </p>
      </div>

      {/* Soil Type */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-emerald-600" />
          {t('step3.section1_title')}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {soils.map((s) => {
            const isSelected = soilType === s.name;
            return (
              <button
                key={s.name}
                type="button"
                onClick={() => setSoilType(s.name)}
                className={`p-3.5 rounded-2xl border-2 text-left transition shadow-xs ${
                  isSelected
                    ? `${s.color} border-emerald-600 ring-2 ring-emerald-500/20`
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="text-sm font-bold text-stone-900">{s.name}</div>
                <div className="text-[11px] text-stone-500 mt-0.5">{s.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Soil pH Slider with Agronomic Color Range */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-stone-700 uppercase tracking-wide">
            {t('step3.section2_title')}
          </label>
          <span className="text-sm font-extrabold px-3 py-0.5 bg-emerald-100 text-emerald-900 rounded-full border border-emerald-300">
            pH {soilPh.toFixed(1)} ({soilPh < 6.0 ? t('step3.acidic') : soilPh > 7.5 ? t('step3.alkaline') : t('step3.neutral')})
          </span>
        </div>

        <input
          type="range"
          min="5.0"
          max="8.5"
          step="0.1"
          value={soilPh}
          onChange={(e) => setSoilPh(parseFloat(e.target.value))}
          className="w-full accent-emerald-600 cursor-pointer"
        />

        <div className="flex justify-between text-[11px] font-semibold text-stone-400">
          <span>5.0 ({t('step3.acidic')})</span>
          <span>6.8 ({t('step3.neutral')})</span>
          <span>8.5 ({t('step3.alkaline')})</span>
        </div>
      </div>

      {/* Irrigation Source */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide flex items-center gap-1.5">
          <Droplets className="w-4 h-4 text-sky-600" />
          {t('step3.section3_title')}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {waterSources.map((ws) => {
            const isSelected = irrigation === ws.name;
            return (
              <button
                key={ws.name}
                type="button"
                onClick={() => setIrrigation(ws.name)}
                className={`p-3.5 rounded-2xl border-2 text-left transition shadow-xs ${
                  isSelected
                    ? 'border-sky-600 bg-sky-50 text-sky-950 ring-2 ring-sky-500/20'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="text-sm font-bold text-stone-900">{ws.name}</div>
                <div className="text-[11px] text-stone-500 mt-0.5">{ws.desc}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
