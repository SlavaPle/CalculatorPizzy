import LocaleCurrencyMapping from '../models/LocaleCurrencyMapping'

/**
 * Получить валюту по локали с поддержкой fallback
 * @param locale - локаль (например, "ru-RU", "en-US")
 * @returns код валюты ISO 4217 или null
 */
export async function getCurrencyByLocale(locale: string): Promise<string | null> {
  if (!locale) {
    return null
  }

  // Нормализация локали (приведение к стандартному формату)
  const normalizedLocale = locale.trim()

  // Попытка найти точное совпадение
  let mapping = await LocaleCurrencyMapping.findOne({
    locale: normalizedLocale,
    isActive: true
  })

  if (mapping) {
    return mapping.currency
  }

  // Если точного совпадения нет, пытаемся найти по языку
  // Например, ru-BY -> ru-RU
  const languageCode = normalizedLocale.split('-')[0]
  
  // Ищем первую активную локаль с таким языком
  mapping = await LocaleCurrencyMapping.findOne({
    locale: new RegExp(`^${languageCode}-`),
    isActive: true
  }).sort({ locale: 1 }) // Сортируем для предсказуемости

  if (mapping) {
    return mapping.currency
  }

  // Fallback на USD если ничего не найдено
  return 'USD'
}

/**
 * Получить список всех поддерживаемых локалей
 */
export async function getSupportedLocales(): Promise<string[]> {
  const mappings = await LocaleCurrencyMapping.find({
    isActive: true
  }).select('locale').sort({ locale: 1 })

  return mappings.map(m => m.locale)
}


