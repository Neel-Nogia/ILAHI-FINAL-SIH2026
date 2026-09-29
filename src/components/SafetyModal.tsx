import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  ShieldCheck, 
  PhoneCall, 
  Share2, 
  AlertTriangle, 
  CheckCircle2, 
  Radio, 
  MapPin, 
  FileText 
} from 'lucide-react';
import { supabaseStore } from '../lib/supabase/client';
import { LiveSOSMap, LocationCoords } from './LiveSOSMap';

interface SafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeBookingId?: string;
}

export const SafetyModal: React.FC<SafetyModalProps> = ({
  isOpen,
  onClose,
  activeBookingId
}) => {
  const [sosTriggered, setSosTriggered] = useState(false);
  const [shareActive, setShareActive] = useState(true);
  const [trustedPhone, setTrustedPhone] = useState('+91 98765 43210');
  const [reportGuideId, setReportGuideId] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Live Location
  const [liveCoords, setLiveCoords] = useState<LocationCoords>({
    latitude: 26.9239,
    longitude: 75.8267,
    accuracy: 10,
    timestamp: Date.now()
  });

  if (!isOpen) return null;

  const handleTriggerSOS = () => {
    supabaseStore.logSOS(
      activeBookingId || 'trip-session-live',
      'Traveler activated emergency SOS button in corridor',
      {
        latitude: liveCoords.latitude,
        longitude: liveCoords.longitude,
        accuracy: liveCoords.accuracy
      }
    );
    setSosTriggered(true);
  };

  const handleReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) return;
    supabaseStore.reportGuide(reportGuideId || 'unspecified', reportReason);
    setReportSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-stone-50 dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden max-h-[94vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-rose-50/80 dark:bg-rose-950/50">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>ILAHI Traveler Safety Center</span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-200">
                  Live GPS
                </span>
              </h3>
              <p className="text-[11px] text-stone-600 dark:text-stone-300">
                Gujarat & Rajasthan Rapid Support & Live Location Shield
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 min-h-[44px] min-w-[44px] rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500 flex items-center justify-center"
            aria-label="Close safety center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 text-sm">
          {/* 1. SOS Emergency Section with Live Map */}
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Emergency SOS Dispatch & Live Radar
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-200/80 dark:bg-rose-900 text-rose-900 dark:text-rose-200 font-semibold">
                Live Geolocation
              </span>
            </div>

            {/* Embedded Live Map */}
            <LiveSOSMap
              initialLat={liveCoords.latitude}
              initialLng={liveCoords.longitude}
              touristName="Verified Traveler"
              touristPhone={trustedPhone}
              onLocationUpdate={coords => setLiveCoords(coords)}
              showEmergencyControls={true}
            />

            {sosTriggered ? (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>SOS Broadcast Logged & Acknowledged</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Your coordinates ({liveCoords.latitude.toFixed(4)}°N, {liveCoords.longitude.toFixed(4)}°E) and active guide details have been logged in the safety vault. Trusted contact notified via SMS.
                </p>
                <div className="pt-2 flex gap-2">
                  <a
                    href="tel:112"
                    className="flex-1 py-2 px-3 rounded-lg bg-emerald-700 text-white text-xs font-semibold text-center hover:bg-emerald-800 min-h-[44px] flex items-center justify-center gap-1"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call National Emergency (112)</span>
                  </a>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs text-stone-700 dark:text-stone-300 mb-3 leading-relaxed">
                  Pressing SOS broadcasts your immediate GPS beacon to verified state tourism helplines and your trusted contact.
                </p>
                <button
                  onClick={handleTriggerSOS}
                  className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 min-h-[44px]"
                >
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                  <span>TRIGGER SOS EMERGENCY ALERT WITH LIVE GPS</span>
                </button>
              </div>
            )}
          </div>

          {/* 2. Live Trip-Sharing Indicator */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-stone-800/80 border border-amber-200 dark:border-stone-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                Live Trip-Sharing Guardian
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                shareActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-stone-200 text-stone-600'
              }`}>
                <Radio className={`w-3 h-3 ${shareActive ? 'animate-pulse text-emerald-600' : ''}`} />
                {shareActive ? 'Sharing Active' : 'Paused'}
              </span>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300">
              Live journey status, itinerary checkpoints, and guide identity are being mirrored with your designated emergency contact.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={trustedPhone}
                onChange={e => setTrustedPhone(e.target.value)}
                placeholder="+91 Emergency Contact"
                className="flex-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-xs text-stone-800 dark:text-stone-200 min-h-[44px]"
              />
              <button
                onClick={() => setShareActive(!shareActive)}
                className="px-3.5 py-2 rounded-xl bg-amber-700 text-white text-xs font-semibold hover:bg-amber-800 min-h-[44px]"
              >
                {shareActive ? 'Update' : 'Resume'}
              </button>
            </div>
          </div>

          {/* 3. Official Helpline Directory */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Verified State Helplines
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <a
                href="tel:1363"
                className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-amber-500 transition-colors flex items-center justify-between min-h-[44px]"
              >
                <div>
                  <div className="font-semibold text-stone-800 dark:text-stone-200">National Tourist Helpline</div>
                  <div className="text-[11px] text-amber-700 dark:text-amber-400 font-mono">1363 (Toll Free)</div>
                </div>
                <PhoneCall className="w-4 h-4 text-stone-400" />
              </a>

              <a
                href="tel:1091"
                className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-amber-500 transition-colors flex items-center justify-between min-h-[44px]"
              >
                <div>
                  <div className="font-semibold text-stone-800 dark:text-stone-200">Women Safety Helpline</div>
                  <div className="text-[11px] text-amber-700 dark:text-amber-400 font-mono">1091 (24/7)</div>
                </div>
                <PhoneCall className="w-4 h-4 text-stone-400" />
              </a>
            </div>
          </div>

          {/* 4. Guide Reporting Affordance */}
          <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-stone-500" />
              Report a Concern or Feedback
            </h4>

            {reportSubmitted ? (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Report recorded. Our trust audit team reviews all submissions.</span>
              </div>
            ) : (
              <form onSubmit={handleReport} className="space-y-2">
                <input
                  type="text"
                  placeholder="Guide Name or Booking ID (optional)"
                  value={reportGuideId}
                  onChange={e => setReportGuideId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-xs min-h-[44px]"
                />
                <textarea
                  placeholder="Describe your safety or service concern..."
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-xs"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 px-3 rounded-xl bg-stone-800 dark:bg-stone-700 text-white text-xs font-semibold hover:bg-stone-900 min-h-[44px]"
                >
                  Submit Confidential Report
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-100/80 dark:bg-stone-900 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 min-h-[44px]"
          >
            Close Safety Center
          </button>
        </div>
      </div>
    </div>
  );
};
