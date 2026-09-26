import React, { useState, useEffect } from 'react';
import { 
  UserRound, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Clock, 
  Edit3, 
  Receipt, 
  Languages, 
  Sparkles,
  Calendar,
  CheckCircle2,
  Lock,
  PlusCircle,
  Eye
} from 'lucide-react';
import { GuideProfile, Booking } from '../lib/types';
import { supabaseStore } from '../lib/supabase/client';

interface GuideDashboardViewProps {
  onStartTier1Signup: () => void;
  onEditTier2: (guide: GuideProfile) => void;
  activeGuideId?: string;
}

export const GuideDashboardView: React.FC<GuideDashboardViewProps> = ({
  onStartTier1Signup,
  onEditTier2,
  activeGuideId
}) => {
  const [guides, setGuides] = useState<GuideProfile[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<GuideProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const raw = supabaseStore.getRawGuides();
      setGuides(raw);
      const chosen = (activeGuideId && raw.find((g: GuideProfile) => g.id === activeGuideId)) || raw[0] || null;
      setSelectedGuide(chosen);

      const allBookings = await supabaseStore.getBookings();
      setBookings(allBookings);
      setLoading(false);
    }
    init();
  }, [activeGuideId]);

  if (loading) {
    return <div className="p-8 text-center text-sm">Loading guide dashboard...</div>;
  }

  // Filter bookings for this guide
  const guideBookings = selectedGuide 
    ? bookings.filter(b => b.guide_id === selectedGuide.id)
    : [];

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <UserRound className="w-6 h-6 text-amber-700 dark:text-amber-400" />
            <span>Guide Control Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-0.5">
            Manage your live profile status, complete Tier 2 cultural tags, and view incoming escrow bookings.
          </p>
        </div>

        <button
          onClick={onStartTier1Signup}
          className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs transition-colors min-h-[44px]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Guide Signup</span>
        </button>
      </div>

      {/* Guide Profile Switcher (for Hackathon Demo) */}
      <div className="p-3.5 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs flex items-center justify-between gap-2">
        <span className="font-semibold text-stone-700 dark:text-stone-300">
          Switch Guide Context:
        </span>
        <select
          value={selectedGuide?.id || ''}
          onChange={e => {
            const g = guides.find(x => x.id === e.target.value);
            if (g) setSelectedGuide(g);
          }}
          className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-medium min-h-[38px]"
        >
          {guides.map(g => (
            <option key={g.id} value={g.id}>
              {g.full_name} ({g.primary_area}, {g.state})
            </option>
          ))}
        </select>
      </div>

      {selectedGuide ? (
        <div className="space-y-6">
          {/* Profile Card Preview */}
          <div className="p-6 rounded-3xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <img
                  src={selectedGuide.photo_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'}
                  alt={selectedGuide.full_name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">
                      {selectedGuide.full_name}
                    </h3>
                    {selectedGuide.is_verified ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
                        Admin Verified
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                        Pending Verification
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-stone-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-700" />
                    <span>{selectedGuide.primary_area}, {selectedGuide.state}</span>
                    <span>•</span>
                    <span className="font-mono text-stone-600 dark:text-stone-400">{selectedGuide.phone}</span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-amber-800 dark:text-amber-400 font-semibold pt-0.5">
                    <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                    <span>
                      {selectedGuide.rating_avg !== null && selectedGuide.rating_avg !== undefined
                        ? `${selectedGuide.rating_avg.toFixed(1)}/5.0 Average Trust Rating`
                        : 'No reviews yet (neutral scoring)'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onEditTier2(selectedGuide)}
                className="self-start px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs flex items-center gap-1.5 min-h-[44px]"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Complete Tier 2 Profile</span>
              </button>
            </div>

            {/* Profile Completion Bar (Step 4 & 5 strict requirement) */}
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-stone-800/60 border border-amber-200/60 dark:border-stone-700/60 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-stone-800 dark:text-stone-200">
                  Profile Completeness Indicator
                </span>
                <span className="font-display font-extrabold text-amber-800 dark:text-amber-400 text-sm">
                  {selectedGuide.profile_completion_pct || 40}% Complete
                </span>
              </div>
              <div className="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-700 dark:bg-amber-500 rounded-full transition-all duration-300"
                  style={{ width: `${selectedGuide.profile_completion_pct || 40}%` }}
                />
              </div>
              <p className="text-[11px] text-stone-500">
                Tier 1 is live and bookable. Adding bio, languages, credentials, and specialties brings this to 100%.
              </p>
            </div>

            {/* Bio Preview */}
            <div className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
              <strong className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1">Bio Summary</strong>
              {selectedGuide.bio || 'No bio written yet. Click "Complete Tier 2 Profile" to add personal background.'}
            </div>

            {/* Chips Preview */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(selectedGuide.specialties || []).map((s, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-xl bg-stone-200/80 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-medium">
                  {s}
                </span>
              ))}
              {(selectedGuide.languages || []).map((l, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-medium">
                  {l}
                </span>
              ))}
            </div>
          </div>

          {/* Incoming Bookings Section (Step 5 & 8) */}
          <div className="space-y-3">
            <h3 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-700 dark:text-amber-400" />
              <span>Incoming Trip & Escrow Requests ({guideBookings.length})</span>
            </h3>

            {guideBookings.length === 0 ? (
              <div className="p-6 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-center text-xs text-stone-500">
                No active bookings assigned to this profile currently. As tourists book through the matching system, requests will appear here.
              </div>
            ) : (
              <div className="space-y-3">
                {guideBookings.map(b => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-stone-900 dark:text-stone-100">
                        {b.tourist_name || 'Verified Traveler'} • {b.start_date} to {b.end_date}
                      </div>
                      <div className="text-stone-500 text-[11px] mt-0.5">
                        Amount Held: <strong className="text-amber-800 dark:text-amber-300">₹{b.computed_amount.toLocaleString('en-IN')}</strong> ({b.status.toUpperCase()})
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      b.status === 'held' ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-900'
                    }`}>
                      {b.status === 'held' ? 'Escrow Locked' : 'Payment Released'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-sm">No guide profile found.</div>
      )}
    </div>
  );
};
