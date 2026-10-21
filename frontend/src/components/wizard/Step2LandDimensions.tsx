import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Compass, CheckCircle2, AlertTriangle, RefreshCw, Upload, Image as ImageIcon, Sparkles } from 'lucide-react';

interface Step2Props {
  areaAcres: number;
  setAreaAcres: (a: number) => void;
  lengthM: number;
  setLengthM: (l: number) => void;
  breadthM: number;
  setBreadthM: (b: number) => void;
  orientation: string;
  setOrientation: (o: string) => void;
  shapeType?: string;
  setShapeType?: (s: string) => void;
  photoPreview?: string;
  setPhotoPreview?: (p: string) => void;
}

export const Step2LandDimensions: React.FC<Step2Props> = ({
  areaAcres,
  setAreaAcres,
  lengthM,
  setLengthM,
  breadthM,
  setBreadthM,
  orientation,
  setOrientation,
  shapeType = 'Regular',
  setShapeType,
  photoPreview,
  setPhotoPreview
}) => {
  const { t } = useTranslation();
  const quickAcres = [0.5, 1.0, 2.0, 5.0];

  // Local string states to avoid typing 60 becoming 160
  const [acresInput, setAcresInput] = useState<string>(String(areaAcres));
  const [lengthInput, setLengthInput] = useState<string>(String(lengthM));
  const [breadthInput, setBreadthInput] = useState<string>(String(breadthM));
  const [autoSync, setAutoSync] = useState<boolean>(true);

  // Sync external changes
  useEffect(() => {
    setAcresInput(String(areaAcres));
  }, [areaAcres]);

  useEffect(() => {
    setLengthInput(String(lengthM));
  }, [lengthM]);

  useEffect(() => {
    setBreadthInput(String(breadthM));
  }, [breadthM]);

  const handleAcresQuickSelect = (acres: number) => {
    setAreaAcres(acres);
    setAcresInput(String(acres));
    const totalSqM = acres * 4047.0;
    const l = Math.round(Math.sqrt(totalSqM) * 1.1 * 10) / 10;
    const b = Math.round((totalSqM / l) * 10) / 10;
    setLengthM(l);
    setBreadthM(b);
    setLengthInput(String(l));
    setBreadthInput(String(b));
  };

  const handleCustomAcresChange = (valStr: string) => {
    setAcresInput(valStr);
    const parsed = parseFloat(valStr);
    if (!isNaN(parsed) && parsed > 0) {
      setAreaAcres(parsed);
      if (autoSync) {
        const totalSqM = parsed * 4047.0;
        const curLen = lengthM > 0 ? lengthM : 50;
        const b = Math.round((totalSqM / curLen) * 10) / 10;
        setBreadthM(b);
        setBreadthInput(String(b));
      }
    }
  };

  const handleLengthChange = (valStr: string) => {
    setLengthInput(valStr);
    const parsed = parseFloat(valStr);
    if (!isNaN(parsed) && parsed > 0) {
      setLengthM(parsed);
      if (autoSync && areaAcres > 0) {
        const totalSqM = areaAcres * 4047.0;
        const b = Math.round((totalSqM / parsed) * 10) / 10;
        setBreadthM(b);
        setBreadthInput(String(b));
      }
    }
  };

  const handleBreadthChange = (valStr: string) => {
    setBreadthInput(valStr);
    const parsed = parseFloat(valStr);
    if (!isNaN(parsed) && parsed > 0) {
      setBreadthM(parsed);
      if (autoSync && areaAcres > 0) {
        const totalSqM = areaAcres * 4047.0;
        const l = Math.round((totalSqM / parsed) * 10) / 10;
        setLengthM(l);
        setLengthInput(String(l));
      }
    }
  };

  // Image Upload handler for boundary sketch / photo
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && setPhotoPreview) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        if (setShapeType) setShapeType('Custom Boundary');
      };
      reader.readAsDataURL(file);
    }
  };

  // Dimension validation calculation
  const calculatedSqM = Math.round(lengthM * breadthM * 10) / 10;
  const calculatedAcres = Math.round((calculatedSqM / 4047.0) * 100) / 100;
  const isDimensionMatched = Math.abs(calculatedAcres - areaAcres) / (areaAcres || 1) < 0.08;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-black text-stone-900">{t('step2.title')}</h2>
        <p className="text-xs text-stone-500">
          {t('step2.desc')}
        </p>
      </div>

      {/* Quick Acre Selector */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">
          {t('step2.section1_title')}
        </label>
        <div className="grid grid-cols-4 gap-2">
          {quickAcres.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => handleAcresQuickSelect(val)}
              className={`py-3 rounded-xl font-bold text-sm transition shadow-xs ${
                areaAcres === val
                  ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-500/20'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
              }`}
            >
              {val} {t('step2.acres_unit')}
            </button>
          ))}
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <span className="text-xs text-stone-500">{t('step2.custom_or')}</span>
          <input
            type="number"
            step="0.1"
            min="0.1"
            max="100"
            value={acresInput}
            onFocus={(e) => e.target.select()}
            onChange={(e) => handleCustomAcresChange(e.target.value)}
            className="w-28 px-3 py-1.5 border border-stone-300 rounded-lg text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <span className="text-xs font-bold text-stone-600">
            {t('step2.acres_unit')} ({(areaAcres * 4047).toLocaleString()} m²)
          </span>
        </div>
      </div>

      {/* Length & Breadth in Meters with Auto-Calculate Toggle */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">
              {t('step2.section2_title')}
            </label>
            <span className="text-[11px] text-emerald-700 font-semibold">{t('step2.section2_sub')}</span>
          </div>

          {/* Auto-Sync Toggle */}
          <button
            type="button"
            onClick={() => setAutoSync(!autoSync)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
              autoSync
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-stone-100 border-stone-300 text-stone-600'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${autoSync ? 'text-emerald-600 animate-spin-slow' : ''}`} />
            <span>{autoSync ? t('step2.auto_sync_on') : t('step2.auto_sync_off')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-xs font-semibold text-stone-600 block mb-1">{t('step2.field_length')}</span>
            <input
              type="number"
              step="0.5"
              min="5"
              max="2000"
              value={lengthInput}
              onFocus={(e) => e.target.select()}
              onChange={(e) => handleLengthChange(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-base font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <span className="text-[10px] text-stone-400 mt-1 block">{t('step2.field_length_sub')}</span>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-xs font-semibold text-stone-600 block mb-1">{t('step2.field_breadth')}</span>
            <input
              type="number"
              step="0.5"
              min="5"
              max="2000"
              value={breadthInput}
              onFocus={(e) => e.target.select()}
              onChange={(e) => handleBreadthChange(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-base font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <span className="text-[10px] text-stone-400 mt-1 block">{t('step2.field_breadth_sub')}</span>
          </div>
        </div>

        {/* Live Dimension Verification Badge */}
        <div className="pt-1">
          {isDimensionMatched ? (
            <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {t('step2.dim_match', { len: lengthM, brd: breadthM, sqm: calculatedSqM, acres: areaAcres })}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {t('step2.dim_mismatch', { sqm: calculatedSqM, calcAcres: calculatedAcres })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Field Shape & Boundary Photo Upload */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">
          {t('step2.section4_title')}
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'Regular', label: t('step2.shape_regular') },
            { id: 'Trapezoid', label: t('step2.shape_trapezoid') },
            { id: 'Contour', label: t('step2.shape_contour') },
            { id: 'Custom Boundary', label: t('step2.shape_custom') }
          ].map((sh) => (
            <button
              key={sh.id}
              type="button"
              onClick={() => {
                if (setShapeType) setShapeType(sh.id);
              }}
              className={`p-3 rounded-xl border text-center transition text-xs font-bold ${
                shapeType === sh.id
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                  : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
              }`}
            >
              {sh.label}
            </button>
          ))}
        </div>

        {/* Upload Dropzone */}
        <div className="p-4 border-2 border-dashed border-stone-300 rounded-2xl bg-stone-50/70 hover:bg-stone-100/70 transition text-center space-y-2">
          {photoPreview ? (
            <div className="flex flex-col items-center gap-2">
              <img
                src={photoPreview}
                alt="Field Boundary"
                className="h-24 w-auto max-w-full rounded-xl object-contain border border-stone-200 shadow-xs"
              />
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {t('step2.photo_attached')}
              </span>
            </div>
          ) : (
            <div className="space-y-1">
              <Upload className="w-6 h-6 text-stone-400 mx-auto" />
              <label className="cursor-pointer inline-block">
                <span className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline">
                  {t('step2.upload_btn')}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-stone-400">{t('step2.upload_hint')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Row Orientation */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-emerald-600" />
          {t('step2.section3_title')}
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
            <div className="text-xs font-bold">{t('step2.north_south_title')}</div>
            <div className="text-[11px] text-stone-500 font-normal mt-0.5">
              {t('step2.north_south_desc')}
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
            <div className="text-xs font-bold">{t('step2.east_west_title')}</div>
            <div className="text-[11px] text-stone-500 font-normal mt-0.5">
              {t('step2.east_west_desc')}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
