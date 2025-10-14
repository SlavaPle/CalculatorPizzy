import { useState } from 'react'
import { X, Trash2, Save } from 'lucide-react'
import NumericStepper from './NumericStepper'

export interface PizzaSettings {
  smallPizzaSlices: number
  largePizzaSlices: number
  largePizzaPrice: number
  smallPizzaPricePercent: number // процент цены маленькой от большой (0-100)
  freePizzaThreshold: number
  useFreePizza: boolean // использовать бесплатную пиццу
  freePizzaIsSmall: boolean // бесплатная пицца малая (иначе большая)
  smallEqual: boolean // вычисляемое: малая >= большой
}

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: PizzaSettings
  onSave: (settings: PizzaSettings) => void
}

const SettingsModal = ({ isOpen, onClose, settings, onSave }: SettingsModalProps) => {
  const [localSettings, setLocalSettings] = useState(settings)
  
  if (!isOpen) return null

  const handleSave = () => {
    // Пересчитываем smallEqual перед сохранением
    const updatedSettings = {
      ...localSettings,
      smallEqual: localSettings.smallPizzaSlices >= localSettings.largePizzaSlices
    }
    onSave(updatedSettings)
  }

  const handleClearSavedUsers = () => {
    if (confirm('Удалить всех сохраненных пользователей?')) {
      localStorage.removeItem('savedUsers')
      alert('Сохраненные пользователи удалены')
    }
  }

  const handleClearAll = () => {
    if (confirm('Очистить все данные приложения?')) {
      localStorage.clear()
      window.location.reload()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Настройки</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Контент */}
        <div className="p-4 space-y-6">
          {/* Настройки пиццы */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Настройки расчета</h3>
            <div className="space-y-4">
              <NumericStepper
                label="Кусков в маленькой пицце"
                value={localSettings.smallPizzaSlices}
                onChange={(value) => setLocalSettings({...localSettings, smallPizzaSlices: value})}
                min={4}
                max={10}
              />
              
              <NumericStepper
                label="Кусков в большой пицце"
                value={localSettings.largePizzaSlices}
                onChange={(value) => setLocalSettings({...localSettings, largePizzaSlices: value})}
                min={6}
                max={12}
              />
              
              <NumericStepper
                label="Цена маленькой относительно большой (%)"
                value={localSettings.smallPizzaPricePercent}
                onChange={(value) => setLocalSettings({...localSettings, smallPizzaPricePercent: value})}
                min={0}
                max={100}
                step={5}
              />
              
              <div className="border-t pt-4">
                <label className="flex items-center space-x-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={localSettings.useFreePizza}
                    onChange={(e) => setLocalSettings({...localSettings, useFreePizza: e.target.checked})}
                    className="h-4 w-4 text-pizza-600 focus:ring-pizza-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Бесплатная пицца при заказе</span>
                </label>
                
                {localSettings.useFreePizza && (
                  <>
                    <NumericStepper
                      label="Каждая N-я пицца бесплатная"
                      value={localSettings.freePizzaThreshold}
                      onChange={(value) => setLocalSettings({...localSettings, freePizzaThreshold: value})}
                      min={2}
                      max={10}
                    />
                    <label className="flex items-center space-x-2 cursor-pointer ml-4">
                      <input
                        type="checkbox"
                        checked={localSettings.freePizzaIsSmall}
                        onChange={(e) => setLocalSettings({...localSettings, freePizzaIsSmall: e.target.checked})}
                        className="h-4 w-4 text-pizza-600 focus:ring-pizza-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Малая пицца (иначе большая)</span>
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Управление данными */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Управление данными</h3>
            <div className="space-y-2">
              <button
                onClick={handleClearSavedUsers}
                className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-yellow-50 text-yellow-700 border border-yellow-300 rounded-lg hover:bg-yellow-100"
              >
                <Trash2 className="h-4 w-4" />
                <span>Очистить сохраненных пользователей</span>
              </button>
              
              <button
                onClick={handleClearAll}
                className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-red-50 text-red-700 border border-red-300 rounded-lg hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
                <span>Очистить все данные</span>
              </button>
            </div>
          </div>

          {/* Информация */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-900 mb-2">О приложении</h4>
            <p className="text-xs text-gray-600">
              PizzaCalk v1.0.0
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Калькулятор закупок пиццы для офисных работников
            </p>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="p-4 border-t border-gray-200 sticky bottom-0 bg-white space-y-2">
          <button
            onClick={handleSave}
            className="w-full bg-pizza-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-pizza-700 flex items-center justify-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Сохранить настройки</span>
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
