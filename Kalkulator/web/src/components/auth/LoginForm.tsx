import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
} from '@mui/material'
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material'
import { useDispatch } from 'react-redux'
import { loginStart, loginSuccess, loginFailure } from '@store/slices/authSlice'
import { AuthService } from '@shared/auth/AuthService'

interface LoginFormProps {
  onSuccess: () => void
}

interface LoginFormData {
  email: string
  password: string
}

const schema = yup.object({
  email: yup
    .string()
    .email('Введите корректный email')
    .required('Email обязателен'),
  password: yup
    .string()
    .min(6, 'Пароль должен содержать минимум 6 символов')
    .required('Пароль обязателен'),
})

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const dispatch = useDispatch()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    dispatch(loginStart())

    try {
      const authService = AuthService.getInstance()
      const result = await authService.login(data.email, data.password)

      if (result.success && result.user && result.token) {
        // AuthService уже сохранил данные в localStorage
        dispatch(loginSuccess(result.user))
        onSuccess()
      } else {
        dispatch(loginFailure(result.error || 'Ошибка входа'))
      }
    } catch (error) {
      dispatch(loginFailure('Ошибка сети'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuest = async () => {
    setIsLoading(true)
    dispatch(loginStart())
    try {
      const authService = AuthService.getInstance()
      const result = await authService.guestLogin()
      if (result.success && result.user && result.token) {
        // AuthService уже сохранил данные в localStorage
        dispatch(loginSuccess(result.user))
        onSuccess()
      } else {
        dispatch(loginFailure(result.error || 'Ошибка гостевого входа'))
      }
    } catch (e) {
      dispatch(loginFailure('Ошибка сети'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleTogglePassword = () => {
    setShowPassword(!showPassword)
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', fontWeight: 600 }}>
        Вход в систему
      </Typography>

      <TextField
        {...register('email')}
        fullWidth
        label="Email"
        type="email"
        error={!!errors.email}
        helperText={errors.email?.message}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <EmailIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      <TextField
        {...register('password')}
        fullWidth
        label="Пароль"
        type={showPassword ? 'text' : 'password'}
        error={!!errors.password}
        helperText={errors.password?.message}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockIcon />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleTogglePassword} edge="end">
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isLoading}
        sx={{ mb: 2 }}
      >
        {isLoading ? 'Вход...' : 'Войти'}
      </Button>

      <Button
        fullWidth
        variant="outlined"
        size="large"
        disabled={isLoading}
        onClick={handleGuest}
        sx={{ mb: 2 }}
      >
        Войти как гость
      </Button>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
        Нет аккаунта?{' '}
        <Button
          variant="text"
          size="small"
          onClick={() => {
            // Переключение на вкладку регистрации
            const tabs = document.querySelector('[role="tablist"]')
            const registerTab = tabs?.querySelector('[aria-controls="auth-tabpanel-1"]') as HTMLElement
            registerTab?.click()
          }}
        >
          Зарегистрироваться
        </Button>
      </Typography>
    </Box>
  )
}
