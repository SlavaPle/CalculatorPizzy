import { Request, Response } from 'express'
import PageVisit from '../models/PageVisit'
import { asyncHandler } from '../middleware/errorHandler'

/**
 * Pobiera IP klienta z nagłówków (proxy) lub z połączenia
 */
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) {
    const first = typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded[0]
    return (first || '').trim() || req.ip || 'unknown'
  }
  return req.ip || req.socket?.remoteAddress || 'unknown'
}

// @desc    Zapisanie wizyty (IP + data wejścia na stronę)
// @route   POST /api/visits
// @access  Public
export const recordVisit = asyncHandler(async (req: Request, res: Response) => {
  const ip = getClientIp(req)
  const visitedAt = new Date()

  await PageVisit.create({ ip, visitedAt })

  res.status(201).json({
    success: true,
    message: 'Wizyta zapisana'
  })
})
