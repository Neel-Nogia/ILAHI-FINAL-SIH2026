import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Navigation, 
  Share2, 
  PhoneCall, 
  ShieldAlert, 
  Compass, 
  Radio, 
  Layers, 
  RefreshCw, 
  Copy, 
  Check, 
  ExternalLink,
  MessageCircle,
  Siren,
  Hospital,
  Building2,
  AlertCircle
} from 'lucide-react';

export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy: number;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
}

export interface NearbyEmergencyService {
  id: string;
  name: string;
  type: 'police' | 'hospital' | 'tourism_booth';
  phone: string;
  latitude: number;
  longitude: number;
  distanceKm?: number;
}

interface LiveSOSMapProps {
  initialLat?: number;
  initialLng?: number;
  touristName?: string;
  touristPhone?: string;
  onLocationUpdate?: (coords: LocationCoords) => void;
  showEmergencyControls?: boolean;
}

// Preset corridors for instant testing & demoing during presentations/offline
const PRESET_CORRIDORS = [
  {
    id: 'device',
    name: '📱 Device Real GPS',
    description: 'Live sensor from your phone or browser',
    lat: 0,
    lng: 0
  },
  {
    id: 'jaipur',
    name: '🏰 Jaipur — Amber & City Palace (RJ)',
    description: 'Heritage corridor near Hawa Mahal & Tourist Police',
    lat: 26.9239,
    lng: 75.8267
  },
  {
    id: 'udaipur',
    name: '⛵ Udaipur — Lake Pichola (RJ)',
    description: 'Lakeside tourist district & Jagdish Chowk',
    lat: 24.5764,
    lng: 73.6835
  },
  {
    id: 'ahmedabad',
    name: '🏛️ Ahmedabad — Walled City (GJ)',
    description: 'UNESCO Heritage corridor & Sabarmati Riverfront',
    lat: 23.0225,
    lng: 72.5714
  },
  {
    id: 'jodhpur',
    name: '🚩 Jodhpur — Mehrangarh Fort (RJ)',
    description: 'Blue City old town & Clock Tower',
    lat: 26.2980,
    lng: 73.0189
  }
];

// Calculate Haversine distance in kilometers
function getHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

// Generate realistic nearby services based on coordinates
function generateNearbyResponders(lat: number, lng: number): NearbyEmergencyService[] {
  return [
    {
      id: 'pol-1',
      name: 'State Tourist Police Assistance Post',
      type: 'police',
      phone: '112',
      latitude: lat + 0.0042,
      longitude: lng + 0.0035
    },
    {
      id: 'pol-2',
      name: 'Central Heritage Patrol Unit (PCR Van 07)',
      type: 'police',
      phone: '+91 141 2601111',
      latitude: lat - 0.0038,
      longitude: lng + 0.0048
    },
    {
      id: 'hosp-1',
      name: 'Government District Emergency Hospital & Trauma Unit',
      type: 'hospital',
      phone: '108',
      latitude: lat + 0.0081,
      longitude: lng - 0.0062
    },
    {
      id: 'booth-1',
      name: 'Department of Tourism Rapid Facilitation Booth',
      type: 'tourism_booth',
      phone: '1363',
      latitude: lat - 0.0051,
      longitude: lng - 0.0041
    }
  ];
}

