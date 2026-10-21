import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Crop, Variety } from '../../types';
import { Sparkles, Sprout, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { fetchSuggestedCompanions } from '../../services/api';

interface Step4Props {
  crops: Crop[];
  selectedCropAId: number;
  setSelectedCropAId: (id: number) => void;
  selectedVarietyAId: number;
  setSelectedVarietyAId: (id: number) => void;
  selectedCropBId: number;
  setSelectedCropBId: (id: number) => void;
  selectedVarietyBId: number;
  setSelectedVarietyBId: (id: number) => void;
  rowRatio: string;
  setRowRatio: (r: string) => void;
  season: string;
  soilType: string;
}

export const Step4CropSelection: React.FC<Step4Props> = ({
  crops,
  selectedCropAId,
  setSelectedCropAId,
  selectedVarietyAId,
  setSelectedVarietyAId,
  selectedCropBId,
  setSelectedCropBId,
  selectedVarietyBId,
  setSelectedVarietyBId,
  rowRatio,
  setRowRatio,
  season,
  soilType
}) => {
  const { t } = useTranslation();
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [suggestionList, setSuggestionList] = useState<any[]>([]);

  const cropA = crops.find(c => c.id === selectedCropAId);
  const cropB = crops.find(c => c.id === selectedCropBId);

  const varietiesA = cropA ? cropA.varieties : [];
  const varietiesB = cropB ? cropB.varieties : [];

  const handleCropAChange = (cId: number) => {
    setSelectedCropAId(cId);
    const c = crops.find(item => item.id === cId);
    if (c && c.varieties.length > 0) {
      setSelectedVarietyAId(c.varieties[0].id);
    }
  };

  const handleCropBChange = (cId: number) => {
    setSelectedCropBId(cId);
    const c = crops.find(item => item.id === cId);
    if (c && c.varieties.length > 0) {
      setSelectedVarietyBId(c.varieties[0].id);
    }
  };

  const handleSuggestCompanion = async () => {
    setIsSuggesting(true);
    try {
      const suggestions = await fetchSuggestedCompanions(selectedCropAId, season, soilType);
      setSuggestionList(suggestions);
      if (suggestions.length > 0) {
        const top = suggestions[0];
        handleCropBChange(top.crop_b_id);
        setSelectedVarietyBId(top.variety_b_id);
        if (top.suggested_row_ratio) {
          setRowRatio(top.suggested_row_ratio);
        }
      }
    } catch (e) {
      console.error('Suggest companion error:', e);
    } finally {
      setIsSuggesting(false);
    }
  };

  const rowRatios = [
    { ratio: '2:1', label: '2:1 Ratio', desc: '2 rows Main Crop, 1 row Companion (Standard ICRISAT/UAS formula)' },
    { ratio: '1:1', label: '1:1 Ratio', desc: 'Alternate single rows (High biodiversity and weed cover)' },
    { ratio: '3:1', label: '3:1 Ratio', desc: '3 rows Groundnut / Millet, 1 row Pigeonpea' },
    { ratio: '4:2', label: '4:2 Ratio', desc: '4 rows Strip Intercrop, 2 rows Companion (Tractor operational spacing)' }
  ];

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-black text-stone-900">{t('step4.title')}</h2>
        <p className="text-xs text-stone-500">
          {t('step4.desc')}
        </p>
      </div>

      {/* Primary Crop (Row A) */}
      <div className="bg-white p-5 rounded-2xl border-2 border-emerald-500/60 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
            <Sprout className="w-4 h-4 text-emerald-600" />
            {t('step4.section1_title')}
          </label>
          <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
            {t('step4.section1_badge')}
          </span>
        </div>

        {/* Big Touch Target Crop Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {crops.map((c) => {
            const isSelected = c.id === selectedCropAId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => handleCropAChange(c.id)}
                className={`p-3 rounded-xl border-2 text-center transition font-bold text-xs shadow-xs ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800'
                }`}
              >
                <div>{c.name}</div>
                <div className={`text-[10px] font-normal ${isSelected ? 'text-emerald-100' : 'text-stone-400'}`}>
                  {c.crop_type}
                </div>
              </button>
            );
          })}
        </div>

        {/* Variety Selector for Crop A */}
        {varietiesA.length > 0 && (
          <div className="pt-2 border-t border-stone-100">
            <label className="block text-xs font-bold text-stone-600 mb-1.5">
              {t('step4.select_variety_for')} {cropA?.name}:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {varietiesA.map((v) => {
                const isSelected = v.id === selectedVarietyAId;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVarietyAId(v.id)}
                    className={`p-3 rounded-xl border text-left transition ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-500'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-stone-900">{v.name}</div>
                    <div className="text-[11px] text-stone-500 mt-0.5 flex flex-wrap gap-2">
                      <span>🕒 {v.maturity_days} days</span>
                      <span>📏 {v.height_cm} cm</span>
                      <span>🌿 {v.canopy_type}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Suggest for Me Companion Button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleSuggestCompanion}
          disabled={isSuggesting}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-extrabold text-xs shadow-md hover:from-amber-600 hover:to-amber-700 transition"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isSuggesting ? t('step4.suggesting') : t('step4.suggest_btn')}</span>
        </button>
      </div>

      {/* Companion Crop (Row B) */}
      <div className="bg-white p-5 rounded-2xl border-2 border-amber-500/60 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
            <Sprout className="w-4 h-4 text-amber-600" />
            {t('step4.section2_title')}
          </label>
          <span className="text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
            {t('step4.section2_badge')}
          </span>
        </div>

        {/* Crop Selector B */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {crops.map((c) => {
            const isSelected = c.id === selectedCropBId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => handleCropBChange(c.id)}
                className={`p-3 rounded-xl border-2 text-center transition font-bold text-xs shadow-xs ${
                  isSelected
                    ? 'border-amber-600 bg-amber-600 text-white shadow-sm ring-2 ring-amber-500/20'
                    : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800'
                }`}
              >
                <div>{c.name}</div>
                <div className={`text-[10px] font-normal ${isSelected ? 'text-amber-100' : 'text-stone-400'}`}>
                  {c.crop_type}
                </div>
              </button>
            );
          })}
        </div>

        {/* Variety Selector for Crop B */}
        {varietiesB.length > 0 && (
          <div className="pt-2 border-t border-stone-100">
            <label className="block text-xs font-bold text-stone-600 mb-1.5">
              {t('step4.select_variety_for')} {cropB?.name}:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {varietiesB.map((v) => {
                const isSelected = v.id === selectedVarietyBId;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVarietyBId(v.id)}
                    className={`p-3 rounded-xl border text-left transition ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50 ring-1 ring-amber-500'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-stone-900">{v.name}</div>
                    <div className="text-[11px] text-stone-500 mt-0.5 flex flex-wrap gap-2">
                      <span>🕒 {v.maturity_days} days</span>
                      <span>📏 {v.height_cm} cm</span>
                      <span>🌿 {v.canopy_type}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Row Proportion Selector */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">
          {t('step4.section3_title')}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rowRatios.map((item) => {
            const isSelected = rowRatio === item.ratio;
            return (
              <button
                key={item.ratio}
                type="button"
                onClick={() => setRowRatio(item.ratio)}
                className={`p-3.5 rounded-xl border-2 text-left transition shadow-xs ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                    : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-between">
                  <span>{item.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                </div>
                <div className="text-[11px] text-stone-500 font-normal mt-0.5">{item.desc}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
