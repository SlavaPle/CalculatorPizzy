import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'

import { Layout } from '@components/layout/Layout'
import { ProtectedRoute } from '@components/auth/ProtectedRoute'
import { AuthInitializer } from '@components/auth/AuthInitializer'
import { AuthPage } from '@pages/AuthPage'
import { HomePage } from '@pages/HomePage'
import { CalculatorPage } from '@pages/CalculatorPage'
import { FormulaPage } from '@pages/FormulaPage'
import { ProfilePage } from '@pages/ProfilePage'
import { SettingsPage } from '@pages/SettingsPage'
import { NotFoundPage } from '@pages/NotFoundPage'
import { FormulasPage } from '@pages/FormulasPage'

function App() {
  return (
    <AuthInitializer>
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        <Routes>
        {/* Публичные маршруты */}
        <Route path="/auth" element={<AuthPage />} />
        
        {/* Защищенные маршруты */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<HomePage />} />
          <Route path="calculator/:id" element={<CalculatorPage />} />
          <Route path="formula/:id" element={<FormulaPage />} />
          <Route path="formulas" element={<FormulasPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        
        {/* 404 */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Box>
    </AuthInitializer>
  )
}

export default App
