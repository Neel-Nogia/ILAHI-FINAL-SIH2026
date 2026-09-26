import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DestinationDetailModal } from './components/DestinationDetailModal';
import { SelectiveSOSModal } from './components/SelectiveSOSModal';
import { LegalModal } from './components/LegalModals';

import { AuthGateView } from './views/AuthGateView';
import { GuideShellView } from './views/GuideShellView';
import { TouristProfileView } from './views/TouristProfileView';
import { HomeView } from './views/HomeView';
import { ExploreView } from './views/ExploreView';
import { MatchView } from './views/MatchView';
import { MatchResultsView } from './views/MatchResultsView';
import { BookingView } from './views/BookingView';
import { BookingsListView } from './views/BookingsListView';

import { 
  AppView, 
  StateOption, 
  Destination, 
  HiddenGemSpot, 
  MatchCriteria, 
  MatchResult, 
  GuideProfile,
  Booking 
} from './lib/types';
import { supabaseStore, AuthSession } from './lib/supabase/client';
import { scoreAndRankGuides } from './lib/matching';

export const App: React.FC = () => {
  // Authentication session state
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => {
    return supabaseStore.getCurrentSession();
  });

  // Single-page state machine for Tourist shell
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedState, setSelectedState] = useState<StateOption>('Gujarat');
  
  // Destination exploration & modal
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [hiddenGems, setHiddenGems] = useState<HiddenGemSpot[]>([]);
  
  // AI Matching state
  const [matchCriteria, setMatchCriteria] = useState<MatchCriteria | null>(null);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [selectedMatchForBooking, setSelectedMatchForBooking] = useState<MatchResult | null>(null);
  
  // Safety & Selective SOS modal
  const [isSelectiveSOSOpen, setIsSelectiveSOSOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | null>(null);
  
  // Bookings count badge
  const [activeBookingsCount, setActiveBookingsCount] = useState<number>(0);

  // Update document title per screen (Step 12 QA requirement)
  useEffect(() => {
    if (!authSession) {
      document.title = 'ILAHI — Sign In / Sign Up | SIH 2026';
      return;
    }

    if (authSession.user.role === 'guide') {
      document.title = 'ILAHI — Local Guide Portal (Pending Review) | SIH 2026';
      return;
    }

    const titles: Record<AppView, string> = {
      'auth': 'Sign In / Register | ILAHI',
      'home': 'ILAHI — Gujarat & Rajasthan Heritage Guide Matching',
      'explore': `Explore Heritage & Hidden Gems in ${selectedState} | ILAHI`,
      'destination-detail': 'Destination Context | ILAHI',
      'match': 'AI Guide Matching Engine | ILAHI',
      'match-results': 'Ranked Local Hosts & Compatibility Breakdown | ILAHI',
      'booking': 'Escrow Booking & UPI Authorization | ILAHI',
      'booking-confirmation': 'Escrow Active | ILAHI',
      'bookings-list': 'Escrow Bookings & Review Lifecycle | ILAHI',
      'profile': 'My Tourist Profile & Trusted Safety Contacts | ILAHI',
      'guide-shell': 'Guide Portal & Availability | ILAHI',
      'guide-tier1': 'Tier 1 Rapid Guide Registration | ILAHI',
      'guide-tier2': 'Tier 2 Profile Expansion | ILAHI',
      'guide-dashboard': 'Guide Hub & Request Management | ILAHI',
      'safety': 'Traveler Safety Center & Selective SOS | ILAHI',
      'privacy': 'Privacy Policy | ILAHI',
      'terms': 'Terms of Service | ILAHI'
    };
    document.title = titles[currentView] || 'ILAHI — Gujarat & Rajasthan Guide Matching';
  }, [currentView, selectedState, authSession]);

  // Load hidden gems and bookings badge
  useEffect(() => {
    async function initData() {
      const gems = await supabaseStore.getHiddenGems();
      setHiddenGems(gems);
      const bookings = await supabaseStore.getBookings(authSession?.user.id, authSession?.user.role);
      setActiveBookingsCount(bookings.filter(b => b.status === 'held' || b.status === 'pending').length);
    }
    initData();
  }, [authSession]);

  const refreshBookingsCount = async () => {
    const bookings = await supabaseStore.getBookings(authSession?.user.id, authSession?.user.role);
    setActiveBookingsCount(bookings.filter(b => b.status === 'held' || b.status === 'pending').length);
  };

  const handleSignOut = async () => {
    await supabaseStore.signOut();
    setAuthSession(null);
    setCurrentView('home');
  };

  // Handlers for Tourist flow
  const handleOpenDestinationDetail = (dest: Destination) => {
    setSelectedDestination(dest);
  };

  const handleSelectDestinationById = async (destId: string) => {
    const dest = await supabaseStore.getDestinationById(destId);
    if (dest) {
      setSelectedState(dest.state);
      setSelectedDestination(dest);
    }
  };

  const handleFindGuideForDestination = (dest: Destination) => {
    setSelectedState(dest.state);
    setCurrentView('match');
  };

  const handleExecuteMatch = async (criteria: MatchCriteria) => {
    setMatchCriteria(criteria);
    const publicGuides = await supabaseStore.getPublicGuideProfiles(criteria.state);
    const availabilities = await supabaseStore.getGuideAvailability();
    const reviews = await supabaseStore.getReviews();
    const ranked = scoreAndRankGuides(publicGuides, criteria, { availabilities, reviews });
    setMatchResults(ranked);
    setCurrentView('match-results');
  };

  const handleSelectGuideForBooking = (result: MatchResult) => {
    setSelectedMatchForBooking(result);
    setCurrentView('booking');
  };

  const handleBookingSuccess = (newBooking: Booking) => {
    refreshBookingsCount();
    setCurrentView('bookings-list');
  };

  // If NOT authenticated, render AuthGateView as landing gate
  if (!authSession) {
    return (
      <AuthGateView 
        onAuthSuccess={(session) => {
          setAuthSession(session);
          if (session.user.role === 'guide') {
            setCurrentView('guide-shell');
          } else {
            setCurrentView('home');
          }
        }} 
      />
    );
  }

  // If authenticated as Guide, render dedicated GuideShellView (no tourist bottom nav)
  if (authSession.user.role === 'guide') {
    return (
      <GuideShellView 
        session={authSession} 
        onSignOut={handleSignOut} 
      />
    );
  }

  // Authenticated as Tourist: Render full Tourist App Shell
  const currentUserObj = {
    name: authSession.user.full_name,
    email: authSession.user.email,
    role: authSession.user.role,
    photo_url: authSession.touristProfile?.photo_url || null
  };

  return (
    <div className="min-h-screen bg-stone-100/60 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans selection:bg-amber-700 selection:text-white transition-colors duration-200">
      {/* App Shell Container */}
      <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col bg-stone-50 dark:bg-stone-950 border-x border-stone-200/80 dark:border-stone-800/80 min-h-screen relative shadow-sm">
        
        {/* Top App Header */}
        <Header
          currentView={currentView}
          setCurrentView={setCurrentView}
          selectedState={selectedState}
          setSelectedState={setSelectedState}
          openSafetyModal={() => setIsSelectiveSOSOpen(true)}
          currentUser={currentUserObj}
          onSignOut={handleSignOut}
        />

        {/* Main View Area */}
        <main className="flex-1 p-4 sm:p-5">
          {currentView === 'home' && (
            <HomeView
              setCurrentView={setCurrentView}
              selectedState={selectedState}
              setSelectedState={setSelectedState}
              onSelectDestinationById={handleSelectDestinationById}
            />
          )}

          {currentView === 'explore' && (
            <ExploreView
              selectedState={selectedState}
              setSelectedState={setSelectedState}
              onOpenDetail={handleOpenDestinationDetail}
              onFindGuide={handleFindGuideForDestination}
            />
          )}

          {currentView === 'match' && (
            <MatchView
              initialState={selectedState}
              initialDistrict={selectedDestination ? selectedDestination.district : undefined}
              initialDestination={selectedDestination}
              onExecuteMatch={handleExecuteMatch}
            />
          )}

          {currentView === 'match-results' && matchCriteria && (
            <MatchResultsView
              criteria={matchCriteria}
              results={matchResults}
              onBackToMatch={() => setCurrentView('match')}
              onSelectGuideForBooking={handleSelectGuideForBooking}
            />
          )}

          {currentView === 'booking' && selectedMatchForBooking && matchCriteria && (
            <BookingView
              matchResult={selectedMatchForBooking}
              criteria={matchCriteria}
              onBackToResults={() => setCurrentView('match-results')}
              onBookingSuccess={handleBookingSuccess}
            />
          )}

          {currentView === 'bookings-list' && (
            <BookingsListView
              onExploreMore={() => setCurrentView('explore')}
            />
          )}

          {currentView === 'profile' && (
            <TouristProfileView
              onBackToHome={() => setCurrentView('home')}
              onProfileUpdated={() => {
                const refreshed = supabaseStore.getCurrentSession();
                if (refreshed) setAuthSession(refreshed);
              }}
            />
          )}

          {/* Fallback Custom 404 Not Found State */}
          {!['home', 'explore', 'match', 'match-results', 'booking', 'booking-confirmation', 'bookings-list', 'profile'].includes(currentView) && (
            <div className="p-12 text-center rounded-3xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
              <h2 className="font-display text-2xl font-bold">State Unreachable</h2>
              <p className="text-xs text-stone-500">The requested screen does not exist.</p>
              <button
                onClick={() => setCurrentView('home')}
                className="px-4 py-2 rounded-xl bg-amber-700 text-white text-xs font-semibold"
              >
                Return to ILAHI Home
              </button>
            </div>
          )}
        </main>

        {/* Minimal Footer */}
        <footer className="border-t border-stone-200 dark:border-stone-800 p-4 pb-20 text-[11px] text-stone-500 dark:text-stone-400 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-bold text-stone-700 dark:text-stone-300">ILAHI</span> — Gujarat & Rajasthan Guide Matching
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLegalModalType('privacy')}
                className="hover:underline hover:text-stone-900 dark:hover:text-stone-100"
              >
                Privacy Policy
              </button>
              <span>•</span>
              <button
                onClick={() => setLegalModalType('terms')}
                className="hover:underline hover:text-stone-900 dark:hover:text-stone-100"
              >
                Terms of Service
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px] text-stone-400">
            <div>
              <span>Support Desk: </span>
              <a href="mailto:support@ilahi-travel.org" className="underline hover:text-amber-700">
                support@ilahi-travel.org
              </a>
              <span className="mx-1.5">•</span>
              <a href="tel:1363" className="underline hover:text-amber-700">
                Helpline: 1363
              </a>
            </div>
            <div>
              © {new Date().getFullYear()} ILAHI Platform (SIH 2026).
            </div>
          </div>
        </footer>

        {/* Bottom App Navigation Bar */}
        <BottomNav
          currentView={currentView}
          setCurrentView={setCurrentView}
          activeBookingCount={activeBookingsCount}
        />

        {/* Destination Detail Modal */}
        {selectedDestination && (
          <DestinationDetailModal
            destination={selectedDestination}
            hiddenGems={hiddenGems}
            onClose={() => setSelectedDestination(null)}
            onFindGuide={dest => {
              setSelectedDestination(null);
              handleFindGuideForDestination(dest);
            }}
          />
        )}

        {/* Two-step Selective SOS Modal */}
        <SelectiveSOSModal
          isOpen={isSelectiveSOSOpen}
          onClose={() => setIsSelectiveSOSOpen(false)}
          touristProfile={authSession.touristProfile || undefined}
        />

        {/* Static Privacy Policy & Terms Modal */}
        <LegalModal
          type={legalModalType}
          onClose={() => setLegalModalType(null)}
        />
      </div>
    </div>
  );
};
