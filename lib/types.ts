// Type definitions for Shadow GPT

export interface User {
  id: string
  email: string
  name: string | null
  createdAt: Date
  updatedAt: Date
}

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
  silence: { label: 'Silence (Méditation)', icon: '🧘', key: 'saversSilence' },
  affirmations: { label: 'Affirmations', icon: '💬', key: 'saversAffirmations' },
  visualization: { label: 'Visualisation', icon: '👁️', key: 'saversVisualization' },
  exercise: { label: 'Exercise (Sport)', icon: '🏃', key: 'saversExercise' },
  reading: { label: 'Reading (Lecture)', icon: '📚', key: 'saversReading' },
  scribing: { label: 'Scribing (Écriture)', icon: '✍️', key: 'saversScribing' },
} as const

export const VICES_CONFIG = {
  coke: { label: 'Coca/Sodas', icon: '🥤', key: 'viceFreeCoke' },
  beer: { label: 'Bière/Alcool', icon: '🍺', key: 'viceFreeBeer' },
  weed: { label: 'Cannabis', icon: '🌿', key: 'viceFreeWeed' },
  sns: { label: 'SNS (+30min)', icon: '📱', key: 'viceFreeSns' },
  porn: { label: 'Contenu Porno', icon: '🔞', key: 'viceFreePorn' },
} as const

export const DEFAULT_MANTRAS = [
  "Avec discipline, la liberté est une délivrance. Sans discipline, la liberté est un piège.",
  "Chaque jour est une nouvelle opportunité de devenir la meilleure version de moi-même.",
  "Ma force intérieure grandit à chaque choix conscient que je fais.",
  "Je construis ma liberté brique par brique, jour après jour.",
  "Les vices d'hier ne définissent pas l'homme que je deviens aujourd'hui.",
  "Je suis plus fort que mes tentations.",
  "Chaque petite victoire construit une grande transformation.",
  "Mon esprit est clair, mon corps est fort, mon âme est libre.",
]
