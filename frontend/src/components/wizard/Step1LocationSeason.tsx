import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sun, CloudRain, Snowflake, MapPin, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { findLocationProfile, REGIONAL_LOCATION_PROFILES, LocationProfile } from '../../data/locationDatabase';

interface Step1Props {
  season: string;
  setSeason: (s: string) => void;
  location: string;
  setLocation: (loc: string) => void;
  zone: string;
  setZone: (z: string) => void;
  setSoilType?: (st: string) => void;
  setSoilPh?: (ph: number) => void;
}

export const Step1LocationSeason: React.FC<Step1Props> = ({
  season,
  setSeason,
  location,
  setLocation,
  zone,
  setZone,
  setSoilType,
  setSoilPh
}) => {
  const { t } = useTranslation();
  const [activeProfile, setActiveProfile] = useState<LocationProfile | null>(null);

  const seasons = [
    {
      id: 'Kharif',
      label: t('step1.kharif_label'),
      sub: t('step1.kharif_sub'),
      icon: CloudRain,
      color: 'border-emerald-500 bg-emerald-50/50'
    },
    {
      id: 'Rabi',
      label: t('step1.rabi_label'),
      sub: t('step1.rabi_sub'),
      icon: Snowflake,
      color: 'border-sky-500 bg-sky-50/50'
    },
    {
      id: 'Summer',
      label: t('step1.summer_label'),
      sub: t('step1.summer_sub'),
      icon: Sun,
      color: 'border-amber-500 bg-amber-50/50'
    }
  ];

  // Check location against verified profiles
  useEffect(() => {
    const profile = findLocationProfile(location);
    setActiveProfile(profile);
    if (profile) {
      setZone(profile.zone);
      if (setSoilType) setSoilType(profile.typicalSoil);
      if (setSoilPh) setSoilPh(profile.typicalPh);
    }
  }, [location]);

  const handleSelectQuickLocation = (profile: LocationProfile) => {
    const locString = `${profile.district}, ${profile.state}`;
    setLocation(locString);
    setZone(profile.zone);
    if (setSoilType) setSoilType(profile.typicalSoil);
    if (setSoilPh) setSoilPh(profile.typicalPh);
    setActiveProfile(profile);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-black text-stone-900">{t('step1.title')}</h2>
        <p className="text-xs text-stone-500">
          {t('step1.desc')}
        </p>
      </div>

      {/* Season Cards */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">
          {t('step1.section1_title')}
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

      {/* Location Input with Verification Feedback */}
      <div className="space-y-3 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">
          {t('step1.section2_title')}
        </label>
        <div className="relative">
          <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-emerald-600" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t('step1.location_placeholder')}
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Verification Status Banner */}
        {activeProfile ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1.5 animate-fadeIn">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t('step1.verified_profile')}: {activeProfile.district} ({activeProfile.zone})</span>
            </div>
            <p className="text-[11px] text-emerald-800">
              {t('step1.auto_detected')} <b>{activeProfile.typicalSoil}</b> • <b>pH {activeProfile.typicalPh}</b> • <b>{activeProfile.avgRainfallMm} mm</b> avg rainfall.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-1">
              <span className="text-[10px] text-emerald-700 font-semibold">{t('step1.suitable_crops_tip')}</span>
              {activeProfile.suitableCrops.map((c, i) => (
                <span key={i} className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-200/70 text-emerald-900 rounded">
                  {c}
                </span>
              ))}
            </div>
          </div>
        ) : location.trim().length >= 2 ? (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1 text-amber-900">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{t('step1.unverified_warning')}</span>
            </div>
          </div>
        ) : null}

        {/* Quick Suggestion Chips */}
        <div className="pt-2">
          <span className="text-[11px] font-semibold text-stone-500 block mb-1.5">
            {t('step1.quick_select')}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {REGIONAL_LOCATION_PROFILES.slice(0, 7).map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectQuickLocation(p)}
                className={`text-xs px-2.5 py-1 rounded-lg transition font-medium ${
                  activeProfile?.district === p.district
                    ? 'bg-emerald-700 text-white font-bold shadow-xs'
                    : 'bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-800'
                }`}
              >
                {p.district}, {p.state}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
