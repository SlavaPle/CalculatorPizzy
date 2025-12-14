import { Minus, Plus } from 'lucide-react'

interface NumericStepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
  className?: string
}

const NumericStepper = ({
  value,
  onChange,
  min = 1,
  max = 100,
  step = 1,
  label,
  className = ''
}: NumericStepperProps) => {
  const handleDecrement = () => {
    const newValue = Math.max(min, value - step)
    onChange(newValue)
  }

  const handleIncrement = () => {
    const newValue = Math.min(max, value + step)
    onChange(newValue)
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={handleDecrement}
          disabled={value <= min}
          className={`w-10 h-10 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${value <= min
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
        >
          <Minus className="h-5 w-5 sm:h-5 sm:w-5" />
        </button>

        <span className="w-8 sm:w-10 text-center font-medium text-base sm:text-lg text-gray-900">
          {value}
        </span>

        <button
          onClick={handleIncrement}
          disabled={value >= max}
          className={`w-10 h-10 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${value >= max
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
        >
          <Plus className="h-5 w-5 sm:h-5 sm:w-5" />
        </button>
      </div>
    </div>
  )
}

export default NumericStepper

