import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  MapPin, 
  Calendar, 
  IndianRupee, 
  Sparkles, 
  Languages, 
  Compass, 
  ShieldCheck, 
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { StateOption, MatchCriteria, Destination } from '../lib/types';
import { OFFICIAL_CATEGORIES, getDistrictsForState } from '../lib/data/destinations-data';

interface MatchViewProps {
  initialState: StateOption;
  initialDistrict?: string;
  initialDestination?: Destination | null;
  onExecuteMatch: (criteria: MatchCriteria) => void;
}

export const MatchView: React.FC<MatchViewProps> = ({
  initialState,
  initialDistrict,
  initialDestination,
  onExecuteMatch
}) => {
  const [state, setState] = useState<StateOption>(initialState);
  const [district, setDistrict] = useState<string>(initialDistrict || '');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [budgetPerDay, setBudgetPerDay] = useState<number>(1500);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialDestination ? initialDestination.categories : ['Heritage', 'Craft']
  );
  const [preferredLanguage, setPreferredLanguage] = useState<string>(
    initialState === 'Gujarat' ? 'Gujarati' : 'Hindi'
  );
  const [travelStyle, setTravelStyle] = useState<string>('slow travel');
  const [safetyPreference, setSafetyPreference] = useState<string>('solo-female-friendly');

  const availableDistricts = getDistrictsForState(state);

  // Sync state and district when props change
  useEffect(() => {
    setState(initialState);
    const validDistricts = getDistrictsForState(initialState);
    if (initialDistrict && validDistricts.includes(initialDistrict)) {
      setDistrict(initialDistrict);
    } else {
      setDistrict(validDistricts[0] || '');
    }
  }, [initialState, initialDistrict]);

  const handleStateChange = (newState: StateOption) => {
    setState(newState);
    const newDistricts = getDistrictsForState(newState);
    setDistrict(newDistricts[0] || '');
    setPreferredLanguage(newState === 'Gujarat' ? 'Gujarati' : 'Hindi');
  };

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExecuteMatch({
      state,
      district: district || availableDistricts[0],
      startDate,
      endDate,
      budgetPerDay,
      categories: selectedCategories,
      preferredLanguage,
      travelStyle,
      safetyPreference
    });
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 border border-amber-300/60 dark:border-amber-900 text-xs font-bold text-amber-900 dark:text-amber-300 mb-2">
          <UserCheck className="w-3.5 h-3.5 text-amber-700" />
          <span>7-Parameter Verified Matching Algorithm</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
          Match with a Verified Local Host
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
          Specify your destination, dates, and interests. Our system ranks accredited local guides and explains why each matches your criteria.
        </p>
      </div>

      {initialDestination && (
        <div className="p-3.5 rounded-2xl bg-amber-100/70 dark:bg-stone-900 border border-amber-300/80 dark:border-amber-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-800 dark:text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-stone-900 dark:text-stone-100">Routing for {initialDestination.place_name}</span>
              <span className="text-stone-600 dark:text-stone-400 ml-1">({initialDestination.district}, {initialDestination.state})</span>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-amber-800 dark:text-amber-400 uppercase">Pre-filled</span>
        </div>
      )}

      {/* Matching Input Form */}
      <form onSubmit={handleSubmit} className="space-y-5 bg-stone-50 dark:bg-stone-900 p-5 sm:p-6 rounded-3xl border border-stone-200 dark:border-stone-800">
        {/* 1. Destination: State & District */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <span>Destination Location</span>
          </label>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] text-stone-500 mb-1 block">State</label>
              <select
                value={state}
                onChange={e => handleStateChange(e.target.value as StateOption)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-semibold focus:ring-2 focus:ring-amber-600 min-h-[44px]"
              >
                <option value="Gujarat">Gujarat</option>
                <option value="Rajasthan">Rajasthan</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-stone-500 mb-1 block">District</label>
              <select
                value={district}
                onChange={e => setDistrict(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-semibold focus:ring-2 focus:ring-amber-600 min-h-[44px]"
              >
                {availableDistricts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 2. Travel Dates & Duration */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <span>Trip Schedule</span>
          </label>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] text-stone-500 mb-1 block">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-amber-600 min-h-[44px]"
                required
              />
            </div>

            <div>
              <label className="text-[11px] text-stone-500 mb-1 block">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                min={startDate}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-amber-600 min-h-[44px]"
                required
              />
            </div>
          </div>
        </div>

        {/* 3. Daily Budget Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>Target Daily Budget</span>
            </label>
            <span className="font-display font-bold text-amber-800 dark:text-amber-400 text-sm">
              ₹{budgetPerDay.toLocaleString('en-IN')} / day
            </span>
          </div>

          <input
            type="range"
            min="600"
            max="4000"
            step="100"
            value={budgetPerDay}
            onChange={e => setBudgetPerDay(Number(e.target.value))}
            className="w-full accent-amber-700 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-stone-500">
            <span>Low (₹600)</span>
            <span>Standard (₹1,800)</span>
            <span>High/Exclusive (₹4,000)</span>
          </div>
        </div>

        {/* 4. Interests / Categories Multi-Select Chips (Step 3 legend) */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <span>Select Interests & Craft Traditions</span>
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
            {OFFICIAL_CATEGORIES.map(category => {
              const isSelected = selectedCategories.includes(category);
              return (
                <button
                  type="button"
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all min-h-[38px] ${
                    isSelected
                      ? 'bg-amber-800 text-white font-semibold shadow-xs'
                      : 'bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Preferred Spoken Language */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
            <Languages className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <span>Preferred Guide Language</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {['Gujarati', 'Hindi', 'English', 'Rajasthani/Marwari'].map(lang => (
              <button
                type="button"
                key={lang}
                onClick={() => setPreferredLanguage(lang)}
                className={`py-2 px-2.5 rounded-xl font-medium text-center border transition-all min-h-[44px] ${
                  preferredLanguage === lang
                    ? 'border-amber-700 bg-amber-100/60 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-bold'
                    : 'border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200/50'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* 6. Travel Style & Safety Preference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block mb-1.5">
              Travel Style
            </label>
            <select
              value={travelStyle}
              onChange={e => setTravelStyle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs min-h-[44px]"
            >
              <option value="slow travel">Slow Travel & Walking</option>
              <option value="cultural immersion">Cultural Immersion & Artisans</option>
              <option value="adventure">Adventure & Trekking</option>
              <option value="family-friendly">Family-Friendly & Relaxed</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block mb-1.5">
              Safety Verification Filter
            </label>
            <select
              value={safetyPreference}
              onChange={e => setSafetyPreference(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs min-h-[44px]"
            >
              <option value="solo-female-friendly">Solo-Female Friendly</option>
              <option value="verified-id">Verified ID & Clear Police Check</option>
              <option value="first-aid-certified">First-Aid Certified</option>
              <option value="family-friendly">Family Vetted</option>
            </select>
          </div>
        </div>

        {/* Submit CTA */}
        <div className="pt-3">
          <button
            type="submit"
            className="w-full py-3.5 px-5 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 min-h-[48px]"
          >
            <UserCheck className="w-5 h-5" />
            <span>Calculate Compatibility & Surface Guides</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </form>
    </div>
  );
};
