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

// Okno minimalne między zapisami tego samego IP (10 minut)
const MIN_VISIT_INTERVAL_MS = 10 * 60 * 1000

// @desc    Zapisanie wizyty (IP + data wejścia na stronę). Ten sam IP nie częściej niż raz na 10 min.
// @route   POST /api/visits
// @access  Public
export const recordVisit = asyncHandler(async (req: Request, res: Response) => {
  const ip = getClientIp(req)
  const now = new Date()
  const since = new Date(now.getTime() - MIN_VISIT_INTERVAL_MS)

  const lastFromIp = await PageVisit.findOne({ ip, visitedAt: { $gte: since } })
    .sort({ visitedAt: -1 })
    .lean()

  if (lastFromIp) {
    res.status(200).json({
      success: true,
      message: 'Wizyta już zapisana w tym oknie'
    })
    return
  }

  await PageVisit.create({ ip, visitedAt: now })

  res.status(201).json({
    success: true,
    message: 'Wizyta zapisana'
  })
})
