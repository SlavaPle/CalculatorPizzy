import { useState } from 'react'
import { User } from '../types'
import { Settings, Save, RotateCcw, User as UserIcon, CreditCard } from 'lucide-react'

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
    // Logic for saving settings will be here
    alert('Settings saved!')
  }

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings?')) {
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
            Settings unavailable in guest mode
          </h1>
          <p className="text-gray-600 mb-8">
            Login to your account or create a new one to access settings
          </p>
          <a href="/auth" className="btn-primary">
            Login to account
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Settings
        </h1>
        <p className="text-gray-600">
          Configure the app to your preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* General settings */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-6">
              <Settings className="h-5 w-5 text-pizza-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                General settings
              </h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    className="input-field"
                  >
                    <option value="RUB">₽ Ruble</option>
                    <option value="USD">$ Dollar</option>
                    <option value="EUR">€ Euro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                    className="input-field"
                  >
                    <option value="ru">Russian</option>
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
                    Notifications about new features
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
                    Automatic saving of calculations
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Pizza settings */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-6">
              <CreditCard className="h-5 w-5 text-pizza-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Order settings
              </h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of pizzas for free one
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
                    Every {settings.freePizzaThreshold}th pizza is free
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Free pizza size
                  </label>
                  <select
                    value={settings.freePizzaSize}
                    onChange={(e) => setSettings({ ...settings, freePizzaSize: e.target.value as any })}
                    className="input-field"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User profile */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <UserIcon className="h-5 w-5 text-pizza-600" />
              <h3 className="font-semibold text-gray-900">
                Profile
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
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
                    Min. slices
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
                    Max. slices
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

          {/* Actions */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">
              Actions
            </h3>

            <div className="space-y-1 sm: space-y-3">
              <button
                onClick={handleSaveSettings}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Save</span>
              </button>

              <button
                onClick={handleResetSettings}
                className="w-full btn-secondary flex items-center justify-center space-x-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">
              Statistics
            </h3>

            <div className="space-y-1 sm: space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total calculations:</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Saved:</span>
                <span className="font-medium text-green-600">2,500₽</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last calculation:</span>
                <span className="font-medium">2 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage









