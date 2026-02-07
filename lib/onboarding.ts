import OpenAI from 'openai'
import { PAIN_POINTS, VISION_OPTIONS } from './types'

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

interface GeneratedTracker {
  title: string
  icon: string
  color: string
}

interface GeneratedChallenge {
  title: string
  description: string
}

interface OnboardingContent {
  affirmations: string[]
  trackers: GeneratedTracker[]
  challenge: GeneratedChallenge | null
}

// Maps pain points to tracker suggestions
const PAIN_POINT_TRACKERS: Record<string, GeneratedTracker> = {
  procrastination: { title: 'Deep Work Session', icon: '🎯', color: '#6366f1' },
  digital_distractions: { title: 'Screen-Free Hour', icon: '📵', color: '#f59e0b' },
  poor_sleep: { title: 'In Bed Before 11PM', icon: '🌙', color: '#8b5cf6' },
  bad_nutrition: { title: 'Healthy Meal', icon: '🥗', color: '#22c55e' },
  no_exercise: { title: 'Workout Done', icon: '💪', color: '#ef4444' },
  no_clear_goals: { title: 'Daily Goal Review', icon: '📋', color: '#0ea5e9' },
}

// Maps pain points to challenge suggestions
const PAIN_POINT_CHALLENGES: Record<string, GeneratedChallenge> = {
  procrastination: {
    title: '7-Day Focus Challenge',
    description: 'Complete at least 2 hours of deep, focused work every day for 7 days. No distractions, no excuses.',
  },
  digital_distractions: {
    title: '7-Day Digital Detox',
    description: 'Limit social media to 30 minutes per day for 7 days. Reclaim your time and attention.',
  },
  poor_sleep: {
    title: '7-Day Sleep Reset',
    description: 'Be in bed by 11PM every night for 7 days. No screens 30 minutes before bed.',
  },
  bad_nutrition: {
    title: '7-Day Clean Eating',
    description: 'No junk food, no sugary drinks for 7 days. Fuel your body with real food.',
  },
  no_exercise: {
    title: '7-Day Movement Challenge',
    description: 'Exercise for at least 30 minutes every day for 7 days. Walk, run, lift — just move.',
  },
  no_clear_goals: {
    title: '7-Day Goal Setting Sprint',
    description: 'Write down your top 3 goals every morning and review progress every evening for 7 days.',
  },
}

function getPainPointLabel(value: string): string {
  const found = PAIN_POINTS.find(p => p.value === value)
  return found ? found.label : value
}

function getVisionLabel(value: string): string {
  const found = VISION_OPTIONS.find(v => v.value === value)
  return found ? found.label : value
}

export async function generateOnboardingContent(
  painPoints: string[],
  painPointsOther: string | undefined,
  vision: string[],
  visionCustom: string | undefined,
): Promise<OnboardingContent> {
  // Generate trackers based on pain points
  const trackers: GeneratedTracker[] = painPoints
    .map(pp => PAIN_POINT_TRACKERS[pp])
    .filter((t): t is GeneratedTracker => !!t)
    .slice(0, 3)

  // Pick a challenge based on the first pain point
  const primaryPainPoint = painPoints.length > 0 ? painPoints[0] : 'procrastination'
  const challenge = PAIN_POINT_CHALLENGES[primaryPainPoint] || PAIN_POINT_CHALLENGES['procrastination']

  // Generate affirmations
  const affirmations = await generateAffirmations(painPoints, painPointsOther, vision, visionCustom)

  return { affirmations, trackers, challenge }
}

async function generateAffirmations(
  painPoints: string[],
  painPointsOther: string | undefined,
  vision: string[],
  visionCustom: string | undefined,
): Promise<string[]> {
  const painLabels = painPoints.map(getPainPointLabel).join(', ')
  const visionLabels = vision.map(getVisionLabel).join(', ')
  const extra = [painPointsOther, visionCustom].filter(Boolean).join(', ')

  if (!openai) {
    return getDefaultAffirmations(painPoints, vision)
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a direct, no-nonsense life coach. Generate short, powerful affirmations in English.',
        },
        {
          role: 'user',
          content: `Generate exactly 3 personalized affirmations for someone who struggles with: ${painLabels}${extra ? `, ${extra}` : ''}. Their goals are: ${visionLabels}${visionCustom ? `, ${visionCustom}` : ''}. Each affirmation should be 1 sentence, direct, powerful. Return only the 3 affirmations, one per line.`,
        },
      ],
      max_tokens: 200,
      temperature: 0.8,
    })

    const text = response.choices[0]?.message?.content || ''
    const lines = text.split('\n').map(l => l.replace(/^\d+\.\s*/, '').trim()).filter(Boolean)
    return lines.length >= 3 ? lines.slice(0, 3) : getDefaultAffirmations(painPoints, vision)
  } catch (error) {
    console.error('OpenAI affirmation generation error:', error)
    return getDefaultAffirmations(painPoints, vision)
  }
}

function getDefaultAffirmations(painPoints: string[], vision: string[]): string[] {
  const defaults: Record<string, string> = {
    procrastination: 'I act now. Every second of delay is a second stolen from my future.',
    digital_distractions: 'I control my attention. My focus is my superpower.',
    poor_sleep: 'I honor my body with rest. Sleep is my foundation for greatness.',
    bad_nutrition: 'I fuel my body with purpose. Every meal is a choice for strength.',
    no_exercise: 'I move my body daily. Physical discipline builds mental power.',
    no_clear_goals: 'I know exactly where I am going. My vision drives every decision.',
    athletic_physique: 'I am building a body that matches the strength of my mind.',
    business_launched: 'I am building something that matters. Every day I make progress.',
    steel_mindset: 'My mind is unshakable. I grow stronger through every challenge.',
    financial_freedom: 'I am building wealth through discipline and smart decisions.',
  }

  const affirmations: string[] = []
  for (const pp of painPoints) {
    if (defaults[pp] && affirmations.length < 2) {
      affirmations.push(defaults[pp])
    }
  }
  for (const v of vision) {
    if (defaults[v] && affirmations.length < 3) {
      affirmations.push(defaults[v])
    }
  }

  while (affirmations.length < 3) {
    affirmations.push('I am in control. Every day I become the best version of myself.')
  }

  return affirmations.slice(0, 3)
}
