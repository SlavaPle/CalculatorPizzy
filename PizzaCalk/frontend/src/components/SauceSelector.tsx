import { useState } from 'react'
import { SauceType } from '../types'
import { Plus, Trash2 } from 'lucide-react'

interface SauceSelectorProps {
  selectedSauces: SauceType[]
  onSaucesChange: (sauces: SauceType[]) => void
}

const SauceSelector = ({ selectedSauces, onSaucesChange }: SauceSelectorProps) => {
  const [showForm, setShowForm] = useState(false)
  const [newSauce, setNewSauce] = useState({
    name: '',
    price: { small: 0, medium: 0, large: 0 }
  })

  const defaultSauceTypes: SauceType[] = [
    {
      id: 'tomato',
      name: 'Томатный соус',
      price: { small: 50, medium: 80, large: 120 }
    },
    {
      id: 'garlic',
      name: 'Чесночный соус',
      price: { small: 60, medium: 90, large: 130 }
    },
    {
      id: 'cheese',
      name: 'Сырный соус',
      price: { small: 70, medium: 100, large: 140 }
    },
    {
      id: 'bbq',
      name: 'Барбекю соус',
      price: { small: 65, medium: 95, large: 135 }
    }
  ]

  const handleAddSauce = (sauce: SauceType) => {
    if (!selectedSauces.find(s => s.id === sauce.id)) {
      onSaucesChange([...selectedSauces, sauce])
    }
  }

  const handleRemoveSauce = (sauceId: string) => {
    onSaucesChange(selectedSauces.filter(s => s.id !== sauceId))
  }

  const handleCreateCustomSauce = () => {
    if (!newSauce.name.trim()) {
      alert('Введите название соуса')
      return
    }

    const customSauce: SauceType = {
      id: `custom-sauce-${Date.now()}`,
      name: newSauce.name,
      price: newSauce.price
    }

    onSaucesChange([...selectedSauces, customSauce])
    setNewSauce({
      name: '',
      price: { small: 0, medium: 0, large: 0 }
    })
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      {/* Предустановленные соусы */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Популярные соусы
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {defaultSauceTypes.map((sauce) => (
            <div key={sauce.id} className="border border-gray-200 rounded-lg p-4 hover:border-pizza-300 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{sauce.name}</h4>
                <button
                  onClick={() => handleAddSauce(sauce)}
                  className="btn-primary text-sm py-1 px-3"
                  disabled={selectedSauces.some(s => s.id === sauce.id)}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Маленький:</span>
                  <span>{sauce.price.small}₽</span>
                </div>
                <div className="flex justify-between">
                  <span>Средний:</span>
                  <span>{sauce.price.medium}₽</span>
                </div>
                <div className="flex justify-between">
                  <span>Большой:</span>
                  <span>{sauce.price.large}₽</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Создание кастомного соуса */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Создать кастомный соус
          </h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-secondary text-sm"
          >
            {showForm ? 'Скрыть' : 'Создать'}
          </button>
        </div>

        {showForm && (
          <div className="border border-gray-200 rounded-lg p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название соуса
              </label>
              <input
                type="text"
                value={newSauce.name}
                onChange={(e) => setNewSauce({ ...newSauce, name: e.target.value })}
                className="input-field"
                placeholder="Введите название"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Цены по размерам
              </label>
              <div className="grid grid-cols-3 gap-4">
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <div key={size} className="space-y-2">
                    <label className="block text-sm text-gray-600 capitalize">
                      {size === 'small' ? 'Маленький' : size === 'medium' ? 'Средний' : 'Большой'}
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        value={newSauce.price[size]}
                        onChange={(e) => setNewSauce({
                          ...newSauce,
                          price: { ...newSauce.price, [size]: parseInt(e.target.value) || 0 }
                        })}
                        className="input-field text-sm"
                        placeholder="0"
                      />
                      <span className="text-sm text-gray-500">₽</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCreateCustomSauce}
                className="btn-primary flex-1"
              >
                Создать соус
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="btn-secondary flex-1"
              >
                Отмена
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Выбранные соусы */}
      {selectedSauces.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Выбранные соусы ({selectedSauces.length})
          </h3>
          <div className="space-y-2">
            {selectedSauces.map((sauce) => (
              <div key={sauce.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900">{sauce.name}</span>
                  <span className="text-sm text-gray-600 ml-2">
                    от {Math.min(...Object.values(sauce.price))}₽
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveSauce(sauce.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Информация о соусах */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">
          Как работают соусы?
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Персональные соусы</strong> - добавляются к стоимости конкретного участника</li>
          <li>• <strong>Общие соусы</strong> - делятся поровну между всеми участниками</li>
          <li>• Каждый участник может выбрать свои персональные соусы в следующем шаге</li>
        </ul>
      </div>
    </div>
  )
}

export default SauceSelector





