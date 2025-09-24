import React from 'react'
import { Box, Typography, Paper, TextField, Button, IconButton, Tooltip } from '@mui/material'
import { Save as SaveIcon, PlayArrow as PlayIcon, Settings as SettingsIcon } from '@mui/icons-material'
import { Formula } from '@shared/models/formula/Formula'

interface FormulaEditorProps {
  formula: Formula
}

export const FormulaEditor: React.FC<FormulaEditorProps> = ({ formula }) => {
  const [formulaText, setFormulaText] = React.useState(formula.formula)
  const [isValid, setIsValid] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const handleSave = () => {
    console.log('Save formula:', formulaText)
  }

  const handleTest = () => {
    console.log('Test formula:', formulaText)
  }

  const handleSettings = () => {
    console.log('Formula settings')
  }

  const handleFormulaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setFormulaText(value)
    
    // Простая валидация
    if (value.trim().length === 0) {
      setIsValid(false)
      setError('Формула не может быть пустой')
    } else {
      setIsValid(true)
      setError(null)
    }
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
      {/* Заголовок и действия */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {formula.displayName}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Настройки">
            <IconButton onClick={handleSettings}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          
          <Button
            variant="outlined"
            startIcon={<PlayIcon />}
            onClick={handleTest}
            sx={{ mr: 1 }}
          >
            Тест
          </Button>
          
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={!isValid}
          >
            Сохранить
          </Button>
        </Box>
      </Box>

      {/* Редактор формулы */}
      <Paper sx={{ p: 2, mb: 3, flex: 1 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Формула
        </Typography>
        
        <TextField
          fullWidth
          multiline
          rows={10}
          value={formulaText}
          onChange={handleFormulaChange}
          error={!isValid}
          helperText={error || 'Введите математическую формулу'}
          placeholder="Например: a + b * c"
          sx={{
            '& .MuiInputBase-input': {
              fontFamily: 'monospace',
              fontSize: '1rem',
              lineHeight: 1.5,
            },
          }}
        />
      </Paper>

      {/* Информация о формуле */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Информация
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Входные переменные
            </Typography>
            <Typography variant="body1">
              {formula.inputs.join(', ') || 'Нет'}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="body2" color="text.secondary">
              Выходные переменные
            </Typography>
            <Typography variant="body1">
              {formula.outputs.join(', ') || 'Нет'}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="body2" color="text.secondary">
              Порядок выполнения
            </Typography>
            <Typography variant="body1">
              {formula.executionOrder}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="body2" color="text.secondary">
              Статус
            </Typography>
            <Typography variant="body1">
              {formula.isEnabled ? 'Включена' : 'Отключена'}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}
