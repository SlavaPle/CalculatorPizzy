import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { initializeAuth } from '@store/slices/authSlice'
import { AuthService } from '@shared/auth/AuthService'

interface AuthInitializerProps {
  children: React.ReactNode
}

export const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const dispatch = useDispatch()

  useEffect(() => {
    const initializeAuthState = async () => {
      try {
        const authService = AuthService.getInstance()
        const user = authService.getCurrentUser()
        const isAuthenticated = authService.isAuthenticated()

        // Если есть сохраненные данные, проверяем токен
        if (user && isAuthenticated) {
          // Попробуем обновить токен, если это возможно
          const tokenRefreshed = await authService.refreshAccessToken()
          
          if (tokenRefreshed || authService.isAuthenticated()) {
            // Токен действителен или был успешно обновлен
            dispatch(initializeAuth({ user, isAuthenticated: true }))
          } else {
            // Токен недействителен, очищаем данные
            await authService.logout()
            dispatch(initializeAuth({ user: null, isAuthenticated: false }))
          }
        } else {
          // Если нет сохраненных данных, устанавливаем состояние как неавторизованное
          dispatch(initializeAuth({ user: null, isAuthenticated: false }))
        }
      } catch (error) {
        console.error('Ошибка инициализации авторизации:', error)
        // В случае ошибки, устанавливаем состояние как неавторизованное
        dispatch(initializeAuth({ user: null, isAuthenticated: false }))
      }
    }

    initializeAuthState()
  }, [dispatch])

  return <>{children}</>
}
