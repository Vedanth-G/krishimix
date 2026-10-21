import React from 'react';
import { Compass, Maximize2, MoveRight } from 'lucide-react';

interface Step2Props {
  areaAcres: number;
  setAreaAcres: (a: number) => void;
  lengthM: number;
  setLengthM: (l: number) => void;
  breadthM: number;
  setBreadthM: (b: number) => void;
  orientation: string;
  setOrientation: (o: string) => void;
}

export const Step2LandDimensions: React.FC<Step2Props> = ({
  areaAcres,
  setAreaAcres,
  lengthM,
  setLengthM,
  breadthM,
  setBreadthM,
  orientation,
  setOrientation
}) => {
  const quickAcres = [0.5, 1.0, 2.0, 5.0];

  const handleAcresChange = (acres: number) => {
    setAreaAcres(acres);
    // 1 acre ~ 4047 m2. For standard rectangular: side ~ sqrt(4047 * acres)
    const totalSqM = acres * 4047.0;
    const l = Math.round(Math.sqrt(totalSqM) * 1.1 * 10) / 10;
    const b = Math.round((totalSqM / l) * 10) / 10;
    setLengthM(l);
    setBreadthM(b);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-black text-stone-900">Land Size & Dimensions</h2>
        <p className="text-xs text-stone-500">
          Precision row calculations depend on field boundary meters.
        </p>
      </div>

      {/* Quick Acre Selector */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">
          1. Total Land Area (Acres)
        </label>
        <div className="grid grid-cols-4 gap-2">
          {quickAcres.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => handleAcresChange(val)}
              className={`py-3 rounded-xl font-bold text-sm transition shadow-xs ${
                areaAcres === val
                  ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-500/20'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
              }`}
            >
              {val} {val === 1.0 ? 'Acre' : 'Acres'}
            </button>
          ))}
        </div>

        <div className="pt-2 flex items-center gap-3">
          <span className="text-xs text-stone-500">Or custom:</span>
          <input
            type="number"
            step="0.1"
            min="0.1"
            max="100"
            value={areaAcres}
            onChange={(e) => handleAcresChange(parseFloat(e.target.value) || 1.0)}
            className="w-28 px-3 py-1.5 border border-stone-300 rounded-lg text-sm font-bold text-stone-900"
          />
          <span className="text-xs font-bold text-stone-600">acres ({(areaAcres * 4047).toLocaleString()} m²)</span>
        </div>
      </div>

      {/* Length & Breadth in Meters */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide flex items-center justify-between">
          <span>2. Physical Field Dimensions (Meters)</span>
          <span className="text-[11px] text-emerald-700 font-semibold">Rows run along length</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-xs font-semibold text-stone-600 block mb-1">Field Length (m)</span>
            <input
              type="number"
              step="1"
              value={lengthM}
              onChange={(e) => setLengthM(parseFloat(e.target.value) || 10)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-base font-bold text-stone-900"
            />
            <span className="text-[10px] text-stone-400 mt-1 block">Parallel to planting furrow lines</span>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-xs font-semibold text-stone-600 block mb-1">Field Breadth (m)</span>
            <input
              type="number"
              step="1"
              value={breadthM}
              onChange={(e) => setBreadthM(parseFloat(e.target.value) || 10)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-base font-bold text-stone-900"
            />
            <span className="text-[10px] text-stone-400 mt-1 block">Cross-width where rows stack</span>
          </div>
        </div>
      </div>

      {/* Row Orientation */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-emerald-600" />
          3. Row Orientation
        </label>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setOrientation('North-South')}
            className={`p-3.5 rounded-xl border-2 text-left transition ${
              orientation === 'North-South'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
            }`}
          >
            <div className="text-xs font-bold">North - South (Recommended)</div>
            <div className="text-[11px] text-stone-500 font-normal mt-0.5">
              Both sides receive uniform morning and evening sunlight
            </div>
          </button>

          <button
            type="button"
            onClick={() => setOrientation('East-West')}
            className={`p-3.5 rounded-xl border-2 text-left transition ${
              orientation === 'East-West'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
            }`}
          >
            <div className="text-xs font-bold">East - West</div>
            <div className="text-[11px] text-stone-500 font-normal mt-0.5">
              Used when field contour slope requires cross-slope furrowing
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
