import { useState } from 'react'
import { Link } from 'react-router-dom'
import { User } from '../types'
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

    // Валидация
    const newErrors: string[] = []
    
    if (!formData.name.trim()) {
      newErrors.push('Введите имя')
    }
    
    if (!isLogin) {
      if (!formData.email.trim()) {
        newErrors.push('Введите email')
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.push('Введите корректный email')
      }
      
      if (!formData.password) {
        newErrors.push('Введите пароль')
      } else if (formData.password.length < 6) {
        newErrors.push('Пароль должен содержать минимум 6 символов')
      }
      
      if (!isLogin && formData.password !== formData.confirmPassword) {
        newErrors.push('Пароли не совпадают')
      }
    }

    if (newErrors.length > 0) {
      setErrors(newErrors)
      return
    }

    // Создание пользователя
    const user: User = {
      id: `user-${Date.now()}`,
      name: formData.name.trim(),
      minSlices: 1,
      canBeMore: false,
      personalSauces: [],
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
        {/* Заголовок */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 text-pizza-600 hover:text-pizza-700 mb-4">
            <ArrowLeft className="h-5 w-5" />
            <span>На главную</span>
          </Link>
          
          <div className="flex justify-center mb-4">
            <Pizza className="h-12 w-12 text-pizza-600" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900">
            {isLogin ? 'Вход в аккаунт' : 'Создание аккаунта'}
          </h2>
          <p className="mt-2 text-gray-600">
            {isLogin 
              ? 'Войдите в свой аккаунт для сохранения настроек'
              : 'Создайте аккаунт для сохранения ваших расчетов'
            }
          </p>
        </div>

        {/* Форма */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Имя *
              </label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="input-field pl-10"
                  placeholder="Введите ваше имя"
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
                  Пароль *
                </label>
                <div className="mt-1 relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="input-field pr-10"
                    placeholder="Минимум 6 символов"
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
                  Подтвердите пароль *
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="input-field"
                  placeholder="Повторите пароль"
                  required
                />
              </div>
            )}
          </div>

          {/* Ошибки */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <ul className="text-sm text-red-600 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Кнопки */}
          <div className="space-y-4">
            <button
              type="submit"
              className="w-full btn-primary py-3"
            >
              {isLogin ? 'Войти' : 'Создать аккаунт'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-pizza-600 hover:text-pizza-700 text-sm"
              >
                {isLogin 
                  ? 'Нет аккаунта? Создать' 
                  : 'Уже есть аккаунт? Войти'
                }
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">или</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onGuestMode}
              className="w-full btn-secondary py-3"
            >
              Продолжить как гость
            </button>
          </div>
        </form>

        {/* Информация */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">
            Зачем нужен аккаунт?
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Сохранение ваших расчетов</li>
            <li>• Персональные настройки</li>
            <li>• История заказов</li>
            <li>• Синхронизация между устройствами</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AuthPage


