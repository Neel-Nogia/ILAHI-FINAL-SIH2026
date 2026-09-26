import React from 'react';
import { ShieldAlert, Compass, Sparkles, LogOut, User } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { AppView, StateOption } from '../lib/types';

interface HeaderProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  selectedState: StateOption;
  setSelectedState: (state: StateOption) => void;
  openSafetyModal: () => void;
  currentUser?: {
    name: string;
    email: string;
    role: 'tourist' | 'guide';
    photo_url?: string | null;
  } | null;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  selectedState,
  setSelectedState,
  openSafetyModal,
  currentUser,
  onSignOut
}) => {
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-50/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* ILAHI Wordmark Logo — Always clickable back to Home */}
        <button
          onClick={() => setCurrentView('home')}
          className="flex items-center gap-2.5 text-left group min-h-[44px] focus:outline-none"
          title="Return to ILAHI Home"
          aria-label="ILAHI Home"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-800 dark:bg-amber-700 flex items-center justify-center text-amber-100 shadow-sm border border-amber-900/40">
            {/* Custom Heritage Arch Icon */}
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9v11h3v-7c0-2.21 1.79-4 4-4s4 1.79 4 4v7h3V9c0-3.87-3.13-7-7-7zm0 2c2.76 0 5 2.24 5 5v2.1c-.6-.68-1.48-1.1-2.45-1.1-1.93 0-3.5 1.57-3.5 3.5v6.5h-1V13.5c0-1.93-1.57-3.5-3.5-3.5-.97 0-1.85.42-2.45 1.1V9c0-2.76 2.24-5 5-5z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display text-2xl font-bold tracking-wider text-amber-950 dark:text-amber-100 group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors">
                ILAHI
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300/40">
                SIH 2026
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-sans hidden sm:block">
              Gujarat & Rajasthan Local Guide Network
            </p>
          </div>
        </button>

        {/* State Switcher & Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick State Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-stone-200/70 dark:bg-stone-800 border border-stone-300/60 dark:border-stone-700 text-xs font-medium">
            <button
              onClick={() => setSelectedState('Gujarat')}
              className={`px-2.5 py-1.5 rounded-lg min-h-[34px] transition-all ${
                selectedState === 'Gujarat'
                  ? 'bg-amber-700 text-white font-semibold shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
              }`}
            >
              Gujarat
            </button>
            <button
              onClick={() => setSelectedState('Rajasthan')}
              className={`px-2.5 py-1.5 rounded-lg min-h-[34px] transition-all ${
                selectedState === 'Rajasthan'
                  ? 'bg-amber-700 text-white font-semibold shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
              }`}
            >
              Rajasthan
            </button>
          </div>

          {/* SOS Safety Button — persistent and reachable */}
          <button
            onClick={openSafetyModal}
            className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors font-medium text-xs sm:text-sm"
            aria-label="Safety Center and SOS"
            title="Safety Center & Emergency SOS"
          >
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 animate-pulse" />
            <span className="hidden xs:inline font-semibold">SOS</span>
          </button>

          {/* Dark / Light Toggle */}
          <ThemeToggle />

          {/* User Profile / Avatar with click to profile */}
          {currentUser && (
            <div className="flex items-center gap-1.5 pl-1 border-l border-stone-200 dark:border-stone-800">
              <button
                onClick={() => {
                  if (currentUser.role === 'tourist') {
                    setCurrentView('profile');
                  } else {
                    setCurrentView('guide-shell');
                  }
                }}
                className={`p-0.5 rounded-xl border transition-all ${
                  currentView === 'profile' || currentView === 'guide-shell'
                    ? 'border-amber-700 ring-2 ring-amber-700/20'
                    : 'border-stone-300 dark:border-stone-700 hover:border-stone-400'
                }`}
                title={`${currentUser.name} (${currentUser.role})`}
                aria-label="User profile"
              >
                {currentUser.photo_url ? (
                  <img
                    src={currentUser.photo_url}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-amber-700 text-white text-xs font-bold flex items-center justify-center uppercase">
                    {getInitials(currentUser.name)}
                  </div>
                )}
              </button>

              {/* Sign Out Button */}
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="p-2 min-h-[44px] min-w-[36px] flex items-center justify-center rounded-xl text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
                  title="Sign out / Switch account"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