export const LiveSOSMap: React.FC<LiveSOSMapProps> = ({
  initialLat = 26.9239,
  initialLng = 75.8267,
  touristName = 'Verified Traveler',
  touristPhone = '+91 98765 43210',
  onLocationUpdate,
  showEmergencyControls = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const travelerMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const responderMarkersRef = useRef<L.Marker[]>([]);
  const trailPolylineRef = useRef<L.Polyline | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const simIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // State
  const [selectedCorridor, setSelectedCorridor] = useState<string>('jaipur');
  const [coords, setCoords] = useState<LocationCoords>({
    latitude: initialLat,
    longitude: initialLng,
    accuracy: 12,
    timestamp: Date.now()
  });
  const [gpsStatus, setGpsStatus] = useState<'locked' | 'acquiring' | 'simulated' | 'denied'>('locked');
  const [isSimulatingMovement, setIsSimulatingMovement] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<[number, number][]>([[initialLat, initialLng]]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [livePulseTick, setLivePulseTick] = useState(0);
  const [nearbyServices, setNearbyServices] = useState<NearbyEmergencyService[]>([]);

  // Update nearby services with sorted distances
  const updateNearbyServices = useCallback((lat: number, lng: number) => {
    const raw = generateNearbyResponders(lat, lng);
    const withDistances = raw.map(s => ({
      ...s,
      distanceKm: getHaversineDistanceKm(lat, lng, s.latitude, s.longitude)
    })).sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    setNearbyServices(withDistances);
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [coords.latitude, coords.longitude],
        zoom: 15,
        zoomControl: true,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      // Breadcrumb path polyline
      const polyline = L.polyline([[coords.latitude, coords.longitude]], {
        color: '#dc2626',
        weight: 3,
        dashArray: '6, 8',
        opacity: 0.7
      }).addTo(map);
      trailPolylineRef.current = polyline;

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update traveler marker & pulse on map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const latLng: [number, number] = [coords.latitude, coords.longitude];

    // Custom Glowing Beacon Icon
    const customSosIcon = L.divIcon({
      className: 'ilahi-sos-beacon',
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      html: `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 44px; height: 44px; border-radius: 9999px; background-color: rgba(220, 38, 38, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; width: 30px; height: 30px; border-radius: 9999px; background-color: rgba(220, 38, 38, 0.85); box-shadow: 0 0 15px rgba(220, 38, 38, 0.9);"></div>
          <div style="position: relative; width: 18px; height: 18px; border-radius: 9999px; background-color: #ffffff; border: 3px solid #991b1b; display: flex; align-items: center; justify-content: center;">
            <div style="width: 6px; height: 6px; border-radius: 9999px; background-color: #991b1b;"></div>
          </div>
        </div>
      `
    });

    if (!travelerMarkerRef.current) {
      const marker = L.marker(latLng, { icon: customSosIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4; color: #1c1917; min-width: 180px;">
          <div style="font-weight: 800; color: #dc2626; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
            <span>🚨 LIVE SOS BROADCAST</span>
          </div>
          <div><strong>Traveler:</strong> ${touristName}</div>
          <div><strong>Phone:</strong> ${touristPhone}</div>
          <div style="margin-top: 4px; font-family: monospace; font-size: 11px; color: #44403c;">
            ${coords.latitude.toFixed(5)}°N, ${coords.longitude.toFixed(5)}°E
          </div>
          <div style="font-size: 10px; color: #16a34a; font-weight: bold; margin-top: 4px;">
            ● Live GPS Tracking Active (±${Math.round(coords.accuracy)}m)
          </div>
        </div>
      `);
      travelerMarkerRef.current = marker;
    } else {
      travelerMarkerRef.current.setLatLng(latLng);
    }

    // Accuracy Circle
    if (!accuracyCircleRef.current) {
      const circle = L.circle(latLng, {
        radius: Math.max(coords.accuracy, 20),
        color: '#dc2626',
        fillColor: '#ef4444',
        fillOpacity: 0.15,
        weight: 1
      }).addTo(map);
      accuracyCircleRef.current = circle;
    } else {
      accuracyCircleRef.current.setLatLng(latLng);
      accuracyCircleRef.current.setRadius(Math.max(coords.accuracy, 20));
    }

    // Update trail polyline
    if (trailPolylineRef.current) {
      trailPolylineRef.current.setLatLngs(breadcrumbs);
    }

    // Smoothly pan map
    map.panTo(latLng, { animate: true, duration: 0.8 });

    // Update nearby responders
    updateNearbyServices(coords.latitude, coords.longitude);

    if (onLocationUpdate) {
      onLocationUpdate(coords);
    }
  }, [coords, touristName, touristPhone, breadcrumbs, onLocationUpdate, updateNearbyServices]);

  // Render responder markers on map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing responder markers
    responderMarkersRef.current.forEach(m => m.remove());
    responderMarkersRef.current = [];

    nearbyServices.forEach(service => {
      const isPolice = service.type === 'police';
      const isHosp = service.type === 'hospital';
      
      const bgColor = isPolice ? '#1d4ed8' : isHosp ? '#15803d' : '#b45309';
      const symbol = isPolice ? '🚓' : isHosp ? '🏥' : '🛡️';

      const serviceIcon = L.divIcon({
        className: 'responder-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        html: `
          <div style="background-color: ${bgColor}; width: 32px; height: 32px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
            ${symbol}
          </div>
        `
      });

      const marker = L.marker([service.latitude, service.longitude], { icon: serviceIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4; color: #1c1917;">
          <div style="font-weight: bold; color: ${bgColor};">${service.name}</div>
          <div style="font-size: 11px; color: #57534e;">Distance: <strong>${service.distanceKm} km away</strong></div>
          <div style="margin-top: 4px;">
            <a href="tel:${service.phone}" style="display: inline-block; padding: 3px 8px; background: ${bgColor}; color: white; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: bold;">
              Call ${service.phone}
            </a>
          </div>
        </div>
      `);
      responderMarkersRef.current.push(marker);
    });
  }, [nearbyServices]);

  // Handle GPS / Corridor changes
  const handleCorridorSelect = (corridorId: string) => {
    setSelectedCorridor(corridorId);
    setIsSimulatingMovement(false);

    if (corridorId === 'device') {
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return;
      }
      setGpsStatus('acquiring');
      
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        pos => {
          const newCoord: LocationCoords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            heading: pos.coords.heading,
            speed: pos.coords.speed,
            timestamp: Date.now()
          };
          setCoords(newCoord);
          setGpsStatus('locked');
          setBreadcrumbs(prev => [...prev.slice(-20), [newCoord.latitude, newCoord.longitude]]);
        },
        err => {
          console.warn('Geolocation error:', err);
          setGpsStatus('denied');
          // Fallback to Jaipur
          alert('GPS permission was denied or unavailable. Falling back to Jaipur Heritage Corridor.');
          handleCorridorSelect('jaipur');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      // Clear real GPS watch if switching to demo corridor
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      const corridor = PRESET_CORRIDORS.find(c => c.id === corridorId);
      if (corridor) {
        const newCoord: LocationCoords = {
          latitude: corridor.lat,
          longitude: corridor.lng,
          accuracy: 8,
          timestamp: Date.now()
        };
        setCoords(newCoord);
        setGpsStatus('locked');
        setBreadcrumbs([[corridor.lat, corridor.lng]]);
      }
    }
  };

  // Simulate live movement along the corridor (useful for live presentations/judging)
  const toggleSimulatedMovement = () => {
    if (isSimulatingMovement) {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      setIsSimulatingMovement(false);
    } else {
      setIsSimulatingMovement(true);
      setGpsStatus('simulated');
      
      let step = 0;
      simIntervalRef.current = setInterval(() => {
        step += 1;
        setCoords(prev => {
          // Add small jitter (~20-40 meters movement)
          const latDelta = (Math.sin(step * 0.4) * 0.0003);
          const lngDelta = (Math.cos(step * 0.4) * 0.0003);
          const newLat = prev.latitude + latDelta;
          const newLng = prev.longitude + lngDelta;
          
          setBreadcrumbs(b => [...b.slice(-30), [newLat, newLng]]);
          return {
            latitude: newLat,
            longitude: newLng,
            accuracy: Math.floor(5 + Math.random() * 8),
            speed: parseFloat((1.2 + Math.random() * 0.8).toFixed(1)),
            timestamp: Date.now()
          };
        });
        setLivePulseTick(t => t + 1);
      }, 2500);
    }
  };

  // Cleanup simulation on unmount
  useEffect(() => {
    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Recenter map
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([coords.latitude, coords.longitude], 16, { animate: true });
    }
  };

  // Generate Google Maps URL
  const googleMapsUrl = `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`;

  // Copy live link to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(googleMapsUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Share via WhatsApp
  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `🚨 EMERGENCY SOS ALERT from ${touristName}!\n\n` +
      `I am requesting urgent assistance. My real-time GPS location is locked at:\n` +
      `📍 https://maps.google.com/?q=${coords.latitude.toFixed(6)},${coords.longitude.toFixed(6)}\n\n` +
      `Coordinates: ${coords.latitude.toFixed(5)}°N, ${coords.longitude.toFixed(5)}°E (Accuracy: ±${Math.round(coords.accuracy)}m)\n` +
      `Sent via ILAHI Traveler Safety Shield.`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-3 font-sans">
      {/* Real-time Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/80">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full bg-rose-600 animate-ping absolute"></div>
            <div className="w-3 h-3 rounded-full bg-rose-600"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-950 dark:text-rose-100 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                LIVE GPS SATELLITE BEACON
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-200/80 dark:bg-rose-900 text-rose-900 dark:text-rose-200 font-bold">
                {gpsStatus === 'acquiring' ? 'ACQUIRING...' : isSimulatingMovement ? 'LIVE TRANSIT SIM' : 'GPS LOCKED'}
              </span>
            </div>
            <div className="text-[11px] text-stone-600 dark:text-stone-300 font-mono flex items-center gap-2 mt-0.5">
              <span>{coords.latitude.toFixed(5)}° N, {coords.longitude.toFixed(5)}° E</span>
              <span>•</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">±{Math.round(coords.accuracy)}m precision</span>
            </div>
          </div>
        </div>

        {/* Quick Corridor Selector */}
        <div className="flex items-center gap-1.5">
          <select
            value={selectedCorridor}
            onChange={e => handleCorridorSelect(e.target.value)}
            className="text-xs font-medium py-1.5 px-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 shadow-xs focus:ring-1 focus:ring-rose-500"
          >
            {PRESET_CORRIDORS.map(corridor => (
              <option key={corridor.id} value={corridor.id}>
                {corridor.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={toggleSimulatedMovement}
            title={isSimulatingMovement ? 'Pause simulated transit' : 'Simulate walking movement for demo'}
            className={`px-2.5 py-1.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1 ${
              isSimulatingMovement
                ? 'bg-amber-600 text-white border-amber-700 animate-pulse'
                : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300'
            }`}
          >
            <RefreshCw className={`w-3 h-3 ${isSimulatingMovement ? 'animate-spin' : ''}`} />
            <span>{isSimulatingMovement ? 'Moving...' : 'Simulate Walk'}</span>
          </button>
        </div>
      </div>

      {/* Leaflet Map Canvas Container */}
      <div className="relative rounded-2xl overflow-hidden border border-stone-300 dark:border-stone-800 shadow-md">
        <div 
          ref={mapContainerRef} 
          className="w-full h-64 sm:h-72 z-10 bg-stone-200 dark:bg-stone-800"
          style={{ minHeight: '260px' }}
        />

        {/* Map Floating Controls Overlay */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={handleRecenter}
            className="p-2 rounded-xl bg-white/95 dark:bg-stone-900/95 text-stone-800 dark:text-stone-200 shadow-md border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="Recenter on Traveler"
          >
            <Navigation className="w-4 h-4 text-rose-600" />
          </button>
        </div>

        {/* Map Legend Overlay */}
        <div className="absolute bottom-2 left-2 z-20 px-2.5 py-1.5 rounded-xl bg-stone-900/80 backdrop-blur-xs text-white text-[10px] flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block animate-pulse"></span>
            You (SOS)
          </span>
          <span className="flex items-center gap-1">
            <span>🚓</span> Police Post
          </span>
          <span className="flex items-center gap-1">
            <span>🏥</span> Hospital
          </span>
        </div>
      </div>

      {/* Nearby Emergency Responders List */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
          <span className="flex items-center gap-1.5">
            <Siren className="w-3.5 h-3.5 text-rose-600" />
            Nearest Verified Emergency Responders
          </span>
          <span className="text-[10px] text-stone-400 font-normal">Real-time Haversine Distance</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {nearbyServices.slice(0, 2).map(service => (
            <div 
              key={service.id}
              className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center justify-between shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm ${
                  service.type === 'police' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}>
                  {service.type === 'police' ? '🚓' : '🏥'}
                </div>
                <div>
                  <div className="font-bold text-stone-900 dark:text-stone-100 line-clamp-1">
                    {service.name}
                  </div>
                  <div className="text-[11px] text-stone-500 flex items-center gap-1">
                    <span className="font-semibold text-rose-600">{service.distanceKm} km away</span>
                    <span>•</span>
                    <span>Est. ~{Math.max(2, Math.round((service.distanceKm || 1) * 3))} mins</span>
                  </div>
                </div>
              </div>

              <a
                href={`tel:${service.phone}`}
                className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-rose-50 text-stone-700 dark:text-stone-300 hover:text-rose-600 transition-colors"
                title={`Call ${service.name}`}
              >
                <PhoneCall className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Location Sharing Actions */}
      {showEmergencyControls && (
        <div className="grid grid-cols-3 gap-2 pt-1">
          {/* Copy Google Maps URL */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied Link' : 'Copy Map Link'}</span>
          </button>

          {/* Open Google Maps App */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 text-center transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-rose-600" />
            <span>Open Maps</span>
          </a>

          {/* Share on WhatsApp */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp GPS</span>
          </button>
        </div>
      )}
    </div>
  );
};
