import { useState, useEffect } from 'react'
import { User } from '../types'
import { Plus, Users, Trash2, Calculator, Minus, Settings } from 'lucide-react'
import SettingsModal, { PizzaSettings } from './SettingsModal'
import { CalculationResultStore } from '../utils/CalculationResultStore'

interface CalculatorProps {
  users: User[]
  setUsers: (users: User[]) => void
  onShowResults: (calculationData: any) => void
}

const CalculatorComponent = ({ users, setUsers, onShowResults }: CalculatorProps) => {
  const [formData, setFormData] = useState({
    name: '',
    slices: 3,
    canBeMore: false
  })
  const [savedUsers, setSavedUsers] = useState<string[]>(() => {
    const saved = localStorage.getItem('savedUsers')
    return saved ? JSON.parse(saved) : []
  })
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<'current' | 'reduced' | 'small'>(() => {
    const storeData = CalculationResultStore.getInstance().getData()
    return storeData?.selectedVariant || 'current'
  })

  // Pizza settings (from localStorage or default value)
  const [pizzaSettings, setPizzaSettings] = useState<PizzaSettings>(() => {
    const saved = localStorage.getItem('pizzaSettings')
    const defaultSettings = {
      smallPizzaSlices: 6,
      largePizzaSlices: 8,
      largePizzaPrice: 800,
      smallPizzaPricePercent: 65,
      freePizzaThreshold: 3,
      useFreePizza: true,
      freePizzaIsSmall: false,
      smallEqual: false, // 6 < 8
      calculationScheme: 'equal-price'
    }

    if (saved) {
      const parsed = JSON.parse(saved)
      // Add new fields if they are missing in saved data
      const merged = { ...defaultSettings, ...parsed }
      // Recalculate smallEqual on load
      merged.smallEqual = merged.smallPizzaSlices >= merged.largePizzaSlices
      return merged
    }

    return defaultSettings
  })

  const handleAddUser = () => {
    if (formData.slices < 1) {
      alert('Number of slices must be at least 1')
      return
    }

    if (formData.slices > 20) {
      alert('Number of slices cannot be more than 20')
      return
    }

    // Automatic name if not specified
    const userName = formData.name.trim() || `User ${users.length + 1}`

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userName,
      minSlices: formData.slices,
      maxSlices: formData.slices,
      canBeMore: formData.canBeMore,
      personalSauces: [],
      totalCost: 0,
      assignedSlices: []
    }

    setUsers([...users, newUser])

    // Save user name if entered manually
    if (formData.name.trim() && !savedUsers.includes(userName)) {
      const updatedSavedUsers = [...savedUsers, userName]
      setSavedUsers(updatedSavedUsers)
      localStorage.setItem('savedUsers', JSON.stringify(updatedSavedUsers))
    }

    setFormData({ name: '', slices: 3, canBeMore: false })
    setShowSuggestions(false)
  }

  const handleRemoveUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId))
  }

  const handleUpdateUserSlices = (userId: string, delta: number) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        const newValue = Math.max(1, Math.min(20, user.minSlices + delta))
        return {
          ...user,
          minSlices: newValue,
          maxSlices: newValue
        }
      }
      return user
    }))
  }

  const handleToggleCanBeMore = (userId: string) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          canBeMore: !user.canBeMore
        }
      }
      return user
    }))
  }

  // Get actual small pizza price considering percentage
  const getActualSmallPizzaPrice = (): number => {
    return Math.round(pizzaSettings.largePizzaPrice * pizzaSettings.smallPizzaPricePercent / 100)
  }

  // Function for optimal pizza count selection
  const bestFactors = (N: number, K: number, M: number, limit: number = 100): [number, number, number] => {
    let best: [number, number, number] = [0, 0, Math.abs(N)]

    for (let b = 0; b <= limit; b++) {
      const a = Math.round((N - b * M) / K)
      if (a < 0) continue;
      const R = Math.abs(N - (a * K + b * M))
      if (R < best[2]) {
        best = [a, b, R]
      }
    }

    return best
  }

  // Create pizza list
  const createPizzaList = (count: number, useSmall: boolean = false) => {
    const pizzas = []
    const slices = useSmall ? pizzaSettings.smallPizzaSlices : pizzaSettings.largePizzaSlices
    const price = useSmall ? getActualSmallPizzaPrice() : pizzaSettings.largePizzaPrice

    for (let i = 0; i < count; i++) {
      const isFree = pizzaSettings.useFreePizza && (i + 1) % pizzaSettings.freePizzaThreshold === 0

      // If pizza is free, use freePizzaIsSmall setting
      let pizzaSlices = slices
      let pizzaSize = useSmall ? 'small' : 'large'

      if (isFree && pizzaSettings.freePizzaIsSmall) {
        pizzaSlices = pizzaSettings.smallPizzaSlices
        pizzaSize = 'small'
      }

      pizzas.push({
        id: `pizza-${i}`,
        slices: pizzaSlices,
        price: price,
        isFree: isFree,
        size: pizzaSize
      })
    }
    return pizzas
  }

  // Calculation function for selected option based on pizza list
  const calculateDistribution = (pizzaList: any[]) => {
    // Sum slices of all pizzas in the list (each may have different quantity)
    const totalPizzaSlices = pizzaList.reduce((sum, pizza) => sum + pizza.slices, 0)
    let pieces = totalPizzaSlices - totalMinSlices  // Extra slices (can be negative)
    const distribution: { [key: string]: number } = {}

    // Initialization - everyone gets minimum
    users.forEach(user => {
      distribution[user.id] = user.minSlices
    })

    // If not enough slices (pieces < 0), subtract in circular scheme
    if (pieces < 0) {
      let missing = Math.abs(pieces)

      // Subtract using the same scheme as crossing out
      // Full circles - subtract equally from everyone
      const fullRounds = Math.floor(missing / users.length)
      const remainder = missing % users.length

      users.forEach((user, index) => {
        let toSubtract = fullRounds
        // Distribute remainder to first users
        if (index < remainder) {
          toSubtract++
        }
        toSubtract = Math.min(toSubtract, distribution[user.id])
        distribution[user.id] -= toSubtract
      })
    }
    // If there are extra slices, distribute them
    else if (pieces > 0) {
      // Distribute remaining slices in a circle
      while (pieces > 0) {
        let distributed = false

        for (const user of users) {
          if (pieces <= 0) break

          if (user.canBeMore) {
            // Add 1 slice
            distribution[user.id]++
            pieces--
            distributed = true
          }
        }

        // If failed to distribute to anyone, exit loop
        if (!distributed) break
      }
    }

    return {
      distribution,
      extraSlices: pieces,
      totalSlices: Object.values(distribution).reduce((sum, val) => sum + val, 0),
      pizzaList
    }
  }

  // On-the-fly calculation
  // Step 1: Get total desired slices
  const totalMinSlices = users.reduce((sum, user) => sum + user.minSlices, 0)

  // Step 1.1: Get total actual slices (for display)
  const totalActualSlices = users.reduce((sum, user) => sum + user.minSlices, 0)

  // Step 2: Find nearest optimal pizza count (large)
  const largePizzaCount = Math.ceil(totalMinSlices / pizzaSettings.largePizzaSlices)
  const largePizzaList = createPizzaList(largePizzaCount, false)

  // Step 3: If small pizzas differ, perform additional calculation
  const smallPizzaCount = Math.ceil(totalMinSlices / pizzaSettings.smallPizzaSlices)
  const smallPizzaList = createPizzaList(smallPizzaCount, true)

  // Step 4: Optimal combination of large and small pizzas
  const [optimalLarge, optimalSmall, optimalRemainder] = bestFactors(
    totalMinSlices,
    pizzaSettings.largePizzaSlices,
    pizzaSettings.smallPizzaSlices
  )

  // Determine whether to show option with optimal combination
  const showOptimalOption = !pizzaSettings.smallEqual && optimalSmall > 0

  // Main calculation (large pizzas or selected option)
  let pizzaList = largePizzaList

  if (selectedVariant === 'small') {
    pizzaList = smallPizzaList
  }

  // Step 4: Now distribute slices per person based on pizzaList
  const currentCalc = calculateDistribution(pizzaList)
  const actualSlices = currentCalc.distribution

  // Calculate extra slices for large pizzas (needed for "-1 pizza" button display)
  const largeExtraSlices = (largePizzaCount * pizzaSettings.largePizzaSlices) - totalActualSlices

  // Alternative calculation (if extra slices removed) - only for large
  const altPizzaCount = largePizzaCount - 1
  const altPizzaList = createPizzaList(altPizzaCount, false)
  const altCalc = calculateDistribution(altPizzaList)
  const altMissingSlices = altCalc.extraSlices < 0 ? Math.abs(altCalc.extraSlices) : 0

  // Count active options for positioning
  const hasOptimal = showOptimalOption
  const hasLarge = true // Large pizzas always shown
  const hasReduced = altMissingSlices > 0 && altMissingSlices <= Math.floor(pizzaSettings.largePizzaSlices / 4) && altPizzaCount > 0

  const activeVariants = [hasOptimal, hasLarge, hasReduced].filter(Boolean).length

  // Automatically select single available option
  useEffect(() => {
    if (activeVariants === 1) {
      if (hasOptimal) {
        setSelectedVariant('small')
      } else if (hasLarge) {
        setSelectedVariant('current')
      } else if (hasReduced) {
        setSelectedVariant('reduced')
      }
    }
  }, [activeVariants, hasOptimal, hasLarge, hasReduced])

  // If alternative option selected, use it
  if (selectedVariant === 'reduced') {
    Object.assign(actualSlices, altCalc.distribution)
  }

  // Calculate extra slices for each option
  const currentCalcForExtra = calculateDistribution(largePizzaList)

  const currentExtraSlicesForUsers = Object.values(currentCalcForExtra.distribution).reduce((sum, slices) => sum + slices, 0) - totalActualSlices
  const reducedExtraSlicesForUsers = Object.values(altCalc.distribution).reduce((sum, slices) => sum + slices, 0) - totalMinSlices


  const filteredSuggestions = savedUsers.filter(name =>
    name.toLowerCase().includes(formData.name.toLowerCase())
  )

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto pb-80">
        <div className="space-y-6">

          {/* Particpants list */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-gray-700">
              <Users className="h-5 w-5" />
              <span className="font-medium">Participants ({users.length})</span>
            </div>

            {users.length > 0 && (
              <div className="space-y-3">

                {users.map((user, index) => {
                  const userRequiredSlices = user.minSlices  // Required slices count

                  // Calculate actualSlices dynamically based on selected option
                  let userActualSlices = user.minSlices
                  if (selectedVariant === 'reduced') {
                    const altCalc = calculateDistribution(createPizzaList(largePizzaCount - 1, false))
                    userActualSlices = altCalc.distribution[user.id] || user.minSlices
                  } else if (selectedVariant === 'small') {
                    const [optimalLarge, optimalSmall] = bestFactors(
                      users.reduce((sum, u) => sum + u.minSlices, 0),
                      pizzaSettings.largePizzaSlices,
                      pizzaSettings.smallPizzaSlices
                    )
                    // Create pizza list for optimal combination
                    const optimalPizzaList = []
                    for (let i = 0; i < optimalLarge; i++) {
                      optimalPizzaList.push({ slices: pizzaSettings.largePizzaSlices, price: pizzaSettings.largePizzaPrice, isFree: false })
                    }
                    for (let i = 0; i < optimalSmall; i++) {
                      optimalPizzaList.push({ slices: pizzaSettings.smallPizzaSlices, price: getActualSmallPizzaPrice(), isFree: false })
                    }
                    const optimalCalc = calculateDistribution(optimalPizzaList)
                    userActualSlices = optimalCalc.distribution[user.id] || user.minSlices
                  } else {
                    // Regular calculation (large pizzas)
                    userActualSlices = actualSlices[user.id] || user.minSlices
                  }

                  const gotExtra = userActualSlices > userRequiredSlices

                  return (
                    <div key={user.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                      <div className="p-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          {/* Number */}
                          <div className="w-8 h-8 bg-pizza-100 text-pizza-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {index + 1}
                          </div>

                          {/* Name */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">{user.name}</p>
                          </div>

                          {/* +/- buttons */}
                          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                            <button
                              onClick={() => handleUpdateUserSlices(user.id, -1)}
                              disabled={user.minSlices <= 1}
                              title="Decrease slices"
                              className={`w-10 h-10 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${user.minSlices <= 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                }`}
                            >
                              <Minus className="h-5 w-5 sm:h-5 sm:w-5" />
                            </button>
                            <span className="w-8 sm:w-10 text-center font-medium text-base sm:text-lg text-gray-900">
                              {userRequiredSlices}
                            </span>
                            <button
                              onClick={() => handleUpdateUserSlices(user.id, 1)}
                              disabled={user.minSlices >= 20}
                              title="Increase slices"
                              className={`w-10 h-10 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${user.minSlices >= 20
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                }`}
                            >
                              <Plus className="h-5 w-5 sm:h-5 sm:w-5" />
                            </button>
                          </div>

                          {/* "Can have more" checkbox */}
                          <label className="flex items-center cursor-pointer flex-shrink-0" title="More possible">
                            <input
                              type="checkbox"
                              checked={user.canBeMore}
                              onChange={() => handleToggleCanBeMore(user.id)}
                              className="rounded border-gray-300 text-pizza-600 focus:ring-pizza-500 w-5 h-5 sm:w-6 sm:h-6"
                            />
                          </label>

                          {/* Delete button */}
                          <button
                            onClick={() => handleRemoveUser(user.id)}
                            className="text-red-600 hover:text-red-800 p-3 flex-shrink-0"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      {/* Pizza slices visualization */}
                      <div className="px-3 pb-3">
                        <div className="bg-gray-50 rounded-lg p-2">
                          <div className="flex flex-wrap gap-1 justify-center">
                            {(() => {
                              // Calculate missing slices only for selected option
                              let missingSlicesCount = 0

                              // Cross out only if this option is focused (selected)
                              if (selectedVariant === 'small' && optimalRemainder < 0) {
                                missingSlicesCount = Math.abs(optimalRemainder)
                              } else if (selectedVariant === 'current' && currentCalcForExtra.extraSlices < 0) {
                                missingSlicesCount = Math.abs(currentCalcForExtra.extraSlices)
                              } else if (selectedVariant === 'reduced' && altMissingSlices > 0) {
                                missingSlicesCount = altMissingSlices
                              }

                              // Determine how many slices to cross out for this user
                              // Distribute in circular scheme: subtract 1 from each user in turn
                              let slicesToCross = 0
                              if (missingSlicesCount > 0) {
                                // Full circles - everyone receives equally
                                const fullRounds = Math.floor(missingSlicesCount / users.length)
                                slicesToCross = fullRounds

                                // Remainder - distribute to first users
                                const remainder = missingSlicesCount % users.length
                                if (index < remainder) {
                                  slicesToCross++
                                }

                                slicesToCross = Math.min(slicesToCross, userRequiredSlices)
                              }

                              return (
                                <>
                                  {/* Main slices (colored) */}
                                  {Array.from({ length: userRequiredSlices }).map((_, i) => {
                                    const shouldCross = slicesToCross > 0 && i >= (userRequiredSlices - slicesToCross)
                                    return (
                                      <span
                                        key={`main-${i}`}
                                        className={`text-base sm:text-xl ${shouldCross ? 'relative' : ''}`}
                                        title={shouldCross ? "Missing" : "Main slice"}
                                      >
                                        🍕
                                        {shouldCross && (
                                          <span className="absolute inset-0 flex items-center justify-center">
                                            <span className="w-full h-0.5 bg-red-600 rotate-45 transform scale-150"></span>
                                          </span>
                                        )}
                                      </span>
                                    )
                                  })}
                                  {/* Extra slices (black and white) */}
                                  {gotExtra && Array.from({ length: userActualSlices - userRequiredSlices }).map((_, i) => (
                                    <span key={`extra-${i}`} className="text-base sm:text-xl grayscale" title="Extra slice">🍕</span>
                                  ))}
                                </>
                              )
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Extra slices panel - show only for selected option */}
                {(() => {
                  // Check if there is at least one user with "Can have more"
                  const hasCanBeMore = users.some(user => user.canBeMore)

                  // If there are users with "Can have more", extra slices distributed as gray
                  // and green panel should not be shown
                  if (hasCanBeMore) {
                    return null
                  }

                  let extraSlicesCount = 0

                  // Show panel only if option is focused
                  if (selectedVariant === 'small' && optimalRemainder > 0) {
                    extraSlicesCount = optimalRemainder
                  } else if (selectedVariant === 'current' && (currentExtraSlicesForUsers > 0 || largeExtraSlices > 0)) {
                    extraSlicesCount = currentExtraSlicesForUsers > 0 ? currentExtraSlicesForUsers : largeExtraSlices
                  } else if (selectedVariant === 'reduced' && reducedExtraSlicesForUsers > 0) {
                    extraSlicesCount = reducedExtraSlicesForUsers
                  }

                  if (extraSlicesCount > 0) {
                    return (
                      <div className="bg-green-50 rounded-lg shadow-sm border-2 border-green-200 p-3">
                        <div className="text-center mb-2">
                          <span className="text-sm font-medium text-green-800">Extra slices</span>
                        </div>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {Array.from({ length: extraSlicesCount }).map((_, i) => (
                            <span key={`extra-slice-${i}`} className="text-base sm:text-xl" title="Extra slice">🍕</span>
                          ))}
                        </div>
                      </div>
                    )
                  }
                  return null
                })()}
              </div>
            )}

            {/* Add participant field */}
            <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Number */}
                <div className="w-8 h-8 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {users.length + 1}
                </div>

                {/* Name with autocomplete */}
                <div className="flex-1 min-w-0 relative">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value })
                      setShowSuggestions(savedUsers.length > 0 && e.target.value.length > 0)
                    }}
                    onFocus={() => setShowSuggestions(savedUsers.length > 0 && formData.name.length > 0)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddUser()}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pizza-500 text-sm"
                    placeholder={`User ${users.length + 1}`}
                  />

                  {/* Dropdown list */}
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                      {filteredSuggestions.map((name, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setFormData({ ...formData, name })
                            setShowSuggestions(false)
                          }}
                          className="px-3 py-2 hover:bg-pizza-50 cursor-pointer text-sm"
                        >
                          {name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* +/- buttons */}
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <button
                    onClick={() => setFormData({ ...formData, slices: Math.max(1, formData.slices - 1) })}
                    disabled={formData.slices <= 1}
                    title="Decrease slices"
                    className={`w-10 h-10 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${formData.slices <= 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                  >
                    <Minus className="h-5 w-5 sm:h-5 sm:w-5" />
                  </button>
                  <span className="w-8 sm:w-10 text-center font-medium text-base sm:text-lg text-gray-900">{formData.slices}</span>
                  <button
                    onClick={() => setFormData({ ...formData, slices: Math.min(20, formData.slices + 1) })}
                    disabled={formData.slices >= 20}
                    title="Increase slices"
                    className={`w-10 h-10 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${formData.slices >= 20
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                  >
                    <Plus className="h-5 w-5 sm:h-5 sm:w-5" />
                  </button>
                </div>

                {/* "Can have more" checkbox */}
                <label className="flex items-center cursor-pointer flex-shrink-0" title="More possible">
                  <input
                    type="checkbox"
                    checked={formData.canBeMore}
                    onChange={(e) => setFormData({ ...formData, canBeMore: e.target.checked })}
                    className="rounded border-gray-300 text-pizza-600 focus:ring-pizza-500 w-5 h-5 sm:w-6 sm:h-6"
                  />
                </label>

                {/* Add button */}
                <button
                  onClick={handleAddUser}
                  className="bg-pizza-600 text-white p-3 sm:p-3 rounded-md hover:bg-pizza-700 flex-shrink-0"
                >
                  <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Fixed bottom panel with calculation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="mx-auto px-4 py-3" style={{ maxWidth: '800px' }}>
          {/* Calculation */}
          {users.length > 0 && (
            <div className="mb-3">
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 min-h-[200px]">

                {showOptimalOption || (altMissingSlices > 0 && altMissingSlices <= Math.floor(pizzaSettings.largePizzaSlices / 4)) ? (
                  // Calculation options (clickable) - fixed grid 9 fields
                  <div className="grid grid-cols-9 gap-1">
                    {/* Option 1: Optimal combination (if different from regular large) - ALWAYS LEFT */}
                    {hasOptimal && (
                      <div className={`${activeVariants === 3 ? 'col-span-3' : activeVariants === 2 ? 'col-span-4' : 'col-span-5'}`}>
                        <button
                          onClick={() => setSelectedVariant('small')}
                          className={`border-2 rounded-lg p-3 transition-all w-full h-full ${selectedVariant === 'small'
                            ? 'border-pizza-500 bg-pizza-50'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          <div className="text-xs text-gray-600 mb-2 text-center font-medium">Optimal combination</div>
                          <div className="space-y-2">
                            <div className="text-center">
                              <div className="text-base sm:text-xl font-bold text-gray-900">
                                {optimalLarge === 0 ? optimalSmall :
                                  optimalSmall === 0 ? optimalLarge :
                                    `${optimalLarge} (${optimalSmall})`}
                              </div>
                              <div className="text-xs text-gray-600">
                                {optimalLarge === 0 ? 'Small pizzas' :
                                  optimalSmall === 0 ? 'Large pizzas' :
                                    'Large (small) pizzas'}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm sm:text-lg font-bold text-blue-600">
                                {totalMinSlices}
                                {optimalRemainder !== 0 && (
                                  <span className="text-gray-500 font-normal"> {optimalRemainder > 0 ? '+' : ''}</span>
                                )}
                                {optimalRemainder !== 0 && (
                                  <span className={`font-bold ${optimalRemainder > 0 ? 'text-green-600' : 'text-red-600'}`}>{optimalRemainder}</span>
                                )}
                                {optimalRemainder !== 0 && (
                                  <span className="text-gray-500 font-normal"> = </span>
                                )}
                                {optimalRemainder !== 0 && (
                                  <span className="text-blue-600 font-bold">{totalMinSlices + optimalRemainder}</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-600">Ordered slices</div>
                            </div>
                            <div className="text-center">
                              <div className={`text-sm font-bold ${optimalRemainder !== 0 ? (optimalRemainder > 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400'}`}>
                                {Math.abs(optimalRemainder)}
                              </div>
                              <div className={`text-xs ${optimalRemainder !== 0 ? (optimalRemainder > 0 ? 'text-green-800' : 'text-red-800') : 'text-gray-400'}`}>
                                {optimalRemainder > 0 ? 'Extra' : optimalRemainder < 0 ? 'Missing' : 'Extra'}
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    )}

                    {/* Empty spaces for centering */}
                    {activeVariants === 2 && !hasOptimal && <div></div>}
                    {activeVariants === 1 && hasLarge && <div></div>}
                    {activeVariants === 1 && hasLarge && <div></div>}

                    {/* Option 2: Large pizzas */}
                    <div className={`${activeVariants === 3 ? 'col-span-3' : activeVariants === 2 ? 'col-span-4' : 'col-span-5'}`}>
                      <button
                        onClick={() => setSelectedVariant('current')}
                        className={`border-2 rounded-lg p-3 transition-all w-full h-full ${selectedVariant === 'current'
                          ? 'border-pizza-500 bg-pizza-50'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div className="text-xs text-gray-600 mb-2 text-center font-medium">Large</div>
                        <div className="space-y-2">
                          <div className="text-center">
                            <div className="text-base sm:text-xl font-bold text-gray-900">{largePizzaCount}</div>
                            <div className="text-xs text-gray-600">Pizzas</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm sm:text-lg font-bold text-blue-600">
                              {totalActualSlices}
                              {largeExtraSlices !== 0 && (
                                <span className="text-gray-500 font-normal"> {largeExtraSlices > 0 ? '+' : ''}</span>
                              )}
                              {largeExtraSlices !== 0 && (
                                <span className={`font-bold ${largeExtraSlices > 0 ? 'text-green-600' : 'text-red-600'}`}>{largeExtraSlices}</span>
                              )}
                              {largeExtraSlices !== 0 && (
                                <span className="text-gray-500 font-normal"> = </span>
                              )}
                              {largeExtraSlices !== 0 && (
                                <span className="text-blue-600 font-bold">{totalActualSlices + largeExtraSlices}</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-600">Ordered slices</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-sm font-bold ${largeExtraSlices !== 0 ? (largeExtraSlices > 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400'}`}>
                              {Math.abs(largeExtraSlices)}
                            </div>
                            <div className={`text-xs ${largeExtraSlices !== 0 ? (largeExtraSlices > 0 ? 'text-green-800' : 'text-red-800') : 'text-gray-400'}`}>
                              {largeExtraSlices > 0 ? 'Extra' : largeExtraSlices < 0 ? 'Missing' : 'Extra'}
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>

                    {/* Empty spaces for centering after large pizzas */}
                    {activeVariants === 1 && hasLarge && <div></div>}
                    {activeVariants === 1 && hasLarge && <div></div>}

                    {/* Option 3: Remove extra (if -1 pizza not enough 1/4 pizza and result > 0) */}
                    {hasReduced && (
                      <div className={`${activeVariants === 3 ? 'col-span-3' : activeVariants === 2 ? 'col-span-4' : 'col-span-5'}`}>
                        <button
                          onClick={() => setSelectedVariant('reduced')}
                          className={`border-2 rounded-lg p-3 transition-all w-full h-full ${selectedVariant === 'reduced'
                            ? 'border-pizza-500 bg-pizza-50'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          <div className="text-xs text-gray-600 mb-2 text-center font-medium">-1 pizza</div>
                          <div className="space-y-2">
                            <div className="text-center">
                              <div className="text-base sm:text-xl font-bold text-gray-900">{altPizzaCount}</div>
                              <div className="text-xs text-gray-600">Pizzas</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm sm:text-lg font-bold text-blue-600">
                                {totalMinSlices}
                                {reducedExtraSlicesForUsers > 0 && (
                                  <span className="text-gray-500 font-normal"> +</span>
                                )}
                                {reducedExtraSlicesForUsers > 0 && (
                                  <span className="text-green-600 font-bold">{reducedExtraSlicesForUsers}</span>
                                )}
                                {reducedExtraSlicesForUsers > 0 && (
                                  <span className="text-gray-500 font-normal"> = </span>
                                )}
                                {reducedExtraSlicesForUsers > 0 && (
                                  <span className="text-blue-600 font-bold">{totalMinSlices + reducedExtraSlicesForUsers}</span>
                                )}
                                {altMissingSlices > 0 && (
                                  <span className="text-gray-500 font-normal"> -</span>
                                )}
                                {altMissingSlices > 0 && (
                                  <span className="text-red-600 font-bold">{altMissingSlices}</span>
                                )}
                                {altMissingSlices > 0 && (
                                  <span className="text-gray-500 font-normal"> = </span>
                                )}
                                {altMissingSlices > 0 && (
                                  <span className="text-blue-600 font-bold">{totalMinSlices - altMissingSlices}</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-600">Ordered slices</div>
                            </div>
                            <div className="text-center">
                              <div className={`text-sm font-bold ${reducedExtraSlicesForUsers > 0 ? 'text-green-600' : altMissingSlices > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                                {reducedExtraSlicesForUsers > 0 ? reducedExtraSlicesForUsers : altMissingSlices > 0 ? altMissingSlices : 0}
                              </div>
                              <div className={`text-xs ${reducedExtraSlicesForUsers > 0 ? 'text-green-800' : altMissingSlices > 0 ? 'text-red-800' : 'text-gray-400'}`}>
                                {reducedExtraSlicesForUsers > 0 ? 'Extra' : altMissingSlices > 0 ? 'Missing' : 'Extra'}
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  // Regular calculation
                  <div className="grid grid-cols-9 gap-1">
                    {/* Empty spaces for centering */}
                    <div></div>
                    <div></div>

                    {/* Main block - 5 fields center */}
                    <div className="col-span-5">
                      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 min-h-[200px]">
                        <div className="space-y-4">
                          <div className="text-center">
                            <div className="sm:text-lg font-bold text-gray-900">{largePizzaCount}</div>
                            <div className="text-xs text-gray-600">Pizzas</div>
                          </div>
                          <div className="text-center">
                            <div className="sm:text-lg font-bold text-blue-600">
                              {totalActualSlices}
                              {(currentExtraSlicesForUsers > 0 || largeExtraSlices > 0) && (
                                <span className="text-gray-500 font-normal text-sm sm:text-lg"> +</span>
                              )}
                              {(currentExtraSlicesForUsers > 0 || largeExtraSlices > 0) && (
                                <span className="text-green-600 font-bold text-sm sm:text-lg">{currentExtraSlicesForUsers > 0 ? currentExtraSlicesForUsers : largeExtraSlices}</span>
                              )}
                              {(currentExtraSlicesForUsers > 0 || largeExtraSlices > 0) && (
                                <span className="text-gray-500 font-normal text-sm sm:text-lg"> = </span>
                              )}
                              {(currentExtraSlicesForUsers > 0 || largeExtraSlices > 0) && (
                                <span className="text-blue-600 font-bold text-sm sm:text-lg">{totalActualSlices + (currentExtraSlicesForUsers > 0 ? currentExtraSlicesForUsers : largeExtraSlices)}</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-600">Ordered slices</div>
                          </div>
                          <div className="text-center">
                            <div className={`sm:text-lg font-bold ${(currentExtraSlicesForUsers > 0 || largeExtraSlices > 0) ? 'text-green-600' : currentCalcForExtra.extraSlices < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                              {(currentExtraSlicesForUsers > 0 || largeExtraSlices > 0) ? (currentExtraSlicesForUsers > 0 ? currentExtraSlicesForUsers : largeExtraSlices) : currentCalcForExtra.extraSlices < 0 ? Math.abs(currentCalcForExtra.extraSlices) : 0}
                            </div>
                            <div className={`text-xs ${(currentExtraSlicesForUsers > 0 || largeExtraSlices > 0) ? 'text-green-800' : currentCalcForExtra.extraSlices < 0 ? 'text-red-800' : 'text-gray-400'}`}>
                              {(currentExtraSlicesForUsers > 0 || largeExtraSlices > 0) ? 'Extra' : currentCalcForExtra.extraSlices < 0 ? 'Missing' : 'Extra'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Empty spaces for centering */}
                    <div></div>
                    <div></div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            {/* Show results button */}
            {users.length > 0 && (
              <button
                onClick={() => {
                  // Determine correct pizza list based on variant
                  let finalPizzaList = pizzaList
                  if (selectedVariant === 'reduced') {
                    finalPizzaList = altPizzaList
                  }

                  // Form data for Results
                  const calculationData = {
                    selectedVariant,
                    pizzaList: finalPizzaList,
                    userSlicesDistribution: actualSlices,
                    pizzaSettings,
                  }

                  // Save to Singleton
                  const store = CalculationResultStore.getInstance()
                  const existingData = store.getData()
                  const orderAmount = existingData?.orderAmount

                  store.setData({
                    ...calculationData,
                    orderAmount
                  })

                  onShowResults(calculationData)
                }}
                className="flex-1 bg-pizza-600 text-white py-2.5 px-6 rounded-lg font-medium flex items-center justify-center space-x-2"
              >
                <Calculator className="h-5 w-5" />
                <span>Show result</span>
              </button>
            )}

            {/* Spacer for alignment */}
            {users.length === 0 && <div className="flex-1"></div>}

            {/* Settings button right */}
            <button
              onClick={() => setShowSettings(true)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2.5 rounded-lg flex items-center justify-center flex-shrink-0"
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Settings modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={pizzaSettings}
        onSave={(newSettings: PizzaSettings) => {
          setPizzaSettings(newSettings)
          localStorage.setItem('pizzaSettings', JSON.stringify(newSettings))
          setShowSettings(false)
        }}
      />
    </div>
  )
}

export default CalculatorComponent

