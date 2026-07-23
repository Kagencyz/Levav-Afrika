// ═══════════════════════════════════════════════════════════════
// WRI Service — Central API for all WRI score operations
// Provides: scoring, history, analytics, dimension tracking
// Offline-first: all data persists to localStorage
// ═══════════════════════════════════════════════════════════════

import type { WriScore, WriDimension } from './levavData';
import {
  getWriScore,
  saveWriScore,
  awardWriPoints,
  WRI_SCORING_RULES,
  isWriInitialized,
  getWriUnlockStatus,
} from './levavData';

// ─── Re-export core functions for convenience ───
export {
  getWriScore,
  saveWriScore,
  awardWriPoints,
  isWriInitialized,
  getWriUnlockStatus,
  WRI_SCORING_RULES,
};

// ─── WRI Analytics ───
export interface WriAnalytics {
  overall: number;
  technical: number;
  communication: number;
  reliability: number;
  leadership: number;
  creativity: number;
  growth: number;
  dimensionCount: number; // how many dimensions are unlocked (>0)
  totalPointsEarned: number;
  historyCount: number;
  lastActivity: string | null;
  weeklyGrowth: number; // points earned in last 7 days
  strongestDimension: WriDimension | null;
  weakestDimension: WriDimension | null;
}

/** Get comprehensive analytics for the current user's WRI score */
export function getWriAnalytics(): WriAnalytics {
  const score = getWriScore();
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const weeklyPoints = score.history
    .filter((h) => new Date(h.date) > weekAgo)
    .reduce((sum, h) => sum + h.score, 0);

  const dimensions: [WriDimension, number][] = [
    ['technical', score.technical],
    ['communication', score.communication],
    ['reliability', score.reliability],
    ['leadership', score.leadership],
    ['creativity', score.creativity],
    ['growth', score.growth],
  ];

  const unlocked = dimensions.filter(([, v]) => v > 0);
  const sorted = [...dimensions].sort((a, b) => b[1] - a[1]);

  return {
    overall: score.overall,
    technical: score.technical,
    communication: score.communication,
    reliability: score.reliability,
    leadership: score.leadership,
    creativity: score.creativity,
    growth: score.growth,
    dimensionCount: unlocked.length,
    totalPointsEarned: score.history.reduce((s, h) => s + h.score, 0),
    historyCount: score.history.length,
    lastActivity:
      score.history.length > 0
        ? score.history[score.history.length - 1].date
        : null,
    weeklyGrowth: weeklyPoints,
    strongestDimension: unlocked.length > 0 ? sorted[0][0] : null,
    weakestDimension: unlocked.length > 0 ? sorted[sorted.length - 1][0] : null,
  };
}

// ─── WRI Level Titles ───
export interface WriLevelInfo {
  title: string;
  color: string;
  nextLevel: string;
  pointsNeeded: number;
}

/** Get the level title, color, and next milestone for a given WRI score */
export function getWriLevel(score: number): WriLevelInfo {
  if (score === 0)
    return {
      title: 'Unrated',
      color: '#666666',
      nextLevel: 'Novice',
      pointsNeeded: 1,
    };
  if (score < 20)
    return {
      title: 'Novice',
      color: '#A0A0A0',
      nextLevel: 'Apprentice',
      pointsNeeded: 20 - score,
    };
  if (score < 40)
    return {
      title: 'Apprentice',
      color: '#3B82F6',
      nextLevel: 'Practitioner',
      pointsNeeded: 40 - score,
    };
  if (score < 60)
    return {
      title: 'Practitioner',
      color: '#F59E0B',
      nextLevel: 'Professional',
      pointsNeeded: 60 - score,
    };
  if (score < 80)
    return {
      title: 'Professional',
      color: '#7E3BED',
      nextLevel: 'Expert',
      pointsNeeded: 80 - score,
    };
  return {
    title: 'Expert',
    color: '#C6FF34',
    nextLevel: 'Master',
    pointsNeeded: 100 - score,
  };
}

// ─── WRI History for Charts ───
export interface WriChartPoint {
  date: string;
  label: string;
  score: number;
}

