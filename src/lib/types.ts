// ============================================================================
// ILAHI TypeScript Domain Models & Definitions
// SIH 2026 Stage 3 Specification
// ============================================================================

export type StateOption = 'Gujarat' | 'Rajasthan';

export type BudgetBand = 'low' | 'medium' | 'high';

export type AvailabilityPreset = 'weekday_mornings' | 'weekends' | 'flexible' | 'custom';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'held' | 'released';

export type UserRole = 'tourist' | 'guide';

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  relation?: string;
}

export interface TouristProfile {
  id: string;
  user_id?: string;
  full_name: string;
  email: string;
  phone: string;
  dob?: string;
  photo_url?: string | null;
  travel_styles: string[];
  categories_of_interest: string[];
  safety_preferences: string[];
  preferred_language: string;
  budget_band: BudgetBand;
  trusted_contacts: TrustedContact[];
  created_at?: string;
  updated_at?: string;
}

export interface GuideProfile {
  id: string;
  user_id?: string | null;
  full_name: string;
  phone: string;
  photo_url?: string | null;
  state: StateOption;
  primary_area: string; // district
  fee_min: number;      // INR per day min
  fee_max: number;      // INR per day max
  areas_of_expertise?: string[] | null;
  specialties?: string[] | null;
  languages?: string[] | null;
  travel_style_tags?: string[] | null;
  safety_tags?: string[] | null;
  bio?: string | null;
  availability_preset?: AvailabilityPreset;
  is_verified?: boolean;
  verification_notes?: string | null;
  credential_url?: string | null;
  contact_visible?: boolean;
  rating_avg?: number | null;
  profile_completion_pct?: number;
  earnings_total?: number;
  trips_completed?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PublicGuideProfile {
  id: string;
  user_id?: string | null;
  full_name: string;
  phone?: string;
  photo_url?: string | null;
  state: StateOption;
  primary_area: string;
  fee_min: number;
  fee_max: number;
  areas_of_expertise: string[];
  specialties: string[];
  languages: string[];
  travel_style_tags: string[];
  safety_tags: string[];
  bio: string;
  availability_preset: AvailabilityPreset;
  is_verified: boolean;
  rating_avg: number | null;
  profile_completion_pct: number;
  created_at?: string;
}

export interface GuideAvailability {
  id: string;
  guide_id: string;
  available_date?: string;
  start_date?: string;
  end_date?: string;
  is_available: boolean;
  created_at?: string;
}

export interface Destination {
  id: string; // 'GJ01', 'RJ01'
  state: StateOption;
  district: string;
  place_name: string;
  categories: string[];
  is_hidden_gem: boolean;
  tags: string[];
  summary: string;
  budget_band: BudgetBand;
  suggested_duration: string;
  best_time: string;
  image_url?: string;
  image_attribution?: string;
}

export interface HiddenGemSpot {
  id: string; // 'HG001'
  parent_destination_id: string;
  state: StateOption;
  district: string;
  spot_name: string;
  categories: string[];
  tags: string[];
  summary: string;
  budget_band: BudgetBand;
  suggested_duration: string;
  best_time: string;
  linked_main_place_name?: string | null;
  image_url?: string;
  image_attribution?: string;
}

export interface Booking {
  id: string;
  tourist_id?: string | null;
  tourist_name?: string;
  guide_id: string;
  destination_id: string;
  destination_name?: string;
  state: StateOption;
  district?: string;
  start_date: string;
  end_date: string;
  trip_start_date?: string;
  trip_end_date?: string;
  computed_amount: number;
  total_fee?: number;
  status: BookingStatus;
  created_at: string;
  updated_at?: string;
  guide_name?: string;
  guide_phone?: string;
}

export interface Review {
  id: string;
  booking_id: string;
  tourist_id?: string;
  guide_id?: string;
  rating: number; // 1 to 5
  comment: string;
  created_at: string;
  tourist_name?: string;
}

export interface SOSEvent {
  id: string;
  timestamp: string;
  booking_id?: string;
  tourist_name: string;
  tourist_phone: string;
  recipients: string[];
  status: 'DISPATCHED' | 'ACKNOWLEDGED' | 'RESOLVED';
  notes?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  maps_url?: string;
  tracking_active?: boolean;
}

export interface MatchCriteria {
  state: StateOption;
  district: string;
  startDate: string;
  endDate: string;
  budgetPerDay: number;
  categories: string[];
  preferredLanguage: string;
  travelStyle: string;
  safetyPreference?: string;
}

export interface MatchFactorBreakdown {
  interestCoverage: number; // weight 0.30
  ratingTrust: number; // weight 0.15
  languageMatch: number; // weight 0.15
  availabilityFit: number; // weight 0.10
  travelStyle: number; // weight 0.10
  budgetFit: number; // weight 0.10
  safetyPreference: number; // weight 0.10
  totalScore: number; // 0 - 100%
  breakdownReasons: string[];
}

export interface MatchResult {
  guide: PublicGuideProfile;
  matchScore: number; // 0 - 100
  breakdown: MatchFactorBreakdown;
}

export type AppView =
  | 'auth'
  | 'home'
  | 'explore'
  | 'destination-detail'
  | 'match'
  | 'match-results'
  | 'booking'
  | 'booking-confirmation'
  | 'bookings-list'
  | 'profile'
  | 'guide-shell'
  | 'guide-tier1'
  | 'guide-tier2'
  | 'guide-dashboard'
  | 'safety'
  | 'privacy'
  | 'terms';
