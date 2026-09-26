import React, { useState } from 'react';
import { 
  UserRound, 
  Compass, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Lock, 
  Calendar, 
  Camera, 
  Plus, 
  Trash2, 
  ArrowRight, 
  Sparkles,
  CheckCircle2,
  Users,
  IndianRupee,
  AlertCircle
} from 'lucide-react';
import { UserRole, StateOption, BudgetBand } from '../lib/types';
import { supabaseStore, AuthSession } from '../lib/supabase/client';
import { OFFICIAL_CATEGORIES, getDistrictsForState } from '../lib/data/destinations-data';

interface AuthGateViewProps {
  onAuthSuccess: (session: AuthSession) => void;
}

const PREDEFINED_TRAVEL_STYLES = [
  'Slow travel', 'Photography', 'Adventure', 'Culture', 'History', 
  'Architecture', 'Nature', 'Food', 'Crafts', 'Wildlife', 'Offbeat', 'Walking', 'Shopping'
];

const PREDEFINED_SAFETY_PREFS = [
  'Verified ID', 'Female-traveler-safe', 'Solo-traveler-safe', 
  'Local police verified', 'Red Cross first-aid', 'Group-friendly', 'Daylight-only'
];

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80'
];

export const AuthGateView: React.FC<AuthGateViewProps> = ({ onAuthSuccess }) => {
  // Mode: Sign In or Sign Up
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  // Selected role
  const [selectedRole, setSelectedRole] = useState<UserRole>('tourist');

  // Shared Sign In Fields
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Tourist Sign Up Fields
  const [touristName, setTouristName] = useState('');
  const [touristEmail, setTouristEmail] = useState('');
  const [touristPassword, setTouristPassword] = useState('');
  const [touristConfirmPassword, setTouristConfirmPassword] = useState('');
  const [touristPhone, setTouristPhone] = useState('+91 ');
  const [touristDob, setTouristDob] = useState('2000-01-01');
  const [touristPhoto, setTouristPhoto] = useState<string | null>(null);
  const [touristStyles, setTouristStyles] = useState<string[]>(['Slow travel', 'Culture']);
  const [touristCategories, setTouristCategories] = useState<string[]>(['Heritage', 'Craft']);
  const [touristSafety, setTouristSafety] = useState<string[]>(['Verified ID', 'Female-traveler-safe']);
  const [touristLang, setTouristLang] = useState('Hindi');
  const [touristBudget, setTouristBudget] = useState<BudgetBand>('medium');
  const [trustedContacts, setTrustedContacts] = useState<Array<{ id: string; name: string; phone: string; relation: string }>>([
    { id: 'c1', name: 'Emergency Family Contact', phone: '+91 98111 22233', relation: 'Family' }
  ]);

  // Guide Sign Up Fields (with Fee Range Fix 2 & Auth Fix 3)
  const [guideName, setGuideName] = useState('');
  const [guideEmail, setGuideEmail] = useState('');
  const [guidePassword, setGuidePassword] = useState('');
  const [guideConfirmPassword, setGuideConfirmPassword] = useState('');
  const [guidePhone, setGuidePhone] = useState('+91 ');
  const [guideState, setGuideState] = useState<StateOption>('Gujarat');
  const [guideDistrict, setGuideDistrict] = useState<string>('Ahmedabad');
  const [guideFeeMin, setGuideFeeMin] = useState<number>(1500);
  const [guideFeeMax, setGuideFeeMax] = useState<number>(3000);
  const [guidePhoto, setGuidePhoto] = useState<string | null>(null);
  const [guideBio, setGuideBio] = useState('');
  const [guideSpecialties, setGuideSpecialties] = useState<string[]>(['heritage walks', 'food trails']);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  const districts = getDistrictsForState(guideState);

  // File Upload Helper
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size should be under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail.trim() || !signInPassword) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessNotice('');

    try {
      const session = await supabaseStore.signInWithPassword(signInEmail, signInPassword);
      setLoading(false);
      onAuthSuccess(session);
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err?.message || 'Login failed. Please verify your email and password.');
    }
  };

  const handleTouristSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!touristName.trim() || !touristEmail.trim() || touristPhone.length < 10) {
      setErrorMessage('Please provide complete name, email, and phone.');
      return;
    }
    if (!touristPassword || touristPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (touristPassword !== touristConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessNotice('');

    try {
      const session = await supabaseStore.signUpTourist({
        email: touristEmail.trim(),
        password: touristPassword,
        full_name: touristName.trim(),
        phone: touristPhone.trim(),
        dob: touristDob,
        photo_url: touristPhoto,
        travel_styles: touristStyles,
        categories_of_interest: touristCategories,
        safety_preferences: touristSafety,
        preferred_language: touristLang,
        budget_band: touristBudget,
        trusted_contacts: trustedContacts
      });
      setLoading(false);
      onAuthSuccess(session);
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err?.message || 'Tourist account registration failed.');
    }
  };

  const handleGuideSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guideName.trim() || !guideEmail.trim() || guidePhone.length < 10) {
      setErrorMessage('Please provide complete name, email, and phone number.');
      return;
    }
    if (!guideFeeMin || !guideFeeMax || guideFeeMin <= 0 || guideFeeMax < guideFeeMin) {
      setErrorMessage('Please provide a valid fee range (Minimum fee cannot exceed Maximum fee).');
      return;
    }
    if (!guidePassword || guidePassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (guidePassword !== guideConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessNotice('');

    try {
      const session = await supabaseStore.signUpGuide({
        email: guideEmail.trim(),
        password: guidePassword,
        full_name: guideName.trim(),
        phone: guidePhone.trim(),
        state: guideState,
        primary_area: guideDistrict,
        fee_min: Number(guideFeeMin),
        fee_max: Number(guideFeeMax),
        photo_url: guidePhoto,
        bio: guideBio.trim(),
        specialties: guideSpecialties
      });
      setLoading(false);
      onAuthSuccess(session);
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err?.message || 'Guide registration failed.');
    }
  };

  // Evaluator Quick Demo Shortcuts
  const handleFastDemoLogin = async (role: UserRole) => {
    setLoading(true);
    setErrorMessage('');
    try {
      if (role === 'tourist') {
        try {
          const session = await supabaseStore.signInWithPassword('ananya.travel@ilahi.org', 'ilahi2026');
          onAuthSuccess(session);
        } catch {
          const session = await supabaseStore.signUpTourist({
            email: 'ananya.travel@ilahi.org',
            password: 'Password123!',
            full_name: 'Ananya Sharma',
            phone: '+91 98765 43210'
          });
          onAuthSuccess(session);
        }
      } else {
        try {
          const session = await supabaseStore.signInWithPassword('dhruv.patel@ilahi-guide.in', 'ilahi2026');
          onAuthSuccess(session);
        } catch {
          const session = await supabaseStore.signUpGuide({
            email: 'dhruv.patel@ilahi-guide.in',
            password: 'Password123!',
            full_name: 'Dhruv Patel',
            phone: '+91 98250 12345',
            state: 'Gujarat',
            primary_area: 'Ahmedabad',
            fee_min: 1500,
            fee_max: 2500,
            bio: 'Fourth-generation resident of Khadiya Pol. Conservation architect passionate about secret stepwells.'
          });
          onAuthSuccess(session);
        }
      }
    } catch (e: any) {
      setLoading(false);
      setErrorMessage(e?.message || 'Demo access error.');
    }
  };

  const toggleArrayItem = (list: string[], setList: (l: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(x => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#171310] flex flex-col justify-center px-4 py-8 sm:py-12 transition-colors">
      <div className="max-w-md sm:max-w-xl w-full mx-auto space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#B5541C] text-white shadow-md">
            <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9v11h3v-7c0-2.21 1.79-4 4-4s4 1.79 4 4v7h3V9c0-3.87-3.13-7-7-7zm0 2c2.76 0 5 2.24 5 5v2.1c-.6-.68-1.48-1.1-2.45-1.1-1.93 0-3.5 1.57-3.5 3.5v6.5h-1V13.5c0-1.93-1.57-3.5-3.5-3.5-.97 0-1.85.42-2.45 1.1V9c0-2.76 2.24-5 5-5z" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-[#241A12] dark:text-[#F5EEE4]">
              ILAHI
            </h1>
            <p className="text-xs text-[#6B5D4F] dark:text-[#B0A192] font-medium">
              Gujarat & Rajasthan Local Guide Network • SIH 2026
            </p>
          </div>
        </div>

        {/* Auth Mode Toggle (Sign In / Sign Up) */}
        <div className="flex p-1 rounded-2xl bg-stone-200/80 dark:bg-stone-800 border border-stone-300 dark:border-stone-700">
          <button
            type="button"
            onClick={() => { setAuthMode('signin'); setErrorMessage(''); }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm min-h-[44px] transition-all ${
              authMode === 'signin'
                ? 'bg-white dark:bg-stone-900 text-[#B5541C] dark:text-[#E27A3F] shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Sign In to Existing Account
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('signup'); setErrorMessage(''); }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm min-h-[44px] transition-all ${
              authMode === 'signup'
                ? 'bg-white dark:bg-stone-900 text-[#B5541C] dark:text-[#E27A3F] shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Create New Account
          </button>
        </div>

        {/* Role Selector Card */}
        <div className="grid grid-cols-2 gap-3">
          <div
            onClick={() => setSelectedRole('tourist')}
            className={`p-3.5 rounded-2xl cursor-pointer border transition-all text-left flex flex-col justify-between ${
              selectedRole === 'tourist'
                ? 'border-[#B5541C] bg-[#FAF6F0] dark:bg-stone-800/80 ring-2 ring-[#B5541C]/30'
                : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <Compass className={`w-5 h-5 ${selectedRole === 'tourist' ? 'text-[#B5541C]' : 'text-stone-400'}`} />
              {selectedRole === 'tourist' && <CheckCircle2 className="w-4 h-4 text-[#B5541C]" />}
            </div>
            <div className="mt-2">
              <span className="font-display text-sm font-bold block text-stone-900 dark:text-stone-100">
                I'm a Tourist
              </span>
              <span className="text-[11px] text-stone-500 block">
                Heritage explorer & traveler
              </span>
            </div>
          </div>

          <div
            onClick={() => setSelectedRole('guide')}
            className={`p-3.5 rounded-2xl cursor-pointer border transition-all text-left flex flex-col justify-between ${
              selectedRole === 'guide'
                ? 'border-[#B5541C] bg-[#FAF6F0] dark:bg-stone-800/80 ring-2 ring-[#B5541C]/30'
                : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <UserRound className={`w-5 h-5 ${selectedRole === 'guide' ? 'text-[#B5541C]' : 'text-stone-400'}`} />
              {selectedRole === 'guide' && <CheckCircle2 className="w-4 h-4 text-[#B5541C]" />}
            </div>
            <div className="mt-2">
              <span className="font-display text-sm font-bold block text-stone-900 dark:text-stone-100">
                I'm a Local Guide
              </span>
              <span className="text-[11px] text-stone-500 block">
                Heritage host & local expert
              </span>
            </div>
          </div>
        </div>

        {/* Error / Success Notifications */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ---------------- SIGN IN FORM ---------------- */}
        {authMode === 'signin' ? (
          <form onSubmit={handleSignIn} className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4 shadow-xs">
            <div className="border-b pb-3 border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">
                  Sign In to Supabase
                </h3>
                <p className="text-xs text-stone-500">
                  Enter your registered {selectedRole === 'tourist' ? 'Tourist' : 'Guide'} credentials
                </p>
              </div>
              <span className="text-[10px] px-2 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold uppercase">
                {selectedRole}
              </span>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  value={signInEmail}
                  onChange={e => setSignInEmail(e.target.value)}
                  placeholder="e.g. yourname@ilahi.org"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 min-h-[44px]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="password"
                  value={signInPassword}
                  onChange={e => setSignInPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 min-h-[44px]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#B5541C] hover:bg-[#974314] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 min-h-[44px] shadow-sm disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating with Supabase...' : `Sign In as ${selectedRole === 'tourist' ? 'Tourist' : 'Local Guide'}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Access (for Hackathon evaluation) */}
            <div className="pt-2 border-t border-stone-200 dark:border-stone-800 text-center space-y-2">
              <span className="text-[11px] text-stone-500 font-semibold block">
                Quick Evaluator Demo Shortcuts
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleFastDemoLogin('tourist')}
                  className="flex-1 py-2 px-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-[11px] font-semibold text-stone-800 dark:text-stone-200 min-h-[44px] hover:bg-stone-200"
                >
                  Tourist (Ananya)
                </button>
                <button
                  type="button"
                  onClick={() => handleFastDemoLogin('guide')}
                  className="flex-1 py-2 px-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-[11px] font-semibold text-stone-800 dark:text-stone-200 min-h-[44px] hover:bg-stone-200"
                >
                  Guide (Dhruv Patel)
                </button>
              </div>
            </div>
          </form>
        ) : selectedRole === 'tourist' ? (
          /* ---------------- TOURIST SIGN UP FORM ---------------- */
          <form onSubmit={handleTouristSignUp} className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4 shadow-xs">
            <div className="border-b pb-3 border-stone-200 dark:border-stone-800">
              <h3 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">
                Tourist Account Registration
              </h3>
              <p className="text-xs text-stone-500">
                Creates your Supabase user and configures travel preferences
              </p>
            </div>

            {/* Profile Photo */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block">
                Profile Photo (Optional / Can keep blank)
              </label>
              <div className="flex items-center gap-3">
                <div className="relative">
                  {touristPhoto ? (
                    <img
                      src={touristPhoto}
                      alt="Tourist preview"
                      className="w-12 h-12 rounded-xl object-cover border-2 border-[#B5541C]"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-stone-800 flex items-center justify-center font-bold text-amber-900 dark:text-amber-300 border border-dashed border-stone-300">
                      {touristName ? touristName.charAt(0).toUpperCase() : <UserRound className="w-5 h-5 text-stone-400" />}
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs font-semibold hover:bg-stone-200 min-h-[36px] flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handlePhotoUpload(e, setTouristPhoto)}
                        className="hidden"
                      />
                    </label>
                    {touristPhoto && (
                      <button
                        type="button"
                        onClick={() => setTouristPhoto(null)}
                        className="text-xs text-rose-600 hover:underline"
                      >
                        Keep Blank
                      </button>
                    )}
                  </div>
                  <div className="flex gap-1 items-center">
                    <span className="text-[10px] text-stone-400">Presets:</span>
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <img
                        key={idx}
                        src={preset}
                        onClick={() => setTouristPhoto(preset)}
                        alt="Preset"
                        className="w-5 h-5 rounded-full object-cover cursor-pointer border hover:scale-110 transition-transform"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={touristName}
                  onChange={e => setTouristName(e.target.value)}
                  placeholder="e.g. Ananya Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm min-h-[44px]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={touristEmail}
                    onChange={e => setTouristEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs min-h-[44px]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 block mb-1">
                    Phone (+91) *
                  </label>
                  <input
                    type="tel"
                    value={touristPhone}
                    onChange={e => setTouristPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs min-h-[44px]"
                    required
                  />
                </div>
              </div>

              {/* Password & Confirm Password (Fix 3) */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 block mb-1">
                    Password (min 6 chars) *
                  </label>
                  <input
                    type="password"
                    value={touristPassword}
                    onChange={e => setTouristPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs min-h-[44px]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 block mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={touristConfirmPassword}
                    onChange={e => setTouristConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs min-h-[44px]"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Travel Styles & Safety Chips */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block">
                Travel Styles
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {PREDEFINED_TRAVEL_STYLES.map(style => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => toggleArrayItem(touristStyles, setTouristStyles, style)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      touristStyles.includes(style)
                        ? 'bg-[#B5541C] text-white'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#B5541C] hover:bg-[#974314] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 min-h-[48px] shadow-sm disabled:opacity-50"
            >
              <span>{loading ? 'Registering with Supabase...' : 'Complete Tourist Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* ---------------- GUIDE SIGN UP FORM (Fix 2 & Fix 3) ---------------- */
          <form onSubmit={handleGuideSignUp} className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4 shadow-xs">
            <div className="border-b pb-3 border-stone-200 dark:border-stone-800">
              <h3 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">
                Local Guide Registration
              </h3>
              <p className="text-xs text-stone-500">
                Publishes your presence immediately across devices with Pending Admin Review
              </p>
            </div>

            {/* Photo upload / blank option */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block">
                Guide Profile Photo
              </label>
              <div className="flex items-center gap-3">
                <div className="relative">
                  {guidePhoto ? (
                    <img
                      src={guidePhoto}
                      alt="Guide preview"
                      className="w-12 h-12 rounded-xl object-cover border-2 border-[#B5541C]"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-stone-800 flex items-center justify-center font-bold text-amber-900 dark:text-amber-300 border border-dashed border-stone-300">
                      {guideName ? guideName.charAt(0).toUpperCase() : <UserRound className="w-5 h-5 text-stone-400" />}
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs font-semibold hover:bg-stone-200 min-h-[36px] inline-flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Choose Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handlePhotoUpload(e, setGuidePhoto)}
                      className="hidden"
                    />
                  </label>
                  {guidePhoto && (
                    <button
                      type="button"
                      onClick={() => setGuidePhoto(null)}
                      className="ml-2 text-xs text-rose-600 hover:underline"
                    >
                      Keep Blank
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block mb-1">
                Full Legal Name *
              </label>
              <input
                type="text"
                value={guideName}
                onChange={e => setGuideName(e.target.value)}
                placeholder="e.g. Harshad Giri"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm min-h-[44px]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={guideEmail}
                  onChange={e => setGuideEmail(e.target.value)}
                  placeholder="guide@ilahi.org"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs min-h-[44px]"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 block mb-1">
                  Phone (+91) *
                </label>
                <input
                  type="tel"
                  value={guidePhone}
                  onChange={e => setGuidePhone(e.target.value)}
                  placeholder="+91 98254 56789"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs min-h-[44px]"
                  required
                />
              </div>
            </div>

            {/* Password & Confirm Password (Fix 3) */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 block mb-1">
                  Password (min 6 chars) *
                </label>
                <input
                  type="password"
                  value={guidePassword}
                  onChange={e => setGuidePassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs min-h-[44px]"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 block mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={guideConfirmPassword}
                  onChange={e => setGuideConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs min-h-[44px]"
                  required
                />
              </div>
            </div>

            {/* State and District */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 block mb-1">
                  State
                </label>
                <select
                  value={guideState}
                  onChange={e => setGuideState(e.target.value as StateOption)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs min-h-[44px]"
                >
                  <option value="Gujarat">Gujarat</option>
                  <option value="Rajasthan">Rajasthan</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 block mb-1">
                  Primary District
                </label>
                <select
                  value={guideDistrict}
                  onChange={e => setGuideDistrict(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs min-h-[44px]"
                >
                  {districts.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fee Range Fields (Fix 2) */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-stone-800/80 border border-amber-200/80 dark:border-stone-700 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-950 dark:text-amber-300 flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 text-[#B5541C]" />
                <span>Standard Daily Fee Range (INR / Day) *</span>
              </label>
              <p className="text-[11px] text-stone-500">
                Required for the matching algorithm's Budget Fit parameter
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] font-semibold text-stone-600 dark:text-stone-400 block mb-0.5">Min Rate (₹)</span>
                  <input
                    type="number"
                    min={500}
                    step={100}
                    value={guideFeeMin}
                    onChange={e => setGuideFeeMin(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs sm:text-sm min-h-[44px] font-semibold"
                    required
                  />
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-stone-600 dark:text-stone-400 block mb-0.5">Max Rate (₹)</span>
                  <input
                    type="number"
                    min={guideFeeMin || 500}
                    step={100}
                    value={guideFeeMax}
                    onChange={e => setGuideFeeMax(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs sm:text-sm min-h-[44px] font-semibold"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block mb-1">
                Short Bio / Background
              </label>
              <textarea
                value={guideBio}
                onChange={e => setGuideBio(e.target.value)}
                rows={2}
                placeholder="Share your heritage heritage knowledge, family origins, or local stories..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#B5541C] hover:bg-[#974314] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 min-h-[48px] shadow-sm disabled:opacity-50"
            >
              <span>{loading ? 'Publishing Guide Profile to Supabase...' : 'Submit Guide Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
