import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  IndianRupee, 
  Lock, 
  User, 
  Phone, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';
import { MatchResult, MatchCriteria, Booking } from '../lib/types';
import { MockUPIModal } from '../components/MockUPIModal';
import { supabaseStore } from '../lib/supabase/client';

interface BookingViewProps {
  matchResult: MatchResult;
  criteria: MatchCriteria;
  onBackToResults: () => void;
  onBookingSuccess: (booking: Booking) => void;
}

export const BookingView: React.FC<BookingViewProps> = ({
  matchResult,
  criteria,
  onBackToResults,
  onBookingSuccess
}) => {
  const [touristName, setTouristName] = useState('Ananya Sharma');
  const [touristPhone, setTouristPhone] = useState('+91 98765 43210');
  const [showUPIModal, setShowUPIModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const guide = matchResult.guide;

  // Calculate duration in days
  const start = new Date(criteria.startDate);
  const end = new Date(criteria.endDate);
  const diffTime = Math.max(1, Math.abs(end.getTime() - start.getTime()));
  const tripDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Computed Amount for real: budget input * trip days (Step 8 strict requirement)
  const computedAmount = criteria.budgetPerDay * tripDays;

  const handleOpenPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!touristName.trim()) {
      setErrorMsg('Please enter your full traveler name.');
      return;
    }
    if (!touristPhone.trim() || touristPhone.length < 10) {
      setErrorMsg('Please provide a valid contact number.');
      return;
    }
    setErrorMsg('');
    setShowUPIModal(true);
  };

  const handleUPIConfirm = async (upiId: string) => {
    setIsSubmitting(true);
    setShowUPIModal(false);

    try {
      // Step 8: Insert into bookings with status = 'held'
      const newBooking = await supabaseStore.createBooking({
        tourist_name: touristName,
        guide_id: guide.id,
        guide_name: guide.full_name,
        guide_phone: '+91 98250 12345',
        destination_id: 'DEST-' + criteria.district,
        destination_name: `${criteria.district} Guided Corridor`,
        state: criteria.state,
        district: criteria.district,
        start_date: criteria.startDate,
        end_date: criteria.endDate,
        computed_amount: computedAmount
      });

      setIsSubmitting(false);
      onBookingSuccess(newBooking);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err?.message || 'Could not complete booking.');
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Back button */}
      <button
        onClick={onBackToResults}
        className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 min-h-[44px]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Matches</span>
      </button>

      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
          Confirm Guided Booking & Escrow Hold
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
          Review the computed trip amount. Your payment is held in escrow until trip completion.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950 border border-rose-300 text-rose-800 dark:text-rose-200 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Guide Summary Card */}
      <div className="p-5 rounded-3xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
        <div className="flex items-center gap-3">
          <img
            src={guide.photo_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'}
            alt={guide.full_name}
            className="w-14 h-14 rounded-2xl object-cover border"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">
                {guide.full_name}
              </h3>
              <ShieldCheck className="w-4 h-4 text-amber-700" />
            </div>
            <p className="text-xs text-stone-500">
              Verified local host for {guide.primary_area}, {guide.state}
            </p>
          </div>
        </div>

        <div className="pt-2 grid grid-cols-2 gap-2 text-xs border-t border-stone-200 dark:border-stone-800">
          <div>
            <span className="text-stone-500 block">Dates</span>
            <span className="font-semibold text-stone-800 dark:text-stone-200">
              {criteria.startDate} to {criteria.endDate} ({tripDays} {tripDays === 1 ? 'day' : 'days'})
            </span>
          </div>
          <div>
            <span className="text-stone-500 block">Interests</span>
            <span className="font-semibold text-stone-800 dark:text-stone-200">
              {criteria.categories.slice(0, 2).join(', ') || 'Heritage'}
            </span>
          </div>
        </div>
      </div>

      {/* Computed Escrow Breakdown (Step 8 strictly requires computed_amount = budget * trip days) */}
      <div className="p-5 rounded-3xl bg-amber-50/80 dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
          Computed Transparent Amount
        </h4>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-stone-600 dark:text-stone-400">
            <span>Daily Budget Multiplier</span>
            <span>₹{criteria.budgetPerDay.toLocaleString('en-IN')} / day</span>
          </div>

          <div className="flex justify-between text-stone-600 dark:text-stone-400">
            <span>Trip Duration</span>
            <span>{tripDays} {tripDays === 1 ? 'day' : 'days'}</span>
          </div>

          <div className="pt-2 border-t border-amber-200 dark:border-stone-800 flex justify-between items-center">
            <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">
              Total Computed Amount
            </span>
            <span className="font-display font-extrabold text-xl text-amber-900 dark:text-amber-200">
              ₹{computedAmount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-amber-100/70 dark:bg-stone-800 text-[11px] text-amber-950 dark:text-amber-300 flex items-start gap-2">
          <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <span>
            Strict Escrow Rule: ₹{computedAmount.toLocaleString('en-IN')} will be held in the vault (status: HELD) and will only be disbursed to {guide.full_name} upon your safe return.
          </span>
        </div>
      </div>

      {/* Tourist Traveler Form */}
      <form onSubmit={handleOpenPayment} className="p-5 rounded-3xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
          Traveler Information
        </h4>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 block mb-1">
              Full Traveler Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={touristName}
                onChange={e => setTouristName(e.target.value)}
                placeholder="Your full name"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 min-h-[44px]"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 block mb-1">
              Contact Phone Number (For safety alerts & booking voucher)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="tel"
                value={touristPhone}
                onChange={e => setTouristPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 min-h-[44px]"
                required
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all min-h-[48px] shadow-sm disabled:opacity-50"
        >
          <Lock className="w-4 h-4" />
          <span>Pay & Hold ₹{computedAmount.toLocaleString('en-IN')} in Escrow</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Mock UPI Modal */}
      {showUPIModal && (
        <MockUPIModal
          amount={computedAmount}
          guideName={guide.full_name}
          destinationName={`${criteria.district}, ${criteria.state}`}
          onConfirmPayment={handleUPIConfirm}
          onCancel={() => setShowUPIModal(false)}
        />
      )}
    </div>
  );
};
