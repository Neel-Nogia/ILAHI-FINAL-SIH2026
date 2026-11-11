import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Sparkles, 
  Calendar, 
  Clock, 
  IndianRupee, 
  ArrowRight,
  Compass,
  X
} from 'lucide-react';
import { Destination, HiddenGemSpot, StateOption, BudgetBand } from '../lib/types';
import { supabaseStore } from '../lib/supabase/client';
import { OFFICIAL_CATEGORIES, getDistrictsForState } from '../lib/data/destinations-data';
import { ExploreGallery } from '../components/ExploreGallery';
import { PlacePhoto } from '../components/PlacePhoto';

interface ExploreViewProps {
  selectedState: StateOption;
  setSelectedState: (state: StateOption) => void;
  onOpenDetail: (dest: Destination) => void;
  onFindGuide: (dest: Destination) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  selectedState,
  setSelectedState,
  onOpenDetail,
  onFindGuide
}) => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBudget, setSelectedBudget] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch real destinations from Supabase / Store
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      const data = await supabaseStore.getDestinations(selectedState);
      if (isMounted) {
        setDestinations(data);
        setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [selectedState]);

  // When selected state changes, reset district filter
  const districts = useMemo(() => {
    return getDistrictsForState(selectedState);
  }, [selectedState]);

  useEffect(() => {
    setSelectedDistrict('all');
  }, [selectedState]);

  // Filtered destinations
  const filteredDestinations = useMemo(() => {
    return destinations.filter(d => {
      if (selectedDistrict !== 'all' && d.district !== selectedDistrict) return false;
      if (selectedCategory !== 'all' && !d.categories.includes(selectedCategory)) return false;
      if (selectedBudget !== 'all' && d.budget_band !== selectedBudget) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = d.place_name.toLowerCase().includes(query);
        const matchesSummary = d.summary.toLowerCase().includes(query);
        const matchesDistrict = d.district.toLowerCase().includes(query);
        const matchesTags = d.tags.some(t => t.toLowerCase().includes(query));
        if (!matchesName && !matchesSummary && !matchesDistrict && !matchesTags) return false;
      }
      return true;
    });
  }, [destinations, selectedDistrict, selectedCategory, selectedBudget, searchQuery]);

  return (
    <div className="space-y-5 pb-20 animate-in fade-in duration-300">
      {/* 1. Top Browse Bar & State Switcher */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Compass className="w-6 h-6 text-amber-700 dark:text-amber-400" />
              <span>Explore {selectedState}</span>
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {selectedState === 'Gujarat' ? '35 heritage hubs & coastal circuits' : '40 historic forts, havelis & desert trails'}
            </p>
          </div>

          {/* Explicit State Segment Control */}
          <div className="flex p-1 rounded-xl bg-stone-200/80 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 self-start sm:self-auto text-xs font-medium">
            <button
              onClick={() => setSelectedState('Gujarat')}
              className={`px-4 py-2 rounded-lg min-h-[44px] transition-all ${
                selectedState === 'Gujarat'
                  ? 'bg-amber-700 text-white font-bold shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
              }`}
            >
              Gujarat (35)
            </button>
            <button
              onClick={() => setSelectedState('Rajasthan')}
              className={`px-4 py-2 rounded-lg min-h-[44px] transition-all ${
                selectedState === 'Rajasthan'
                  ? 'bg-amber-700 text-white font-bold shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
              }`}
            >
              Rajasthan (40)
            </button>
          </div>
        </div>

        {/* 2. District & Search Filter Row */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder={`Search ${selectedState} destinations, crafts, or monuments...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 min-h-[44px]"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {/* District Filter Dropdown */}
            <select
              value={selectedDistrict}
              onChange={e => setSelectedDistrict(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-600 min-h-[44px]"
              aria-label="Filter by district"
            >
              <option value="all">All Districts ({districts.length})</option>
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Budget Band Dropdown */}
            <select
              value={selectedBudget}
              onChange={e => setSelectedBudget(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-600 min-h-[44px]"
              aria-label="Filter by budget band"
            >
              <option value="all">Any Budget</option>
              <option value="low">Low Budget</option>
              <option value="medium">Medium Budget</option>
              <option value="high">High Budget</option>
            </select>
          </div>
        </div>

        {/* 3. Official Category Chips (Step 3 legend) */}
        <div className="overflow-x-auto pb-1.5 scrollbar-none flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full font-medium shrink-0 transition-colors min-h-[38px] ${
              selectedCategory === 'all'
                ? 'bg-amber-800 text-white font-bold'
                : 'bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700'
            }`}
          >
            All Categories
          </button>
          {OFFICIAL_CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(selectedCategory === category ? 'all' : category)}
              className={`px-3 py-1.5 rounded-full font-medium shrink-0 transition-colors min-h-[38px] ${
                selectedCategory === category
                  ? 'bg-amber-800 text-white font-bold'
                  : 'bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* 3.5 Photo Highlights Gallery (Section 3) */}
      <ExploreGallery
        destinations={destinations}
        selectedState={selectedState}
        onSelectDestination={onOpenDetail}
      />

      {/* 4. Active Filter Count Banner */}
      <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
        <span>Showing <strong>{filteredDestinations.length}</strong> real places in {selectedState}</span>
        {(selectedDistrict !== 'all' || selectedCategory !== 'all' || selectedBudget !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedDistrict('all');
              setSelectedCategory('all');
              setSelectedBudget('all');
              setSearchQuery('');
            }}
            className="text-amber-800 dark:text-amber-400 hover:underline font-semibold"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* 5. Destination Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="p-5 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 animate-pulse h-48" />
          ))}
        </div>
      ) : filteredDestinations.length === 0 ? (
        <div className="p-8 text-center rounded-3xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
          <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">No destinations match the active filters</p>
          <p className="text-xs text-stone-500">Try changing district or category selection</p>
          <button
            onClick={() => {
              setSelectedDistrict('all');
              setSelectedCategory('all');
              setSelectedBudget('all');
              setSearchQuery('');
            }}
            className="mt-2 px-4 py-2 rounded-xl bg-amber-700 text-white text-xs font-semibold"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredDestinations.map(dest => (
            <div
              key={dest.id}
              className="p-5 rounded-3xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-amber-600 dark:hover:border-amber-500 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                {/* Real Attributed Photograph or Neutral Placeholder */}
                <PlacePhoto
                  imageUrl={dest.image_url}
                  attribution={dest.image_attribution}
                  placeName={dest.place_name}
                  className="w-full h-40 rounded-2xl mb-2 cursor-pointer"
                  onClick={() => onOpenDetail(dest)}
                />

                {/* District & Hidden Gem Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{dest.district}</span>
                  </span>
                  {dest.is_hidden_gem && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
                      Hidden Gem
                    </span>
                  )}
                </div>

                {/* Place Name */}
                <h3 
                  onClick={() => onOpenDetail(dest)}
                  className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors cursor-pointer"
                >
                  {dest.place_name}
                </h3>

                {/* One-Line Summary */}
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-2">
                  {dest.summary}
                </p>

                {/* Tags & Categories */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {dest.categories.map((c, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100/70 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-medium">
                      {c}
                    </span>
                  ))}
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                    {dest.best_time}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => onOpenDetail(dest)}
                  className="px-3 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 min-h-[44px]"
                >
                  Full Details
                </button>

                <button
                  onClick={() => onFindGuide(dest)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold transition-all min-h-[44px] shadow-xs"
                >
                  <span>Find Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
