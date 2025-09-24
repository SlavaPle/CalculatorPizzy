import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
} from '@mui/material'
import { RootState } from '@store'
import { loginStart, loginSuccess, loginFailure } from '@store/slices/authSlice'
import { LoginForm } from '@components/auth/LoginForm'
import { RegisterForm } from '@components/auth/RegisterForm'
import { ForgotPasswordForm } from '@components/auth/ForgotPasswordForm'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export const AuthPage: React.FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { isLoading, error } = useSelector((state: RootState) => state.auth)
  const [tabValue, setTabValue] = useState(0)

  const from = location.state?.from?.pathname || '/'

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleLoginSuccess = () => {
    navigate(from, { replace: true })
  }

  const handleRegisterSuccess = () => {
    setTabValue(0) // Переключиться на вкладку входа
  }

  const handleForgotPasswordSuccess = () => {
    setTabValue(0) // Переключиться на вкладку входа
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="auth tabs"
              variant="fullWidth"
            >
              <Tab label="Вход" id="auth-tab-0" aria-controls="auth-tabpanel-0" />
              <Tab label="Регистрация" id="auth-tab-1" aria-controls="auth-tabpanel-1" />
              <Tab label="Восстановление" id="auth-tab-2" aria-controls="auth-tabpanel-2" />
            </Tabs>
          </Box>

          {error && (
            <Alert severity="error" sx={{ m: 2 }}>
              {error}
            </Alert>
          )}

          <TabPanel value={tabValue} index={0}>
            <LoginForm onSuccess={handleLoginSuccess} />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <RegisterForm onSuccess={handleRegisterSuccess} />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <ForgotPasswordForm onSuccess={handleForgotPasswordSuccess} />
          </TabPanel>

          {isLoading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                zIndex: 1,
              }}
            >
              <CircularProgress />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
