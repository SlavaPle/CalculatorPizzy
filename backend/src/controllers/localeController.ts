import { Request, Response } from 'express'
import LocaleCurrencyMapping from '../models/LocaleCurrencyMapping'
import { asyncHandler, createError } from '../middleware/errorHandler'

/**
 * Waluta po locale (np. GET /api/locales/currency?locale=ru-RU)
 */
export const getCurrencyByLocaleHandler = asyncHandler(async (req: Request, res: Response) => {
  const locale = (req.query['locale'] as string)?.trim()
  if (!locale) {
    throw createError('Parametr locale jest wymagany', 400)
  }
  const mapping = await LocaleCurrencyMapping.findOne({
    locale: locale,
    isActive: true
  })
  if (!mapping) {
    throw createError('Locale nie znaleziony', 404)
  }
  res.json({ locale: mapping['locale'], currency: mapping['currency'] })
})

/**
 * Lista obsługiwanych locale (GET /api/locales/supported)
 */
export const getSupportedLocalesHandler = asyncHandler(async (_req: Request, res: Response) => {
  const list = await LocaleCurrencyMapping.find({ isActive: true })
    .select('locale currency countryCode')
    .sort({ locale: 1 })
  res.json({ locales: list })
})
