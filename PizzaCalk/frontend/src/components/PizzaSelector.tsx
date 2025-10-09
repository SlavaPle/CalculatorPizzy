import { useState } from 'react'
import { PizzaType } from '../types'
import { Plus, Trash2 } from 'lucide-react'

interface PizzaSelectorProps {
  selectedPizzas: PizzaType[]
  onPizzasChange: (pizzas: PizzaType[]) => void
}

const PizzaSelector = ({ selectedPizzas, onPizzasChange }: PizzaSelectorProps) => {
  const [showForm, setShowForm] = useState(false)
  const [newPizza, setNewPizza] = useState({
    name: '',
    basePrice: { small: 0, medium: 0, large: 0, xlarge: 0 },
    slices: { small: 4, medium: 6, large: 8, xlarge: 10 }
  })

  const defaultPizzaTypes: PizzaType[] = [
    {
      id: 'margherita',
      name: 'Маргарита',
      basePrice: { small: 400, medium: 600, large: 800, xlarge: 1000 },
      slices: { small: 4, medium: 6, large: 8, xlarge: 10 }
    },
    {
      id: 'pepperoni',
      name: 'Пепперони',
      basePrice: { small: 500, medium: 750, large: 1000, xlarge: 1250 },
      slices: { small: 4, medium: 6, large: 8, xlarge: 10 }
    },
    {
      id: 'four-cheese',
      name: 'Четыре сыра',
      basePrice: { small: 450, medium: 675, large: 900, xlarge: 1125 },
      slices: { small: 4, medium: 6, large: 8, xlarge: 10 }
    },
    {
      id: 'hawaiian',
      name: 'Гавайская',
      basePrice: { small: 480, medium: 720, large: 960, xlarge: 1200 },
      slices: { small: 4, medium: 6, large: 8, xlarge: 10 }
    }
  ]

  const handleAddPizza = (pizza: PizzaType) => {
    if (!selectedPizzas.find(p => p.id === pizza.id)) {
      onPizzasChange([...selectedPizzas, pizza])
    }
  }

  const handleRemovePizza = (pizzaId: string) => {
    onPizzasChange(selectedPizzas.filter(p => p.id !== pizzaId))
  }

  const handleCreateCustomPizza = () => {
    if (!newPizza.name.trim()) {
      alert('Введите название пиццы')
      return
    }

    const customPizza: PizzaType = {
      id: `custom-${Date.now()}`,
      name: newPizza.name,
      basePrice: newPizza.basePrice,
      slices: newPizza.slices
    }

    onPizzasChange([...selectedPizzas, customPizza])
    setNewPizza({
      name: '',
      basePrice: { small: 0, medium: 0, large: 0, xlarge: 0 },
      slices: { small: 4, medium: 6, large: 8, xlarge: 10 }
    })
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      {/* Предустановленные пиццы */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Популярные пиццы
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {defaultPizzaTypes.map((pizza) => (
            <div key={pizza.id} className="border border-gray-200 rounded-lg p-4 hover:border-pizza-300 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{pizza.name}</h4>
                <button
                  onClick={() => handleAddPizza(pizza)}
                  className="btn-primary text-sm py-1 px-3"
                  disabled={selectedPizzas.some(p => p.id === pizza.id)}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Маленькая:</span>
                  <span>{pizza.basePrice.small}₽ ({pizza.slices.small} кусков)</span>
                </div>
                <div className="flex justify-between">
                  <span>Средняя:</span>
                  <span>{pizza.basePrice.medium}₽ ({pizza.slices.medium} кусков)</span>
                </div>
                <div className="flex justify-between">
                  <span>Большая:</span>
                  <span>{pizza.basePrice.large}₽ ({pizza.slices.large} кусков)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Создание кастомной пиццы */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Создать кастомную пиццу
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
                Название пиццы
              </label>
              <input
                type="text"
                value={newPizza.name}
                onChange={(e) => setNewPizza({ ...newPizza, name: e.target.value })}
                className="input-field"
                placeholder="Введите название"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Цены по размерам
                </label>
                <div className="space-y-2">
                  {(['small', 'medium', 'large', 'xlarge'] as const).map((size) => (
                    <div key={size} className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 w-16 capitalize">{size}:</span>
                      <input
                        type="number"
                        min="0"
                        value={newPizza.basePrice[size]}
                        onChange={(e) => setNewPizza({
                          ...newPizza,
                          basePrice: { ...newPizza.basePrice, [size]: parseInt(e.target.value) || 0 }
                        })}
                        className="input-field text-sm"
                        placeholder="0"
                      />
                      <span className="text-sm text-gray-500">₽</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Количество кусков
                </label>
                <div className="space-y-2">
                  {(['small', 'medium', 'large', 'xlarge'] as const).map((size) => (
                    <div key={size} className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 w-16 capitalize">{size}:</span>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={newPizza.slices[size]}
                        onChange={(e) => setNewPizza({
                          ...newPizza,
                          slices: { ...newPizza.slices, [size]: parseInt(e.target.value) || 4 }
                        })}
                        className="input-field text-sm"
                      />
                      <span className="text-sm text-gray-500">кусков</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCreateCustomPizza}
                className="btn-primary flex-1"
              >
                Создать пиццу
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

      {/* Выбранные пиццы */}
      {selectedPizzas.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Выбранные пиццы ({selectedPizzas.length})
          </h3>
          <div className="space-y-2">
            {selectedPizzas.map((pizza) => (
              <div key={pizza.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900">{pizza.name}</span>
                  <span className="text-sm text-gray-600 ml-2">
                    от {Math.min(...Object.values(pizza.basePrice))}₽
                  </span>
                </div>
                <button
                  onClick={() => handleRemovePizza(pizza.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PizzaSelector





