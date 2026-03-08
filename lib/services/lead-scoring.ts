/**
 * Lead Scoring Algorithm
 * Calculates a score from 0-100 based on multiple factors
 */

interface LeadScoringInput {
  budget?: number
  eventDate?: string
  guestCount?: number
  source?: string
  hasEngaged?: boolean
}

export function calculateLeadScore(input: LeadScoringInput): number {
  let score = 0

  // 1. Budget Score (0-30 points)
  if (input.budget) {
    if (input.budget >= 500000) score += 30 // ₹5L+
    else if (input.budget >= 300000) score += 25 // ₹3L-5L
    else if (input.budget >= 150000) score += 20 // ₹1.5L-3L
    else if (input.budget >= 75000) score += 15 // ₹75k-1.5L
    else if (input.budget >= 30000) score += 10 // ₹30k-75k
    else score += 5 // <₹30k
  }

  // 2. Event Date Proximity (0-20 points)
  if (input.eventDate) {
    const today = new Date()
    const eventDate = new Date(input.eventDate)
    const daysUntilEvent = Math.floor(
      (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysUntilEvent < 0) {
      score += 0 // Past date
    } else if (daysUntilEvent <= 30) {
      score += 20 // Within 1 month - urgent!
    } else if (daysUntilEvent <= 60) {
      score += 18 // 1-2 months
    } else if (daysUntilEvent <= 90) {
      score += 15 // 2-3 months
    } else if (daysUntilEvent <= 180) {
      score += 12 // 3-6 months
    } else if (daysUntilEvent <= 365) {
      score += 8 // 6-12 months
    } else {
      score += 5 // 1+ year
    }
  }

  // 3. Guest Count (0-15 points)
  if (input.guestCount) {
    if (input.guestCount >= 500) score += 15 // 500+ guests
    else if (input.guestCount >= 300) score += 12 // 300-500
    else if (input.guestCount >= 150) score += 10 // 150-300
    else if (input.guestCount >= 75) score += 7 // 75-150
    else if (input.guestCount >= 30) score += 5 // 30-75
    else score += 3 // <30
  }

  // 4. Source Quality (0-15 points)
  const sourceScores: Record<string, number> = {
    referral: 15, // Best - trusted source
    website: 12, // Good - direct interest
    instagram: 10,
    facebook: 8,
    google: 10,
    email: 7,
    phone: 12,
    walkin: 13,
    other: 5,
  }
  if (input.source) {
    score += sourceScores[input.source.toLowerCase()] || 5
  }

  // 5. Engagement Level (0-20 points)
  if (input.hasEngaged) {
    score += 20 // Has responded/engaged
  } else {
    score += 10 // New lead, not yet engaged
  }

  return Math.min(100, Math.max(0, score))
}

/**
 * Get score category
 */
export function getScoreCategory(score: number): 'high' | 'medium' | 'low' {
  if (score >= 70) return 'high'
  if (score >= 40) return 'medium'
  return 'low'
}

/**
 * Get score color
 */
export function getScoreColor(score: number): string {
  const category = getScoreCategory(score)
  return {
    high: 'text-green-600 bg-green-50',
    medium: 'text-yellow-600 bg-yellow-50',
    low: 'text-red-600 bg-red-50',
  }[category]
}
