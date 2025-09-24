import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@store'
import { setCurrentTab } from '@store/slices/calculatorSlice'
import { Box, Typography, Alert } from '@mui/material'
import { CalculatorInterface } from '@components/calculator/CalculatorInterface'

export const CalculatorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const dispatch = useDispatch()
  const { currentTab, tabs } = useSelector((state: RootState) => state.calculator)

  useEffect(() => {
    if (id) {
      const tab = tabs.find(t => t.id === id)
      if (tab) {
        dispatch(setCurrentTab(tab))
      }
    }
  }, [id, tabs, dispatch])

  if (!currentTab) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Калькулятор не найден
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          {currentTab.displayName}
        </Typography>
        {currentTab.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {currentTab.description}
          </Typography>
        )}
      </Box>
      
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <CalculatorInterface tab={currentTab} />
      </Box>
    </Box>
  )
}
