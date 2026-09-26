import React, { useState } from 'react';
import { 
  UserCheck, 
  MapPin, 
  Languages, 
  Tag, 
  ShieldCheck, 
  Calendar, 
  Upload, 
  CheckCircle2, 
  ArrowLeft, 
  Save, 
  Lock 
} from 'lucide-react';
import { GuideProfile, AvailabilityPreset } from '../lib/types';
import { getDistrictsForState } from '../lib/data/destinations-data';
import { supabaseStore } from '../lib/supabase/client';

interface GuideTier2ViewProps {
  guide: GuideProfile;
  onSaved: (updatedGuide: GuideProfile) => void;
  onBackToDashboard: () => void;
}

const PREDEFINED_SPECIALTIES = [
  'heritage walks',
  'craft workshops',
  'food trails',
  'wildlife',
  'pilgrimage circuits',
  'desert experiences',
  'village stays',
  'textile arts',
  'stepwell tours',
  'folk music & dance'
];

const PREDEFINED_LANGUAGES = [
  'Gujarati',
  'Rajasthani/Marwari',
  'Hindi',
  'English',
  'Kutchi',
  'Mewari',
  'Sanskrit'
];

const PREDEFINED_TRAVEL_STYLES = [
  'slow travel',
  'cultural immersion',
  'adventure',
  'family-friendly',
  'walking-heavy'
];

const PREDEFINED_SAFETY_TAGS = [
  'solo-female-friendly',
  'family-friendly',
  'verified-id',
  'first-aid-certified',
  'desert-safety-trained'
];

