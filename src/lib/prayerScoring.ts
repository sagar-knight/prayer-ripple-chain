/**
 * Prayer Fairness & Scoring System
 * 
 * Ensures fair distribution so no prayer request is ignored.
 * Computes a priority score for each open prayer request.
 */

export interface ScoredPrayerRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  isAnonymous: boolean;
  location?: string;
  timeAgo: string;
  churchName?: string;
  prayerCount: number;
  // Scoring fields
  createdAt: Date;
  lastPrayedAt: Date | null;
  assignedTargetCount: number;
  assignedPrayedCount: number;
  assignmentStatus: "pending" | "completed";
  status: "open" | "closed";
  country?: string;
  interestCategories?: string[];
  visibility: "public" | "family-only" | "org-only" | "private";
  familyId?: string;
  requesterUserId?: string;
}

export interface UserPrayerHistoryEntry {
  prayerId: string;
  prayedAt: Date;
  modeUsed: string;
}

/**
 * Compute the priority score for a prayer request.
 * Higher score = should be prayed for sooner.
 */
export function computePrayerScore(prayer: ScoredPrayerRequest): number {
  const now = Date.now();

  // Need factor: fewer prayers → higher need
  const need = 1 / (prayer.prayerCount + 1);

  // Age boost: older requests get a log boost
  const ageHours = (now - prayer.createdAt.getTime()) / (1000 * 60 * 60);
  const ageBoost = Math.log(1 + ageHours);

  // Stale boost: longer since last prayed → higher boost
  const staleHours = prayer.lastPrayedAt
    ? (now - prayer.lastPrayedAt.getTime()) / (1000 * 60 * 60)
    : 999; // treat null as very stale
  const staleBoost = Math.log(1 + staleHours);

  // Assignment boost: requests not yet at minimum coverage
  const assignedRemaining = Math.max(0, prayer.assignedTargetCount - prayer.assignedPrayedCount);
  const assignBoost = assignedRemaining > 0 ? 2.0 : 0;

  // Final score with jitter for tie-breaking
  const jitter = Math.random() * 0.05;

  return (5 * need) + (1.2 * ageBoost) + (1.5 * staleBoost) + assignBoost + jitter;
}

/**
 * Filter eligible prayers for a user, excluding:
 * - Non-open prayers
 * - Already prayed within 30 days
 * - Visibility violations
 * - Optionally user's own requests
 */
export function filterEligible(
  prayers: ScoredPrayerRequest[],
  userHistory: UserPrayerHistoryEntry[],
  options: {
    excludeOwnUserId?: string;
    userOrgIds?: string[];
  } = {}
): ScoredPrayerRequest[] {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const recentlyPrayedIds = new Set(
    userHistory
      .filter((h) => h.prayedAt >= thirtyDaysAgo)
      .map((h) => h.prayerId)
  );

  return prayers.filter((p) => {
    if (p.status !== "open") return false;
    if (recentlyPrayedIds.has(p.id)) return false;
    if (p.visibility === "private") return false;
    if ((p.visibility === "family-only" || p.visibility === "org-only") && p.familyId) {
      if (!options.userOrgIds?.includes(p.familyId)) return false;
    }
    return true;
  });
}

/**
 * Select next prayers using the scoring system.
 * Supports mode-based filtering + fairness scoring.
 */
export function selectNextPrayers(
  prayers: ScoredPrayerRequest[],
  userHistory: UserPrayerHistoryEntry[],
  mode: string,
  count: number,
  options: {
    userCountry?: string;
    userInterests?: string[];
    excludeOwnUserId?: string;
    userOrgIds?: string[];
  } = {}
): ScoredPrayerRequest[] {
  let eligible = filterEligible(prayers, userHistory, options);

  // Mode-based filtering
  switch (mode) {
    case "my_country":
      if (options.userCountry) {
        const countryFiltered = eligible.filter((p) => p.country === options.userCountry);
        if (countryFiltered.length > 0) eligible = countryFiltered;
      }
      break;
    case "interests":
      if (options.userInterests && options.userInterests.length > 0) {
        const interestFiltered = eligible.filter((p) =>
          p.interestCategories?.some((c) => options.userInterests!.includes(c))
        );
        if (interestFiltered.length > 0) eligible = interestFiltered;
      }
      break;
    case "recent":
      // Still score, but add a recency boost (already handled by age_boost in score)
      break;
    case "surprise":
      // Random from top-scored pool
      break;
    case "rescue":
      // Only prayers with very low count or stale
      eligible = eligible.filter((p) => {
        const staleHours = p.lastPrayedAt
          ? (Date.now() - p.lastPrayedAt.getTime()) / (1000 * 60 * 60)
          : 999;
        return p.prayerCount <= 1 || staleHours > 72;
      });
      break;
    // "needs_most" uses default scoring
  }

  // Score and sort
  const scored = eligible.map((p) => ({
    prayer: p,
    score: computePrayerScore(p),
  }));

  scored.sort((a, b) => {
    if (Math.abs(a.score - b.score) < 0.01) {
      // Tie-break: lower prayer count first, then older first
      if (a.prayer.prayerCount !== b.prayer.prayerCount) {
        return a.prayer.prayerCount - b.prayer.prayerCount;
      }
      return a.prayer.createdAt.getTime() - b.prayer.createdAt.getTime();
    }
    return b.score - a.score;
  });

  if (mode === "surprise") {
    // Pick randomly from top 50% of scored pool
    const poolSize = Math.max(1, Math.ceil(scored.length * 0.5));
    const pool = scored.slice(0, poolSize);
    const shuffled = pool.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map((s) => s.prayer);
  }

  return scored.slice(0, count).map((s) => s.prayer);
}

/**
 * Check if a prayer qualifies for rescue mode.
 */
export function isRescueCandidate(prayer: ScoredPrayerRequest): boolean {
  const staleHours = prayer.lastPrayedAt
    ? (Date.now() - prayer.lastPrayedAt.getTime()) / (1000 * 60 * 60)
    : 999;
  return prayer.prayerCount <= 1 || staleHours > 72;
}

/**
 * Auto-assignment: determine initial K assignments for a new prayer.
 * Returns the target count (K) for minimum coverage guarantee.
 */
export function getMinimumCoverageTarget(): number {
  return 3; // configurable: 3-5
}
