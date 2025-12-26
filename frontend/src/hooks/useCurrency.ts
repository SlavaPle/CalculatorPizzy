import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { formatCurrency as formatCurrencyUtil } from '../utils/currency'
import axios from 'axios'

const CURRENCY_STORAGE_KEY = 'userCurrency'

interface UseCurrencyReturn {
  currency: string
  locale: string
  formatCurrency: (amount: number) => string
  setCurrency: (currency: string) => void
  isLoading: boolean
  error: string | null
}

/**
 * Хук для работы с валютой
 * Автоматически определяет валюту по локали, но позволяет переопределить
 */
export function useCurrency(): UseCurrencyReturn {
  const { i18n } = useTranslation()
  const [currency, setCurrencyState] = useState<string>('USD')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const locale = i18n.language || 'en-US'

  // Загрузка валюты из localStorage или определение по локали
  useEffect(() => {
    const loadCurrency = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Проверяем сохраненную валюту пользователя
        const savedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY)
        if (savedCurrency) {
          setCurrencyState(savedCurrency)
          setIsLoading(false)
          return
        }

        // Определяем валюту по локали через API
        try {
          const response = await axios.get(`/api/locales/currency`, {
            params: { locale }
          })
          
          if (response.data.success && response.data.data.currency) {
            setCurrencyState(response.data.data.currency)
          } else {
            setCurrencyState('USD') // Fallback
          }
        } catch (apiError) {
          console.warn('Failed to fetch currency from API, using USD as fallback', apiError)
          setCurrencyState('USD') // Fallback на USD
        }
      } catch (err) {
        console.error('Error loading currency:', err)
        setError(err instanceof Error ? err.message : 'Failed to load currency')
        setCurrencyState('USD') // Fallback
      } finally {
        setIsLoading(false)
      }
    }

    loadCurrency()
  }, [locale])

  // Форматирование валюты
  const formatCurrency = useCallback((amount: number): string => {
    return formatCurrencyUtil(amount, currency, locale)
  }, [currency, locale])

  // Установка валюты пользователем
  const setCurrency = useCallback((newCurrency: string) => {
    setCurrencyState(newCurrency)
    localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency)
  }, [])

  return {
    currency,
    locale,
    formatCurrency,
    setCurrency,
    isLoading,
    error
  }
}


