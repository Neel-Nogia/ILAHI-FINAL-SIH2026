import React from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Languages, 
  Calendar, 
  IndianRupee, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Star,
  CheckCircle2,
  Clock,
  Briefcase
} from 'lucide-react';
import { MatchResult, MatchCriteria, Destination } from '../lib/types';
import { ScoreBreakdownCard } from '../components/ScoreBreakdownCard';

interface MatchResultsViewProps {
  criteria: MatchCriteria;
  results: MatchResult[];
  onBackToMatch: () => void;
  onSelectGuideForBooking: (result: MatchResult) => void;
}

export const MatchResultsView: React.FC<MatchResultsViewProps> = ({
  criteria,
  results,
  onBackToMatch,
  onSelectGuideForBooking
}) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBackToMatch}
          className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Edit Matching Criteria</span>
        </button>

        <span className="text-xs px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 font-semibold border border-amber-300/40">
          {criteria.district}, {criteria.state}
        </span>
      </div>

      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
          Ranked Verified Guides
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
          Scored across interest overlap, language fluency, verified review trust, schedule availability, travel style, and budget fit.
        </p>
      </div>

      {/* No results fallback */}
      {results.length === 0 ? (
        <div className="p-8 text-center rounded-3xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
          <p className="text-base font-bold text-stone-800 dark:text-stone-200">
            No active guides matched your strict safety or district filter
          </p>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try adjusting your safety filter or selecting an adjacent district in {criteria.state}.
          </p>
          <button
            onClick={onBackToMatch}
            className="px-5 py-2.5 rounded-xl bg-amber-700 text-white font-semibold text-xs min-h-[44px]"
          >
            Adjust Search Criteria
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {results.map((result, index) => {
            const guide = result.guide;
            const isTopRanked = index === 0;

            return (
              <div
                key={guide.id}
                className={`p-5 sm:p-6 rounded-3xl bg-stone-50 dark:bg-stone-900 border transition-all ${
                  isTopRanked
                    ? 'border-amber-600 shadow-md ring-1 ring-amber-600/30'
                    : 'border-stone-200 dark:border-stone-800'
                }`}
              >
                {/* Top Badge */}
                {isTopRanked && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-700 text-white text-xs font-bold mb-3 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    <span>Top Compatible Match ({result.matchScore}%)</span>
                  </div>
                )}

                {/* Guide Profile Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3.5">
                    {/* Photo */}
                    <div className="relative">
                      <img
                        src={guide.photo_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'}
                        alt={guide.full_name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-stone-200 dark:border-stone-700"
                      />
                      {guide.is_verified && (
                        <div 
                          className="absolute -bottom-1 -right-1 bg-amber-700 text-white p-1 rounded-full shadow-sm"
                          title="SIH Verified Local Host"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    {/* Name & Basic Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">
                          {guide.full_name}
                        </h3>
                        {guide.is_verified && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300/40">
                            Verified Host
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                          <span>{guide.primary_area}, {guide.state}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-amber-800 dark:text-amber-400 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                          <span>{guide.rating_avg ? `${guide.rating_avg.toFixed(1)}/5.0` : 'New Guide'}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 pt-0.5">
                        <Languages className="w-3.5 h-3.5 text-stone-400" />
                        <span>{guide.languages.join(', ')}</span>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 pt-0.5">
                        <IndianRupee className="w-3.5 h-3.5 text-[#B5541C]" />
                        <span>Rate: ₹{guide.fee_min || 1000} – ₹{guide.fee_max || 3000} / day</span>
                      </div>
                    </div>
                  </div>

                  {/* Overall Match Score Badge */}
                  <div className="self-start sm:self-center px-4 py-2 rounded-2xl bg-amber-100/80 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-900 text-center">
                    <div className="font-display text-2xl font-black text-amber-900 dark:text-amber-200">
                      {result.matchScore}%
                    </div>
                    <div className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-400">
                      Match Fit
                    </div>
                  </div>
                </div>

                {/* Guide Bio */}
                <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed mb-4">
                  {guide.bio || 'Verified local cultural host with extensive regional expertise.'}
                </p>

                {/* Specialties & Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {guide.specialties.map((s, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-xl bg-stone-200/80 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-medium">
                      {s}
                    </span>
                  ))}
                  {guide.safety_tags.map((t, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-medium border border-emerald-300/40">
                      ✓ {t}
                    </span>
                  ))}
                </div>

                {/* 7-Factor Explainable Score Breakdown Card (Step 7 requirement) */}
                <div className="mb-4">
                  <ScoreBreakdownCard
                    breakdown={result.breakdown}
                    guideName={guide.full_name}
                  />
                </div>

                {/* Action CTA */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-200 dark:border-stone-800">
                  <div className="text-xs text-stone-600 dark:text-stone-400 text-center sm:text-left">
                    <span>Rate: ~₹{criteria.budgetPerDay.toLocaleString('en-IN')}/day</span>
                    <span className="mx-2">•</span>
                    <span className="font-semibold text-amber-800 dark:text-amber-300">Full Escrow Protection</span>
                  </div>

                  <button
                    onClick={() => onSelectGuideForBooking(result)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all min-h-[44px] shadow-sm"
                  >
                    <span>Proceed to Escrow Booking</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
