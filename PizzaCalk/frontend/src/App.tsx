import { useState } from 'react'
import { User } from './types'
import Header from './components/Header'
import CalculatorComponent from './components/Calculator'
import Results from './components/Results'

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isGuest, setIsGuest] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [result, setResult] = useState<any>(null)

  const handleLogin = (user: User) => {
    setCurrentUser(user)
    setIsGuest(false)
  }

  const handleGuestMode = () => {
    setCurrentUser(null)
    setIsGuest(true)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setIsGuest(false)
    setUsers([])
    setResult(null)
  }

  const handleShowResults = () => {
    if (users.length === 0) {
      alert('Добавьте хотя бы одного участника')
      return
    }

    // Расчет на лету
    const totalSlices = users.reduce((sum, user) => sum + user.minSlices, 0)
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
      totalCost: pizzaCount * 800,
      freePizzaValue: freePizzaCount * 800,
      totalUsers: users.length,
      totalSlices,
      pizzaCount,
      freePizzaCount,
      regularPizzaCount: pizzaCount - freePizzaCount
    }
    
    setResult(result)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentUser={currentUser}
        isGuest={isGuest}
        onLogout={handleLogout}
      />
      
      <main className="mx-auto px-4 py-4" style={{ maxWidth: '800px' }}>
        {!currentUser && !isGuest ? (
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🍕 PizzaCalk
            </h1>
            <p className="text-gray-600 mb-8">
              Калькулятор закупок пиццы для офиса
            </p>
            <div className="space-y-4">
              <button
                onClick={handleGuestMode}
                className="w-full bg-pizza-600 text-white py-3 px-6 rounded-lg font-medium"
              >
                Начать расчет
              </button>
              <button
                onClick={() => handleLogin({ id: 'demo', name: 'Демо пользователь', minSlices: 1, canBeMore: false, personalSauces: [], totalCost: 0, assignedSlices: [] })}
                className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium"
              >
                Войти в аккаунт
              </button>
            </div>
          </div>
        ) : result ? (
          <Results 
            result={result}
            users={users}
            onBack={() => setResult(null)}
            onNew={() => {
              setUsers([])
              setResult(null)
            }}
          />
        ) : (
          <CalculatorComponent 
            users={users}
            setUsers={setUsers}
            onShowResults={handleShowResults}
          />
        )}
      </main>
    </div>
  )
}

export default App