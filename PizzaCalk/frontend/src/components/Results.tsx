import { useState } from 'react'
import { User } from '../types'
import { ArrowLeft, RotateCcw, Pizza, Users, DollarSign, Gift } from 'lucide-react'

interface ResultsProps {
  result: any
  users: User[]
  onBack: () => void
  onNew: () => void
}

const Results = ({ result, users, onBack, onNew }: ResultsProps) => {
  const [showSettings, setShowSettings] = useState(false)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Результат расчета
        </h1>
        <p className="text-gray-600">
          Оптимальный заказ для вашей команды
        </p>
      </div>

      {/* Основная статистика */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-pizza-600 mb-1">
            {result.pizzaCount}
          </div>
          <div className="text-sm text-gray-600">Пицц</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {result.freePizzaCount}
          </div>
          <div className="text-sm text-gray-600">Бесплатных</div>
        </div>
      </div>

      {/* Стоимость */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {formatCurrency(result.totalCost)}
          </div>
          <div className="text-gray-600">Общая стоимость</div>
          {result.freePizzaValue > 0 && (
            <div className="text-green-600 text-sm mt-2">
              Экономия: {formatCurrency(result.freePizzaValue)}
            </div>
          )}
        </div>
      </div>

      {/* Детали заказа */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <h3 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
          <Pizza className="h-5 w-5" />
          <span>Заказанные пиццы</span>
        </h3>
        
        <div className="space-y-3">
          {result.optimalPizzas.map((pizza: any, index: number) => (
            <div key={pizza.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-pizza-100 text-pizza-600 rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {pizza.type} ({pizza.size})
                  </div>
                  <div className="text-sm text-gray-600">
                    {pizza.slices} кусков
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">
                  {formatCurrency(pizza.price)}
                </div>
                {pizza.isFree && (
                  <div className="text-green-600 text-sm">Бесплатная</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Участники */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <h3 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Участники ({users.length})</span>
        </h3>
        
        <div className="space-y-2">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{user.name}</div>
                <div className="text-sm text-gray-600">
                  Кусков: {user.minSlices} {user.canBeMore && '(можно больше)'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  ~{formatCurrency(result.totalCost / users.length)}
                </div>
                <div className="text-xs text-gray-500">за человека</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Кнопки действий */}
      <div className="space-y-3">
        <button
          onClick={onNew}
          className="w-full bg-pizza-600 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center space-x-2"
        >
          <RotateCcw className="h-5 w-5" />
          <span>Новый расчет</span>
        </button>
        
        <button
          onClick={onBack}
          className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Назад к редактированию</span>
        </button>
      </div>

      {/* Информация о бесплатных пиццах */}
      {result.freePizzaCount > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Gift className="h-5 w-5 text-green-600" />
            <h4 className="font-medium text-green-900">
              Бесплатные пиццы!
            </h4>
          </div>
          <p className="text-sm text-green-800">
            При заказе {result.pizzaCount} пицц вы получаете {result.freePizzaCount} бесплатных пицц.
            Это экономия {formatCurrency(result.freePizzaValue)}!
          </p>
        </div>
      )}
    </div>
  )
}

export default Results


