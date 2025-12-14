import { useState } from 'react'
import { User } from '../../shared/types'
import { Plus, Users, Trash2, Calculator, Minus, Settings } from 'lucide-react'
import SettingsModal, { PizzaSettings } from './SettingsModal'
import PizzaVariantCard from './PizzaVariantCard'
import { CalculationResultStore } from '../../utils/CalculationResultStore'
import { bestFactors, createPizzaList, calculateDistribution } from '../../utils/calculations'

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

  // Wrapper for createPizzaList with current settings
  const createPizzaListWithSettings = (count: number, useSmall: boolean = false) => {
    const slices = useSmall ? pizzaSettings.smallPizzaSlices : pizzaSettings.largePizzaSlices
    const price = useSmall ? getActualSmallPizzaPrice() : pizzaSettings.largePizzaPrice
    const size = useSmall ? 'small' : 'large' as 'small' | 'large'

    return createPizzaList(
      count,
      slices,
      price,
      pizzaSettings.freePizzaThreshold,
      pizzaSettings.useFreePizza,
      pizzaSettings.freePizzaIsSmall,
      pizzaSettings.smallPizzaSlices,
      size
    )
  }

  // On-the-fly calculation
  // Step 1: Get total desired slices
  const totalMinSlices = users.reduce((sum, user) => sum + user.minSlices, 0)

  // Step 1.1: Get total actual slices (for display)
  const totalActualSlices = users.reduce((sum, user) => sum + user.minSlices, 0)

  // ========== CREATE THREE PIZZA LISTS FOR EACH VARIANT ==========

  // VARIANT 1: Optimal combination (large + small)
  const [optimalLarge, optimalSmall, optimalRemainder] = bestFactors(
    totalMinSlices,
    pizzaSettings.largePizzaSlices,
    pizzaSettings.smallPizzaSlices
  )

  // Create optimal pizza list
  const optimalPizzaList = []
  for (let i = 0; i < optimalLarge; i++) {
    const isFree = pizzaSettings.useFreePizza && (i + 1) % pizzaSettings.freePizzaThreshold === 0
    let pizzaSlices = pizzaSettings.largePizzaSlices
    let pizzaSize: 'small' | 'large' = 'large'

    if (isFree && pizzaSettings.freePizzaIsSmall) {
      pizzaSlices = pizzaSettings.smallPizzaSlices
      pizzaSize = 'small'
    }

    optimalPizzaList.push({
      id: `pizza-large-${i}`,
      slices: pizzaSlices,
      price: pizzaSettings.largePizzaPrice,
      isFree: isFree,
      size: pizzaSize
    })
  }

  for (let i = 0; i < optimalSmall; i++) {
    const globalIndex = optimalLarge + i
    const isFree = pizzaSettings.useFreePizza && (globalIndex + 1) % pizzaSettings.freePizzaThreshold === 0

    optimalPizzaList.push({
      id: `pizza-small-${i}`,
      slices: pizzaSettings.smallPizzaSlices,
      price: getActualSmallPizzaPrice(),
      isFree: isFree,
      size: 'small' as 'small' | 'large'
    })
  }

  // VARIANT 2: Large pizzas only
  const largePizzaCount = Math.ceil(totalMinSlices / pizzaSettings.largePizzaSlices)
  const largePizzaList = createPizzaListWithSettings(largePizzaCount, false)

  // VARIANT 3: Reduced (-1 pizza)
  const altPizzaCount = largePizzaCount - 1
  const altPizzaList = createPizzaListWithSettings(altPizzaCount, false)

  // ========== CALCULATE DISTRIBUTIONS FOR EACH VARIANT ==========

  const optimalCalc = calculateDistribution(optimalPizzaList, users)
  const largeCalc = calculateDistribution(largePizzaList, users)
  const altCalc = calculateDistribution(altPizzaList, users)

  // ========== DETERMINE WHICH VARIANTS TO SHOW ==========

  const showOptimalOption = !pizzaSettings.smallEqual && optimalSmall > 0
  const altMissingSlices = altCalc.extraSlices < 0 ? Math.abs(altCalc.extraSlices) : 0

  // Check if Optimal is identical to Large (same pizza composition)
  const optimalLargeCount = optimalPizzaList.filter(p => p.size === 'large').length
  const optimalSmallCount = optimalPizzaList.filter(p => p.size === 'small').length
  const largeLargeCount = largePizzaList.filter(p => p.size === 'large').length
  const largeSmallCount = largePizzaList.filter(p => p.size === 'small').length

  const isOptimalSameAsLarge = optimalLargeCount === largeLargeCount && optimalSmallCount === largeSmallCount

  // Check if Reduced is identical to Large
  const altLargeCount = altPizzaList.filter(p => p.size === 'large').length
  const altSmallCount = altPizzaList.filter(p => p.size === 'small').length

  const isReducedSameAsLarge = altLargeCount === largeLargeCount && altSmallCount === largeSmallCount

  const hasOptimal = showOptimalOption && !isOptimalSameAsLarge
  const hasLarge = true // Large pizzas always shown
  const hasReduced = altMissingSlices > 0 && altMissingSlices <= Math.floor(pizzaSettings.largePizzaSlices / 4) && altPizzaCount > 0 && !isReducedSameAsLarge

  const activeVariants = [hasOptimal, hasLarge, hasReduced].filter(Boolean).length

  // ========== SELECT ACTIVE PIZZA LIST AND DISTRIBUTION ==========

  let activePizzaList = largePizzaList
  let activeDistribution = largeCalc.distribution

  if (selectedVariant === 'small') {
    activePizzaList = optimalPizzaList
    activeDistribution = optimalCalc.distribution
  } else if (selectedVariant === 'reduced') {
    activePizzaList = altPizzaList
    activeDistribution = altCalc.distribution
  }

  // Calculate extra slices for display (total slices in list - required slices)
  const largeTotalSlices = largePizzaList.reduce((sum, p) => sum + p.slices, 0)
  const largeExtraSlices = largeTotalSlices - totalActualSlices

  const currentExtraSlicesForUsers = Object.values(largeCalc.distribution).reduce((sum, slices) => sum + slices, 0) - totalActualSlices
  const reducedExtraSlicesForUsers = Object.values(altCalc.distribution).reduce((sum, slices) => sum + slices, 0) - totalMinSlices

  // For crossing out visualization
  const currentCalcForExtra = largeCalc


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
                    const altCalc = calculateDistribution(createPizzaListWithSettings(largePizzaCount - 1, false), users)
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
                    const optimalCalc = calculateDistribution(optimalPizzaList, users)
                    userActualSlices = optimalCalc.distribution[user.id] || user.minSlices
                  } else {
                    // Regular calculation (large pizzas)
                    userActualSlices = activeDistribution[user.id] || user.minSlices
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
        <div className="mx-auto px-4 py-3" style={{ maxWidth: '50rem' }}>
          {/* Calculation */}
          {users.length > 0 && (
            <div className="mb-3">
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 min-h-[12.5rem]">

                {showOptimalOption || (altMissingSlices > 0 && altMissingSlices <= Math.floor(pizzaSettings.largePizzaSlices / 4)) ? (
                  // Calculation options (clickable) - fixed grid 9 fields
                  <div className="grid grid-cols-9 gap-1">
                    {/* Option 1: Optimal combination */}
                    {hasOptimal && (
                      <div className={`${activeVariants === 3 ? 'col-span-3' : activeVariants === 2 ? 'col-span-4' : 'col-span-5'}`}>
                        <PizzaVariantCard
                          title="Optimal combination"
                          pizzaCount={optimalLarge === 0 ? optimalSmall : optimalSmall === 0 ? optimalLarge : `${optimalLarge} (${optimalSmall})`}
                          pizzaLabel={optimalLarge === 0 ? 'Small pizzas' : optimalSmall === 0 ? 'Large pizzas' : 'Large (small) pizzas'}
                          requiredSlices={totalMinSlices}
                          extraSlices={optimalRemainder}
                          totalSlices={totalMinSlices + optimalRemainder}
                          isSelected={selectedVariant === 'small'}
                          onClick={() => setSelectedVariant('small')}
                        />
                      </div>
                    )}

                    {/* Empty spaces for centering */}
                    {activeVariants === 2 && !hasOptimal && <div></div>}
                    {activeVariants === 1 && hasLarge && <div></div>}
                    {activeVariants === 1 && hasLarge && <div></div>}

                    {/* Option 2: Large pizzas */}
                    <div className={`${activeVariants === 3 ? 'col-span-3' : activeVariants === 2 ? 'col-span-4' : 'col-span-5'}`}>
                      <PizzaVariantCard
                        title={activeVariants === 1 ? '' : 'Large'}
                        pizzaCount={largePizzaList.some(p => p.size === 'small')
                          ? `${largePizzaList.filter(p => p.size === 'large').length} (${largePizzaList.filter(p => p.size === 'small').length})`
                          : largePizzaCount}
                        pizzaLabel={largePizzaList.some(p => p.size === 'small') ? 'Large (small) pizzas' : 'Pizzas'}
                        requiredSlices={totalActualSlices}
                        extraSlices={largeExtraSlices}
                        totalSlices={totalActualSlices + largeExtraSlices}
                        isSelected={selectedVariant === 'current'}
                        onClick={() => setSelectedVariant('current')}
                      />
                    </div>

                    {/* Empty spaces for centering after large pizzas */}
                    {activeVariants === 1 && hasLarge && <div></div>}
                    {activeVariants === 1 && hasLarge && <div></div>}

                    {/* Option 3: Remove extra (-1 pizza) */}
                    {hasReduced && (
                      <div className={`${activeVariants === 3 ? 'col-span-3' : activeVariants === 2 ? 'col-span-4' : 'col-span-5'}`}>
                        <PizzaVariantCard
                          title="-1 pizza"
                          pizzaCount={altPizzaList.some(p => p.size === 'small')
                            ? `${altPizzaList.filter(p => p.size === 'large').length} (${altPizzaList.filter(p => p.size === 'small').length})`
                            : altPizzaCount}
                          pizzaLabel={altPizzaList.some(p => p.size === 'small') ? 'Large (small) pizzas' : 'Pizzas'}
                          requiredSlices={totalMinSlices}
                          extraSlices={reducedExtraSlicesForUsers > 0 ? reducedExtraSlicesForUsers : -altMissingSlices}
                          totalSlices={reducedExtraSlicesForUsers > 0 ? totalMinSlices + reducedExtraSlicesForUsers : totalMinSlices - altMissingSlices}
                          isSelected={selectedVariant === 'reduced'}
                          onClick={() => setSelectedVariant('reduced')}
                        />
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
                      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 min-h-[12.5rem]">
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
                  const finalPizzaList = activePizzaList

                  // Form data for Results
                  const calculationData = {
                    selectedVariant,
                    pizzaList: finalPizzaList,
                    userSlicesDistribution: activeDistribution,
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

