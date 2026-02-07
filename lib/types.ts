// Type definitions for Zenith AI

export interface User {
  id: string
  clerkId: string
  email: string
  name: string | null
  age: number | null
  disciplineLevel: string | null
  painPoints: string[]
  painPointsOther: string | null
  vision: string[]
  visionCustom: string | null
  pactText: string | null
  onboardingCompleted: boolean
  createdAt: Date
  updatedAt: Date
}

// Onboarding types
export interface OnboardingData {
  name: string
  age: number
  disciplineLevel: 'chaos' | 'inconsistent' | 'soldier' | 'master'
  painPoints: string[]
  painPointsOther?: string
  vision: string[]
  visionCustom?: string
  pactText: string
}

export const DISCIPLINE_LEVELS = [
  { value: 'chaos', label: 'Total Chaos', icon: '🌪️' },
  { value: 'inconsistent', label: 'Up and Down', icon: '📈' },
  { value: 'soldier', label: 'Soldier', icon: '🎖️' },
  { value: 'master', label: 'Master', icon: '👑' },
] as const

export const PAIN_POINTS = [
  { value: 'procrastination', label: 'Procrastination', icon: '⏰' },
  { value: 'digital_distractions', label: 'Digital Distractions', icon: '📱' },
  { value: 'poor_sleep', label: 'Poor Sleep', icon: '😴' },
  { value: 'bad_nutrition', label: 'Bad Nutrition', icon: '🍔' },
  { value: 'no_exercise', label: 'No Exercise', icon: '🏋️' },
  { value: 'no_clear_goals', label: 'No Clear Goals', icon: '🎯' },
] as const

export const VISION_OPTIONS = [
  { value: 'athletic_physique', label: 'Athletic Physique', icon: '💪' },
  { value: 'business_launched', label: 'Business Launched', icon: '🚀' },
  { value: 'steel_mindset', label: 'Steel Mindset', icon: '🧠' },
  { value: 'financial_freedom', label: 'Financial Freedom', icon: '💰' },
] as const

export interface Session {
  id: string
  userId: string
  token: string
  expiresAt: Date
  createdAt: Date
}

export interface DailyTracking {
  id: string
  userId: string
  date: string // ISO date string YYYY-MM-DD
  
  // SAVERS
  saversSilence: boolean
  saversAffirmations: boolean
  saversVisualization: boolean
  saversExercise: boolean
  saversReading: boolean
  saversScribing: boolean
  
  // Vices
  viceFreeCoke: boolean
  viceFreeBeer: boolean
  viceFreeWeed: boolean
  viceFreeSns: boolean
  viceFreePorn: boolean
  
  // Additional
  dailyAffirmation: string | null
  notes: string | null
  moodRating: number | null
  energyLevel: number | null
  
  createdAt: Date
  updatedAt: Date
}

export interface Challenge {
  id: string
  userId: string
  title: string
  description: string | null
  durationDays: number
  startDate: string
  endDate: string
  status: 'active' | 'completed' | 'failed' | 'archived'
  createdAt: Date
  updatedAt: Date
  progress?: ChallengeProgress
}

export interface ChallengeCheckIn {
  id: string
  challengeId: string
  date: string
  status: 'success' | 'fail' | 'skip'
  notes: string | null
  createdAt: Date
}

export interface ChallengeProgress {
  totalDays: number
  completedDays: number
  failedDays: number
  skippedDays: number
  currentStreak: number
  bestStreak: number
  percentComplete: number
  daysRemaining: number
}

export interface CustomTracker {
  id: string
  userId: string
  title: string
  color: string
  icon: string
  createdAt: Date
  updatedAt: Date
}

export interface CustomTrackerEntry {
  id: string
  trackerId: string
  date: string
  amount: number
  createdAt: Date
  updatedAt: Date
}

export interface TrackerWithTotal extends CustomTracker {
  monthlyTotal: number
  entries: CustomTrackerEntry[]
}

export interface Streak {
  type: string
  label: string
  icon: string
  current: number
  best: number
  lastDate: string | null
}

export interface MonthData {
  [date: string]: DailyTracking
}

export interface MonthSummary {
  totalDays: number
  daysTracked: number
  averageSaversScore: number
  averageVicesScore: number
  perfectDays: number
}

// Form types
export interface DayFormData {
  saversSilence: boolean
  saversAffirmations: boolean
  saversVisualization: boolean
  saversExercise: boolean
  saversReading: boolean
  saversScribing: boolean
  viceFreeCoke: boolean
  viceFreeBeer: boolean
  viceFreeWeed: boolean
  viceFreeSns: boolean
  viceFreePorn: boolean
  dailyAffirmation: string
  notes: string
  moodRating: number
  energyLevel: number
}

export interface CreateChallengeData {
  title: string
  description: string
  durationDays: number
  startDate: string
}

export interface TrackerEntryData {
  trackerId: string
  date: string
  amount: number
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
}

export interface AuthResponse extends ApiResponse {
  user?: User
  token?: string
}

// Config types
export const SAVERS_CONFIG = {
  silence: { label: 'Silence (Meditation)', icon: '🧘', key: 'saversSilence' },
  affirmations: { label: 'Affirmations', icon: '💬', key: 'saversAffirmations' },
  visualization: { label: 'Visualization', icon: '👁️', key: 'saversVisualization' },
  exercise: { label: 'Exercise (Workout)', icon: '🏃', key: 'saversExercise' },
  reading: { label: 'Reading', icon: '📚', key: 'saversReading' },
  scribing: { label: 'Scribing (Journaling)', icon: '✍️', key: 'saversScribing' },
} as const

export const VICES_CONFIG = {
  coke: { label: 'Soda/Cola', icon: '🥤', key: 'viceFreeCoke' },
  beer: { label: 'Beer/Alcohol', icon: '🍺', key: 'viceFreeBeer' },
  weed: { label: 'Cannabis', icon: '🌿', key: 'viceFreeWeed' },
  sns: { label: 'SNS (+30min)', icon: '📱', key: 'viceFreeSns' },
  porn: { label: 'Porn', icon: '🔞', key: 'viceFreePorn' },
} as const

export const DEFAULT_MANTRAS = [
  "Discipline equals freedom. Without discipline, freedom is a trap.",
  "Every day is a new opportunity to become the best version of myself.",
  "My inner strength grows with every conscious choice I make.",
  "I build my freedom brick by brick, day by day.",
  "Yesterday's vices do not define the person I am becoming today.",
  "I am stronger than my temptations.",
  "Every small victory builds a great transformation.",
  "My mind is clear, my body is strong, my soul is free.",
]
