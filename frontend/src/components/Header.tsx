import { User } from '../types'
import { Pizza } from 'lucide-react'

interface HeaderProps {
  currentUser: User | null
  isGuest: boolean
}

const Header = ({ currentUser, isGuest }: HeaderProps) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="mx-auto px-4" style={{ maxWidth: '800px' }}>
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Pizza className="h-6 w-6 text-pizza-600" />
            <span className="text-lg font-bold text-gray-900">PizzaCalk</span>
          </div>

          {/* User */}
          <div className="flex items-center space-x-3">
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