import { useState } from 'react'
import { SauceType } from '../types'
import { Plus, Trash2 } from 'lucide-react'

interface SauceSelectorProps {
  selectedSauces: SauceType[]
  onSaucesChange: (sauces: SauceType[]) => void
}

const SauceSelector = ({ selectedSauces, onSaucesChange }: SauceSelectorProps) => {
  const [showForm, setShowForm] = useState(false)
  const [newSauce, setNewSauce] = useState({
    name: '',
    price: { small: 0, medium: 0, large: 0 }
  })

  const defaultSauceTypes: SauceType[] = [
    {
      id: 'tomato',
      name: 'Tomato sauce',
      price: { small: 50, medium: 80, large: 120 }
    },
    {
      id: 'garlic',
      name: 'Garlic sauce',
      price: { small: 60, medium: 90, large: 130 }
    },
    {
      id: 'cheese',
      name: 'Cheese sauce',
      price: { small: 70, medium: 100, large: 140 }
    },
    {
      id: 'bbq',
      name: 'BBQ sauce',
      price: { small: 65, medium: 95, large: 135 }
    }
  ]

  const handleAddSauce = (sauce: SauceType) => {
    if (!selectedSauces.find(s => s.id === sauce.id)) {
      onSaucesChange([...selectedSauces, sauce])
    }
  }

  const handleRemoveSauce = (sauceId: string) => {
    onSaucesChange(selectedSauces.filter(s => s.id !== sauceId))
  }

  const handleCreateCustomSauce = () => {
    if (!newSauce.name.trim()) {
      alert('Enter sauce name')
      return
    }

    const customSauce: SauceType = {
      id: `custom-sauce-${Date.now()}`,
      name: newSauce.name,
      price: newSauce.price
    }

    onSaucesChange([...selectedSauces, customSauce])
    setNewSauce({
      name: '',
      price: { small: 0, medium: 0, large: 0 }
    })
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      {/* Preset sauces */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Popular sauces
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {defaultSauceTypes.map((sauce) => (
            <div key={sauce.id} className="border border-gray-200 rounded-lg p-4 hover:border-pizza-300 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{sauce.name}</h4>
                <button
                  onClick={() => handleAddSauce(sauce)}
                  className="btn-primary p-3"
                  disabled={selectedSauces.some(s => s.id === sauce.id)}
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Small:</span>
                  <span>{sauce.price.small}₽</span>
                </div>
                <div className="flex justify-between">
                  <span>Medium:</span>
                  <span>{sauce.price.medium}₽</span>
                </div>
                <div className="flex justify-between">
                  <span>Large:</span>
                  <span>{sauce.price.large}₽</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create custom sauce */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Create custom sauce
          </h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-secondary text-sm"
          >
            {showForm ? 'Hide' : 'Create'}
          </button>
        </div>

        {showForm && (
          <div className="border border-gray-200 rounded-lg p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sauce name
              </label>
              <input
                type="text"
                value={newSauce.name}
                onChange={(e) => setNewSauce({ ...newSauce, name: e.target.value })}
                className="input-field"
                placeholder="Enter name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prices by size
              </label>
              <div className="grid grid-cols-3 gap-4">
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <div key={size} className="space-y-2">
                    <label className="block text-sm text-gray-600 capitalize">
                      {size === 'small' ? 'Small' : size === 'medium' ? 'Medium' : 'Large'}
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        value={newSauce.price[size]}
                        onChange={(e) => setNewSauce({
                          ...newSauce,
                          price: { ...newSauce.price, [size]: parseInt(e.target.value) || 0 }
                        })}
                        className="input-field text-sm"
                        placeholder="0"
                      />
                      <span className="text-sm text-gray-500">₽</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCreateCustomSauce}
                className="btn-primary flex-1"
              >
                Create sauce
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selected sauces */}
      {selectedSauces.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Selected sauces ({selectedSauces.length})
          </h3>
          <div className="space-y-2">
            {selectedSauces.map((sauce) => (
              <div key={sauce.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900">{sauce.name}</span>
                  <span className="text-sm text-gray-600 ml-2">
                    from {Math.min(...Object.values(sauce.price))}₽
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveSauce(sauce.id)}
                  className="text-red-600 hover:text-red-800 p-3"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sauce information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">
          How do sauces work?
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Personal sauces</strong> - added to specific participant's cost</li>
          <li>• <strong>Shared sauces</strong> - divided equally among all participants</li>
          <li>• Each participant can choose their personal sauces in the next step</li>
        </ul>
      </div>
    </div>
  )
}

export default SauceSelector









