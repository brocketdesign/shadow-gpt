import OpenAI from 'openai'
import { prisma } from './prisma'
import { DEFAULT_MANTRAS } from './types'

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

export async function getDailyAffirmation(date: string): Promise<string> {
  // Check cache first
  try {
    const cached = await prisma.affirmationCache.findUnique({
      where: { date: new Date(date) },
    })
    
    if (cached) {
      return cached.content
    }
  } catch (error) {
    console.error('Error checking affirmation cache:', error)
  }
  
  // Generate new affirmation
  const affirmation = await generateAffirmation()
  
  // Cache it
  try {
    await prisma.affirmationCache.create({
      data: {
        date: new Date(date),
        content: affirmation,
        source: openai ? 'openai' : 'default',
      },
    })
  } catch (error) {
    console.error('Error caching affirmation:', error)
  }
  
  return affirmation
}

async function generateAffirmation(): Promise<string> {
  if (!openai) {
    return getRandomDefaultAffirmation()
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Tu es un coach de vie bienveillant mais direct qui aide les gens à surmonter leurs addictions et construire une vie disciplinée.',
        },
        {
          role: 'user',
          content: "Génère une affirmation puissante et motivante en français pour quelqu'un qui lutte contre des addictions et qui veut construire une vie disciplinée et libre. L'affirmation doit être directe, respectueuse, et inspirante. Maximum 150 caractères.",
        },
      ],
      max_tokens: 100,
      temperature: 0.8,
    })
    
    return response.choices[0]?.message?.content || getRandomDefaultAffirmation()
  } catch (error) {
    console.error('OpenAI error:', error)
    return getRandomDefaultAffirmation()
  }
}

export async function enhanceDescription(title: string, description: string): Promise<string> {
  if (!openai) {
    return description || `Challenge de transformation personnelle: ${title}. Chaque jour compte, chaque effort te rapproche de la meilleure version de toi-même.`
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Tu es un coach de vie bienveillant qui aide les gens à atteindre leurs objectifs personnels.',
        },
        {
          role: 'user',
          content: `Améliore et enrichis cette description de challenge personnel pour la rendre plus motivante et inspirante.\n\nTitre du challenge: ${title}\nDescription actuelle: ${description || 'Aucune description fournie'}\n\nRéponds uniquement avec la description améliorée, sans préambule ni explication.`,
        },
      ],
      max_tokens: 300,
      temperature: 0.8,
    })
    
    return response.choices[0]?.message?.content || description
  } catch (error) {
    console.error('OpenAI enhancement error:', error)
    return description
  }
}

function getRandomDefaultAffirmation(): string {
  return DEFAULT_MANTRAS[Math.floor(Math.random() * DEFAULT_MANTRAS.length)]
}
