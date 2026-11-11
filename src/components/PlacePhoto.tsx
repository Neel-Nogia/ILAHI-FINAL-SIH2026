import React, { useState } from 'react';
import { Camera, Info } from 'lucide-react';

export interface PlacePhotoProps {
  imageUrl?: string | null;
  attribution?: string | null;
  placeName: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  aspectRatio?: string;
  onClick?: () => void;
  priority?: boolean;
}

/**
 * PlacePhoto Component
 * Renders real, verified destination photography with mandatory attribution.
 * When imageUrl is missing or null, renders a neutral "Photo coming soon" placeholder.
 * Strictly adheres to SIH Step 1 directive: real photos only, never generated stand-ins.
 * Attribution is rendered as plain text through React's default escaping (no dangerouslySetInnerHTML).
 */
export const PlacePhoto: React.FC<PlacePhotoProps> = ({
  imageUrl,
  attribution,
  placeName,
  className = '',
  width,
  height,
  aspectRatio,
  onClick,
  priority = false
}) => {
  const [showAttribution, setShowAttribution] = useState(false);
  const [hasError, setHasError] = useState(false);

  // If no photo or image failed to load, display clean neutral placeholder
  if (!imageUrl || hasError) {
    return (
      <div
        onClick={onClick}
        className={`relative flex flex-col items-center justify-center bg-stone-200/80 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border border-stone-300/60 dark:border-stone-700/60 select-none ${className}`}
        style={{
          width: width ?? '100%',
          height: height ?? '100%',
          aspectRatio: aspectRatio ?? undefined
        }}
        role="img"
        aria-label={`Photo coming soon for ${placeName}`}
      >
        <div className="flex flex-col items-center gap-1.5 p-3 text-center">
          <div className="w-8 h-8 rounded-full bg-stone-300/80 dark:bg-stone-700/80 flex items-center justify-center text-stone-500 dark:text-stone-300">
            <Camera className="w-4 h-4 opacity-70" />
          </div>
          <span className="text-[11px] font-semibold tracking-wide uppercase text-stone-600 dark:text-stone-300">
            Photo coming soon
          </span>
          <span className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-1 max-w-[180px]">
            {placeName}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden group ${className}`}
      style={{
        width: width ?? '100%',
        height: height ?? '100%',
        aspectRatio: aspectRatio ?? undefined
      }}
    >
      <img
        src={imageUrl}
        alt={`Photograph of ${placeName}`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onError={() => setHasError(true)}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />

      {/* Attribution Overlay Badge */}
      {attribution && (
        <div className="absolute bottom-1.5 right-1.5 z-20 max-w-[90%]">
          {/* Subtle info toggle button for mobile/touch */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowAttribution((prev) => !prev);
            }}
            title={attribution}
            aria-label="View photo attribution"
            className="sm:hidden p-1 rounded-full bg-stone-950/70 text-stone-300 backdrop-blur-xs hover:text-white"
          >
            <Info className="w-3 h-3" />
          </button>

          {/* Desktop hover badge and mobile revealed drawer */}
          <div
            className={`text-[9px] leading-tight px-1.5 py-0.5 rounded bg-stone-950/80 backdrop-blur-xs text-stone-300 border border-stone-800/80 transition-opacity duration-200 pointer-events-none select-none line-clamp-1 ${
              showAttribution ? 'block opacity-100' : 'hidden sm:block opacity-0 group-hover:opacity-100'
            }`}
          >
            {attribution}
          </div>
        </div>
      )}
    </div>
  );
};
