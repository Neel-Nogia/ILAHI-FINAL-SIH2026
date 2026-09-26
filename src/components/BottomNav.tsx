import React from 'react';
import { Home, Compass, UserCheck, Receipt, User } from 'lucide-react';
import { AppView } from '../lib/types';

interface BottomNavProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  activeBookingCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  setCurrentView,
  activeBookingCount
}) => {
  const navItems = [
    {
      id: 'home' as AppView,
      label: 'Home',
      icon: Home
    },
    {
      id: 'explore' as AppView,
      label: 'Explore',
      icon: Compass
    },
    {
      id: 'match' as AppView,
      label: 'AI Match',
      icon: UserCheck
    },
    {
      id: 'bookings-list' as AppView,
      label: 'Bookings',
      icon: Receipt,
      badge: activeBookingCount > 0 ? activeBookingCount : undefined
    },
    {
      id: 'profile' as AppView,
      label: 'Profile',
      icon: User
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-stone-50/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200/90 dark:border-stone-800 transition-colors">
      <div className="max-w-4xl mx-auto px-2 flex items-center justify-around">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = 
            currentView === item.id ||
            (item.id === 'explore' && currentView === 'destination-detail') ||
            (item.id === 'match' && currentView === 'match-results') ||
            (item.id === 'bookings-list' && (currentView === 'booking' || currentView === 'booking-confirmation'));

          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 min-h-[56px] transition-colors relative min-w-[44px] ${
                isActive
                  ? 'text-amber-800 dark:text-amber-400 font-semibold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
              aria-label={item.label}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-700 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 font-medium">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-amber-700 dark:bg-amber-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
