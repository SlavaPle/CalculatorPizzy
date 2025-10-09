import { User } from '../types'
import { ArrowLeft, Calculator, Pizza, Users, Gift, CheckCircle } from 'lucide-react'

interface PizzaCalculationProps {
  calculation: any
  users: User[]
  onBack: () => void
  onFinalCalculate: () => void
}

const PizzaCalculation = ({ calculation, users, onBack, onFinalCalculate }: PizzaCalculationProps) => {
  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Расчет количества пицц
        </h1>
        <p className="text-gray-600">
          Проверьте расчет и подтвердите заказ
        </p>
      </div>

      {/* Основная статистика */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-pizza-600 mb-1">
            {calculation.totalSlices}
          </div>
          <div className="text-sm text-gray-600">Всего кусков</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {calculation.pizzaCount}
          </div>
          <div className="text-sm text-gray-600">Пицц нужно</div>
        </div>
      </div>

      {/* Детали расчета */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <h3 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
          <Calculator className="h-5 w-5" />
          <span>Детали расчета</span>
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Участников:</span>
            <span className="font-medium">{calculation.totalUsers}</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Желаемых кусков:</span>
            <span className="font-medium">{calculation.totalSlices}</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Кусков в пицце:</span>
            <span className="font-medium">8</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-blue-700 font-medium">Пицц нужно:</span>
            <span className="font-bold text-blue-900">{calculation.pizzaCount}</span>
          </div>
        </div>
      </div>

      {/* Бесплатные пиццы */}
      {calculation.freePizzaCount > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Gift className="h-5 w-5 text-green-600" />
            <h4 className="font-medium text-green-900">
              Бесплатные пиццы!
            </h4>
          </div>
          <p className="text-sm text-green-800 mb-3">
            При заказе {calculation.pizzaCount} пицц вы получаете {calculation.freePizzaCount} бесплатных пицц.
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span>Платных пицц:</span>
              <span className="font-medium">{calculation.regularPizzaCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Бесплатных пицц:</span>
              <span className="font-medium text-green-600">{calculation.freePizzaCount}</span>
            </div>
          </div>
        </div>
      )}

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
                  Кусков: {user.minSlices} - {user.maxSlices}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  {user.maxSlices} кусков
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Кнопки действий */}
      <div className="space-y-3">
        <button
          onClick={onFinalCalculate}
          className="w-full bg-pizza-600 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center space-x-2"
        >
          <CheckCircle className="h-5 w-5" />
          <span>Подтвердить заказ</span>
        </button>
        
        <button
          onClick={onBack}
          className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Назад к редактированию</span>
        </button>
      </div>

      {/* Информация */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">
          Что дальше?
        </h4>
        <p className="text-sm text-blue-800">
          После подтверждения вы увидите детальный расчет стоимости, 
          распределение по участникам и сможете поделиться результатом.
        </p>
      </div>
    </div>
  )
}

export default PizzaCalculation




