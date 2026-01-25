import PizzaVariantCard from './PizzaVariantCard'

interface PizzaVariantsPanelProps {
  hasOptimal: boolean
  hasLarge: boolean
  hasReduced: boolean
  activeVariants: number
  selectedVariant: 'current' | 'reduced' | 'small'
  onSelectVariant: (variant: 'current' | 'reduced' | 'small') => void
  optimalLarge: number
  optimalSmall: number
  optimalRemainder: number
  totalMinSlices: number
  largePizzaList: any[]
  largePizzaCount: number
  totalActualSlices: number
  largeExtraSlices: number
  altPizzaList: any[]
  altPizzaCount: number
  altMissingSlices: number
  reducedExtraSlicesForUsers: number
  currentExtraSlicesForUsers: number
  currentCalcForExtra: any
}

const PizzaVariantsPanel = ({
  hasOptimal,
  hasLarge,
  hasReduced,
  activeVariants,
  selectedVariant,
  onSelectVariant,
  optimalLarge,
  optimalSmall,
  optimalRemainder,
  totalMinSlices,
  largePizzaList,
  largePizzaCount,
  totalActualSlices,
  largeExtraSlices,
  altPizzaList,
  altPizzaCount,
  altMissingSlices,
  reducedExtraSlicesForUsers,
  currentExtraSlicesForUsers,
  currentCalcForExtra
}: PizzaVariantsPanelProps) => {
  const showOptions = hasOptimal || (altMissingSlices > 0 && altMissingSlices <= Math.floor((largePizzaList[0]?.slices || 8) / 4))

  if (showOptions) {
    return (
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
              onClick={() => onSelectVariant('small')}
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
            onClick={() => onSelectVariant('current')}
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
              onClick={() => onSelectVariant('reduced')}
            />
          </div>
        )}
      </div>
    )
  }

  // Regular calculation display
  return (
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
  )
}

export default PizzaVariantsPanel
