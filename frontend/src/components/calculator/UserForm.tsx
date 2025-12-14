import { useState } from 'react'
import { Plus, X } from 'lucide-react'

interface UserFormProps {
  onAddUser: (userData: { name: string; minSlices: number; maxSlices: number; preferredTypes?: string[] }) => void
}

const UserForm = ({ onAddUser }: UserFormProps) => {
  const [name, setName] = useState('')
  const [minSlices, setMinSlices] = useState(1)
  const [maxSlices, setMaxSlices] = useState(3)
  const [preferredTypes, setPreferredTypes] = useState<string[]>([])
  const [showForm, setShowForm] = useState(false)

  const pizzaTypes = [
    'Margherita',
    'Pepperoni',
    'Four Cheese',
    'Hawaiian',
    'Meat',
    'Vegetarian'
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      alert('Enter participant name')
      return
    }

    if (minSlices > maxSlices) {
      alert('Minimum quantity cannot be greater than maximum')
      return
    }

    onAddUser({
      name: name.trim(),
      minSlices,
      maxSlices,
      preferredTypes: preferredTypes.length > 0 ? preferredTypes : undefined
    })

    // Reset form
    setName('')
    setMinSlices(1)
    setMaxSlices(3)
    setPreferredTypes([])
    setShowForm(false)
  }

  const handleTypeToggle = (type: string) => {
    setPreferredTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full flex items-center justify-center space-x-2 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-pizza-500 hover:bg-pizza-50 transition-colors"
      >
        <Plus className="h-5 w-5 text-gray-400" />
        <span className="text-gray-600">Add participant</span>
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Add participant
        </h3>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Participant name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field"
          placeholder="Enter name"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum slices
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={minSlices}
            onChange={(e) => setMinSlices(parseInt(e.target.value) || 1)}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum slices
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={maxSlices}
            onChange={(e) => setMaxSlices(parseInt(e.target.value) || 3)}
            className="input-field"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pizza type preferences (optional)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {pizzaTypes.map((type) => (
            <label key={type} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={preferredTypes.includes(type)}
                onChange={() => handleTypeToggle(type)}
                className="rounded border-gray-300 text-pizza-600 focus:ring-pizza-500"
              />
              <span className="text-sm text-gray-700">{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          type="submit"
          className="btn-primary flex-1"
        >
          Add participant
        </button>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="btn-secondary flex-1"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default UserForm