export const GuideTier2View: React.FC<GuideTier2ViewProps> = ({
  guide,
  onSaved,
  onBackToDashboard
}) => {
  const [specialties, setSpecialties] = useState<string[]>(guide.specialties || []);
  const [areasOfExpertise, setAreasOfExpertise] = useState<string[]>(guide.areas_of_expertise || []);
  const [languages, setLanguages] = useState<string[]>(guide.languages || ['Hindi']);
  const [travelStyleTags, setTravelStyleTags] = useState<string[]>(guide.travel_style_tags || []);
  const [safetyTags, setSafetyTags] = useState<string[]>(guide.safety_tags || ['verified-id']);
  const [availabilityPreset, setAvailabilityPreset] = useState<AvailabilityPreset>(
    guide.availability_preset || 'flexible'
  );
  const [showCustomAvailability, setShowCustomAvailability] = useState(false);
  const [bio, setBio] = useState(guide.bio || '');
  const [credentialUrl, setCredentialUrl] = useState(guide.credential_url || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const districts = getDistrictsForState(guide.state);

  // Live profile completion calculation (Step 2 & 5 formula)
  const calculateLivePct = () => {
    let score = 0;
    if (bio.trim().length > 0) score += 20;
    if (specialties.length > 0) score += 20;
    if (areasOfExpertise.length > 0) score += 20;
    if (languages.length > 0) score += 20;
    if (credentialUrl.trim().length > 0) score += 20;
    return score;
  };

  const livePct = calculateLivePct();

  const toggleArrayItem = (list: string[], setList: (items: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Step 5: Every field can be filled independently and in any order
      const updated = await supabaseStore.updateGuideTier2(guide.id, {
        specialties,
        areas_of_expertise: areasOfExpertise,
        languages,
        travel_style_tags: travelStyleTags,
        safety_tags: safetyTags,
        availability_preset: availabilityPreset,
        bio: bio.trim() || null,
        credential_url: credentialUrl.trim() || null
      });

      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      onSaved(updated);
    } catch (err: any) {
      setIsSaving(false);
      alert(err?.message || 'Error updating profile');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Guide Dashboard</span>
        </button>

        <span className="text-xs font-semibold text-stone-500">
          Tier 2 Profile Expansion
        </span>
      </div>

      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
          Complete Profile: {guide.full_name}
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
          Add specific specialties, spoken languages, schedule presets, and verification credentials.
        </p>
      </div>

      {/* Live Profile Completion Bar (Step 5 strict requirement) */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-stone-900 border border-amber-200 dark:border-stone-800 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-stone-800 dark:text-stone-200">
            Profile Completion Status
          </span>
          <span className="font-display font-extrabold text-amber-800 dark:text-amber-400 text-sm">
            {livePct}% Complete
          </span>
        </div>
        <div className="w-full h-2.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-700 dark:bg-amber-500 rounded-full transition-all duration-300"
            style={{ width: `${livePct}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-stone-500">
          <span>Tier 1 Base (Active)</span>
          <span>5 Key Fields (20% each)</span>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile changes saved successfully! Database and matching indices updated.</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-6 bg-stone-50 dark:bg-stone-900 p-5 sm:p-6 rounded-3xl border border-stone-200 dark:border-stone-800">
        {/* 1. Specialties: tag-picker chips (fixed predefined list per Step 5) */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <span>Specialties (Fixed Chip Picker)</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PREDEFINED_SPECIALTIES.map(item => {
              const isSelected = specialties.includes(item);
              return (
                <button
                  type="button"
                  key={item}
                  onClick={() => toggleArrayItem(specialties, setSpecialties, item)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all min-h-[38px] ${
                    isSelected
                      ? 'bg-amber-800 text-white font-semibold'
                      : 'bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Areas of Expertise: multi-select from distinct district in destinations (Step 5) */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <span>Districts of Expertise ({guide.state})</span>
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
            {districts.map(dist => {
              const isSelected = areasOfExpertise.includes(dist);
              return (
                <button
                  type="button"
                  key={dist}
                  onClick={() => toggleArrayItem(areasOfExpertise, setAreasOfExpertise, dist)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all min-h-[38px] ${
                    isSelected
                      ? 'bg-amber-800 text-white font-semibold'
                      : 'bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {dist}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Spoken Languages: multi-select chips */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
            <Languages className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <span>Spoken Languages</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PREDEFINED_LANGUAGES.map(lang => {
              const isSelected = languages.includes(lang);
              return (
                <button
                  type="button"
                  key={lang}
                  onClick={() => toggleArrayItem(languages, setLanguages, lang)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all min-h-[38px] ${
                    isSelected
                      ? 'bg-amber-800 text-white font-semibold'
                      : 'bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {lang}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Travel Style & Safety Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block">
              Travel Styles
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PREDEFINED_TRAVEL_STYLES.map(style => {
                const isSelected = travelStyleTags.includes(style);
                return (
                  <button
                    type="button"
                    key={style}
                    onClick={() => toggleArrayItem(travelStyleTags, setTravelStyleTags, style)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg transition-all min-h-[34px] ${
                      isSelected
                        ? 'bg-amber-800 text-white font-semibold'
                        : 'bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    {style}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block">
              Safety Accreditations
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PREDEFINED_SAFETY_TAGS.map(tag => {
                const isSelected = safetyTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleArrayItem(safetyTags, setSafetyTags, tag)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg transition-all min-h-[34px] ${
                      isSelected
                        ? 'bg-emerald-700 text-white font-semibold'
                        : 'bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    ✓ {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 5. Availability: Three large preset buttons + Customize (Step 5 strict requirement) */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <span>Availability Preset</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'weekday_mornings', label: 'Weekday Mornings' },
              { id: 'weekends', label: 'Weekends Only' },
              { id: 'flexible', label: 'Flexible / Full' }
            ].map(p => (
              <button
                type="button"
                key={p.id}
                onClick={() => setAvailabilityPreset(p.id as AvailabilityPreset)}
                className={`py-3 px-2 rounded-xl text-xs font-bold text-center border transition-all min-h-[48px] ${
                  availabilityPreset === p.id
                    ? 'border-amber-700 bg-amber-100/70 dark:bg-amber-950 text-amber-900 dark:text-amber-300'
                    : 'border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowCustomAvailability(!showCustomAvailability)}
            className="text-xs text-amber-800 dark:text-amber-400 hover:underline pt-1 block"
          >
            {showCustomAvailability ? 'Hide Custom Availability' : '+ Customize Day/Time Windows'}
          </button>

          {showCustomAvailability && (
            <div className="p-3.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-2 text-xs">
              <span className="font-semibold text-stone-800 dark:text-stone-200">
                Operating Hours (guide_availability)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="time"
                  defaultValue="08:00"
                  className="px-3 py-2 rounded-lg border bg-white dark:bg-stone-900"
                />
                <input
                  type="time"
                  defaultValue="18:00"
                  className="px-3 py-2 rounded-lg border bg-white dark:bg-stone-900"
                />
              </div>
            </div>
          )}
        </div>

        {/* 6. Bio Textarea */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block">
            Personal Bio & Storytelling Style (Optional)
          </label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={3}
            placeholder="Share your personal connection to local heritage, hidden craft spots, or family lineage..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100"
          />
        </div>

        {/* 7. Credentials (Private Storage Bucket: guide-credentials) */}
        <div className="space-y-2 p-4 rounded-2xl bg-amber-50/60 dark:bg-stone-800/60 border border-amber-200/60 dark:border-stone-700">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              <span>Private Tourism Credential or ID</span>
            </label>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-semibold">
              Pending Admin Review
            </span>
          </div>

          <p className="text-[11px] text-stone-500 leading-relaxed">
            Uploaded to private storage bucket <code className="font-mono text-amber-800">guide-credentials</code>. Strictly inaccessible through public queries per RLS rules.
          </p>

          <input
            type="text"
            value={credentialUrl}
            onChange={e => setCredentialUrl(e.target.value)}
            placeholder="Private storage file path (e.g. credentials/id_proof.pdf)"
            className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs min-h-[44px]"
          />
        </div>

        {/* Submit */}
        <div className="pt-2 flex gap-3">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold text-stone-600 dark:text-stone-400 min-h-[44px]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 py-3 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all min-h-[44px] shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Updating...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
