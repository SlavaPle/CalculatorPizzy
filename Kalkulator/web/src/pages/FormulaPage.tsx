import React from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { Box, Typography, Alert } from '@mui/material'
import { FormulaEditor } from '@components/formula/FormulaEditor'

export const FormulaPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { formulas } = useSelector((state: RootState) => state.formula)
  
  const formula = formulas.find(f => f.id === id)

  if (!formula) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Формула не найдена
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          {formula.displayName}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Редактирование формулы
        </Typography>
      </Box>
      
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <FormulaEditor formula={formula} />
      </Box>
    </Box>
  )
}
