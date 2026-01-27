import { useState } from 'react'
import { User } from '../../shared/types'
import { Calculator, Users, Settings } from 'lucide-react'
import SettingsModal, { PizzaSettings } from './SettingsModal'
import { CalculationResultStore } from '../../utils/CalculationResultStore'
import { usePizzaCalculation } from '../../hooks/usePizzaCalculation'
import { useSliceSizes } from '../../hooks/useSliceSizes'
import UserList from './UserList'
import AddUserForm from './AddUserForm'
import PizzaVariantsPanel from './PizzaVariantsPanel'
import ExtraSlicesPanel from './ExtraSlicesPanel'

interface CalculatorProps {
  users: User[]
  setUsers: (users: User[]) => void
  onShowResults: (calculationData: any) => void
}

const CalculatorComponent = ({ users, setUsers, onShowResults }: CalculatorProps) => {
  const [savedUsers, setSavedUsers] = useState<string[]>(() => {
    const saved = localStorage.getItem('savedUsers')
    return saved ? JSON.parse(saved) : []
  })
  const [showSettings, setShowSettings] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<'current' | 'reduced' | 'small'>(() => {
    const storeData = CalculationResultStore.getInstance().getData()
    return storeData?.selectedVariant || 'current'
  })

  // Состояние для режима фильтрации кусков для каждого пользователя (Все/Малые/Большие)
  const [sliceFilterMode, setSliceFilterMode] = useState<{ [userId: string]: 'all' | 'small' | 'large' }>(() => {
    const saved = localStorage.getItem('sliceFilterMode')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Валидация типов
        const validated: { [userId: string]: 'all' | 'small' | 'large' } = {}
        for (const [key, value] of Object.entries(parsed)) {
          if (value === 'all' || value === 'small' || value === 'large') {
            validated[key] = value
          }
        }
        return validated
      } catch {
        return {}
      }
    }
    return {}
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
      smallEqual: false,
      calculationScheme: 'equal-price'
    }

    if (saved) {
      const parsed = JSON.parse(saved)
      const merged = { ...defaultSettings, ...parsed }
      merged.smallEqual = merged.smallPizzaSlices >= merged.largePizzaSlices
      return merged
    }

    return defaultSettings
  })

  // Используем хук для расчета пицц
  const calculation = usePizzaCalculation(users, pizzaSettings, selectedVariant, sliceFilterMode)

  // Используем хук для определения размеров кусков
  const { getUserSliceSizes, getExtraSliceSizes } = useSliceSizes(
    users,
    calculation.activePizzaList,
    calculation.activeDistribution
  )

  const handleAddUser = (name: string, slices: number, canBeMore: boolean) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      minSlices: slices,
      maxSlices: slices,
      canBeMore,
      totalCost: 0,
      assignedSlices: []
    }

    setUsers([...users, newUser])

    // Save user name if entered manually
    if (name && !savedUsers.includes(name)) {
      const updatedSavedUsers = [...savedUsers, name]
      setSavedUsers(updatedSavedUsers)
      localStorage.setItem('savedUsers', JSON.stringify(updatedSavedUsers))
    }
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

  // Переключение режима фильтрации кусков для пользователя
  const handleToggleSliceFilter = (userId: string) => {
    const currentMode = sliceFilterMode[userId] || 'all'
    const nextMode: 'all' | 'small' | 'large' = currentMode === 'all' ? 'small' : currentMode === 'small' ? 'large' : 'all'
    const newFilterMode = { ...sliceFilterMode, [userId]: nextMode } as { [userId: string]: 'all' | 'small' | 'large' }
    setSliceFilterMode(newFilterMode)
    localStorage.setItem('sliceFilterMode', JSON.stringify(newFilterMode))
  }

  // Функция для получения фактического количества кусков пользователя
  const getUserActualSlices = (user: User, _index: number): number => {
    // Używamy zawsze aktywnego rozkładu z usePizzaCalculation,
    // żeby UI (kolorowe vs szare kawałki) było spójne z faktycznie wybranym wariantem
    // i uwzględniało dodatkowe kawałki (canBeMore).
    return calculation.activeDistribution[user.id]?.length || user.minSlices
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 overflow-y-auto pb-[22rem] min-h-[calc(100vh-14rem)]">
        <div className="space-y-6">
          {/* Participants list */}
          <div className="space-y-1 sm: space-y-3">
            <div className="flex items-center space-x-2 text-gray-700">
              <Users className="h-5 w-5" />
              <span className="font-medium">Participants ({users.length})</span>
            </div>

            {users.length > 0 && (
              <div className="space-y-1 sm: space-y-3">
                <UserList
                  users={users}
                  onUpdateSlices={handleUpdateUserSlices}
                  onToggleCanBeMore={handleToggleCanBeMore}
                  onRemoveUser={handleRemoveUser}
                  getUserSliceSizes={getUserSliceSizes}
                  getUserActualSlices={getUserActualSlices}
                  selectedVariant={selectedVariant}
                  optimalRemainder={calculation.optimalRemainder}
                  currentCalcForExtra={calculation.currentCalcForExtra}
                  altMissingSlices={calculation.altMissingSlices}
                  pizzaSettings={pizzaSettings}
                  sliceFilterMode={sliceFilterMode}
                  onToggleSliceFilter={handleToggleSliceFilter}
                  userCosts={calculation.userCosts}
                />

                <ExtraSlicesPanel
                  users={users}
                  selectedVariant={selectedVariant}
                  optimalRemainder={calculation.optimalRemainder}
                  currentCalcForExtra={calculation.currentCalcForExtra}
                  altMissingSlices={calculation.altMissingSlices}
                  currentExtraSlicesForUsers={calculation.currentExtraSlicesForUsers}
                  largeExtraSlices={calculation.largeExtraSlices}
                  reducedExtraSlicesForUsers={calculation.reducedExtraSlicesForUsers}
                  getExtraSliceSizes={getExtraSliceSizes}
                  pizzaSettings={pizzaSettings}
                />
              </div>
            )}

            {/* Add participant field */}
            <AddUserForm
              usersCount={users.length}
              savedUsers={savedUsers}
              onAddUser={handleAddUser}
            />
          </div>
        </div>
      </div>

      {/* Fixed bottom panel with calculation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="mx-auto px-4 py-1 sm:py-3" style={{ maxWidth: '50rem' }}>
          {/* Calculation */}
          {users.length > 0 && (
            <div className="mb-3">
              <div className="bg-white rounded-lg shadow-sm p-1 sm:p-4 border border-gray-200 min-h-[12.5rem]">
                <PizzaVariantsPanel
                  hasOptimal={calculation.hasOptimal}
                  hasLarge={calculation.hasLarge}
                  hasReduced={calculation.hasReduced}
                  activeVariants={calculation.activeVariants}
                  selectedVariant={selectedVariant}
                  onSelectVariant={setSelectedVariant}
                  optimalLarge={calculation.optimalLarge}
                  optimalSmall={calculation.optimalSmall}
                  optimalRemainder={calculation.optimalRemainder}
                  totalMinSlices={calculation.totalMinSlices}
                  largePizzaList={calculation.largePizzaList}
                  largePizzaCount={calculation.largePizzaCount}
                  totalActualSlices={calculation.totalActualSlices}
                  largeExtraSlices={calculation.largeExtraSlices}
                  altPizzaList={calculation.altPizzaList}
                  altPizzaCount={calculation.altPizzaCount}
                  altMissingSlices={calculation.altMissingSlices}
                  reducedExtraSlicesForUsers={calculation.reducedExtraSlicesForUsers}
                  currentExtraSlicesForUsers={calculation.currentExtraSlicesForUsers}
                  currentCalcForExtra={calculation.currentCalcForExtra}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            {/* Show results button */}
            {users.length > 0 && (
              <button
                onClick={() => {
                  const calculationData = {
                    selectedVariant,
                    pizzaList: calculation.activePizzaList,
                    userSlicesDistribution: calculation.activeDistribution,
                    pizzaSettings,
                  }

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
