import React, { useState, useEffect } from 'react';
import { 
  UserRound, 
  MapPin, 
  Phone, 
  Star, 
  Calendar, 
  Receipt, 
  CheckCircle2, 
  XCircle, 
  Camera, 
  LogOut, 
  Save, 
  Edit3, 
  Clock, 
  ShieldCheck, 
  ShieldAlert,
  IndianRupee,
  Layers,
  Sparkles,
  Tag,
  Radio
} from 'lucide-react';
import { GuideProfile, Booking, Review, AvailabilityPreset, BookingStatus } from '../lib/types';
import { supabaseStore, AuthSession } from '../lib/supabase/client';
import { ThemeToggle } from '../components/ThemeToggle';
import { getDistrictsForState } from '../lib/data/destinations-data';

interface GuideShellViewProps {
  session: AuthSession;
  onSignOut: () => void;
}

const PREDEFINED_SPECIALTIES = [
  'heritage walks', 'craft workshops', 'food trails', 'wildlife', 
  'pilgrimage circuits', 'desert experiences', 'village stays', 'textile arts', 'stepwell tours'
];

export const GuideShellView: React.FC<GuideShellViewProps> = ({ session, onSignOut }) => {
  const guideId = session.user.id;
  const [guide, setGuide] = useState<GuideProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Edit in place state
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [feeMin, setFeeMin] = useState<number>(1500);
  const [feeMax, setFeeMax] = useState<number>(3000);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [availabilityPreset, setAvailabilityPreset] = useState<AvailabilityPreset>('flexible');
  const [activeDays, setActiveDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  const [statusMessage, setStatusMessage] = useState('');

  const loadGuideData = async () => {
    const current = (await supabaseStore.getGuideById(guideId)) || 
                    (session.guideProfile as GuideProfile) || 
                    (await supabaseStore.getPublicGuideProfiles())[0];
    if (current) {
      setGuide(current);
      setName(current.full_name);
      setBio(current.bio || '');
      setFeeMin(current.fee_min || 1500);
      setFeeMax(current.fee_max || 3000);
      setSpecialties(current.specialties || []);
      setAvailabilityPreset(current.availability_preset || 'flexible');
      
      const allBookings = await supabaseStore.getBookings(current.id, 'guide');
      setBookings(allBookings);

      const allReviews = await supabaseStore.getReviews(current.id);
      setReviews(allReviews);
    }
  };

  useEffect(() => {
    loadGuideData();

    // Fix 1: Supabase Realtime live sync for incoming bookings
    const unsubscribe = supabaseStore.subscribeToGuideBookings(guideId, (newBooking) => {
      setBookings(prev => {
        const idx = prev.findIndex(b => b.id === newBooking.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = newBooking;
          return copy;
        }
        return [newBooking, ...prev];
      });
      setStatusMessage(`🔔 Live Booking Alert: Received booking for ${newBooking.destination_name || 'heritage tour'}!`);
      setTimeout(() => setStatusMessage(''), 6000);
    });

    return () => {
      unsubscribe();
    };
  }, [guideId]);

  if (!guide) {
    return <div className="p-8 text-center text-sm font-semibold">Loading guide control center...</div>;
  }

  // Handle Photo Upload / Change / Remove
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const photoUrl = reader.result as string;
        const updated = await supabaseStore.updateGuideProfile(guide.id, { photo_url: photoUrl });
        setGuide(updated);
        setStatusMessage('Profile photo updated in Supabase.');
        setTimeout(() => setStatusMessage(''), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = async () => {
    const updated = await supabaseStore.updateGuideProfile(guide.id, { photo_url: null });
    setGuide(updated);
    setStatusMessage('Profile photo removed (showing initials).');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await supabaseStore.updateGuideProfile(guide.id, {
      full_name: name.trim(),
      bio: bio.trim(),
      fee_min: Number(feeMin),
      fee_max: Number(feeMax),
      specialties,
      availability_preset: availabilityPreset
    });
    setGuide(updated);
    setIsEditingProfile(false);
    setStatusMessage('Guide profile & fee range updated in Supabase.');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleBookingAction = async (bookingId: string, action: 'accept' | 'decline') => {
    const newStatus: BookingStatus = action === 'accept' ? 'confirmed' : 'cancelled';
    await supabaseStore.updateBookingStatus(bookingId, newStatus);
    setStatusMessage(`Booking #${bookingId.slice(0, 8)} ${action === 'accept' ? 'accepted' : 'declined'}.`);
    setTimeout(() => setStatusMessage(''), 3000);
    loadGuideData();
  };

  const toggleDay = (day: string) => {
    if (activeDays.includes(day)) {
      setActiveDays(activeDays.filter(d => d !== day));
    } else {
      setActiveDays([...activeDays, day]);
    }
  };

  const toggleSpecialty = (item: string) => {
    if (specialties.includes(item)) {
      setSpecialties(specialties.filter(s => s !== item));
    } else {
      setSpecialties([...specialties, item]);
    }
  };

  const totalEarnings = bookings
    .filter(b => b.status === 'released' || b.status === 'confirmed')
    .reduce((sum, b) => sum + (b.total_fee || b.computed_amount), 0);

  const pendingEscrow = bookings
    .filter(b => b.status === 'held' || b.status === 'pending')
    .reduce((sum, b) => sum + (b.total_fee || b.computed_amount), 0);

  return (
    <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#171310] text-[#241A12] dark:text-[#F5EEE4] flex flex-col font-sans transition-colors duration-200">
      {/* Persistent Guide Shell Top Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#241E19]/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#B5541C] text-white flex items-center justify-center font-bold shadow-xs">
              <UserRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xl font-bold tracking-tight text-[#241A12] dark:text-[#F5EEE4]">
                  ILAHI Guide Portal
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                  <span>Live Sync</span>
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Shared Supabase Hub • {guide.primary_area}, {guide.state}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={onSignOut}
              className="px-3 py-2 rounded-xl text-stone-600 dark:text-stone-300 hover:text-rose-600 border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-xs font-semibold flex items-center gap-1.5 min-h-[44px]"
              title="Sign Out to switch role"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Single-Page Content Area */}
      <main className="max-w-3xl w-full mx-auto p-4 sm:p-6 space-y-6 flex-1">
        
        {/* Banner: Pending Admin Review */}
        <section className="p-4 sm:p-5 rounded-3xl bg-amber-500/10 border-2 border-amber-600/30 text-amber-950 dark:text-amber-200 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-700 dark:text-amber-400" />
              <h3 className="font-display text-base sm:text-lg font-bold">
                Status: Pending Admin Review
              </h3>
            </div>
            <span className="text-[11px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-amber-200/60 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
              Prototype Mode
            </span>
          </div>
          <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
            Your profile is active in the shared Supabase directory. Tourist matches and live bookings are fully functional while your official verification badges are processed.
          </p>
          <div className="flex flex-wrap gap-3 text-xs pt-1 border-t border-amber-300/40 dark:border-amber-800/40">
            <span className="flex items-center gap-1 font-semibold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4" /> Phone Registered ({guide.phone})
            </span>
            <span className="flex items-center gap-1 font-semibold text-amber-800 dark:text-amber-400">
              <Clock className="w-4 h-4" /> Government ID Verification In Progress
            </span>
            <span className="flex items-center gap-1 font-semibold text-amber-800 dark:text-amber-400">
              <Clock className="w-4 h-4" /> Heritage Badge Under Review
            </span>
          </div>
        </section>

        {/* Live Notification Banner */}
        {statusMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{statusMessage}</span>
          </div>
        )}

        {/* ---------------- SECTION A: PROFILE CARD (Edit in Place) ---------------- */}
        <section className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#241E19] border border-stone-200/90 dark:border-stone-800/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Photo Upload / Change / Remove Circle */}
              <div className="relative group">
                {guide.photo_url ? (
                  <img
                    src={guide.photo_url}
                    alt={guide.full_name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-[#B5541C] shadow-xs"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-amber-100 dark:bg-stone-800 flex items-center justify-center font-display text-2xl font-bold text-amber-900 dark:text-amber-300 border-2 border-stone-300 dark:border-stone-700">
                    {guide.full_name.charAt(0).toUpperCase()}
                  </div>
                )}

                <label className="absolute -bottom-1 -right-1 cursor-pointer p-1.5 rounded-full bg-[#B5541C] text-white hover:bg-[#974314] shadow-sm transition-transform active:scale-95" title="Change Profile Photo">
                  <Camera className="w-3.5 h-3.5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100">
                    {guide.full_name}
                  </h2>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    guide.is_verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {guide.is_verified ? 'Verified Guide' : 'Pending Admin Review'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#B5541C]" />
                    <span>{guide.primary_area}, {guide.state}</span>
                  </span>
                  <span>•</span>
                  <span className="font-mono">{guide.phone}</span>
                </div>

                {/* Prominent Fee Range Badge (Fix 2) */}
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 pt-0.5">
                  <IndianRupee className="w-3.5 h-3.5 text-[#B5541C]" />
                  <span>Daily Rate: ₹{guide.fee_min || 1000} – ₹{guide.fee_max || 3000} / day</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-400 font-semibold pt-0.5">
                  <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                  <span>{guide.rating_avg ? `${guide.rating_avg.toFixed(1)}/5.0 (${reviews.length} reviews)` : '4.8/5.0 (Baseline Trust Applied)'}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 self-start">
              {guide.photo_url && (
                <button
                  onClick={handleRemovePhoto}
                  className="px-2.5 py-1.5 text-xs text-rose-600 hover:underline min-h-[38px]"
                >
                  Remove Photo
                </button>
              )}
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-xs font-semibold hover:bg-stone-200 min-h-[38px] flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingProfile ? 'Cancel Edit' : 'Edit Profile & Rates'}</span>
              </button>
            </div>
          </div>

          {/* Edit In Place Form */}
          {isEditingProfile ? (
            <form onSubmit={handleSaveProfile} className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3 animate-in fade-in">
              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs min-h-[44px]"
                  required
                />
              </div>

              {/* Fee Range Inputs (Fix 2) */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Min Fee (₹ / day) *
                  </label>
                  <input
                    type="number"
                    min={500}
                    step={100}
                    value={feeMin}
                    onChange={e => setFeeMin(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs min-h-[44px] font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Max Fee (₹ / day) *
                  </label>
                  <input
                    type="number"
                    min={feeMin || 500}
                    step={100}
                    value={feeMax}
                    onChange={e => setFeeMax(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs min-h-[44px] font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Bio / Heritage Narrative
                </label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Specialties (Fixed Chips)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PREDEFINED_SPECIALTIES.map(item => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => toggleSpecialty(item)}
                      className={`text-xs px-2.5 py-1 rounded-xl transition-all min-h-[34px] ${
                        specialties.includes(item)
                          ? 'bg-[#B5541C] text-white font-semibold'
                          : 'bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-3 py-2 rounded-xl border text-xs min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#B5541C] text-white text-xs font-bold hover:bg-[#974314] min-h-[44px] flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save to Supabase</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 pt-2 border-t border-stone-100 dark:border-stone-800">
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                {guide.bio || 'Heritage guide registered for curated circuit walks, artisan introductions, and custom travel experiences.'}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {guide.specialties && guide.specialties.map(s => (
                  <span key={s} className="px-2.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[11px] font-medium border border-stone-200 dark:border-stone-700">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ---------------- SECTION B: AVAILABILITY MANAGER ---------------- */}
        <section className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#241E19] border border-stone-200/90 dark:border-stone-800/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#B5541C]" />
              <h3 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">
                Weekly Availability Schedule
              </h3>
            </div>
            <span className="text-xs text-stone-500">
              Preset: <strong className="capitalize text-stone-800 dark:text-stone-200">{availabilityPreset.replace('_', ' ')}</strong>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'weekday_mornings', label: 'Weekday Mornings' },
              { id: 'weekends', label: 'Weekends Only' },
              { id: 'flexible', label: 'Flexible / Full' }
            ].map(p => (
              <button
                type="button"
                key={p.id}
                onClick={async () => {
                  setAvailabilityPreset(p.id as AvailabilityPreset);
                  await supabaseStore.updateGuideProfile(guide.id, { availability_preset: p.id as AvailabilityPreset });
                  setStatusMessage(`Availability updated to ${p.label}.`);
                  setTimeout(() => setStatusMessage(''), 3000);
                }}
                className={`py-3 px-2 rounded-xl text-xs font-bold text-center border transition-all min-h-[44px] ${
                  availabilityPreset === p.id
                    ? 'border-[#B5541C] bg-amber-50 dark:bg-amber-950 text-[#B5541C] dark:text-[#E27A3F]'
                    : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Active Weekly Tour Days
            </span>
            <div className="grid grid-cols-7 gap-1.5">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <button
                  type="button"
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                    activeDays.includes(day)
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-400'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- SECTION C: LIVE BOOKINGS LIST (Fix 1) ---------------- */}
        <section className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#241E19] border border-stone-200/90 dark:border-stone-800/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#B5541C]" />
              <h3 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">
                Tour Requests & Bookings ({bookings.length})
              </h3>
            </div>
            {pendingEscrow > 0 && (
              <span className="text-xs font-bold text-amber-800 dark:text-amber-400">
                ₹{pendingEscrow.toLocaleString('en-IN')} Escrow Hold
              </span>
            )}
          </div>

          {bookings.length === 0 ? (
            <div className="p-6 text-center text-xs text-stone-500 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-dashed border-stone-300 dark:border-stone-700">
              No tour requests received yet. When tourists match and book you on another device, their request will appear here in real time!
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map(b => (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-stone-900 dark:text-stone-100">
                      {b.tourist_name || 'Traveler'} • {b.start_date} to {b.end_date}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                      b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-900' :
                      b.status === 'cancelled' ? 'bg-rose-100 text-rose-900' :
                      'bg-amber-100 text-amber-900'
                    }`}>
                      {b.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-stone-500 text-[11px]">
                    <span>Destination: {b.destination_name}</span>
                    <span className="font-bold text-stone-800 dark:text-stone-200">₹{(b.total_fee || b.computed_amount).toLocaleString('en-IN')}</span>
                  </div>

                  {(b.status === 'held' || b.status === 'pending') && (
                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={() => handleBookingAction(b.id, 'accept')}
                        className="flex-1 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs min-h-[38px] transition-colors"
                      >
                        Accept Tour Request
                      </button>
                      <button
                        onClick={() => handleBookingAction(b.id, 'decline')}
                        className="py-2 px-3 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-xs min-h-[38px] hover:bg-stone-100"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ---------------- SECTION D: EARNINGS & REVIEWS SUMMARY ---------------- */}
        <section className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#241E19] border border-stone-200/90 dark:border-stone-800/80 shadow-xs space-y-4">
          <h3 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-[#B5541C]" />
            <span>Earnings & Verified Reviews</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-stone-900 border border-amber-200 dark:border-stone-800">
              <span className="text-stone-500 block mb-0.5">Disbursed / Confirmed</span>
              <span className="font-display text-xl font-bold text-[#B5541C]">
                ₹{totalEarnings.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-stone-900 border border-amber-200 dark:border-stone-800">
              <span className="text-stone-500 block mb-0.5">Active / Completed</span>
              <span className="font-display text-xl font-bold text-[#B5541C]">
                {bookings.filter(b => b.status === 'confirmed' || b.status === 'released').length} Tours
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
