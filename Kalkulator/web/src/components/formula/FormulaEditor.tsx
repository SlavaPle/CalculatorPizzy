import React from 'react'
import { Box, Typography, Paper, TextField, Button, IconButton, Tooltip } from '@mui/material'
import { Save as SaveIcon, PlayArrow as PlayIcon, Settings as SettingsIcon } from '@mui/icons-material'
import { Formula } from '@shared/models/formula/Formula'
import { ComputeEngine } from '@cortex-js/compute-engine'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': any
    }
  }
}

interface FormulaEditorProps {
  formula: Formula
}

export const FormulaEditor: React.FC<FormulaEditorProps> = ({ formula }) => {
  const [formulaText, setFormulaText] = React.useState(formula.formula)
  const [latex, setLatex] = React.useState<string>(formula.formulaLatex || '')
  const [mathJson, setMathJson] = React.useState<unknown>(formula.formulaJson || null)
  const [isValid, setIsValid] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const mathfieldRef = React.useRef<any>(null)

  React.useEffect(() => {
    // Ленивая загрузка MathLive для регистрации кастомного элемента
    let mounted = true
    ;(async () => {
      try {
        await import('mathlive')
      } catch (_) {
        // игнорируем для SSR/тестов
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const handleSave = () => {
    // Подменяем основной текст формулы текущим LaTeX для обратной совместимости
    const normalizedText = latex || formulaText
    console.log('Save formula:', { text: normalizedText, latex, mathJson })
  }

  const handleTest = () => {
    try {
      const ce = new ComputeEngine()
      const expr = ce.parse(latex && latex.trim().length > 0 ? latex : formulaText)
      const evaluated = expr.evaluate()
      const numeric = evaluated.N()
      console.log('ComputeEngine test result:', numeric.json)
    } catch (e) {
      console.error('ComputeEngine error:', e)
    }
  }

  const handleSettings = () => {
    console.log('Formula settings')
  }

  const handleFormulaChange = (_event: React.ChangeEvent<HTMLInputElement>) => {
    // Редактирование текстового поля отключено; источник истины — MathLive
    return
  }

  const handleLatexInput = React.useCallback(() => {
    try {
      const current = mathfieldRef.current as any
      const nextLatex = current?.value ?? ''
      setLatex(nextLatex)
      const ce = new ComputeEngine()
      const expr = ce.parse(nextLatex || '')
      setMathJson(expr.json)
      setIsValid(true)
      setError(null)
    } catch (e: any) {
      setIsValid(false)
      setError(e?.message || 'Ошибка парсинга LaTeX')
    }
  }, [])

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

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              LaTeX (MathLive)
            </Typography>
            <Box
              sx={{
                p: 1,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                backgroundColor: 'background.paper',
              }}
            >
              <math-field
                ref={mathfieldRef}
                value={latex}
                onInput={handleLatexInput}
                style={{ width: '100%', minHeight: 48 }}
              />
            </Box>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Текущий LaTeX (только просмотр)
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={10}
              value={latex || formulaText}
              onChange={handleFormulaChange}
              error={!isValid}
              helperText={error || 'Редактируйте формулу в поле MathLive слева'}
              placeholder="LaTeX формулы"
              InputProps={{ readOnly: true }}
              sx={{
                '& .MuiInputBase-input': {
                  fontFamily: 'monospace',
                  fontSize: '1rem',
                  lineHeight: 1.5,
                },
              }}
            />
          </Box>
        </Box>
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
              MathJSON (фрагмент)
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
              {mathJson ? JSON.stringify(mathJson).slice(0, 200) : '—'}
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
