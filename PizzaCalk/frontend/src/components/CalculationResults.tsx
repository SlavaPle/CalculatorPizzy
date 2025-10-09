import { useState } from 'react'
import { CalculationResult } from '../types'
import { Users, Pizza, Utensils, DollarSign, Download, Share2 } from 'lucide-react'

interface CalculationResultsProps {
  result: CalculationResult
}

const CalculationResults = ({ result }: CalculationResultsProps) => {
  const [activeView, setActiveView] = useState<'summary' | 'detailed' | 'visualization'>('summary')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const handleExport = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      totalCost: result.totalCost,
      freePizzaValue: result.freePizzaValue,
      pizzas: result.optimalPizzas,
      userCosts: result.userCosts,
      distribution: result.distribution
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pizza-calculation-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleShare = async () => {
    const shareText = `🍕 Расчет заказа пиццы\n\nОбщая стоимость: ${formatCurrency(result.totalCost)}\nКоличество пицц: ${result.optimalPizzas.length}\nБесплатных пицц: ${result.optimalPizzas.filter(p => p.isFree).length}\n\nДетали в PizzaCalk`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Расчет заказа пиццы',
          text: shareText
        })
      } catch (err) {
        console.log('Ошибка при попытке поделиться:', err)
      }
    } else {
      // Fallback для браузеров без поддержки Web Share API
      navigator.clipboard.writeText(shareText)
      alert('Информация скопирована в буфер обмена')
    }
  }

  return (
    <div className="space-y-6">
      {/* Заголовок с действиями */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">
          Результат расчета
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={handleExport}
            className="btn-secondary text-sm flex items-center space-x-1"
          >
            <Download className="h-4 w-4" />
            <span>Экспорт</span>
          </button>
          <button
            onClick={handleShare}
            className="btn-primary text-sm flex items-center space-x-1"
          >
            <Share2 className="h-4 w-4" />
            <span>Поделиться</span>
          </button>
        </div>
      </div>

      {/* Переключатель представлений */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'summary', label: 'Сводка', icon: <DollarSign className="h-4 w-4" /> },
          { id: 'detailed', label: 'Детали', icon: <Users className="h-4 w-4" /> },
          { id: 'visualization', label: 'Визуализация', icon: <Pizza className="h-4 w-4" /> }
        ].map((view) => (
          <button
            key={view.id}
            onClick={() => setActiveView(view.id as any)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === view.id
                ? 'bg-white text-pizza-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {view.icon}
            <span>{view.label}</span>
          </button>
        ))}
      </div>

      {/* Сводка */}
      {activeView === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card text-center">
            <div className="text-3xl font-bold text-pizza-600 mb-2">
              {formatCurrency(result.totalCost)}
            </div>
            <div className="text-gray-600">Общая стоимость</div>
          </div>
          
          <div className="card text-center">
            <div className="text-3xl font-bold text-pizza-600 mb-2">
              {result.optimalPizzas.length}
            </div>
            <div className="text-gray-600">Всего пицц</div>
          </div>
          
          <div className="card text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {result.optimalPizzas.filter(p => p.isFree).length}
            </div>
            <div className="text-gray-600">Бесплатных пицц</div>
          </div>
        </div>
      )}

      {/* Детальная информация */}
      {activeView === 'detailed' && (
        <div className="space-y-6">
          {/* Список пицц */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Заказанные пиццы
            </h4>
            <div className="space-y-3">
              {result.optimalPizzas.map((pizza, index) => (
                <div key={pizza.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-pizza-100 text-pizza-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {pizza.type} ({pizza.size})
                      </div>
                      <div className="text-sm text-gray-600">
                        {pizza.slices} кусков • {formatCurrency(pizza.price)}
                        {pizza.isFree && <span className="text-green-600 ml-2">• Бесплатная</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Распределение по пользователям */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Распределение стоимости
            </h4>
            <div className="space-y-3">
              {Object.entries(result.distribution).map(([userId, userData]) => (
                <div key={userId} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">
                      Пользователь {userId}
                    </div>
                    <div className="text-lg font-bold text-pizza-600">
                      {formatCurrency(userData.cost)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Кусков: {userData.slices.length} • Соусов: {userData.sauces.length}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Визуализация */}
      {activeView === 'visualization' && (
        <div className="space-y-6">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Визуализация заказа
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {result.optimalPizzas.map((pizza, index) => (
                <div key={pizza.id} className="text-center">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white font-bold text-lg mb-2 ${
                    pizza.isFree ? 'bg-green-500' : 'bg-pizza-500'
                  }`}>
                    🍕
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {pizza.type}
                  </div>
                  <div className="text-xs text-gray-600">
                    {pizza.slices} кусков
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatCurrency(pizza.price)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* График распределения */}
          <div className="bg-white p-6 rounded-lg border">
            <h5 className="font-medium text-gray-900 mb-4">
              Распределение стоимости
            </h5>
            <div className="space-y-3">
              {Object.entries(result.distribution).map(([userId, userData]) => {
                const percentage = (userData.cost / result.totalCost) * 100
                return (
                  <div key={userId} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Пользователь {userId}</span>
                      <span>{formatCurrency(userData.cost)} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-pizza-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CalculationResults





