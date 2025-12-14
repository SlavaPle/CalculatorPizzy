import { useState } from 'react'
import { Link } from 'react-router-dom'
import { User } from '../shared/types'
import { Pizza, ArrowLeft, User as UserIcon, Eye, EyeOff } from 'lucide-react'

interface AuthPageProps {
  onLogin: (user: User) => void
  onGuestMode: () => void
}

const AuthPage = ({ onLogin, onGuestMode }: AuthPageProps) => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])

    // Validation
    const newErrors: string[] = []

    if (!formData.name.trim()) {
      newErrors.push('Enter name')
    }

    if (!isLogin) {
      if (!formData.email.trim()) {
        newErrors.push('Enter email')
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.push('Enter valid email')
      }

      if (!formData.password) {
        newErrors.push('Enter password')
      } else if (formData.password.length < 6) {
        newErrors.push('Password must contain at least 6 characters')
      }

      if (!isLogin && formData.password !== formData.confirmPassword) {
        newErrors.push('Passwords do not match')
      }
    }

    if (newErrors.length > 0) {
      setErrors(newErrors)
      return
    }

    // User creation
    const user: User = {
      id: `user-${Date.now()}`,
      name: formData.name.trim(),
      minSlices: 1,
      maxSlices: 1,
      canBeMore: false,

      totalCost: 0,
      assignedSlices: []
    }

    onLogin(user)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors.length > 0) {
      setErrors([])
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 text-pizza-600 hover:text-pizza-700 mb-4">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to home</span>
          </Link>

          <div className="flex justify-center mb-4">
            <Pizza className="h-12 w-12 text-pizza-600" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900">
            {isLogin ? 'Login to account' : 'Create account'}
          </h2>
          <p className="mt-2 text-gray-600">
            {isLogin
              ? 'Login to your account to save settings'
              : 'Create an account to save your calculations'
            }
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name *
              </label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="input-field pl-10"
                  placeholder="Enter your name"
                  required
                />
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="input-field"
                  placeholder="example@email.com"
                  required
                />
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <div className="mt-1 relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="input-field pr-10"
                    placeholder="At least 6 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirm password *
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="input-field"
                  placeholder="Repeat password"
                  required
                />
              </div>
            )}
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <ul className="text-sm text-red-600 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-4">
            <button
              type="submit"
              className="w-full btn-primary py-3"
            >
              {isLogin ? 'Login' : 'Create account'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-pizza-600 hover:text-pizza-700 text-sm"
              >
                {isLogin
                  ? 'No account? Create'
                  : 'Already have an account? Login'
                }
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onGuestMode}
              className="w-full btn-secondary py-3"
            >
              Continue as guest
            </button>
          </div>
        </form>

        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">
            Why do you need an account?
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Save your calculations</li>
            <li>• Personal settings</li>
            <li>• Order history</li>
            <li>• Sync between devices</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AuthPage


