import { useState } from 'react'
import { User } from '../types'
import { Settings, Save, RotateCcw, User as UserIcon, Bell, Globe, CreditCard } from 'lucide-react'

interface SettingsPageProps {
  currentUser: User | null
  isGuest: boolean
}

const SettingsPage = ({ currentUser, isGuest }: SettingsPageProps) => {
  const [settings, setSettings] = useState({
    currency: 'RUB',
    language: 'ru',
    notifications: true,
    autoSave: true,
    freePizzaThreshold: 3,
    freePizzaSize: 'medium' as 'small' | 'medium' | 'large' | 'xlarge'
  })

  const [userSettings, setUserSettings] = useState({
    name: currentUser?.name || '',
    email: '',
    defaultMinSlices: 1,
    defaultMaxSlices: 3
  })

  const handleSaveSettings = () => {
    // Здесь будет логика сохранения настроек
    alert('Настройки сохранены!')
  }

  const handleResetSettings = () => {
    if (confirm('Вы уверены, что хотите сбросить все настройки?')) {
      setSettings({
        currency: 'RUB',
        language: 'ru',
        notifications: true,
        autoSave: true,
        freePizzaThreshold: 3,
        freePizzaSize: 'medium'
      })
    }
  }

  if (isGuest) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-16">
          <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Настройки недоступны в гостевом режиме
          </h1>
          <p className="text-gray-600 mb-8">
            Войдите в аккаунт или создайте новый для доступа к настройкам
          </p>
          <a href="/auth" className="btn-primary">
            Войти в аккаунт
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Настройки
        </h1>
        <p className="text-gray-600">
          Настройте приложение под ваши предпочтения
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Основные настройки */}
        <div className="lg:col-span-2 space-y-6">
          {/* Общие настройки */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-6">
              <Settings className="h-5 w-5 text-pizza-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Общие настройки
              </h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Валюта
                  </label>
                  <select
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    className="input-field"
                  >
                    <option value="RUB">₽ Рубль</option>
                    <option value="USD">$ Доллар</option>
                    <option value="EUR">€ Евро</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Язык
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                    className="input-field"
                  >
                    <option value="ru">Русский</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                    className="rounded border-gray-300 text-pizza-600 focus:ring-pizza-500"
                  />
                  <span className="text-sm text-gray-700">
                    Уведомления о новых функциях
                  </span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.autoSave}
                    onChange={(e) => setSettings({ ...settings, autoSave: e.target.checked })}
                    className="rounded border-gray-300 text-pizza-600 focus:ring-pizza-500"
                  />
                  <span className="text-sm text-gray-700">
                    Автоматическое сохранение расчетов
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Настройки пиццы */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-6">
              <CreditCard className="h-5 w-5 text-pizza-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Настройки заказа
              </h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Количество пицц для бесплатной
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={settings.freePizzaThreshold}
                    onChange={(e) => setSettings({ ...settings, freePizzaThreshold: parseInt(e.target.value) || 3 })}
                    className="input-field"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Каждая {settings.freePizzaThreshold}-я пицца бесплатная
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Размер бесплатной пиццы
                  </label>
                  <select
                    value={settings.freePizzaSize}
                    onChange={(e) => setSettings({ ...settings, freePizzaSize: e.target.value as any })}
                    className="input-field"
                  >
                    <option value="small">Маленькая</option>
                    <option value="medium">Средняя</option>
                    <option value="large">Большая</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Профиль пользователя */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <UserIcon className="h-5 w-5 text-pizza-600" />
              <h3 className="font-semibold text-gray-900">
                Профиль
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Имя
                </label>
                <input
                  type="text"
                  value={userSettings.name}
                  onChange={(e) => setUserSettings({ ...userSettings, name: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={userSettings.email}
                  onChange={(e) => setUserSettings({ ...userSettings, email: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Мин. кусков
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={userSettings.defaultMinSlices}
                    onChange={(e) => setUserSettings({ ...userSettings, defaultMinSlices: parseInt(e.target.value) || 1 })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Макс. кусков
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={userSettings.defaultMaxSlices}
                    onChange={(e) => setUserSettings({ ...userSettings, defaultMaxSlices: parseInt(e.target.value) || 3 })}
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Действия */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">
              Действия
            </h3>

            <div className="space-y-3">
              <button
                onClick={handleSaveSettings}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Сохранить</span>
              </button>

              <button
                onClick={handleResetSettings}
                className="w-full btn-secondary flex items-center justify-center space-x-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Сбросить</span>
              </button>
            </div>
          </div>

          {/* Статистика */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">
              Статистика
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Всего расчетов:</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Сэкономлено:</span>
                <span className="font-medium text-green-600">2,500₽</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Последний расчет:</span>
                <span className="font-medium">2 дня назад</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage





