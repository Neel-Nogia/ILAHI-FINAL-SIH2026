import React, { useState } from 'react';
import { X, Sparkles, MapPin, Clock, Calendar, IndianRupee, Compass, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { Destination, HiddenGemSpot } from '../lib/types';

interface DestinationDetailModalProps {
  destination: Destination | null;
  hiddenGems: HiddenGemSpot[];
  onClose: () => void;
  onFindGuide: (destination: Destination) => void;
}

export const DestinationDetailModal: React.FC<DestinationDetailModalProps> = ({
  destination,
  hiddenGems,
  onClose,
  onFindGuide
}) => {
  const [showHiddenGems, setShowHiddenGems] = useState(true);

  if (!destination) return null;

  const linkedGems = hiddenGems.filter(g => g.parent_destination_id === destination.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-stone-50 dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-start justify-between gap-3 bg-amber-50/60 dark:bg-stone-900/60">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-950 text-amber-900 dark:text-amber-300">
                {destination.state} • {destination.district}
              </span>
              {destination.is_hidden_gem && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
                  Offbeat Gem
                </span>
              )}
            </div>
            <h3 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100">
              {destination.place_name}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 min-h-[44px] min-w-[44px] rounded-full hover:bg-stone-200/70 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 flex items-center justify-center transition-colors"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Summary */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
              Heritage & Cultural Context
            </h4>
            <p className="text-stone-800 dark:text-stone-200 leading-relaxed text-sm">
              {destination.summary}
            </p>
          </div>

          {/* Key Quick Facts Bento */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-stone-800/60 border border-amber-200/60 dark:border-stone-700/60">
              <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 text-xs mb-1">
                <Clock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span>Duration</span>
              </div>
              <p className="text-xs font-bold text-stone-800 dark:text-stone-200 capitalize">
                {destination.suggested_duration?.replace('_', ' ') || 'Half Day'}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-stone-800/60 border border-amber-200/60 dark:border-stone-700/60">
              <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 text-xs mb-1">
                <Calendar className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span>Best Season</span>
              </div>
              <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                {destination.best_time || 'Oct-Mar'}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-stone-800/60 border border-amber-200/60 dark:border-stone-700/60">
              <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 text-xs mb-1">
                <IndianRupee className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span>Budget</span>
              </div>
              <p className="text-xs font-bold text-stone-800 dark:text-stone-200 capitalize">
                {destination.budget_band} Band
              </p>
            </div>
          </div>

          {/* Categories & Tags */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
              Tags & Experiences
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {destination.categories.map((c, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 font-medium">
                  {c}
                </span>
              ))}
              {destination.tags.map((t, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                  #{t}
                </span>
              ))}
            </div>
          </div>

          {/* Expandable Nearby Hidden Gems Section (Step 3 & Step 6) */}
          {linkedGems.length > 0 && (
            <div className="rounded-2xl border border-amber-300/60 dark:border-stone-700 bg-amber-50/40 dark:bg-stone-800/40 overflow-hidden">
              <button
                onClick={() => setShowHiddenGems(!showHiddenGems)}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-amber-100/50 dark:hover:bg-stone-800/70 transition-colors min-h-[44px]"
              >
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                    Nearby Hidden Gems ({linkedGems.length} spots)
                  </span>
                </div>
                {showHiddenGems ? (
                  <ChevronUp className="w-4 h-4 text-stone-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-stone-500" />
                )}
              </button>

              {showHiddenGems && (
                <div className="p-3.5 pt-0 space-y-2.5 border-t border-amber-200/50 dark:border-stone-700/60">
                  {linkedGems.map(gem => (
                    <div key={gem.id} className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs">
                      <div className="flex items-center justify-between font-semibold text-stone-900 dark:text-stone-100 mb-1">
                        <span>{gem.spot_name}</span>
                        <span className="text-[10px] font-normal text-amber-700 dark:text-amber-400 capitalize">
                          {gem.suggested_duration?.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-stone-600 dark:text-stone-400 text-[11px] leading-relaxed">
                        {gem.summary}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-100/80 dark:bg-stone-900/80 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 min-h-[44px]"
          >
            Back to Explore
          </button>
          <button
            onClick={() => {
              onClose();
              onFindGuide(destination);
            }}
            className="flex-1 max-w-xs flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-sm transition-all min-h-[44px] shadow-sm"
          >
            <span>Find a Local Guide Here</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