/** Get cumulative WRI history formatted for chart rendering */
export function getWriHistoryForChart(): WriChartPoint[] {
  const score = getWriScore();
  if (score.history.length === 0) return [];

  // Aggregate by day, showing cumulative score
  const byDay = new Map<string, number>();
  let runningTotal = 0;

  const sorted = [...score.history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (const entry of sorted) {
    const date = new Date(entry.date);
    const key = `${date.getMonth() + 1}/${date.getDate()}`;
    runningTotal += entry.score;
    byDay.set(key, Math.min(100, runningTotal));
  }

  return Array.from(byDay.entries()).map(([label, score]) => ({
    date: label,
    label,
    score,
  }));
}

// ─── WRI Activity Types ───
export type WriActivityType =
  | 'levav28_complete'
  | 'lesson_complete'
  | 'course_complete'
  | 'gig_applied'
  | 'gig_completed'
  | 'gig_reviewed'
  | 'impact_volunteer'
  | 'profile_complete';

/** Record a WRI-scorable activity and award points automatically */
export function recordWriActivity(
  type: WriActivityType,
  metadata?: Record<string, unknown>
): WriScore {
  const score = getWriScore();

  switch (type) {
    case 'levav28_complete':
      return awardWriPoints(`levav28-day${metadata?.day ?? 1}-complete` as string);
    case 'lesson_complete':
      return awardWriPoints('learn-lesson-complete');
    case 'course_complete':
      return awardWriPoints('learn-course-complete');
    case 'gig_applied':
      return awardWriPoints('quickwork-applied');
    case 'gig_completed':
      return awardWriPoints('quickwork-completed');
    case 'gig_reviewed':
      return awardWriPoints('quickwork-positive-review');
    case 'impact_volunteer':
      return awardWriPoints('impact-volunteer');
    case 'profile_complete':
      return awardWriPoints('profile-complete');
    default:
      return score;
  }
}

// ─── WRI Dimension Labels ───
export const WRI_DIMENSION_LABELS: Record<WriDimension, string> = {
  technical: 'Technical Skills',
  communication: 'Communication',
  reliability: 'Reliability',
  leadership: 'Leadership',
  creativity: 'Creativity',
  growth: 'Growth Mindset',
};

/** Get a user-friendly label for a WRI dimension */
export function getWriDimensionLabel(dim: WriDimension): string {
  return WRI_DIMENSION_LABELS[dim] ?? dim;
}

// ─── WRI Recommendations ───
/** Get recommended next actions based on current WRI state */
export function getWriRecommendations(): string[] {
  const score = getWriScore();
  const recs: string[] = [];

  if (score.technical === 0)
    recs.push('Complete your first Learn lesson to unlock Technical Skills');
  if (score.reliability === 0)
    recs.push('Apply to a QuickWork gig to unlock Reliability');
  if (score.leadership === 0)
    recs.push('Volunteer at an Impact partner to unlock Leadership');
  if (score.communication === 0)
    recs.push(
      'Get a positive review on a completed gig to unlock Communication'
    );
  if (score.creativity === 0)
    recs.push('Create something original in Levav 28 Day 15 to unlock Creativity');
  if (score.growth === 0)
    recs.push('Complete Levav 28 Week 1 to unlock Growth Mindset');

  if (recs.length === 0) {
    recs.push('Complete more lessons to boost your Technical score');
    recs.push('Pick up more QuickWork gigs to increase Reliability');
    recs.push('Help mentor new talent to grow your Leadership score');
  }

  return recs;
}

// ─── WRI Dimension Breakdown for Charts ───
export interface WriDimensionBreakdown {
  skill: string;
  score: number;
  label: string;
  unlocked: boolean;
}

/** Get skill breakdown data for bar chart rendering */
export function getWriSkillBreakdown(): WriDimensionBreakdown[] {
  const score = getWriScore();
  const unlockStatus = getWriUnlockStatus();

  return [
    { skill: 'Technical', score: score.technical, label: 'Technical Skills', unlocked: unlockStatus.technical },
    { skill: 'Communication', score: score.communication, label: 'Communication', unlocked: unlockStatus.communication },
    { skill: 'Reliability', score: score.reliability, label: 'Reliability', unlocked: unlockStatus.reliability },
    { skill: 'Leadership', score: score.leadership, label: 'Leadership', unlocked: unlockStatus.leadership },
    { skill: 'Creativity', score: score.creativity, label: 'Creativity', unlocked: unlockStatus.creativity },
    { skill: 'Growth', score: score.growth, label: 'Growth Mindset', unlocked: unlockStatus.growth },
  ];
}

// ─── WRI Summary for Dashboard Header ───
export interface WriSummary {
  overall: number;
  initialized: boolean;
  level: WriLevelInfo;
  dimensionCount: number;
  totalPointsEarned: number;
  weeklyGrowth: number;
}

/** Get a compact WRI summary for dashboard header widgets */
export function getWriSummary(): WriSummary {
  const analytics = getWriAnalytics();
  const level = getWriLevel(analytics.overall);

  return {
    overall: analytics.overall,
    initialized: isWriInitialized(),
    level,
    dimensionCount: analytics.dimensionCount,
    totalPointsEarned: analytics.totalPointsEarned,
    weeklyGrowth: analytics.weeklyGrowth,
  };
}
