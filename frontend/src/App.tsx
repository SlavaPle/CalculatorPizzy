import { useState } from 'react'
import { User } from './types'
import Header from './components/Header'
import CalculatorComponent from './components/Calculator'
import Results from './components/Results'

import { CalculationResultStore } from './utils/CalculationResultStore'

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
    CalculationResultStore.getInstance().clear()
  }

  const handleShowResults = (calculationData: any) => {
    if (users.length === 0) {
      alert('Add at least one participant')
      return
    }

    // Get data from Singleton (preferred) or argument
    const storeData = CalculationResultStore.getInstance().getData()
    const { pizzaList, userSlicesDistribution } = storeData || calculationData

    // Calculate statistics
    const pizzaCount = pizzaList.length
    const freePizzaCount = pizzaList.filter((p: any) => p.isFree).length
    const totalSlices = pizzaList.reduce((sum: number, p: any) => sum + p.slices, 0)

    const result = {
      optimalPizzas: pizzaList.map((pizza: any, i: number) => ({
        id: `pizza-${i}`,
        type: pizza.type || 'Margherita',
        size: pizza.size,
        price: pizza.price,
        slices: pizza.slices,
        isFree: pizza.isFree
      })),
      totalCost: pizzaList.reduce((sum: number, p: any) => sum + (p.isFree ? 0 : p.price), 0),
      freePizzaValue: pizzaList.filter((p: any) => p.isFree).reduce((sum: number, p: any) => sum + p.price, 0),
      totalUsers: users.length,
      totalSlices,
      pizzaCount,
      freePizzaCount,
      regularPizzaCount: pizzaCount - freePizzaCount,
      userSlicesDistribution, // Pass slice distribution
      calculationData: storeData || calculationData // Pass all calculation data
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
              Pizza purchase calculator for office
            </p>
            <div className="space-y-4">
              <button
                onClick={handleGuestMode}
                className="w-full bg-pizza-600 text-white py-3 px-6 rounded-lg font-medium"
              >
                Start calculation
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