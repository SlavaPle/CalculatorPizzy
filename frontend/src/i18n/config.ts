import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'

const apiBase = import.meta.env.VITE_API_URL || ''

i18n
  // Загрузка переводов с сервера
  .use(Backend)
  // Автоматическое определение языка браузера
  .use(LanguageDetector)
  // Передача i18n в react-i18next
  .use(initReactI18next)
  // Инициализация i18next
  .init({
    // Backend конфигурация для загрузки переводов с сервера
    backend: {
      loadPath: `${apiBase}/api/translations/{{lng}}?namespace={{ns}}`,
      crossDomain: false,
      requestOptions: {
        cache: 'no-cache' // Отключаем кеш для разработки
      },
      // Парсинг ответа - API возвращает переводы напрямую
      parse: (data: string) => {
        try {
          const parsed = JSON.parse(data)
          return parsed
        } catch (e) {
          console.error('Error parsing translations:', e)
          return {}
        }
      },
      reloadInterval: false // Отключаем автоматическую перезагрузку
    },

    // Поддерживаемые языки (полные локали)
    supportedLngs: ['ru-RU', 'en-US', 'pl-PL', 'ru', 'en'],

    // Язык по умолчанию
    fallbackLng: {
      default: ['en-US'],
      // Fallback логика: ru-BY -> ru-RU -> en-US
      'ru-BY': ['ru-RU', 'en-US'],
      'ru-KZ': ['ru-RU', 'en-US'],
      'ru': ['ru-RU', 'en-US'],
      'pl': ['pl-PL', 'en-US']
    },

    // Namespace по умолчанию
    defaultNS: 'translation',
    ns: ['translation'],

    // Интерполяция
    interpolation: {
      escapeValue: false // React уже экранирует значения
    },

    // Определение языка
    detection: {
      // Порядок определения языка
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Ключ для хранения выбранного языка в localStorage
      lookupLocalStorage: 'i18nextLng',
      // Кэшировать выбранный язык
      caches: ['localStorage'],
      // Конвертация локали (например, ru -> ru-RU)
      convertDetectedLanguage: (lng: string) => {
        // Если локаль уже полная (содержит дефис), возвращаем как есть
        if (lng.includes('-')) {
          return lng
        }
        
        // Конвертация простых кодов языка в полные локали
        const localeMap: Record<string, string> = {
          'ru': 'ru-RU',
          'en': 'en-US',
          'pl': 'pl-PL',
          'de': 'de-DE',
          'fr': 'fr-FR',
          'es': 'es-ES',
          'it': 'it-IT',
          'ja': 'ja-JP',
          'zh': 'zh-CN',
          'ko': 'ko-KR'
        }
        
        return localeMap[lng] || 'en-US'
      }
    },

    // Режим отладки (включен для диагностики)
    debug: true,

    // React опции
    react: {
      useSuspense: false // Отключаем Suspense, чтобы избежать проблем с SSR
    }
  })

export default i18n

