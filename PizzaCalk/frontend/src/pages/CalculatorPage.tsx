import { useState } from 'react'
import { User, User as UserType, PizzaType, SauceType } from '../types'
// import { UserManager, SauceManager, PizzaCalculator } from '../../shared/classes'
import UserForm from '../components/UserForm'
import PizzaSelector from '../components/PizzaSelector'
import SauceSelector from '../components/SauceSelector'
import CalculationResults from '../components/CalculationResults'
import { Plus, Users, Pizza, Utensils } from 'lucide-react'

interface CalculatorPageProps {
  currentUser: User | null
  isGuest: boolean
}

const CalculatorPage = ({ currentUser, isGuest }: CalculatorPageProps) => {
  const [users, setUsers] = useState<User[]>([])
  const [selectedPizzas, setSelectedPizzas] = useState<PizzaType[]>([])
  const [selectedSauces, setSelectedSauces] = useState<SauceType[]>([])
  const [calculationResult, setCalculationResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'users' | 'pizzas' | 'sauces' | 'results'>('users')

  const handleAddUser = (userData: { name: string; minSlices: number; maxSlices: number; preferredTypes?: string[] }) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userData.name,
      minSlices: userData.minSlices,
      maxSlices: userData.maxSlices,
      preferredTypes: userData.preferredTypes,
      personalSauces: [],
      totalCost: 0,
      assignedSlices: []
    }
    setUsers([...users, newUser])
  }

  const handleRemoveUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId))
  }

  const handleCalculate = () => {
    if (users.length === 0) {
      alert('Добавьте хотя бы одного участника')
      return
    }

    const order = {
      id: `order-${Date.now()}`,
      users,
      pizzas: [],
      sharedSauces: [],
      totalCost: 0,
      freePizzaCount: 0,
      createdAt: new Date()
    }

    // Простой расчет для демонстрации
    const totalSlices = users.reduce((sum, user) => sum + user.maxSlices, 0)
    const pizzaCount = Math.ceil(totalSlices / 8)
    const freePizzaCount = Math.floor(pizzaCount / 3)
    
    const result = {
      optimalPizzas: Array.from({ length: pizzaCount }, (_, i) => ({
        id: `pizza-${i}`,
        type: 'Маргарита',
        size: 'large',
        price: 800,
        slices: 8,
        isFree: i < freePizzaCount
      })),
      userCosts: {},
      totalCost: pizzaCount * 800,
      freePizzaValue: freePizzaCount * 800,
      distribution: {}
    }
    
    setCalculationResult(result)
    setActiveTab('results')
  }

  const tabs = [
    { id: 'users', label: 'Участники', icon: <Users className="h-5 w-5" />, count: users.length },
    { id: 'pizzas', label: 'Пиццы', icon: <Pizza className="h-5 w-5" />, count: selectedPizzas.length },
    { id: 'sauces', label: 'Соусы', icon: <Utensils className="h-5 w-5" />, count: selectedSauces.length },
    { id: 'results', label: 'Результат', icon: <Plus className="h-5 w-5" />, count: calculationResult ? 1 : 0 }
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Калькулятор закупок пиццы
        </h1>
        <p className="text-gray-600">
          Настройте параметры заказа и получите оптимальный расчет
        </p>
      </div>

      {/* Табы */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-pizza-500 text-pizza-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className="bg-pizza-100 text-pizza-800 text-xs px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Контент табов */}
      <div className="card">
        {activeTab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Участники заказа
              </h2>
              <span className="text-sm text-gray-500">
                {users.length} участников
              </span>
            </div>
            
            <UserForm onAddUser={handleAddUser} />
            
            {users.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Добавленные участники
                </h3>
                <div className="space-y-3">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">
                          Кусков: {user.minSlices} - {user.maxSlices}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveUser(user.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Удалить
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pizzas' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Выбор пицц
            </h2>
            <PizzaSelector 
              selectedPizzas={selectedPizzas}
              onPizzasChange={setSelectedPizzas}
            />
          </div>
        )}

        {activeTab === 'sauces' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Выбор соусов
            </h2>
            <SauceSelector 
              selectedSauces={selectedSauces}
              onSaucesChange={setSelectedSauces}
            />
          </div>
        )}

        {activeTab === 'results' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Результат расчета
            </h2>
            {calculationResult ? (
              <CalculationResults result={calculationResult} />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  Нажмите "Рассчитать" для получения результата
                </p>
                <button
                  onClick={handleCalculate}
                  className="btn-primary"
                  disabled={users.length === 0}
                >
                  Рассчитать
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Кнопка расчета */}
      {activeTab !== 'results' && (
        <div className="mt-8 text-center">
          <button
            onClick={handleCalculate}
            className="btn-primary text-lg px-8 py-3"
            disabled={users.length === 0}
          >
            Рассчитать оптимальный заказ
          </button>
        </div>
      )}
    </div>
  )
}

export default CalculatorPage
