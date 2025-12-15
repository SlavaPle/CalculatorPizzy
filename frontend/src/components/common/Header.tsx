import { User } from '../../shared/types'
import { Pizza, HelpCircle } from 'lucide-react'

interface HeaderProps {
  currentUser: User | null
  isGuest: boolean
  onHelpClick: () => void
}

const Header = ({ currentUser, isGuest, onHelpClick }: HeaderProps) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="mx-auto px-4" style={{ maxWidth: '50rem' }}>
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Pizza className="h-6 w-6 text-pizza-600" />
            <span className="text-lg font-bold text-gray-900">PizzaCalk</span>
          </div>

          {/* User */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onHelpClick}
              className="inline-flex items-center space-x-1 text-sm text-pizza-600 hover:text-pizza-700 font-medium"
            >
              <HelpCircle className="h-4 w-4" />
              <span>Help</span>
            </button>
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">{currentUser.name}</span>
              </div>
            ) : isGuest ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Guest</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header