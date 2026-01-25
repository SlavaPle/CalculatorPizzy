import { useState, useEffect } from 'react'
import { Plus, Minus } from 'lucide-react'

interface AddUserFormProps {
  usersCount: number
  savedUsers: string[]
  onAddUser: (name: string, slices: number, canBeMore: boolean) => void
}

const AddUserForm = ({ usersCount, savedUsers, onAddUser }: AddUserFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    slices: 3,
    canBeMore: false
  })
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])

  useEffect(() => {
    const filtered = savedUsers.filter(name =>
      name.toLowerCase().includes(formData.name.toLowerCase())
    )
    setFilteredSuggestions(filtered)
  }, [formData.name, savedUsers])

  const handleAddUser = () => {
    if (formData.slices < 1) {
      alert('Number of slices must be at least 1')
      return
    }

    if (formData.slices > 20) {
      alert('Number of slices cannot be more than 20')
      return
    }

    const userName = formData.name.trim() || `User ${usersCount + 1}`
    onAddUser(userName, formData.slices, formData.canBeMore)
    setFormData({ name: '', slices: 3, canBeMore: false })
    setShowSuggestions(false)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Number */}
        <div className="w-8 h-8 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
          {usersCount + 1}
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
            placeholder={`User ${usersCount + 1}`}
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
  )
}

export default AddUserForm
