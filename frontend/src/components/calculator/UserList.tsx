import { User } from '../../shared/types'
import { Plus, Minus, Trash2 } from 'lucide-react'
import { PizzaSettings } from './SettingsModal'

interface UserListProps {
  users: User[]
  onUpdateSlices: (userId: string, delta: number) => void
  onToggleCanBeMore: (userId: string) => void
  onRemoveUser: (userId: string) => void
  getUserSliceSizes: (userId: string, totalSlices: number) => boolean[]
  getUserActualSlices: (user: User, index: number) => number
  selectedVariant: 'current' | 'reduced' | 'small'
  optimalRemainder: number
  currentCalcForExtra: any
  altMissingSlices: number
  pizzaSettings: PizzaSettings
  sliceFilterMode: { [userId: string]: 'all' | 'small' | 'large' }
  onToggleSliceFilter: (userId: string) => void
  userCosts: { [userId: string]: number }
}

const UserList = ({
  users,
  onUpdateSlices,
  onToggleCanBeMore,
  onRemoveUser,
  getUserSliceSizes,
  getUserActualSlices,
  selectedVariant,
  optimalRemainder,
  currentCalcForExtra,
  altMissingSlices,
  pizzaSettings,
  sliceFilterMode,
  onToggleSliceFilter,
  userCosts
}: UserListProps) => {
  return (
    <div className="space-y-3">
      {users.map((user, index) => {
        const userRequiredSlices = user.minSlices
        const userActualSlices = getUserActualSlices(user, index)
        const gotExtra = userActualSlices > userRequiredSlices

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

        // Определяем размеры кусков для этого пользователя
        const sliceSizes = getUserSliceSizes(user.id, userActualSlices)
        
        // Режим фильтрации для этого пользователя
        const filterMode = sliceFilterMode[user.id] || 'all'
        const isProportionalScheme = pizzaSettings.calculationScheme === 'proportional-price'
        
        // Функция для проверки, должен ли кусок отображаться
        // Показываем все куски, если режим 'all'
        // Показываем куски нужного размера + неправильные куски (чтобы видеть ошибки)
        const shouldShowSlice = (index: number, isSmall: boolean) => {
          if (!isProportionalScheme || filterMode === 'all') {
            return true // Показываем все куски
          }
          
          // Проверяем, является ли кусок "неправильным" для пользователя
          const isWrongSlice = (filterMode === 'small' && !isSmall) || (filterMode === 'large' && isSmall)
          
          // Если кусок неправильный - показываем его всегда
          if (isWrongSlice) {
            return true
          }
          
          // Если кусок правильный - показываем его согласно режиму фильтрации
          if (filterMode === 'small') {
            return isSmall
          }
          if (filterMode === 'large') {
            return !isSmall
          }
          
          return true
        }

        return (
          <div key={user.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-3">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Number */}
                <div className="w-8 h-8 bg-pizza-100 text-pizza-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {index + 1}
                </div>

                {/* Name and Cost */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{user.name}</p>
                </div>

                {/* +/- buttons */}
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <button
                    onClick={() => onUpdateSlices(user.id, -1)}
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
                    onClick={() => onUpdateSlices(user.id, 1)}
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
                    onChange={() => onToggleCanBeMore(user.id)}
                    className="rounded border-gray-300 text-pizza-600 focus:ring-pizza-500 w-5 h-5 sm:w-6 sm:h-6"
                  />
                </label>

                {/* Delete button */}
                <button
                  onClick={() => onRemoveUser(user.id)}
                  className="text-red-600 hover:text-red-800 p-3 flex-shrink-0"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Pizza slices visualization */}
            <div className="px-3 pb-3">
              <div className="bg-gray-50 rounded-lg p-2 relative">
                {/* Pizza slices container - центрируется относительно всего контейнера */}
                <div className="flex flex-wrap gap-1 justify-center">
                  {/* Main slices (colored) */}
                  {Array.from({ length: userRequiredSlices }).map((_, i) => {
                    const shouldCross = slicesToCross > 0 && i >= (userRequiredSlices - slicesToCross)
                    const isSmallSlice = sliceSizes[i] || false
                    const sliceSizeClass = isSmallSlice && pizzaSettings.calculationScheme !== 'equal-price' ? 'text-[0.85em]' : 'text-base sm:text-xl'
                    
                    if (!shouldShowSlice(i, isSmallSlice)) return null
                    
                    return (
                      <span
                        key={`main-${i}`}
                        className={`${sliceSizeClass} ${shouldCross ? 'relative' : ''}`}
                        title={shouldCross ? "Missing" : isSmallSlice ? "Small slice" : "Main slice"}
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
                  {gotExtra && Array.from({ length: userActualSlices - userRequiredSlices }).map((_, i) => {
                    const extraIndex = userRequiredSlices + i
                    const isSmallSlice = sliceSizes[extraIndex] || false
                    const sliceSizeClass = isSmallSlice && pizzaSettings.calculationScheme !== 'equal-price' ? 'text-[0.85em]' : 'text-base sm:text-xl'
                    
                    if (!shouldShowSlice(extraIndex, isSmallSlice)) return null
                    
                    return (
                      <span key={`extra-${i}`} className={`${sliceSizeClass} grayscale`} title="Extra slice">🍕</span>
                    )
                  })}
                </div>
                
                {/* Кнопка фильтрации (только для ProportionalPriceScheme) - справа на отдельном слое */}
                {isProportionalScheme && (
                  <button
                    onClick={() => onToggleSliceFilter(user.id)}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 w-16 h-8 px-2 rounded text-xs font-medium transition-colors flex-shrink-0 flex items-center justify-center ${
                      filterMode === 'all' 
                        ? 'bg-gray-300 hover:bg-gray-400 text-gray-700' 
                        : filterMode === 'small'
                        ? 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900'
                        : 'bg-green-400 hover:bg-green-500 text-green-900'
                    }`}
                    title={
                      filterMode === 'all' 
                        ? 'All slices' 
                        : filterMode === 'small'
                        ? 'Small slices only'
                        : 'Large slices only'
                    }
                  >
                    {/* На больших экранах - текст, на маленьких - иконка */}
                    <span className="hidden sm:inline">
                      {filterMode === 'all' ? 'All' : filterMode === 'small' ? 'Small' : 'Large'}
                    </span>
                    <span className="sm:hidden flex items-center justify-center gap-0.5">
                      {filterMode === 'all' 
                        ? (
                          <>
                            <span className="text-[0.85em] grayscale">🍕</span>
                            <span className="text-base grayscale">🍕</span>
                          </>
                        )
                        : filterMode === 'small'
                        ? <span className="text-[0.85em]">🍕</span>
                        : <span className="text-base">🍕</span>
                      }
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default UserList
