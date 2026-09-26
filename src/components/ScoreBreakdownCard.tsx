import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, ShieldCheck, HeartHandshake, Sparkles } from 'lucide-react';
import { MatchFactorBreakdown } from '../lib/types';

interface ScoreBreakdownCardProps {
  breakdown: MatchFactorBreakdown;
  guideName: string;
}

export const ScoreBreakdownCard: React.FC<ScoreBreakdownCardProps> = ({
  breakdown,
  guideName
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const factors = [
    { label: 'Interest & Craft Overlap', score: breakdown.interestCoverage, weight: '30%', desc: 'Match between your chosen activities and guide expertise' },
    { label: 'Rating & Traveler Trust', score: breakdown.ratingTrust, weight: '15%', desc: 'Verified traveler reviews or neutral baseline' },
    { label: 'Language Fluency', score: breakdown.languageMatch, weight: '15%', desc: 'Spoken regional & connecting languages' },
    { label: 'Availability Alignment', score: breakdown.availabilityFit, weight: '10%', desc: 'Guide schedule against your selected dates' },
    { label: 'Travel Style Harmony', score: breakdown.travelStyle, weight: '10%', desc: 'Pacing, cultural depth, and group dynamics' },
    { label: 'Budget Fit', score: breakdown.budgetFit, weight: '10%', desc: 'Daily budget vs. destination circuit band' },
    { label: 'Safety Accreditation', score: breakdown.safetyPreference, weight: '10%', desc: 'Solo-female & first-aid security verifications' },
  ];

  return (
    <div className="rounded-2xl bg-amber-50/50 dark:bg-stone-900 border border-amber-200/70 dark:border-stone-800 p-4 transition-all">
      {/* Header with Total Score */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-700 dark:bg-amber-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
            {breakdown.totalScore}%
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              Compatibility Score
            </h4>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Evaluated across 7 verified parameters for {guideName}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-semibold text-amber-800 dark:text-amber-400 hover:text-amber-900 flex items-center gap-1 py-1.5 px-2.5 rounded-lg hover:bg-amber-100/60 dark:hover:bg-stone-800 min-h-[44px]"
        >
          {isExpanded ? 'Hide Details' : 'Why this %?'}
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Primary Highlights */}
      <div className="mt-3 space-y-1.5">
        {breakdown.breakdownReasons.slice(0, 3).map((reason, idx) => (
          <div key={idx} className="flex items-start gap-2 text-xs text-stone-700 dark:text-stone-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>{reason}</span>
          </div>
        ))}
      </div>

      {/* Expandable 7-Parameter Breakdown Drawer */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-amber-200/60 dark:border-stone-800 space-y-3">
          <p className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
            Deterministic Parameter Analysis
          </p>

          <div className="space-y-2.5">
            {factors.map((f, i) => (
              <div key={i} className="text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-stone-800 dark:text-stone-200">
                    {f.label} <span className="text-[10px] text-stone-500 font-normal">({f.weight})</span>
                  </span>
                  <span className="font-semibold text-amber-800 dark:text-amber-400">{f.score}%</span>
                </div>
                <div className="w-full h-1.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-700 dark:bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(5, f.score)}%` }}
                  />
                </div>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
