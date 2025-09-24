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
  Alert,
} from '@mui/material'
import {
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material'
import { AuthService } from '@shared/auth/AuthService'

interface ForgotPasswordFormProps {
  onSuccess: () => void
}

interface ForgotPasswordFormData {
  email: string
}

const schema = yup.object({
  email: yup
    .string()
    .email('Введите корректный email')
    .required('Email обязателен'),
})

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const authService = AuthService.getInstance()
      const result = await authService.forgotPassword(data.email)

      if (result.success) {
        setIsSuccess(true)
        setTimeout(() => {
          onSuccess()
        }, 2000)
      } else {
        setError(result.error || 'Ошибка восстановления пароля')
      }
    } catch (error) {
      setError('Ошибка сети')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <Box sx={{ textAlign: 'center' }}>
        <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Инструкции отправлены!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Проверьте вашу почту и следуйте инструкциям для восстановления пароля.
        </Typography>
      </Box>
    )
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', fontWeight: 600 }}>
        Восстановление пароля
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
        Введите ваш email, и мы отправим инструкции для восстановления пароля.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

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
        {isLoading ? 'Отправка...' : 'Отправить инструкции'}
      </Button>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
        Вспомнили пароль?{' '}
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
