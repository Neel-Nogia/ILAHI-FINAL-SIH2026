import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldAlert, 
  AlertTriangle, 
  PhoneCall, 
  CheckCircle2, 
  History, 
  UserCheck, 
  Radio, 
  Shield, 
  Send,
  Users,
  MapPin,
  ExternalLink,
  Navigation
} from 'lucide-react';
import { supabaseStore } from '../lib/supabase/client';
import { TouristProfile, Booking, SOSEvent } from '../lib/types';
import { LiveSOSMap, LocationCoords } from './LiveSOSMap';

interface SelectiveSOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  touristProfile?: TouristProfile;
  activeBooking?: Booking | null;
}

export const SelectiveSOSModal: React.FC<SelectiveSOSModalProps> = ({
  isOpen,
  onClose,
  touristProfile,
  activeBooking
}) => {
  const profile = touristProfile || supabaseStore.getTouristProfile();
  
  // Recipients checklist state
  const [notifyPolice, setNotifyPolice] = useState(true);
  const [notifyGuide, setNotifyGuide] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [sosSent, setSosSent] = useState(false);
  const [activeTab, setActiveTab] = useState<'dispatch' | 'live-map' | 'history'>('dispatch');
  const [sosHistory, setSosHistory] = useState<SOSEvent[]>([]);

  // Live Location coordinates
  const [currentCoords, setCurrentCoords] = useState<LocationCoords>({
    latitude: 26.9239,
    longitude: 75.8267,
    accuracy: 10,
    timestamp: Date.now()
  });

  // Initialize trusted contacts as checked by default for fast panic handling
  useEffect(() => {
    if (profile.trusted_contacts) {
      setSelectedContacts(profile.trusted_contacts.map(c => c.id));
    }
    setSosHistory(supabaseStore.getSOSEvents());
  }, [profile]);

  if (!isOpen) return null;

  // Preset 1: "Danger is my guide" (Section 4 requirement)
  const applyDangerGuidePreset = () => {
    setNotifyPolice(true);
    setNotifyGuide(false);
    setSelectedContacts(profile.trusted_contacts.map(c => c.id));
  };

  // Preset 2: "Just need my guide" (Section 4 requirement)
  const applyNeedGuidePreset = () => {
    setNotifyPolice(false);
    setNotifyGuide(true);
    setSelectedContacts([]);
  };

  const toggleContact = (contactId: string) => {
    if (selectedContacts.includes(contactId)) {
      setSelectedContacts(selectedContacts.filter(id => id !== contactId));
    } else {
      setSelectedContacts([...selectedContacts, contactId]);
    }
  };

  const handleConfirmSOS = () => {
    const recipientsList: string[] = [];
    if (notifyPolice) recipientsList.push('State Tourism Police / Emergency Helpline (112)');
    if (notifyGuide) {
      const guideName = activeBooking?.guide_name || 'Assigned Local Guide';
      recipientsList.push(`Guide: ${guideName}`);
    }
    profile.trusted_contacts.forEach(c => {
      if (selectedContacts.includes(c.id)) {
        recipientsList.push(`${c.name} (${c.phone})`);
      }
    });

    if (recipientsList.length === 0) {
      alert('Please select at least one recipient to send the SOS broadcast.');
      return;
    }

    const lat = currentCoords.latitude;
    const lng = currentCoords.longitude;
    const accuracy = Math.round(currentCoords.accuracy);
    const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

    // Log to sos_events with live coordinates and maps link
    supabaseStore.logCustomSOS({
      booking_id: activeBooking?.id,
      tourist_name: profile.full_name,
      tourist_phone: profile.phone,
      recipients: recipientsList,
      notes: notifyGuide 
        ? 'Assistance requested with local guide'
        : 'Emergency safety broadcast dispatched to authorities and family',
      location: `GPS: ${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E (±${accuracy}m)`,
      latitude: lat,
      longitude: lng,
      accuracy: accuracy,
      maps_url: mapsUrl,
      tracking_active: true
    });

    setSosSent(true);
    setSosHistory(supabaseStore.getSOSEvents());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-stone-50 dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden max-h-[94vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header - Danger Reserved Red */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-rose-50/90 dark:bg-rose-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#A32020] text-white flex items-center justify-center font-bold shadow-xs">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>Selective SOS & Live Map Tracking</span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-rose-200/80 dark:bg-rose-900 text-rose-900 dark:text-rose-200">
                  Live GPS
                </span>
              </h3>
              <p className="text-[11px] text-stone-600 dark:text-stone-300">
                Real-time satellite coordinates & selective emergency dispatch
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 min-h-[44px] min-w-[44px] rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500 flex items-center justify-center"
            aria-label="Close SOS"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher: Dispatch vs Live Map Focus vs Audit Log */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 bg-stone-100/70 dark:bg-stone-800/40 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('dispatch')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors min-h-[44px] flex items-center justify-center gap-1.5 ${
              activeTab === 'dispatch'
                ? 'border-[#A32020] text-[#A32020] dark:text-rose-400 bg-white dark:bg-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Emergency Dispatch</span>
          </button>
          
          <button
            onClick={() => setActiveTab('live-map')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors min-h-[44px] flex items-center justify-center gap-1.5 ${
              activeTab === 'live-map'
                ? 'border-[#A32020] text-[#A32020] dark:text-rose-400 bg-white dark:bg-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Navigation className="w-3.5 h-3.5 text-rose-600" />
            <span>Live Radar Map</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors min-h-[44px] flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-[#A32020] text-[#A32020] dark:text-rose-400 bg-white dark:bg-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Log ({sosHistory.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {activeTab === 'history' ? (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                Dispatched SOS Incident History & Geospatial Records
              </h4>
              {sosHistory.length === 0 ? (
                <div className="p-6 text-center text-xs text-stone-500 rounded-2xl bg-stone-100 dark:bg-stone-800">
                  No SOS events recorded on this device yet.
                </div>
              ) : (
                sosHistory.map(evt => (
                  <div key={evt.id} className="p-3.5 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-700 dark:text-rose-400">
                        Incident #{evt.id.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-stone-500">
                        {new Date(evt.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-700 dark:text-stone-300">
                      <strong>Recipients:</strong> {evt.recipients.join(', ')}
                    </div>

                    {evt.location && (
                      <div className="text-[11px] text-stone-600 dark:text-stone-300 flex items-center justify-between bg-white dark:bg-stone-900 p-2 rounded-xl border border-stone-200 dark:border-stone-700">
                        <div className="flex items-center gap-1.5 font-mono">
                          <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>{evt.location}</span>
                        </div>
                        {evt.maps_url && (
                          <a
                            href={evt.maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-semibold text-rose-600 hover:underline flex items-center gap-1 shrink-0 ml-2"
                          >
                            <span>Open Map</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-200 dark:border-stone-700">
                      <span>Status: <strong className="text-emerald-600">{evt.status}</strong></span>
                      {evt.accuracy && <span>Precision: ±{evt.accuracy}m</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : activeTab === 'live-map' ? (
            /* Dedicated Live Radar Map Tab */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
                    <span>Real-time Geolocation Beacon & Corridor Map</span>
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Live satellite tracking with dynamic distance to nearest police and medical teams
                  </p>
                </div>
              </div>

              <LiveSOSMap
                initialLat={currentCoords.latitude}
                initialLng={currentCoords.longitude}
                touristName={profile.full_name}
                touristPhone={profile.phone}
                onLocationUpdate={coords => setCurrentCoords(coords)}
                showEmergencyControls={true}
              />
            </div>
          ) : sosSent ? (
            /* Dispatched state with live active tracking */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Selective SOS Dispatched Successfully</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200">
                    LIVE TRACKING ACTIVE
                  </span>
                </div>
                <p className="text-xs leading-relaxed">
                  Your exact GPS coordinates have been beamed exclusively to your designated recipients. Real-time satellite beacon remains active below.
                </p>
                <div className="pt-1 flex gap-2">
                  <a
                    href="tel:112"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-700 text-white text-xs font-semibold text-center hover:bg-emerald-800 min-h-[44px] flex items-center justify-center gap-1.5"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Call Emergency 112 Directly</span>
                  </a>
                </div>
              </div>

              {/* Embedded Live Map while SOS is active */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  Active Emergency Beacon Map
                </span>
                <LiveSOSMap
                  initialLat={currentCoords.latitude}
                  initialLng={currentCoords.longitude}
                  touristName={profile.full_name}
                  touristPhone={profile.phone}
                  onLocationUpdate={coords => setCurrentCoords(coords)}
                  showEmergencyControls={true}
                />
              </div>
            </div>
          ) : (
            /* Dispatch flow with Interactive Map preview and selective contacts */
            <div className="space-y-4">
              {/* Interactive Live Map Component */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                    Live GPS Coordinates & Nearest Responders
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('live-map')}
                    className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 hover:underline"
                  >
                    Expand Map View →
                  </button>
                </div>
                
                <LiveSOSMap
                  initialLat={currentCoords.latitude}
                  initialLng={currentCoords.longitude}
                  touristName={profile.full_name}
                  touristPhone={profile.phone}
                  onLocationUpdate={coords => setCurrentCoords(coords)}
                  showEmergencyControls={true}
                />
              </div>

              {/* Quick One-Tap Presets (Section 4 requirement) */}
              <div className="space-y-1.5 pt-1 border-t border-stone-200 dark:border-stone-800">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  Quick Situation Presets
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={applyDangerGuidePreset}
                    className="p-2.5 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-[#A32020] dark:text-rose-300 text-xs font-bold text-left hover:bg-rose-100 min-h-[44px] flex flex-col justify-center"
                  >
                    <span>⚠️ "Danger is my guide"</span>
                    <span className="text-[10px] font-normal text-stone-500">Unchecks guide; alerts police & family</span>
                  </button>

                  <button
                    type="button"
                    onClick={applyNeedGuidePreset}
                    className="p-2.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 text-xs font-bold text-left hover:bg-amber-100 min-h-[44px] flex flex-col justify-center"
                  >
                    <span>🧭 "Just need my guide"</span>
                    <span className="text-[10px] font-normal text-stone-500">Alerts only guide; avoids alarming family</span>
                  </button>
                </div>
              </div>

              {/* Recipient Checklist */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  Selective Recipient Checklist
                </span>

                <div className="space-y-2 text-xs">
                  {/* Local Police */}
                  <label className="flex items-center justify-between p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 cursor-pointer min-h-[44px]">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={notifyPolice}
                        onChange={e => setNotifyPolice(e.target.checked)}
                        className="w-4 h-4 accent-[#A32020] rounded"
                      />
                      <div>
                        <div className="font-bold text-stone-900 dark:text-stone-100">Local Police & Helpline (112)</div>
                        <div className="text-[10px] text-stone-500">Rapid emergency beacon to nearest PCR with live GPS link</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded">
                      Standard
                    </span>
                  </label>

                  {/* Assigned Tour Guide */}
                  <label className="flex items-center justify-between p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 cursor-pointer min-h-[44px]">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={notifyGuide}
                        onChange={e => setNotifyGuide(e.target.checked)}
                        className="w-4 h-4 accent-amber-700 rounded"
                      />
                      <div>
                        <div className="font-bold text-stone-900 dark:text-stone-100">
                          {activeBooking?.guide_name ? `Assigned Guide: ${activeBooking.guide_name}` : 'Active Guided Tour Host'}
                        </div>
                        <div className="text-[10px] text-stone-500">Notify guide for logistical support or lost companion</div>
                      </div>
                    </div>
                  </label>

                  {/* Configured Trusted Contacts (Section 5) */}
                  {profile.trusted_contacts.map(c => {
                    const isChecked = selectedContacts.includes(c.id);
                    return (
                      <label key={c.id} className="flex items-center justify-between p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 cursor-pointer min-h-[44px]">
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleContact(c.id)}
                            className="w-4 h-4 accent-amber-700 rounded"
                          />
                          <div>
                            <div className="font-bold text-stone-900 dark:text-stone-100">
                              {c.name} {c.relation ? `(${c.relation})` : ''}
                            </div>
                            <div className="text-[10px] text-stone-500 font-mono">{c.phone}</div>
                          </div>
                        </div>
                        <span className="text-[10px] text-stone-400 font-medium">Family / Trusted</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Confirm & Send Button - Large Danger Red */}
              <button
                type="button"
                onClick={handleConfirmSOS}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#A32020] hover:bg-[#851919] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 min-h-[48px]"
              >
                <Send className="w-4 h-4" />
                <span>CONFIRM & DISPATCH SELECTIVE ALERT WITH LIVE GPS</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-900 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 min-h-[44px]"
          >
            Close SOS Center
          </button>
        </div>
      </div>
    </div>
  );
};
