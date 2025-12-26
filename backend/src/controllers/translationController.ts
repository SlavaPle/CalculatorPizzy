import { Request, Response, NextFunction } from 'express'
import Translation from '../models/Translation'
import { asyncHandler, createError } from '../middleware/errorHandler'

/**
 * Получить переводы для локали с поддержкой fallback
 */
const getTranslationsWithFallback = async (locale: string, namespace: string = 'translation') => {
  // Нормализация локали
  const normalizedLocale = locale.trim()

  // Попытка найти точное совпадение
  let translation = await Translation.findOne({
    locale: normalizedLocale,
    namespace,
    isActive: true
  })

  if (translation) {
    return translation.translations
  }

  // Если точного совпадения нет, пытаемся найти по языку
  // Например, ru-BY -> ru-RU
  const languageCode = normalizedLocale.split('-')[0]
  
  translation = await Translation.findOne({
    locale: new RegExp(`^${languageCode}-`),
    namespace,
    isActive: true
  }).sort({ locale: 1 })

  if (translation) {
    return translation.translations
  }

  // Fallback на en-US
  translation = await Translation.findOne({
    locale: 'en-US',
    namespace,
    isActive: true
  })

  if (translation) {
    return translation.translations
  }

  return null
}

// @desc    Получить переводы для локали
// @route   GET /api/translations/:locale
// @access  Public
export const getTranslations = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { locale } = req.params
  const { namespace } = req.query

  if (!locale) {
    return next(createError('Locale is required', 400))
  }

  const ns = (namespace as string) || 'translation'
  const translations = await getTranslationsWithFallback(locale, ns)

  if (!translations) {
    return next(createError('Translations not found', 404))
  }

  // Получаем версию для кеширования
  const translationDoc = await Translation.findOne({
    locale: locale,
    namespace: ns,
    isActive: true
  })

  const version = translationDoc?.version || 1

  // Устанавливаем заголовки для кеширования
  res.set({
    'Cache-Control': 'public, max-age=3600', // Кешировать на 1 час
    'ETag': `"${locale}-${ns}-${version}"`
  })

  res.json(translations)
})

// @desc    Получить переводы для локали и namespace
// @route   GET /api/translations/:locale/:namespace
// @access  Public
export const getTranslationsByNamespace = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { locale, namespace } = req.params

  if (!locale || !namespace) {
    return next(createError('Locale and namespace are required', 400))
  }

  const translations = await getTranslationsWithFallback(locale, namespace)

  if (!translations) {
    return next(createError('Translations not found', 404))
  }

  const translationDoc = await Translation.findOne({
    locale: locale,
    namespace: namespace,
    isActive: true
  })

  const version = translationDoc?.version || 1

  res.set({
    'Cache-Control': 'public, max-age=3600',
    'ETag': `"${locale}-${namespace}-${version}"`
  })

  res.json(translations)
})


