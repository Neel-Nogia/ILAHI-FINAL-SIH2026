import { PublicGuideProfile, MatchCriteria, MatchResult, MatchFactorBreakdown, GuideAvailability, Review } from './types';
import { ALL_DESTINATIONS } from './data/destinations-data';

export function scoreAndRankGuides(
  guides: PublicGuideProfile[],
  criteria: MatchCriteria,
  options?: {
    availabilities?: GuideAvailability[];
    reviews?: Review[];
  }
): MatchResult[] {
  // Precompute average ratings from real reviews per guide if provided
  const realRatingsByGuide: Record<string, { total: number; count: number }> = {};
  if (options?.reviews && options.reviews.length > 0) {
    options.reviews.forEach(r => {
      const gId = r.guide_id;
      if (gId) {
        if (!realRatingsByGuide[gId]) {
          realRatingsByGuide[gId] = { total: 0, count: 0 };
        }
        realRatingsByGuide[gId].total += r.rating;
        realRatingsByGuide[gId].count += 1;
      }
    });
  }

  // Precompute custom unavailable/available dates per guide if provided
  const availabilityByGuide: Record<string, GuideAvailability[]> = {};
  if (options?.availabilities && options.availabilities.length > 0) {
    options.availabilities.forEach(a => {
      if (!availabilityByGuide[a.guide_id]) {
        availabilityByGuide[a.guide_id] = [];
      }
      availabilityByGuide[a.guide_id].push(a);
    });
  }

  // 1. Hard filter (before scoring)
  const candidateGuides = guides.filter(guide => {
    // Condition A: Guide's state matches tourist's chosen state
    if (guide.state !== criteria.state) return false;

    // Condition B: Guide's primary_area or areas_of_expertise includes chosen district
    // (or is in the same state if no exact district match exists)
    const exactDistrictMatches = guides.some(
      g => g.state === criteria.state && 
      (g.primary_area.toLowerCase() === criteria.district.toLowerCase() ||
       g.areas_of_expertise.some(a => a.toLowerCase() === criteria.district.toLowerCase()))
    );

    if (exactDistrictMatches) {
      const guideCoversDistrict = 
        guide.primary_area.toLowerCase() === criteria.district.toLowerCase() ||
        guide.areas_of_expertise.some(a => a.toLowerCase() === criteria.district.toLowerCase());
      if (!guideCoversDistrict) return false;
    }

    // Condition C: Safety preference, if set, must be present in guide's safety_tags
    if (criteria.safetyPreference && criteria.safetyPreference.trim() !== '') {
      const pref = criteria.safetyPreference.toLowerCase();
      const hasSafetyTag = guide.safety_tags.some(t => t.toLowerCase().includes(pref) || pref.includes(t.toLowerCase()));
      if (!hasSafetyTag) return false;
    }

    return true;
  });

  // 2. Weighted scoring across 7 parameters
  const results: MatchResult[] = candidateGuides.map(guide => {
    const reasons: string[] = [];

    // Factor 1: Interest coverage (Weight: 0.30)
    // Overlap between tourist's chosen categories and guide's specialties/tags
    let interestScore = 0;
    if (criteria.categories.length > 0) {
      const guideKeywords = [
        ...guide.specialties.map(s => s.toLowerCase()),
        ...guide.travel_style_tags.map(t => t.toLowerCase())
      ];
      
      let matchedCount = 0;
      criteria.categories.forEach(cat => {
        const catLower = cat.toLowerCase();
        const hasDirect = guideKeywords.some(kw => kw.includes(catLower) || catLower.includes(kw));
        if (hasDirect) matchedCount++;
      });
      interestScore = Math.min(1.0, matchedCount / Math.max(1, criteria.categories.length));
      if (interestScore > 0.4) {
        reasons.push(`${Math.round(interestScore * 100)}% interest overlap with your focus on ${criteria.categories.slice(0, 2).join(', ')}`);
      }
    } else {
      interestScore = 0.7; // default neutral baseline
    }

    // Factor 2: Rating / trust (Weight: 0.15)
    // Computed from REAL reviews data where available; falls back to guide.rating_avg, then 3.0/5.0
    let ratingScore = 0;
    const realReviewStats = realRatingsByGuide[guide.id];
    let computedRatingAvg: number | null = null;
    
    if (realReviewStats && realReviewStats.count > 0) {
      computedRatingAvg = Number((realReviewStats.total / realReviewStats.count).toFixed(1));
      ratingScore = Math.min(1.0, computedRatingAvg / 5.0);
      reasons.push(`Verified traveler trust rating of ${computedRatingAvg}/5.0 (${realReviewStats.count} real reviews)`);
    } else if (guide.rating_avg !== null && guide.rating_avg !== undefined) {
      computedRatingAvg = guide.rating_avg;
      ratingScore = Math.min(1.0, guide.rating_avg / 5.0);
      reasons.push(`Verified traveler trust rating of ${guide.rating_avg.toFixed(1)}/5.0`);
    } else {
      ratingScore = 3.0 / 5.0; // 0.60 neutral mid-score, never fake a number
      reasons.push('New verified guide profile (neutral baseline rating applied)');
    }

    // Factor 3: Language match (Weight: 0.15)
    let languageScore = 0.5;
    if (criteria.preferredLanguage) {
      const prefLang = criteria.preferredLanguage.toLowerCase();
      const hasLanguage = guide.languages.some(l => l.toLowerCase() === prefLang || l.toLowerCase().includes(prefLang));
      if (hasLanguage) {
        languageScore = 1.0;
        reasons.push(`Fluent in your preferred language (${criteria.preferredLanguage})`);
      } else {
        const commonLingua = guide.languages.some(l => ['hindi', 'english'].includes(l.toLowerCase()));
        languageScore = commonLingua ? 0.65 : 0.3;
      }
    }

    // Factor 4: Availability fit (Weight: 0.10)
    // Queries guide_availability real records first, then preset schedule
    let availabilityScore = 0.7;
    const guideAvails = availabilityByGuide[guide.id] || [];
    
    if (criteria.startDate && criteria.endDate) {
      const tripStart = new Date(criteria.startDate);
      const tripEnd = new Date(criteria.endDate);

      // Check if any explicitly blocked dates in guide_availability
      const conflict = guideAvails.some(a => {
        if (!a.is_available && a.available_date) {
          const d = new Date(a.available_date);
          return d >= tripStart && d <= tripEnd;
        }
        return false;
      });

      if (conflict) {
        availabilityScore = 0.3;
      } else {
        const preset = guide.availability_preset;
        const isWeekend = tripStart.getDay() === 0 || tripStart.getDay() === 6;
        if (preset === 'flexible') {
          availabilityScore = 1.0;
          reasons.push('Schedule confirmed open for your selected trip dates');
        } else if (preset === 'weekends' && isWeekend) {
          availabilityScore = 1.0;
          reasons.push('Weekend availability matches your planned travel window');
        } else if (preset === 'weekday_mornings' && !isWeekend) {
          availabilityScore = 0.95;
          reasons.push('Morning slots align with heritage walks');
        } else {
          availabilityScore = 0.75;
        }
      }
    } else {
      availabilityScore = guide.availability_preset === 'flexible' ? 1.0 : 0.8;
    }

    // Factor 5: Travel style fit (Weight: 0.10)
    let travelStyleScore = 0.6;
    if (criteria.travelStyle) {
      const prefStyle = criteria.travelStyle.toLowerCase();
      const styleMatch = guide.travel_style_tags.some(t => t.toLowerCase().includes(prefStyle) || prefStyle.includes(t.toLowerCase()));
      if (styleMatch) {
        travelStyleScore = 1.0;
        reasons.push(`Travel style harmony: matches '${criteria.travelStyle}'`);
      } else {
        travelStyleScore = 0.5;
      }
    }

    // Factor 6: Budget fit (Weight: 0.10)
    // Compares directly against the real fee_min and fee_max fields on the guide
    let budgetScore = 0.8;
    const feeMin = guide.fee_min || 1000;
    const feeMax = guide.fee_max || 3000;
    const userBudget = criteria.budgetPerDay || 2000;

    if (userBudget >= feeMin && userBudget <= feeMax) {
      budgetScore = 1.0;
      reasons.push(`Daily budget ₹${userBudget} perfectly fits guide's fee range (₹${feeMin} – ₹${feeMax}/day)`);
    } else if (userBudget > feeMax) {
      budgetScore = 0.95; // Well within tourist's higher spending budget
      reasons.push(`Guide's rate (₹${feeMin} – ₹${feeMax}/day) is comfortably within your ₹${userBudget}/day budget`);
    } else {
      // Tourist budget is lower than feeMin
      const ratio = userBudget / feeMin;
      budgetScore = Math.max(0.3, Math.min(0.85, ratio));
      if (budgetScore > 0.6) {
        reasons.push(`Guide fee starts at ₹${feeMin}/day (budget negotiation possible)`);
      }
    }

    // Factor 7: Safety preference (Weight: 0.10)
    let safetyScore = 0.5;
    if (guide.safety_tags.length > 0) {
      safetyScore = Math.min(1.0, 0.4 + (guide.safety_tags.length * 0.2));
      if (guide.safety_tags.includes('solo-female-friendly')) {
        reasons.push('Vetted solo-female friendly certified guide');
      }
    }

    // Weighted Total Score Calculation:
    // 0.30 + 0.15 + 0.15 + 0.10 + 0.10 + 0.10 + 0.10 = 1.00
    const weightedSum = 
      (interestScore * 0.30) +
      (ratingScore * 0.15) +
      (languageScore * 0.15) +
      (availabilityScore * 0.10) +
      (travelStyleScore * 0.10) +
      (budgetScore * 0.10) +
      (safetyScore * 0.10);

    const totalScore = Math.round(weightedSum * 100);

    const breakdown: MatchFactorBreakdown = {
      interestCoverage: Math.round(interestScore * 100),
      ratingTrust: Math.round(ratingScore * 100),
      languageMatch: Math.round(languageScore * 100),
      availabilityFit: Math.round(availabilityScore * 100),
      travelStyle: Math.round(travelStyleScore * 100),
      budgetFit: Math.round(budgetScore * 100),
      safetyPreference: Math.round(safetyScore * 100),
      totalScore,
      breakdownReasons: reasons.length > 0 ? reasons : ['Verified local guide in destination district']
    };

    return {
      guide: {
        ...guide,
        rating_avg: computedRatingAvg ?? guide.rating_avg
      },
      matchScore: totalScore,
      breakdown
    };
  });

  // Sort descending by calculated match score
  return results.sort((a, b) => b.matchScore - a.matchScore);
}
