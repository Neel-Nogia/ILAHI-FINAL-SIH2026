import React, { useState } from 'react';
import { 
  UserRound, 
  MapPin, 
  Phone, 
  Upload, 
  CheckCircle2, 
  ArrowRight, 
  Camera, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { StateOption, GuideProfile } from '../lib/types';
import { getDistrictsForState } from '../lib/data/destinations-data';
import { supabaseStore } from '../lib/supabase/client';

interface GuideTier1ViewProps {
  onRegistered: (guide: GuideProfile) => void;
  onCancel: () => void;
}

export const GuideTier1View: React.FC<GuideTier1ViewProps> = ({
  onRegistered,
  onCancel
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [state, setState] = useState<StateOption>('Gujarat');
  const [primaryArea, setPrimaryArea] = useState<string>('Ahmedabad');
  const [photoUrl, setPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const districts = getDistrictsForState(state);

  const handleStateChange = (newState: StateOption) => {
    setState(newState);
    const newDistricts = getDistrictsForState(newState);
    setPrimaryArea(newDistricts[0] || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }

    // Phone validation
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit phone number with +91 country code.');
      return;
    }

    if (!primaryArea) {
      setErrorMessage('Please select your primary operational district.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      // Step 4: Rapid Tier 1 insert into guide_profiles with is_verified = false
      const newGuide = await supabaseStore.registerGuideTier1({
        full_name: fullName,
        phone: phone.trim(),
        state,
        primary_area: primaryArea,
        photo_url: photoUrl
      });

      setIsSubmitting(false);
      onRegistered(newGuide);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'Failed to submit Tier 1 registration.');
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 border border-amber-300/60 dark:border-amber-900 text-xs font-bold text-amber-900 dark:text-amber-300 mb-2">
          <UserRound className="w-3.5 h-3.5 text-amber-700" />
          <span>Tier 1 Rapid Guide Registration (~2 Minutes)</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
          Join the Verified Local Network
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
          Complete these 4 basic fields to go live immediately. You can fill Tier 2 cultural tags and documents anytime.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950 border border-rose-300 text-rose-800 dark:text-rose-200 text-xs">
          {errorMessage}
        </div>
      )}

      {/* Single-Column Mobile-First Form (Step 4 strict requirement) */}
      <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
        {/* 1. Full Name */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block mb-1">
            Full Name <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="e.g. Rameshwar Rathore"
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 min-h-[44px]"
            required
          />
        </div>

        {/* 2. Phone Number */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block mb-1">
            Phone Number (Validated) <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+91 98250 12345"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 min-h-[44px]"
              required
            />
          </div>
          <p className="text-[10px] text-stone-500 mt-1">
            RLS protected: Masked from public queries until confirmed booking.
          </p>
        </div>

        {/* 3. State */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block mb-1">
            Operating State <span className="text-rose-600">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleStateChange('Gujarat')}
              className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all min-h-[44px] ${
                state === 'Gujarat'
                  ? 'border-amber-700 bg-amber-100/70 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-bold'
                  : 'border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300'
              }`}
            >
              Gujarat
            </button>
            <button
              type="button"
              onClick={() => handleStateChange('Rajasthan')}
              className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all min-h-[44px] ${
                state === 'Rajasthan'
                  ? 'border-amber-700 bg-amber-100/70 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-bold'
                  : 'border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300'
              }`}
            >
              Rajasthan
            </button>
          </div>
        </div>

        {/* 4. Primary Area (Dropdown populated from distinct districts in destinations) */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block mb-1">
            Primary District Area <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <select
              value={primaryArea}
              onChange={e => setPrimaryArea(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 min-h-[44px]"
              required
            >
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 5. One Photo Upload (guide-photos bucket path or preview) */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block mb-1">
            Profile Photo
          </label>
          <div className="flex items-center gap-3">
            <img
              src={photoUrl}
              alt="Preview"
              className="w-12 h-12 rounded-xl object-cover border"
            />
            <input
              type="text"
              value={photoUrl}
              onChange={e => setPhotoUrl(e.target.value)}
              placeholder="Paste public photo URL"
              className="flex-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs min-h-[44px]"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold text-stone-600 dark:text-stone-400 min-h-[44px]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all min-h-[44px] shadow-sm disabled:opacity-50"
          >
            <span>Publish Tier 1 Live Profile</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
