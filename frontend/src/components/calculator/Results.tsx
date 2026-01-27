import { useState, useMemo } from 'react'
import { User } from '../../shared/types'
import { ArrowLeft, RotateCcw, Users } from 'lucide-react'
import { CalculationResultStore } from '../../utils/CalculationResultStore'
import { calculateSlicePrice, calculateSimpleSlicePrice } from '../../utils/calculations/pizzaOptimization'
import { getSliceSizeClass } from '../../utils/sliceSizeClass'
import PizzaSlice from '../common/PizzaSlice'

/** Koszt listy kawałków (proportional): duże×cena duży, małe×cena mały. Używane dla użytkowników i extra slices. */
function calcSlicesCostBySize(
  slices: Array<{ size: 'small' | 'large' }>,
  prices: { large: number; small: number }
): number {
  return slices.reduce((sum, s) => sum + (s.size === 'small' ? prices.small : prices.large), 0)
}

interface ResultsProps {
  result: any
  users: User[]
  onBack: () => void
  onNew: () => void
}

const Results = ({ result, users, onBack, onNew }: ResultsProps) => {
  const [orderAmount, setOrderAmount] = useState<string>(() => {
    const storeData = CalculationResultStore.getInstance().getData()
    return storeData?.orderAmount || ''
  })
  const [splitCommonSlices, setSplitCommonSlices] = useState(false)

  const handleOrderAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value

    // Validation: allow empty string or positive number with max 2 decimal places
    if (newValue === '' || /^\d*\.?\d{0,2}$/.test(newValue)) {
      setOrderAmount(newValue)
      const store = CalculationResultStore.getInstance()
      const data = store.getData()
      if (data) {
        store.setData({ ...data, orderAmount: newValue })
      }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Calculate total slices with metadata (PizzaSlice[]) — z pizzaList gdy dostępne (zgodne id z distribution)
  const totalSlices = useMemo(() => {
    const allSlices: any[] = []
    const source = result.calculationData?.pizzaList || result.optimalPizzas
    source.forEach((pizza: any) => {
      const pizzaType = pizza.type || 'Margherita'
      const pricePerSlice = calculateSimpleSlicePrice(pizza.price, pizza.slices, pizza.isFree || false)
      for (let i = 0; i < pizza.slices; i++) {
        allSlices.push({
          id: `slice-${pizza.id}-${i}`,
          pizzaId: pizza.id,
          type: pizzaType,
          price: pricePerSlice,
          size: pizza.size
        })
      }
    })
    return allSlices
  }, [result.optimalPizzas, result.calculationData?.pizzaList])

  // Price per slice
  const pricePerSlice = useMemo(() => {
    const amount = parseFloat(orderAmount) || 0
    return amount > 0 ? amount / totalSlices.length : 0
  }, [orderAmount, totalSlices])

  // Расчет цен кусков (для proportional-price схемы)
  const pizzaSettings = result.calculationData?.pizzaSettings

  // Rozkład Large/Small jak w PizzaVariantsPanel (dla equal i proportional)
  const pizzaStats = useMemo(() => {
    // Используем активный список пицц из calculationData, если доступен
    const pizzas = result.calculationData?.pizzaList || result.optimalPizzas || []
    const large = pizzas.filter((p: any) => p.size === 'large').length
    const small = pizzas.filter((p: any) => p.size === 'small').length
    let label = 'Pizzas'
    let countDisplay: string | number = pizzas.length
    if (large > 0 && small > 0) {
      countDisplay = `${large} (${small})`
      label = 'Large (small) pizzas'
    } else if (large === 0 && small > 0) {
      countDisplay = small
      label = 'Small pizzas'
    } else if (large > 0 && small === 0) {
      countDisplay = large
      label = 'Large pizzas'
    }
    return { large, small, label, countDisplay }
  }, [result.optimalPizzas, result.calculationData?.pizzaList, result.pizzaCount])

  // Пересчитываем количество бесплатных пицц на основе активного списка
  // Учитываем только те пиццы, которые изначально были большими (не малые пиццы, добавленные принудительно)
  const freePizzaCount = useMemo(() => {
    const pizzas = result.calculationData?.pizzaList || result.optimalPizzas || []
    // Считаем только бесплатные пиццы, которые были изначально большими
    // (малые пиццы, добавленные принудительно, имеют isFree: false)
    return pizzas.filter((p: any) => p.isFree).length
  }, [result.optimalPizzas, result.calculationData?.pizzaList])

  // Distribute slices among users
  const userSlicesDistribution = useMemo(() => {
    // Use data from passed result if available
    if (result.userSlicesDistribution) {
      return result.userSlicesDistribution
    }
    // Otherwise use minSlices as fallback
    const distribution: { [key: string]: number } = {}
    users.forEach(user => {
      distribution[user.id] = user.minSlices
    })
    return distribution
  }, [users, result.userSlicesDistribution])

  // Calculate shared slices (extra)
  const totalUserSlices = useMemo(() => {
    // Если userSlicesDistribution содержит PizzaSlice[], используем length
    if (userSlicesDistribution && typeof Object.values(userSlicesDistribution)[0] === 'object' && Array.isArray(Object.values(userSlicesDistribution)[0])) {
      return Object.values(userSlicesDistribution as Record<string, any[]>).reduce((sum: number, slices: any[]) => sum + slices.length, 0)
    }
    // Иначе используем число
    return Object.values(userSlicesDistribution as Record<string, number>).reduce((sum: number, val: number) => sum + val, 0)
  }, [userSlicesDistribution])

  const commonSlices = totalSlices.length - totalUserSlices

  // Lista extra slices z size (do sliceSizeClass) — wykluczamy przypisane użytkownikom
  const commonSlicesList = useMemo(() => {
    const hasSliceArrays = userSlicesDistribution && typeof Object.values(userSlicesDistribution)[0] === 'object' && Array.isArray(Object.values(userSlicesDistribution)[0])
    if (!hasSliceArrays) return []
    const assignedIds = new Set<string>()
    users.forEach(u => {
      const arr = (userSlicesDistribution as Record<string, any[]>)[u.id]
      if (Array.isArray(arr)) arr.forEach((s: any) => assignedIds.add(s.id))
    })
    return totalSlices.filter((s: any) => !assignedIds.has(s.id))
  }, [totalSlices, userSlicesDistribution, users])

  // Ceny za duży/mały kawałek (proportional) — do kosztu extra slices
  const proportionalSlicePrices = useMemo(() => {
    if (pizzaSettings?.calculationScheme !== 'proportional-price' || !pizzaSettings) return null
    const amount = parseFloat(orderAmount) || 0
    if (amount <= 0) return { large: 0, small: 0 }
    const large = calculateSlicePrice(amount, totalSlices, pizzaSettings)
    const small = large * pizzaSettings.smallPizzaPricePercent / 100
    return { large, small }
  }, [orderAmount, totalSlices, pizzaSettings])

  // Koszt extra slices — proportional: calcSlicesCostBySize; equal: wszystkie×pricePerSlice
  const commonSlicesCost = useMemo(() => {
    if (proportionalSlicePrices && commonSlicesList.length > 0) {
      return calcSlicesCostBySize(commonSlicesList, proportionalSlicePrices)
    }
    return commonSlices * pricePerSlice
  }, [proportionalSlicePrices, commonSlicesList, commonSlices, pricePerSlice])

  // Obliczamy koszty użytkowników i ekstra, korygując różnicę w 1 cent
  const { userCosts, adjustedCommonSlicesCost } = useMemo(() => {
    // Funkcja do zaokrąglenia do 2 miejsc po przecinku
    const roundTo2Decimals = (value: number): number => {
      return Math.round(value * 100) / 100
    }

    // Obliczamy bazowe koszty użytkowników
    const baseUserCosts: { [userId: string]: number } = {}
    users.forEach(user => {
      const userSlices = userSlicesDistribution[user.id]
      let cost = 0
      if (Array.isArray(userSlices)) {
        if (proportionalSlicePrices && parseFloat(orderAmount) > 0) {
          cost = calcSlicesCostBySize(userSlices, proportionalSlicePrices)
        } else {
          // equal-price: wszystkie kawałki po tej samej cenie = orderAmount / totalSlices
          const sliceCount = userSlices.length
          cost = sliceCount * pricePerSlice
        }
      } else {
        const sliceCount = userSlices || 0
        cost = sliceCount * pricePerSlice
      }
      baseUserCosts[user.id] = roundTo2Decimals(cost)
    })

    // Jeśli ekstra jest rozdzielony między użytkowników
    let adjustedUserCosts = { ...baseUserCosts }
    let adjustedCommonCost = roundTo2Decimals(commonSlicesCost)

    if (splitCommonSlices && users.length > 0) {
      const extraPerUser = roundTo2Decimals(commonSlicesCost / users.length)
      users.forEach(user => {
        adjustedUserCosts[user.id] = roundTo2Decimals(adjustedUserCosts[user.id] + extraPerUser)
      })
    }

    // Obliczamy całkowitą sumę zamówienia
    const totalOrderAmount = parseFloat(orderAmount) || 0

    // Obliczamy sumę wszystkich kosztów (użytkownicy + ekstra jeśli nie rozdzielony)
    const totalUserCostsSum = Object.values(adjustedUserCosts).reduce((sum, cost) => sum + cost, 0)
    const totalPaidCost = splitCommonSlices ? totalUserCostsSum : totalUserCostsSum + adjustedCommonCost

    // Sprawdzamy różnicę i korygujemy, jeśli brakuje około 1 cent
    // Powtarzamy korektę, aż różnica będzie mniejsza niż 0.005 (z uwzględnieniem błędów zaokrąglenia)
    let currentDifference = totalOrderAmount - totalPaidCost
    
    // Maksymalnie 10 iteracji, aby uniknąć nieskończonej pętli
    for (let i = 0; i < 10 && currentDifference > 0.005; i++) {
      // Obliczamy aktualną sumę po poprzednich korektach
      const currentTotalUserCostsSum = Object.values(adjustedUserCosts).reduce((sum, cost) => sum + cost, 0)
      const currentTotalPaidCost = splitCommonSlices ? currentTotalUserCostsSum : currentTotalUserCostsSum + adjustedCommonCost
      currentDifference = totalOrderAmount - currentTotalPaidCost
      
      // Jeśli brakuje więcej niż 0.005, dodajemy 1 cent
      if (currentDifference > 0.005) {
        if (!splitCommonSlices) {
          // Jeśli ekstra nie jest rozdzielony - dodajemy 1 cent do ekstra
          adjustedCommonCost = roundTo2Decimals(adjustedCommonCost + 0.01)
        } else {
          // Jeśli ekstra jest rozdzielony - dodajemy po 1 cent do każdego użytkownika z minimalną sumą
          const minCost = Math.min(...Object.values(adjustedUserCosts))
          const usersWithMinCost = Object.entries(adjustedUserCosts)
            .filter(([_, cost]) => Math.abs(cost - minCost) < 0.001)
            .map(([userId]) => userId)

          usersWithMinCost.forEach(userId => {
            adjustedUserCosts[userId] = roundTo2Decimals(adjustedUserCosts[userId] + 0.01)
          })
        }
      }
    }

    // Zaokrąglamy wszystkie koszty użytkowników do 2 miejsc po przecinku przed zwróceniem
    const finalUserCosts: { [userId: string]: number } = {}
    Object.entries(adjustedUserCosts).forEach(([userId, cost]) => {
      finalUserCosts[userId] = roundTo2Decimals(cost)
    })

    return { userCosts: finalUserCosts, adjustedCommonSlicesCost: roundTo2Decimals(adjustedCommonCost) }
  }, [users, userSlicesDistribution, proportionalSlicePrices, orderAmount, pricePerSlice, commonSlicesCost, splitCommonSlices])

  // Koszt użytkownika — używamy skorygowanych wartości
  const getUserCost = (userId: string) => {
    return userCosts[userId] || 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Calculation result
        </h1>
      </div>

      {/* Main statistics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-pizza-600 mb-1">
            {pizzaStats.countDisplay}
          </div>
          <div className="text-sm text-gray-600">{pizzaStats.label}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {freePizzaCount}
          </div>
          <div className="text-sm text-gray-600">Free</div>
        </div>
      </div>

      {/* Order amount input */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 flex items-center gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order amount
          </label>
          <input
            type="number"
            value={orderAmount}
            onChange={handleOrderAmountChange}
            placeholder="Enter order amount"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pizza-500 focus:border-pizza-500 text-lg"
          />
        </div>

        {pricePerSlice > 0 && (
          <div className="text-right pl-4 border-l border-gray-200 min-w-[7.5rem]">
            <div className="text-gray-600 text-sm mb-1 whitespace-nowrap">Price per slice</div>
            {pizzaSettings?.calculationScheme === 'proportional-price' && pizzaSettings ? (
              <div className="space-y-1">
                <div className="text-lg font-bold text-blue-600">
                  Large: {formatCurrency(calculateSlicePrice(parseFloat(orderAmount) || 0, totalSlices, pizzaSettings))}
                </div>
                <div className="text-lg font-bold text-green-600">
                  Small: {formatCurrency(calculateSlicePrice(parseFloat(orderAmount) || 0, totalSlices, pizzaSettings) * pizzaSettings.smallPizzaPricePercent / 100)}
                </div>
              </div>
            ) : (
              <div className="text-2xl font-bold text-pizza-600">
                {formatCurrency(pricePerSlice)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Participants */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <h3 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Participants ({users.length})</span>
        </h3>

        <div className="space-y-1 sm: space-y-3">
          {users.map((user) => {
            const userSlices = userSlicesDistribution[user.id]
            const sliceCount = Array.isArray(userSlices) ? userSlices.length : (userSlices || 0)
            
            return (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="font-medium text-gray-900">{user.name}</div>
                  {/* Pizza slices visualization — małe pomniejszone przy proportional jak w UserList */}
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(userSlices) ? (
                      userSlices.map((slice: any, i: number) => {
                        const isSmall = slice.size === 'small'
                        const sliceSizeClass = getSliceSizeClass(isSmall, pizzaSettings)
                        return (
                          <PizzaSlice 
                            key={slice.id ?? i} 
                            isSmall={isSmall}
                            className={sliceSizeClass}
                            title={isSmall ? 'Small slice' : 'Pizza slice'}
                          />
                        )
                      })
                    ) : (
                      Array.from({ length: sliceCount }).map((_, i) => (
                        <PizzaSlice 
                          key={i} 
                          isSmall={false}
                          className="text-base sm:text-xl"
                          title="Pizza slice"
                        />
                      ))
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-pizza-600">
                    {pricePerSlice > 0 ? formatCurrency(getUserCost(user.id)) : '—'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Shared slices */}
      {commonSlices > 0 && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="font-medium text-green-900">Extra slices</span>
              <div className="flex flex-wrap gap-1">
                {(commonSlicesList.length > 0 ? commonSlicesList : Array.from({ length: commonSlices }).map((_, i) => ({ id: `extra-${i}`, size: null as string | null }))).map((slice: any, i: number) => {
                  const isSmall = slice.size === 'small'
                  const sliceSizeClass = getSliceSizeClass(isSmall, pizzaSettings)
                  return (
                    <PizzaSlice 
                      key={slice.id ?? i} 
                      isSmall={isSmall}
                      className={sliceSizeClass}
                      title={isSmall ? 'Small slice' : 'Extra slice'}
                    />
                  )
                })}
              </div>
            </div>
            <div className={`font-bold text-lg text-green-700 ${splitCommonSlices ? 'line-through opacity-50' : ''}`}>
              {pricePerSlice > 0 ? formatCurrency(adjustedCommonSlicesCost) : '—'}
            </div>
          </div>

          <button
            onClick={() => setSplitCommonSlices(!splitCommonSlices)}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${splitCommonSlices
              ? 'bg-green-600 text-white'
              : 'bg-white text-green-700 border-2 border-green-300 hover:bg-green-100'
              }`}
          >
            {splitCommonSlices ? '✓ Split among all' : 'Split among all'}
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-1 sm: space-y-3">
        <button
          onClick={onNew}
          className="w-full bg-pizza-600 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center space-x-2"
        >
          <RotateCcw className="h-5 w-5" />
          <span>New calculation</span>
        </button>

        <button
          onClick={onBack}
          className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to editing</span>
        </button>
      </div>
    </div>
  )
}

export default Results


