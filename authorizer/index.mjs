import { createHmac, timingSafeEqual } from 'node:crypto'

function decode(segment) {
  const pad = segment.length % 4 === 0 ? '' : '='.repeat(4 - (segment.length % 4))
  return Buffer.from(segment.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64')
}

function deny() {
  return { isAuthorized: false }
}

export const handler = async (event) => {
  try {
    const secret = process.env.JWT_SECRET
    if (!secret) return deny()

    const raw = String(event.authorizationToken || '')
      .replace(/^Bearer\s+/i, '')
      .trim()
    const parts = raw.split('.')
    if (parts.length !== 3) return deny()

    const [headerSeg, payloadSeg, sigSeg] = parts
    const header = JSON.parse(decode(headerSeg).toString('utf8'))
    if (header.alg !== 'HS256') return deny()

    const expected = createHmac('sha256', secret)
      .update(`${headerSeg}.${payloadSeg}`)
      .digest()
    const actual = decode(sigSeg)
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      return deny()
    }

    const claims = JSON.parse(decode(payloadSeg).toString('utf8'))
    if (typeof claims.exp !== 'number' || claims.exp * 1000 <= Date.now()) return deny()
    if (claims.user_id == null || typeof claims.name !== 'string' || !claims.name) {
      return deny()
    }

    const groupIDs = Array.isArray(claims.group_ids) ? claims.group_ids : []
    const remaining = Math.floor(claims.exp - Date.now() / 1000)
    return {
      isAuthorized: true,
      resolverContext: {
        user_id: String(claims.user_id),
        name: claims.name,
        group_ids: JSON.stringify(groupIDs),
      },
      ttlOverride: Math.min(Math.max(remaining, 1), 300),
    }
  } catch {
    return deny()
  }
}
