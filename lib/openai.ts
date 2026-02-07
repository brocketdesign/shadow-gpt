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
          content: 'You are a kind but direct life coach who helps people overcome their addictions and build a disciplined life.',
        },
        {
          role: 'user',
          content: "Generate a powerful and motivating affirmation in English for someone struggling with addictions who wants to build a disciplined and free life. The affirmation should be direct, respectful, and inspiring. Maximum 150 characters.",
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
    return description || `Personal transformation challenge: ${title}. Every day counts, every effort brings you closer to the best version of yourself.`
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a kind life coach who helps people achieve their personal goals.',
        },
        {
          role: 'user',
          content: `Enhance and enrich this personal challenge description to make it more motivating and inspiring.\n\nChallenge title: ${title}\nCurrent description: ${description || 'No description provided'}\n\nRespond only with the enhanced description, no preamble or explanation.`,
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
