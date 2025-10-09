import React from 'react'
import { Box, Paper, Typography, TextField, Button, Stack, List, ListItem, ListItemText, Divider, Alert, IconButton, Tooltip, Grid } from '@mui/material'
import { ComputeEngine } from '@cortex-js/compute-engine'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': any
    }
  }
}
import { Delete as DeleteIcon, Edit as EditIcon, Save as SaveIcon, Add as AddIcon } from '@mui/icons-material'
import { AuthService } from '@shared/auth/AuthService'

type ApiFormula = {
  id: string
  name: string
  expression: string
  variables?: { key: string; name?: string; unit?: string }[]
  resultName?: string
  resultUnit?: string
  createdAt: string
  updatedAt: string
}

export const FormulasPage: React.FC = () => {
  const [items, setItems] = React.useState<ApiFormula[]>([])
  const [name, setName] = React.useState('')
  const [expression, setExpression] = React.useState('')
  const [mathJson, setMathJson] = React.useState<unknown>(null)
  const [variables, setVariables] = React.useState<{ key: string; name?: string; unit?: string }[]>([])
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [parseError, setParseError] = React.useState<string | null>(null)
  const mathfieldRef = React.useRef<any>(null)

  React.useEffect(() => {
    // Регистрация web-component MathLive
    (async () => {
      try {
        await import('mathlive')
      } catch (_) {
        // noop
      }
    })()
  }, [])

  // Синхронизация внешних изменений expression в math-field, не ломая ручной ввод
  React.useEffect(() => {
    const mf = mathfieldRef.current as any
    if (mf && typeof mf.value === 'string' && mf.value !== expression) {
      // Обновляем только когда значение пришло извне (например, при выборе для редактирования)
      mf.value = expression
    }
  }, [expression])

  const apiBase = (typeof window !== 'undefined' && (window as any).__API_URL__) || (import.meta as any)?.env?.VITE_API_URL || ''

  const extractFormulaInfo = React.useCallback((expr: string) => {
    // 1) Попытка разбора как LaTeX через Compute Engine (MathLive)
    try {
      const ce = new ComputeEngine()
      const parsed = ce.parse(expr)
      const json = (parsed as any)?.json

      const isEqual = Array.isArray(json) && json[0] === 'Equal' && json.length >= 3
      if (!isEqual) {
        setParseError('Формула должна содержать знак равенства (=)')
        return { variables: [], result: null, isValid: false, error: 'Формула должна содержать знак равенства (=)' }
      }

      const left = json[1]
      const right = json[2]

      // Собираем все символы из MathJSON
      const collectSymbols = (node: any, acc: Set<string>) => {
        if (!node) return
        if (Array.isArray(node)) {
          if (node[0] === 'Symbol' && typeof node[1] === 'string') {
            acc.add(node[1])
          } else {
            // Рекурсивно обходим остальные узлы
            for (let i = 1; i < node.length; i++) {
              collectSymbols(node[i], acc)
            }
          }
        }
      }

      const leftSyms = new Set<string>()
      const rightSyms = new Set<string>()
      collectSymbols(left, leftSyms)
      collectSymbols(right, rightSyms)

      let result: string | null = null
      let inputVariables: string[] = []

      if (leftSyms.size === 1 && rightSyms.size > 0) {
        result = Array.from(leftSyms)[0]
        inputVariables = Array.from(rightSyms)
      } else if (rightSyms.size === 1 && leftSyms.size > 0) {
        result = Array.from(rightSyms)[0]
        inputVariables = Array.from(leftSyms)
      } else {
        setParseError('С одной стороны уравнения должна быть одна переменная (результат)')
        return { variables: [], result: null, isValid: false, error: 'С одной стороны уравнения должна быть одна переменная (результат)' }
      }

      const allVariables = [...new Set([result, ...inputVariables])]
      setParseError(null)
      return { variables: allVariables, result, isValid: true, error: null }
    } catch (_) {
      // 2) Фоллбэк: простой парсинг по символу '=' для обычного текста
      const equalIndex = expr.indexOf('=')
      if (equalIndex === -1) {
        setParseError('Формула должна содержать знак равенства (=)')
        return { variables: [], result: null, isValid: false, error: 'Формула должна содержать знак равенства (=)' }
      }
      const leftPart = expr.substring(0, equalIndex).trim()
      const rightPart = expr.substring(equalIndex + 1).trim()
      const leftOperators = /[\+\-\*\/\^\(\)\<\>\&\|\!]+/g
      const leftParts = leftPart.split(leftOperators).map(p => p.trim()).filter(p => p.length > 0)
      const leftVariables = leftParts.filter(part => /[A-Za-zА-Яа-я]/.test(part))
      const rightOperators = /[\+\-\*\/\^\(\)\<\>\&\|\!]+/g
      const rightParts = rightPart.split(rightOperators).map(p => p.trim()).filter(p => p.length > 0)
      const rightVariables = rightParts.filter(part => /[A-Za-zА-Яа-я]/.test(part))
      let result: string | null = null
      let inputVariables: string[] = []
      if (leftVariables.length === 1 && rightVariables.length > 0) {
        result = leftVariables[0]
        inputVariables = rightVariables
      } else if (rightVariables.length === 1 && leftVariables.length > 0) {
        result = rightVariables[0]
        inputVariables = leftVariables
      } else {
        setParseError('С одной стороны уравнения должна быть одна переменная (результат)')
        return { variables: [], result: null, isValid: false, error: 'В одной из частей уравнения должна быть только одна переменная (результат)' }
      }
      const allVariables = [...new Set([result, ...inputVariables])]
      setParseError(null)
      return { variables: allVariables, result, isValid: true, error: null }
    }
  }, [])

  const load = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const token = AuthService.getInstance().getToken()
      const res = await fetch(`${apiBase}/api/formulas`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ошибка загрузки')
      setItems(Array.isArray(data.formulas) ? data.formulas : [])
    } catch (e: any) {
      setError(e?.message || 'Ошибка загрузки')
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    load()
  }, [])

  // Пересчитываем переменные и результат при изменении выражения
  React.useEffect(() => {
    const info = extractFormulaInfo(expression)
    if (info.isValid) {
      setVariables(prev => {
        const map = new Map(prev.map(v => [v.key, v]))
        return info.variables.map(k => map.get(k) || { key: k })
      })
    }
  }, [expression, extractFormulaInfo])

  const handleCreate = async () => {
    if (!name.trim() || !expression.trim()) {
      setError('Заполните имя и выражение')
      return
    }
    
    const info = extractFormulaInfo(expression)
    if (!info.isValid) {
      setError(info.error || 'Некорректная формула')
      return
    }
    try {
      setIsLoading(true)
      setError(null)
      const token = AuthService.getInstance().getToken()
      const res = await fetch(`${apiBase}/api/formulas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ 
          name: name.trim(), 
          expression: expression.trim(), 
          variables,
          formulaLatex: expression.trim(),
          formulaJson: mathJson
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ошибка создания')
      setItems(prev => [data.formula, ...prev])
      setName('')
      setExpression('')
      setVariables([])
      setSelectedId(null)
    } catch (e: any) {
      setError(e?.message || 'Ошибка создания')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectForEdit = (f: ApiFormula) => {
    setSelectedId(f.id)
    setName(f.name)
    setExpression(f.expression)
    setVariables(f.variables || [])
  }

  const handleUpdate = async () => {
    if (!selectedId) return
    if (!name.trim() || !expression.trim()) {
      setError('Заполните имя и выражение')
      return
    }
    
    const info = extractFormulaInfo(expression)
    if (!info.isValid) {
      setError(info.error || 'Некорректная формула')
      return
    }
    try {
      setIsLoading(true)
      setError(null)
      const token = AuthService.getInstance().getToken()
      const res = await fetch(`${apiBase}/api/formulas/${selectedId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ 
          name: name.trim(), 
          expression: expression.trim(), 
          variables,
          formulaLatex: expression.trim(),
          formulaJson: mathJson
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ошибка обновления')
      setItems(prev => prev.map(it => it.id === selectedId ? data.formula : it))
      setSelectedId(null)
      setName('')
      setExpression('')
      setVariables([])
    } catch (e: any) {
      setError(e?.message || 'Ошибка обновления')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const token = AuthService.getInstance().getToken()
      const res = await fetch(`${apiBase}/api/formulas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Ошибка удаления')
      setItems(prev => prev.filter(it => it.id !== id))
      if (selectedId === id) {
        setSelectedId(null)
        setName('')
        setExpression('')
        setVariables([])
      }
    } catch (e: any) {
      setError(e?.message || 'Ошибка удаления')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box sx={{ p: 3, display: 'grid', gridTemplateColumns: '400px 1fr', gap: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          {selectedId ? 'Редактировать формулу' : 'Добавить формулу'}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        <Stack spacing={2}>
          <TextField
            label="Название"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
          />
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Выражение (MathLive)
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
                onInput={() => {
                  const next = (mathfieldRef.current as any)?.value ?? ''
                  setExpression(next)
                  try {
                    const ce = new ComputeEngine()
                    const parsed = ce.parse(next)
                    setMathJson((parsed as any)?.json ?? null)
                  } catch {
                    setMathJson(null)
                  }
                }}
                style={{ width: '100%', minHeight: 48 }}
              />
            </Box>
            <Typography variant="caption" color={parseError ? 'error' : 'text.secondary'}>
              {parseError || 'Формула должна содержать знак равенства (=)'}
            </Typography>

            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                MathJSON (строка)
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={3}
                value={mathJson ? JSON.stringify(mathJson) : ''}
                InputProps={{ readOnly: true }}
                sx={{
                  '& .MuiInputBase-input': {
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  },
                }}
              />
            </Box>
          </Box>
          {!!variables.length && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Переменные</Typography>
              <Grid container spacing={1}>
                {variables.map((v) => {
                  const isResult = extractFormulaInfo(expression).result === v.key
                  return (
                    <React.Fragment key={v.key}>
                      <Grid item xs={4}>
                        <TextField 
                          label={isResult ? "Результат (ключ)" : "Ключ"} 
                          value={v.key} 
                          size="small" 
                          fullWidth 
                          disabled 
                          color={isResult ? "success" : "primary"}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField 
                          label={isResult ? "Название результата" : "Имя"} 
                          value={v.name || ''} 
                          size="small" 
                          fullWidth 
                          onChange={(e) => {
                            const val = e.target.value
                            setVariables(prev => prev.map(p => p.key === v.key ? { ...p, name: val } : p))
                          }} 
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField 
                          label={isResult ? "Единицы результата" : "Единицы"} 
                          value={v.unit || ''} 
                          size="small" 
                          fullWidth 
                          onChange={(e) => {
                            const val = e.target.value
                            setVariables(prev => prev.map(p => p.key === v.key ? { ...p, unit: val } : p))
                          }} 
                        />
                      </Grid>
                    </React.Fragment>
                  )
                })}
              </Grid>
            </Box>
          )}
          {selectedId ? (
            <Stack direction="row" spacing={1}>
              <Button variant="contained" startIcon={<SaveIcon />} onClick={handleUpdate} disabled={isLoading}>
                Сохранить
              </Button>
              <Button variant="outlined" startIcon={<AddIcon />} onClick={() => { setSelectedId(null); setName(''); setExpression(''); setVariables([]) }} disabled={isLoading}>
                Новая
              </Button>
            </Stack>
          ) : (
            <Button variant="contained" onClick={handleCreate} disabled={isLoading}>
              Создать
            </Button>
          )}
        </Stack>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Мои формулы
        </Typography>
        <List dense>
          {items.map(f => (
            <React.Fragment key={f.id}>
              <ListItem
                secondaryAction={
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Редактировать">
                      <IconButton edge="end" onClick={() => handleSelectForEdit(f)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton edge="end" onClick={() => handleDelete(f.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                }
              >
                <ListItemText
                  primary={f.name}
                  secondary={f.expression}
                />
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
          {!items.length && (
            <ListItem>
              <ListItemText primary={isLoading ? 'Загрузка...' : 'Формул пока нет'} />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  )
}


