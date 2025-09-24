import React from 'react'
import { Box, Paper, Typography, TextField, Button, Stack, List, ListItem, ListItemText, Divider, Alert, IconButton, Tooltip, Grid } from '@mui/material'
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
  const [variables, setVariables] = React.useState<{ key: string; name?: string; unit?: string }[]>([])
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const apiBase = (typeof window !== 'undefined' && (window as any).__API_URL__) || (import.meta as any)?.env?.VITE_API_URL || ''

  const extractFormulaInfo = React.useCallback((expr: string) => {
    // Ищем знак равенства для определения результата
    const equalIndex = expr.indexOf('=')
    
    if (equalIndex === -1) {
      // Нет знака равенства - это выражение, результат неопределен
      return { variables: [], result: null, isValid: false, error: 'Формула должна содержать знак равенства (=)' }
    }
    
    // Разделяем на левую и правую части
    const leftPart = expr.substring(0, equalIndex).trim()
    const rightPart = expr.substring(equalIndex + 1).trim()
    
    // Проверяем, что только одна переменная в одной из частей
    const leftOperators = /[\+\-\*\/\^\(\)\<\>\&\|\!]+/g
    const leftParts = leftPart.split(leftOperators).map(p => p.trim()).filter(p => p.length > 0)
    const leftVariables = leftParts.filter(part => /[A-Za-zА-Яа-я]/.test(part))
    
    const rightOperators = /[\+\-\*\/\^\(\)\<\>\&\|\!]+/g
    const rightParts = rightPart.split(rightOperators).map(p => p.trim()).filter(p => p.length > 0)
    const rightVariables = rightParts.filter(part => /[A-Za-zА-Яа-я]/.test(part))
    
    let result: string | null = null
    let inputVariables: string[] = []
    
    if (leftVariables.length === 1 && rightVariables.length > 0) {
      // Случай: result = expression (например: c = a + b)
      result = leftVariables[0]
      inputVariables = rightVariables
    } else if (rightVariables.length === 1 && leftVariables.length > 0) {
      // Случай: expression = result (например: a + b = c)
      result = rightVariables[0]
      inputVariables = leftVariables
    } else {
      return { variables: [], result: null, isValid: false, error: 'В одной из частей уравнения должна быть только одна переменная (результат)' }
    }
    
    // Объединяем все переменные (включая результат)
    const allVariables = [...new Set([result, ...inputVariables])]
    
    return { 
      variables: allVariables, 
      result, 
      isValid: true, 
      error: null 
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
          variables
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
          variables
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
        setResultName('')
        setResultUnit('')
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
          <TextField
            label="Выражение"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            multiline
            minRows={3}
            disabled={isLoading}
            placeholder="например: c = a + b или a + b = c"
            error={!!extractFormulaInfo(expression).error}
            helperText={extractFormulaInfo(expression).error || 'Формула должна содержать знак равенства (=)'}
          />
          {!!variables.length && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Переменные</Typography>
              <Grid container spacing={1}>
                {variables.map((v, idx) => {
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


