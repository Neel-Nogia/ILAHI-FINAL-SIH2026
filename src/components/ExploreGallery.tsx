import React, { useState } from 'react';
import { Camera, ChevronLeft, ChevronRight, X, ArrowRight, MapPin, Sparkles } from 'lucide-react';
import { Destination, StateOption } from '../lib/types';
import { DESTINATION_PHOTOS, getDestinationPhoto } from '../lib/data/destinations-data';

interface ExploreGalleryProps {
  destinations: Destination[];
  selectedState: StateOption;
  onSelectDestination: (dest: Destination) => void;
}

export const ExploreGallery: React.FC<ExploreGalleryProps> = ({
  destinations,
  selectedState,
  onSelectDestination
}) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Filter destinations that have featured curated photography for this state
  const featuredDestinations = destinations
    .filter(d => d.state === selectedState && DESTINATION_PHOTOS[d.id])
    .slice(0, 12);

  const activeLightboxDest = lightboxIndex !== null ? featuredDestinations[lightboxIndex] : null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + featuredDestinations.length) % featuredDestinations.length);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % featuredDestinations.length);
    }
  };

  if (featuredDestinations.length === 0) return null;

  return (
    <div className="space-y-2.5 my-2">
      {/* Subsection Title */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
          <Camera className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          <span>{selectedState} Visual Highlights</span>
        </div>
        <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
          Tap thumbnail to view
        </span>
      </div>

      {/* Horizontal Scroll Strip (Section 3 requirement) */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
        {featuredDestinations.map((dest, idx) => {
          const photoUrl = getDestinationPhoto(dest.id, dest.state);

          return (
            <div
              key={dest.id}
              onClick={() => setLightboxIndex(idx)}
              className="group relative shrink-0 w-36 sm:w-44 h-48 sm:h-52 rounded-2xl overflow-hidden cursor-pointer snap-start border border-stone-200/90 dark:border-stone-800 shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <img
                src={photoUrl}
                alt={dest.place_name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Gradient scrim with readable high-contrast caption */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-transparent flex flex-col justify-end p-2.5 text-white">
                <span className="text-[10px] font-semibold text-amber-300 flex items-center gap-0.5 uppercase tracking-wider">
                  <MapPin className="w-3 h-3" />
                  <span>{dest.district}</span>
                </span>
                <h4 className="font-display text-xs sm:text-sm font-bold leading-tight drop-shadow-xs line-clamp-1">
                  {dest.place_name}
                </h4>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full-Screen Lightbox Viewer (Section 3 requirement) */}
      {activeLightboxDest && (
        <div 
          className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxIndex(null)}
        >
          <div 
            className="relative max-w-2xl w-full bg-stone-900 rounded-3xl overflow-hidden border border-stone-800 shadow-2xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-3 right-3 z-20 p-2 rounded-full bg-stone-900/80 text-white hover:bg-stone-800 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
              aria-label="Close lightbox"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Navigation Arrows */}
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-stone-900/80 text-white hover:bg-stone-800 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-stone-900/80 text-white hover:bg-stone-800 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
              aria-label="Next photo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Main Photo Display */}
            <div className="relative w-full h-80 sm:h-96 bg-black flex items-center justify-center overflow-hidden">
              <img
                src={getDestinationPhoto(activeLightboxDest.id, activeLightboxDest.state)}
                alt={activeLightboxDest.place_name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Lightbox Caption & Details CTA */}
            <div className="p-4 sm:p-5 bg-stone-900 text-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-stone-800">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-800/60">
                    {activeLightboxDest.state} • {activeLightboxDest.district}
                  </span>
                  <span className="text-xs text-stone-400">
                    Photo {lightboxIndex! + 1} of {featuredDestinations.length}
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-white">
                  {activeLightboxDest.place_name}
                </h3>
                <p className="text-xs text-stone-300 line-clamp-1">
                  {activeLightboxDest.summary}
                </p>
              </div>

              <button
                onClick={() => {
                  const target = activeLightboxDest;
                  setLightboxIndex(null);
                  onSelectDestination(target);
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 min-h-[44px] shrink-0"
              >
                <span>View Full Details & Gems</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
