import { useState, useEffect } from 'react'
import { X, Trash2, Save } from 'lucide-react'
import NumericStepper from '../common/NumericStepper'
import { CalculationSchemeManager } from '../../utils/calculationSchemes/CalculationSchemeManager'

// Component for visualizing pizza with slices
const PizzaVisualization = ({ slices, size, label }: { slices: number, size: 'small' | 'large', label: string }) => {
  const pizzaSize = size === 'small' ? 'w-16 h-16' : 'w-20 h-20'
  const containerSize = size === 'small' ? 64 : 80 // размер в пикселях

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="text-sm font-medium text-gray-700">{label}</div>
      <div className={`relative ${pizzaSize} rounded-full border-2 border-gray-300 bg-orange-100 flex items-center justify-center overflow-hidden`}>
        {/* Separators between slices */}
        <svg
          className="absolute inset-0 w-full h-full"
        >
          {Array.from({ length: slices }).map((_, index) => {
            const angle = (360 / slices) * index - 90 // начинаем с -90 для верхней позиции
            const centerX = containerSize / 2
            const centerY = containerSize / 2
            const innerRadius = containerSize * 0.15
            const outerRadius = containerSize * 0.45
            
            const x1 = centerX + innerRadius * Math.cos(angle * Math.PI / 180)
            const y1 = centerY + innerRadius * Math.sin(angle * Math.PI / 180)
            const x2 = centerX + outerRadius * Math.cos(angle * Math.PI / 180)
            const y2 = centerY + outerRadius * Math.sin(angle * Math.PI / 180)

            return (
              <line
                key={`line-${index}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#fb923c"
                strokeWidth="2"
              />
            )
          })}
        </svg>
        {/* Pizza center */}
        <div className={`absolute w-2 h-2 bg-orange-400 rounded-full`}></div>
      </div>
      <div className="text-xs text-gray-600">{slices} slices</div>
    </div>
  )
}

export interface PizzaSettings {
  smallPizzaSlices: number
  largePizzaSlices: number
  largePizzaPrice: number
  smallPizzaPricePercent: number // percentage of small pizza price relative to large (0-100)
  freePizzaThreshold: number
  useFreePizza: boolean // use free pizza
  freePizzaIsSmall: boolean // free pizza is small (otherwise large)
  smallEqual: boolean // calculated: small >= large
  calculationScheme: string // calculation scheme
}

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: PizzaSettings
  onSave: (settings: PizzaSettings) => void
}

const SettingsModal = ({ isOpen, onClose, settings, onSave }: SettingsModalProps) => {
  const [localSettings, setLocalSettings] = useState(settings)
  const [availableSchemes, setAvailableSchemes] = useState<any[]>([])

  useEffect(() => {
    const schemeManager = CalculationSchemeManager.getInstance()
    setAvailableSchemes(schemeManager.getAllSchemes())
  }, [isOpen, settings])

  if (!isOpen) return null

  const handleSave = () => {
    // Recalculate smallEqual before saving
    const updatedSettings = {
      ...localSettings,
      smallEqual: localSettings.smallPizzaSlices >= localSettings.largePizzaSlices
    }
    onSave(updatedSettings)
  }

  const handleClearSavedUsers = () => {
    if (confirm('Delete all saved users?')) {
      localStorage.removeItem('savedUsers')
      alert('Saved users deleted')
    }
  }

  const handleClearAll = () => {
    if (confirm('Clear all application data?')) {
      localStorage.clear()
      window.location.reload()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Pizza settings */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Calculation settings</h3>
            <div className="space-y-4">
              {/* Calculation scheme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calculation scheme
                </label>
                <select
                  value={localSettings.calculationScheme}
                  onChange={(e) => {
                    setLocalSettings({ ...localSettings, calculationScheme: e.target.value })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pizza-500 focus:border-pizza-500"
                >
                  {availableSchemes.map((scheme) => (
                    <option 
                      key={scheme.id} 
                      value={scheme.id}
                    >
                      {scheme.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {availableSchemes.find(s => s.id === localSettings.calculationScheme)?.description}
                </p>
              </div>
              {/* Pizza visualization */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700 mb-3">Pizza visualization</div>
                <div className="flex justify-center space-x-8">
                  <PizzaVisualization
                    slices={localSettings.smallPizzaSlices}
                    size="small"
                    label="Small pizza"
                  />
                  <PizzaVisualization
                    slices={localSettings.largePizzaSlices}
                    size="large"
                    label="Large pizza"
                  />
                </div>
              </div>

              <NumericStepper
                label="Slices in small pizza"
                value={localSettings.smallPizzaSlices}
                onChange={(value) => setLocalSettings({ ...localSettings, smallPizzaSlices: value })}
                min={4}
                max={10}
              />

              <NumericStepper
                label="Slices in large pizza"
                value={localSettings.largePizzaSlices}
                onChange={(value) => setLocalSettings({ ...localSettings, largePizzaSlices: value })}
                min={6}
                max={12}
              />

              <NumericStepper
                label="Small pizza price relative to large (%)"
                value={localSettings.smallPizzaPricePercent}
                onChange={(value) => setLocalSettings({ ...localSettings, smallPizzaPricePercent: value })}
                min={0}
                max={100}
                step={5}
              />

              <div className="border-t pt-4">
                <label className="flex items-center space-x-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={localSettings.useFreePizza}
                    onChange={(e) => setLocalSettings({ ...localSettings, useFreePizza: e.target.checked })}
                    className="h-5 w-5 sm:h-6 sm:w-6 text-pizza-600 focus:ring-pizza-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Free pizza on order</span>
                </label>

                {localSettings.useFreePizza && (
                  <>
                    <NumericStepper
                      label="Every Nth pizza is free"
                      value={localSettings.freePizzaThreshold}
                      onChange={(value) => setLocalSettings({ ...localSettings, freePizzaThreshold: value })}
                      min={2}
                      max={10}
                    />
                    <label className="flex items-center space-x-2 cursor-pointer ml-4">
                      <input
                        type="checkbox"
                        checked={localSettings.freePizzaIsSmall}
                        onChange={(e) => setLocalSettings({ ...localSettings, freePizzaIsSmall: e.target.checked })}
                        className="h-5 w-5 sm:h-6 sm:w-6 text-pizza-600 focus:ring-pizza-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Small pizza (otherwise large)</span>
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Data management */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Data management</h3>
            <div className="space-y-2">
              <button
                onClick={handleClearSavedUsers}
                className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-yellow-50 text-yellow-700 border border-yellow-300 rounded-lg hover:bg-yellow-100"
              >
                <Trash2 className="h-5 w-5" />
                <span>Clear saved users</span>
              </button>

              <button
                onClick={handleClearAll}
                className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-red-50 text-red-700 border border-red-300 rounded-lg hover:bg-red-100"
              >
                <Trash2 className="h-5 w-5" />
                <span>Clear all data</span>
              </button>
            </div>
          </div>

          {/* Information */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-900 mb-2">About the app</h4>
            <p className="text-xs text-gray-600">
              PizzaCalk v1.0.0
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Pizza purchase calculator for office workers
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="p-4 border-t border-gray-200 sticky bottom-0 bg-white z-10 space-y-2">
          <button
            onClick={handleSave}
            className="w-full bg-pizza-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-pizza-700 flex items-center justify-center space-x-2"
          >
            <Save className="h-5 w-5" />
            <span>Save settings</span>
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
