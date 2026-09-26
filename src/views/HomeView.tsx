import React from 'react';
import { 
  Compass, 
  UserCheck, 
  ShieldCheck, 
  MapPin, 
  Lock, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Camera, 
  Users, 
  Award,
  ChevronRight
} from 'lucide-react';
import { AppView, StateOption } from '../lib/types';

interface HomeViewProps {
  setCurrentView: (view: AppView) => void;
  selectedState: StateOption;
  setSelectedState: (state: StateOption) => void;
  onSelectDestinationById: (destId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  setCurrentView,
  selectedState,
  setSelectedState,
  onSelectDestinationById
}) => {
  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* 1. Hero Bento Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-amber-900 via-amber-800 to-amber-950 text-white p-6 sm:p-8 shadow-sm border border-amber-900/60">
        {/* Subtle heritage pattern watermark overlay */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-amber-600/20 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-700/60 border border-amber-500/40 text-xs font-semibold tracking-wide text-amber-200">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            <span>SIH 2026 • Verified Human Guides & Escrow Protection</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Travel deeper into Gujarat & Rajasthan with verified locals.
          </h1>

          <p className="text-amber-100/90 text-sm sm:text-base leading-relaxed">
            Connect directly with heritage conservationists, master Ajrakh artisans, and desert navigators. Suggested itineraries around genuine local knowledge, protected by escrow.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setCurrentView('match')}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm transition-all shadow-md active:scale-98 min-h-[44px]"
            >
              <UserCheck className="w-4 h-4 text-stone-950" />
              <span>Match with a Local Guide</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => setCurrentView('explore')}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/40 text-amber-100 font-semibold text-sm transition-colors min-h-[44px]"
            >
              <Compass className="w-4 h-4" />
              <span>Explore 75 Destinations</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Trust & Safety Pillar Metric Bento */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 text-xs font-medium mb-1">
            <MapPin className="w-4 h-4 text-amber-700 dark:text-amber-500" />
            <span>Curated Places</span>
          </div>
          <div className="font-display text-2xl font-extrabold text-stone-900 dark:text-stone-100">
            75 + 41
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            Destinations & hidden spots
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 text-xs font-medium mb-1">
            <Lock className="w-4 h-4 text-amber-700 dark:text-amber-500" />
            <span>Escrow Vault</span>
          </div>
          <div className="font-display text-2xl font-extrabold text-stone-900 dark:text-stone-100">
            100%
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            Funds held until release
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 text-xs font-medium mb-1">
            <ShieldCheck className="w-4 h-4 text-amber-700 dark:text-amber-500" />
            <span>Vetted Hosts</span>
          </div>
          <div className="font-display text-2xl font-extrabold text-stone-900 dark:text-stone-100">
            Tier 1 & 2
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            Strict ID & field audit
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 text-xs font-medium mb-1">
            <Award className="w-4 h-4 text-amber-700 dark:text-amber-500" />
            <span>States Covered</span>
          </div>
          <div className="font-display text-2xl font-extrabold text-stone-900 dark:text-stone-100">
            GJ & RJ
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            41 active districts
          </p>
        </div>
      </section>

      {/* 3. Featured Real Experiences Preview (Specific places per Step 1 copy rules) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">
              Living Heritage & Craft Experiences
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Specific regional specializations led by verified resident guides
            </p>
          </div>
          <button
            onClick={() => setCurrentView('explore')}
            className="text-xs font-semibold text-amber-800 dark:text-amber-400 hover:underline flex items-center min-h-[44px]"
          >
            <span>All 75 Places</span>
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Card 1: Nirona */}
          <div 
            onClick={() => onSelectDestinationById('GJ07')}
            className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-amber-600 transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-1">
              Kutch • Craft & Art
            </div>
            <h3 className="font-display text-base font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors">
              Rogan Painting in Nirona
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
              Rare castor-oil pigment painting preserved by the Khatri family, alongside copper-coated bell makers.
            </p>
            <div className="mt-3 flex items-center justify-between text-xs font-medium text-amber-700 dark:text-amber-400">
              <span>View details</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Patan */}
          <div 
            onClick={() => onSelectDestinationById('GJ01')}
            className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-amber-600 transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-1">
              Patan • Solanki Dynasty
            </div>
            <h3 className="font-display text-base font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors">
              Rani ki Vav Stepwell
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
              UNESCO subterranean inverted temple featuring 800+ sculpted Solanki-era Vishnu avatars and Patola silk looms.
            </p>
            <div className="mt-3 flex items-center justify-between text-xs font-medium text-amber-700 dark:text-amber-400">
              <span>View details</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Bagru */}
          <div 
            onClick={() => onSelectDestinationById('RJ28')}
            className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-amber-600 transition-all cursor-pointer group"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-1">
              Bagru • Natural Dyes
            </div>
            <h3 className="font-display text-base font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors">
              Hand-Block Printing Village
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
              Hands-on woodblock carving and natural vegetable dye printing workshops directly in artisan Chippa homes.
            </p>
            <div className="mt-3 flex items-center justify-between text-xs font-medium text-amber-700 dark:text-amber-400">
              <span>View details</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Guide Registration Callout Bento (Step 4 & 5) */}
      <section className="p-6 rounded-3xl bg-stone-100 dark:bg-stone-900 border border-stone-300/80 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
            <Users className="w-4 h-4" />
            <span>Are you a local guide or host in Gujarat or Rajasthan?</span>
          </div>
          <h3 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">
            Tier 1 Registration takes under 2 minutes
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 max-w-md">
            Publish your district presence immediately. Complete Tier 2 cultural tags and credentials at your own pace.
          </p>
        </div>

        <button
          onClick={() => setCurrentView('guide-tier1')}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs transition-colors shrink-0 min-h-[44px]"
        >
          Register as Local Guide
        </button>
      </section>
    </div>
  );
};
