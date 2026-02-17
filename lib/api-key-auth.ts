import { prisma } from './prisma'
import { createHash, randomBytes } from 'crypto'

/**
 * Generate a new API key pair (key + secret).
 * The key is a public identifier (prefix: zk_).
 * The secret is hashed before storage.
 */
export function generateApiKeyPair() {
  const key = `zk_${randomBytes(24).toString('hex')}`
  const secret = `zs_${randomBytes(32).toString('hex')}`
  const hashedSecret = hashSecret(secret)
  return { key, secret, hashedSecret }
}

/**
 * Hash a secret using SHA-256.
 */
export function hashSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('hex')
}

/**
 * Authenticate a request using API key + secret from headers.
 * Returns the user ID if valid, null otherwise.
 * 
 * Expected headers:
 *   x-api-key: zk_...
 *   x-api-secret: zs_...
 */
export async function authenticateApiKey(
  apiKey: string | null,
  apiSecret: string | null
): Promise<{ userId: string; keyId: string } | null> {
  if (!apiKey || !apiSecret) return null

  try {
    const keyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      select: { id: true, userId: true, secret: true },
    })

    if (!keyRecord) return null

    const hashedInput = hashSecret(apiSecret)
    if (hashedInput !== keyRecord.secret) return null

    // Update last used timestamp (fire and forget)
    prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsedAt: new Date() },
    }).catch(() => {})

    return { userId: keyRecord.userId, keyId: keyRecord.id }
  } catch {
    return null
  }
}
