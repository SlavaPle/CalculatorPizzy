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
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material'
import { useDispatch } from 'react-redux'
import { loginStart, loginSuccess, loginFailure } from '@store/slices/authSlice'
import { AuthService } from '@shared/auth/AuthService'

interface RegisterFormProps {
  onSuccess: () => void
}

interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

const upperRegex = /\p{Lu}/u // хотя бы одна заглавная буква (любой алфавит, в т.ч. кириллица)
const lowerRegex = /\p{Ll}/u // хотя бы одна строчная буква (любой алфавит)
const digitRegex = /\d/
const symbolRegex = /[^\p{L}\d]/u // хотя бы один символ, не являющийся буквой или цифрой

const schema = yup.object({
  name: yup
    .string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .required('Имя обязательно'),
  email: yup
    .string()
    .email('Введите корректный email')
    .required('Email обязателен'),
  password: yup
    .string()
    .min(8, 'Минимум 8 символов')
    .test('has-upper', 'Нужна хотя бы одна заглавная буква (A…Z/А…Я)', (v) => !!v && upperRegex.test(v))
    .test('has-lower', 'Нужна хотя бы одна строчная буква (a…z/а…я)', (v) => !!v && lowerRegex.test(v))
    .test('has-digit', 'Нужна хотя бы одна цифра', (v) => !!v && digitRegex.test(v))
    .test('has-symbol', 'Нужен хотя бы один символ (напр. !@#%^&*)', (v) => !!v && symbolRegex.test(v))
    .test('no-space', 'Пробелы не допускаются', (v) => !!v && !/\s/.test(v))
    .required('Пароль обязателен'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Пароли не совпадают')
    .required('Подтверждение пароля обязательно'),
})

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const dispatch = useDispatch()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    dispatch(loginStart())

    try {
      const authService = AuthService.getInstance()
      const result = await authService.register(data.email, data.password, data.name)

      if (result.success && result.user && result.token) {
        dispatch(loginSuccess(result.user))
        onSuccess()
      } else {
        dispatch(loginFailure(result.error || 'Ошибка регистрации'))
      }
    } catch (error) {
      dispatch(loginFailure('Ошибка сети'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleTogglePassword = () => {
    setShowPassword(!showPassword)
  }

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', fontWeight: 600 }}>
        Регистрация
      </Typography>

      <TextField
        {...register('name')}
        fullWidth
        label="Имя"
        error={!!errors.name}
        helperText={errors.name?.message}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PersonIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

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
        sx={{ mb: 2 }}
      />

      <TextField
        {...register('confirmPassword')}
        fullWidth
        label="Подтверждение пароля"
        type={showConfirmPassword ? 'text' : 'password'}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockIcon />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleToggleConfirmPassword} edge="end">
                {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
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
        {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
      </Button>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
        Уже есть аккаунт?{' '}
        <Button
          variant="text"
          size="small"
          onClick={() => {
            // Переключение на вкладку входа
            const tabs = document.querySelector('[role="tablist"]')
            const loginTab = tabs?.querySelector('[aria-controls="auth-tabpanel-0"]') as HTMLElement
            loginTab?.click()
          }}
        >
          Войти
        </Button>
      </Typography>
    </Box>
  )
}
