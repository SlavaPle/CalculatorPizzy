import { PizzaSettings } from './SettingsModal'

interface ExtraSlicesPanelProps {
  users: any[]
  selectedVariant: 'current' | 'reduced' | 'small'
  optimalRemainder: number
  currentCalcForExtra: any
  altMissingSlices: number
  currentExtraSlicesForUsers: number
  largeExtraSlices: number
  reducedExtraSlicesForUsers: number
  getExtraSliceSizes: () => boolean[]
  pizzaSettings: PizzaSettings
}

const ExtraSlicesPanel = ({
  users,
  selectedVariant,
  optimalRemainder,
  currentCalcForExtra: _currentCalcForExtra,
  altMissingSlices: _altMissingSlices,
  currentExtraSlicesForUsers,
  largeExtraSlices,
  reducedExtraSlicesForUsers,
  getExtraSliceSizes,
  pizzaSettings
}: ExtraSlicesPanelProps) => {
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
    const extraSliceSizes = getExtraSliceSizes()
    // Ограничиваем количество отображаемых кусков до количества доступных
    const displayCount = Math.min(extraSlicesCount, extraSliceSizes.length)
    return (
      <div className="bg-green-50 rounded-lg shadow-sm border-2 border-green-200 p-3">
        <div className="text-center mb-2">
          <span className="text-sm font-medium text-green-800">Extra slices</span>
        </div>
        <div className="flex flex-wrap gap-1 justify-center">
          {Array.from({ length: displayCount }).map((_, i) => {
            const isSmallSlice = extraSliceSizes[i] || false
            const sliceSizeClass = isSmallSlice && pizzaSettings.calculationScheme !== 'equal-price' ? 'text-[0.85em]' : 'text-base sm:text-xl'
            return (
              <span key={`extra-slice-${i}`} className={`${sliceSizeClass}`} title="Extra slice">🍕</span>
            )
          })}
        </div>
      </div>
    )
  }
  return null
}

export default ExtraSlicesPanel
