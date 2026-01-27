/**
 * Pizza Calculation Variant Card
 * Displays a calculation option with pizza count, slices, and extras
 */

interface PizzaVariantCardProps {
    title: string
    pizzaCount: number | string
    pizzaLabel: string
    requiredSlices: number
    extraSlices: number
    totalSlices: number
    isSelected: boolean
    onClick: () => void
}

const PizzaVariantCard = ({
    title,
    pizzaCount,
    pizzaLabel,
    requiredSlices,
    extraSlices,
    totalSlices,
    isSelected,
    onClick
}: PizzaVariantCardProps) => {
    const hasExtra = extraSlices !== 0
    const extraColor = extraSlices > 0 ? 'text-green-600' : 'text-red-600'
    const extraBgColor = extraSlices > 0 ? 'text-green-800' : 'text-red-800'
    const extraLabel = extraSlices > 0 ? 'Extra' : extraSlices < 0 ? 'Missing' : 'Extra'

    return (
        <button
            onClick={onClick}
            className={`border-2 rounded-lg p-1 sm:p-3 transition-all w-full h-full ${isSelected
                ? 'border-pizza-500 bg-pizza-50'
                : 'border-gray-200 hover:border-gray-300'
                }`}
        >
            {title && <div className="text-sm text-gray-600 text-center font-medium">{title}</div>}
            <div className={title ? "space-y-1 sm: space-y-3" : "space-y-4"}>
                {/* Pizza count */}
                <div className="text-center mt-0 sm:mt-3">
                    <div className="text-lg sm:text-2xl font-bold text-gray-900">
                        {pizzaCount}
                    </div>
                    <div className="text-sm text-gray-600">{pizzaLabel}</div>
                </div>

                {/* Slices calculation */}
                <div className="text-center mt-0 sm:mt-3">
                    <div className="text-lg sm:text-xl font-bold text-blue-600">
                        {requiredSlices}
                        {hasExtra && (
                            <>
                                <span className="text-gray-500 font-normal"> {extraSlices > 0 ? '+' : '-'}</span>
                                <span className={`font-bold ${extraColor}`}>{Math.abs(extraSlices)}</span>
                                <span className="text-gray-500 font-normal"> = </span>
                                <span className="text-blue-600 font-bold">{totalSlices}</span>
                            </>
                        )}
                    </div>
                    <div className="text-sm text-gray-600">Ordered slices</div>
                </div>

                {/* Extra/Missing indicator */}
                <div className="text-center mt-0 sm:mt-3">
                    <div className={`text-lg font-bold ${hasExtra ? extraColor : 'text-gray-400'}`}>
                        {Math.abs(extraSlices)}
                    </div>
                    <div className={`text-sm ${hasExtra ? extraBgColor : 'text-gray-400'}`}>
                        {extraLabel}
                    </div>
                </div>
            </div>
        </button>
    )
}

export default PizzaVariantCard
