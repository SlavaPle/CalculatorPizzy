/**
 * Форматирование валюты с учетом локали
 */
export function formatCurrency(amount: number, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount)
  } catch (error) {
    // Fallback на простой формат в случае ошибки
    return `${amount.toFixed(2)} ${currency}`
  }
}

/**
 * Список популярных валют ISO 4217
 */
export interface CurrencyInfo {
  code: string
  name: string
  symbol?: string
}

export function getSupportedCurrencies(): CurrencyInfo[] {
  return [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
    { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
    { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
    { code: 'BYN', name: 'Belarusian Ruble', symbol: 'Br' },
    { code: 'KZT', name: 'Kazakhstani Tenge', symbol: '₸' },
    { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴' },
    { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
    { code: 'ARS', name: 'Argentine Peso', symbol: '$' },
    { code: 'TWD', name: 'New Taiwan Dollar', symbol: 'NT$' }
  ]
}

/**
 * Получить информацию о валюте по коду
 */
export function getCurrencyInfo(code: string): CurrencyInfo | undefined {
  return getSupportedCurrencies().find(c => c.code === code)
}


