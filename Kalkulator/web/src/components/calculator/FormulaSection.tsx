import React from 'react'
import { Box, Typography, Paper, IconButton, Tooltip, Chip, Collapse } from '@mui/material'
import { Delete as DeleteIcon, Edit as EditIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material'
import { Formula } from '@shared/models/formula/Formula'

interface FormulaSectionProps {
  formulas: Formula[]
}

export const FormulaSection: React.FC<FormulaSectionProps> = ({ formulas }) => {
  const [expandedFormulas, setExpandedFormulas] = React.useState<Set<string>>(new Set())

  const handleDelete = (formulaId: string) => {
    console.log('Delete formula:', formulaId)
  }

  const handleEdit = (formulaId: string) => {
    console.log('Edit formula:', formulaId)
  }

  const handleToggleExpanded = (formulaId: string) => {
    const newExpanded = new Set(expandedFormulas)
    if (newExpanded.has(formulaId)) {
      newExpanded.delete(formulaId)
    } else {
      newExpanded.add(formulaId)
    }
    setExpandedFormulas(newExpanded)
  }

  if (formulas.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Нет формул
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {formulas.map((formula) => {
        const isExpanded = expandedFormulas.has(formula.id)
        
        return (
          <Paper
            key={formula.id}
            variant="outlined"
            sx={{
              p: 2,
              backgroundColor: formula.isEnabled ? 'background.paper' : 'action.disabledBackground',
              opacity: formula.isEnabled ? 1 : 0.6,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
                {formula.displayName}
              </Typography>
              
              <Chip
                label={formula.isEnabled ? 'Включена' : 'Отключена'}
                size="small"
                color={formula.isEnabled ? 'success' : 'default'}
                variant="outlined"
              />
              
              <Tooltip title={isExpanded ? 'Свернуть' : 'Развернуть'}>
                <IconButton
                  size="small"
                  onClick={() => handleToggleExpanded(formula.id)}
                >
                  {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Tooltip>
            </Box>

            <Collapse in={isExpanded}>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Формула:
                </Typography>
                <Box
                  sx={{
                    p: 1,
                    backgroundColor: 'action.hover',
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    mb: 2,
                  }}
                >
                  {formula.formula}
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    label={`Входы: ${formula.inputs.length}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={`Выходы: ${formula.outputs.length}`}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Редактировать">
                    <IconButton size="small" onClick={() => handleEdit(formula.id)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Удалить">
                    <IconButton size="small" onClick={() => handleDelete(formula.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Collapse>
          </Paper>
        )
      })}
    </Box>
  )
}
