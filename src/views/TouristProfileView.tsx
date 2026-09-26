import React, { useState } from 'react';
import { 
  User, 
  Camera, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle2, 
  ArrowLeft,
  UserRound
} from 'lucide-react';
import { TouristProfile, BudgetBand } from '../lib/types';
import { supabaseStore } from '../lib/supabase/client';
import { OFFICIAL_CATEGORIES } from '../lib/data/destinations-data';

interface TouristProfileViewProps {
  onBackToHome: () => void;
  onProfileUpdated?: (updated: TouristProfile) => void;
}

const PREDEFINED_TRAVEL_STYLES = [
  'Slow travel', 'Photography', 'Adventure', 'Culture', 'History', 
  'Architecture', 'Nature', 'Food', 'Crafts', 'Wildlife', 'Offbeat', 'Walking', 'Shopping'
];

const PREDEFINED_SAFETY_PREFS = [
  'Verified ID', 'Female-traveler-safe', 'Solo-traveler-safe', 
  'Local police verified', 'Red Cross first-aid', 'Group-friendly', 'Daylight-only'
];

export const TouristProfileView: React.FC<TouristProfileViewProps> = ({
  onBackToHome,
  onProfileUpdated
}) => {
  const profile = supabaseStore.getTouristProfile();

  const [fullName, setFullName] = useState(profile.full_name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [dob, setDob] = useState(profile.dob || '1998-05-14');
  const [photoUrl, setPhotoUrl] = useState<string | null>(profile.photo_url || null);
  const [travelStyles, setTravelStyles] = useState<string[]>(profile.travel_styles || []);
  const [categories, setCategories] = useState<string[]>(profile.categories_of_interest || []);
  const [safetyPrefs, setSafetyPrefs] = useState<string[]>(profile.safety_preferences || []);
  const [language, setLanguage] = useState(profile.preferred_language || 'Hindi');
  const [budget, setBudget] = useState<BudgetBand>(profile.budget_band || 'medium');
  const [contacts, setContacts] = useState(profile.trusted_contacts || []);

  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleItem = (list: string[], setList: (items: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updated = await supabaseStore.updateTouristProfile({
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      dob,
      photo_url: photoUrl,
      travel_styles: travelStyles,
      categories_of_interest: categories,
      safety_preferences: safetyPrefs,
      preferred_language: language,
      budget_band: budget,
      trusted_contacts: contacts
    });

    setIsSaving(false);
    setSuccessToast(true);
    if (onProfileUpdated) onProfileUpdated(updated);
    setTimeout(() => setSuccessToast(false), 3000);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <span className="text-xs font-semibold text-stone-500">
          Traveler Preferences
        </span>
      </div>

      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
          Your Traveler Profile & Interests
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
          These preferences automatically calibrate our 7-parameter matching algorithm when you search for local guides.
        </p>
      </div>

      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Preferences saved successfully! Future matching runs will utilize your updated profile.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-5 shadow-xs">
        {/* Photo Upload / Change / Keep Blank */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block">
            Profile Photo
          </label>
          <div className="flex items-center gap-3.5">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Profile preview"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#B5541C]"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-stone-800 flex items-center justify-center font-display text-2xl font-bold text-amber-900 dark:text-amber-300 border border-stone-300 dark:border-stone-700">
                {fullName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="space-y-1">
              <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs font-semibold hover:bg-stone-200 min-h-[38px] inline-flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" />
                <span>Upload New Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setPhotoUrl(null)}
                  className="ml-2 px-2.5 py-1 text-xs text-rose-600 hover:underline min-h-[38px]"
                >
                  Keep Blank
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Basic Fields */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block mb-1">
              Full Legal Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm min-h-[44px]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs min-h-[44px]"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 block mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs min-h-[44px]"
                required
              />
            </div>
          </div>
        </div>

        {/* Travel Style Multi-Select Chips */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block">
            Your Travel Style Persona
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PREDEFINED_TRAVEL_STYLES.map(style => {
              const isSelected = travelStyles.includes(style);
              return (
                <button
                  type="button"
                  key={style}
                  onClick={() => toggleItem(travelStyles, setTravelStyles, style)}
                  className={`text-[11px] px-2.5 py-1 rounded-xl transition-all min-h-[36px] ${
                    isSelected
                      ? 'bg-[#B5541C] text-white font-semibold'
                      : 'bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {style}
                </button>
              );
            })}
          </div>
        </div>

        {/* Categories of Interest Multi-Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block">
            Preferred Cultural Categories
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
            {OFFICIAL_CATEGORIES.map(cat => {
              const isSelected = categories.includes(cat);
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => toggleItem(categories, setCategories, cat)}
                  className={`text-[11px] px-2.5 py-1 rounded-xl transition-all min-h-[36px] ${
                    isSelected
                      ? 'bg-[#B5541C] text-white font-semibold'
                      : 'bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Safety Preferences Multi-Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block">
            Safety & Verification Priorities
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PREDEFINED_SAFETY_PREFS.map(pref => {
              const isSelected = safetyPrefs.includes(pref);
              return (
                <button
                  type="button"
                  key={pref}
                  onClick={() => toggleItem(safetyPrefs, setSafetyPrefs, pref)}
                  className={`text-[11px] px-2.5 py-1 rounded-xl transition-all min-h-[36px] ${
                    isSelected
                      ? 'bg-emerald-700 text-white font-semibold'
                      : 'bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  ✓ {pref}
                </button>
              );
            })}
          </div>
        </div>

        {/* Language & Budget */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 block mb-1">
              Primary Language
            </label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs min-h-[44px]"
            >
              <option value="Hindi">Hindi</option>
              <option value="English">English</option>
              <option value="Gujarati">Gujarati</option>
              <option value="Rajasthani/Marwari">Rajasthani/Marwari</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 block mb-1">
              Budget Band
            </label>
            <select
              value={budget}
              onChange={e => setBudget(e.target.value as BudgetBand)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs min-h-[44px]"
            >
              <option value="low">Budget (Low)</option>
              <option value="medium">Standard (Medium)</option>
              <option value="high">Exclusive (High)</option>
            </select>
          </div>
        </div>

        {/* Trusted Contacts for Custom SOS */}
        <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
              Trusted SOS Contacts ({contacts.length}/3)
            </span>
            {contacts.length < 3 && (
              <button
                type="button"
                onClick={() => setContacts([...contacts, { id: 'c' + Date.now(), name: '', phone: '+91 ', relation: 'Family' }])}
                className="text-xs text-[#B5541C] dark:text-[#E27A3F] font-semibold hover:underline flex items-center gap-1 min-h-[38px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Contact</span>
              </button>
            )}
          </div>

          <div className="space-y-2">
            {contacts.map((c, i) => (
              <div key={c.id} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Contact Name"
                  value={c.name}
                  onChange={e => {
                    const updated = [...contacts];
                    updated[i].name = e.target.value;
                    setContacts(updated);
                  }}
                  className="flex-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs min-h-[44px]"
                />
                <input
                  type="tel"
                  placeholder="+91 Phone"
                  value={c.phone}
                  onChange={e => {
                    const updated = [...contacts];
                    updated[i].phone = e.target.value;
                    setContacts(updated);
                  }}
                  className="flex-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs min-h-[44px]"
                />
                {contacts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setContacts(contacts.filter((_, idx) => idx !== i))}
                    className="p-2 text-stone-400 hover:text-rose-600 min-h-[44px]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Save CTA */}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3.5 px-4 rounded-xl bg-[#B5541C] hover:bg-[#974314] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 min-h-[48px] shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Updating Profile...' : 'Save & Update Matching Persona'}</span>
        </button>
      </form>
    </div>
  );
};
