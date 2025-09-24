import React from 'react'
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  IconButton, 
  Tooltip, 
  Alert, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Chip,
  Divider,
  Checkbox,
  FormControlLabel
} from '@mui/material'
import { Add as AddIcon, Settings as SettingsIcon, PlayArrow as PlayIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { Tab } from '@shared/models/tab/Tab'

interface CalculatorInterfaceProps {
  tab: Tab
}

interface CalculatorFormula {
  id: string
  formulaId: string
  name: string
  expression: string
  variables: { key: string; name?: string; unit?: string }[]
  result: string
  inputFields: { 
    variable: string; 
    selectedVariable: string; 
    label: string;
    isDependency: boolean; // Зависимость от предыдущих формул
    dependencyValue?: string; // Значение из зависимости (если isDependency = true)
  }[]
  resultValue: string
  availableVariables: string[] // Переменные из текущей формулы
  previousFormulasVariables: string[] // Переменные из предыдущих формул
  isValid: boolean // Валидация: остался ли только один результат
}

export const CalculatorInterface: React.FC<CalculatorInterfaceProps> = ({ tab }) => {
  const navigate = useNavigate()
  const [availableFormulas, setAvailableFormulas] = React.useState<any[]>([])
  const [calculatorFormulas, setCalculatorFormulas] = React.useState<CalculatorFormula[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Загружаем доступные формулы из API
  React.useEffect(() => {
    const loadFormulas = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const token = localStorage.getItem('auth_token')
        if (!token) return
        
        const apiBase = (typeof window !== 'undefined' && (window as any).__API_URL__) || (import.meta as any)?.env?.VITE_API_URL || ''
        const response = await fetch(`${apiBase}/api/formulas`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setAvailableFormulas(Array.isArray(data.formulas) ? data.formulas : [])
        } else {
          setError('Ошибка загрузки формул')
        }
      } catch (err) {
        setError('Ошибка сети')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadFormulas()
  }, [])

  const handleAddFormula = () => {
    // Переход к странице управления формулами
    navigate('/formulas')
  }

  const handleAddFormulaToCalculator = (formula: any) => {
    // Получаем переменные из предыдущих формул
    const previousFormulasVariables = calculatorFormulas.flatMap(f => f.variables.map(v => v.key))
    
    // Переменные из текущей формулы
    const currentFormulaVariables = formula.variables?.map((v: any) => v.key) || []
    
    // Создаем поля ввода (все переменные кроме одной - результата)
    const inputFields = formula.variables?.slice(0, -1).map((v: any) => ({
      variable: v.key,
      selectedVariable: '', // Пользователь выберет
      label: v.name || v.key,
      isDependency: false, // По умолчанию не зависимость
      dependencyValue: '', // Значение из зависимости
    })) || []
    
    const newCalculatorFormula: CalculatorFormula = {
      id: `calc_${Date.now()}`,
      formulaId: formula.id,
      name: formula.name,
      expression: formula.expression,
      variables: formula.variables || [],
      result: '', // Будет определен после выбора всех переменных
      inputFields,
      resultValue: '',
      availableVariables: currentFormulaVariables,
      previousFormulasVariables,
      isValid: false
    }
    
    setCalculatorFormulas(prev => [...prev, newCalculatorFormula])
  }

  const handleRemoveFormula = (formulaId: string) => {
    setCalculatorFormulas(prev => prev.filter(f => f.id !== formulaId))
  }

  const handleVariableSelection = (formulaId: string, fieldVariable: string, selectedVariable: string) => {
    setCalculatorFormulas(prev => {
      const updatedFormulas = prev.map(f => {
        if (f.id !== formulaId) return f
        
        // Обновляем выбранную переменную
        const updatedInputFields = f.inputFields.map(field => 
          field.variable === fieldVariable 
            ? { ...field, selectedVariable }
            : field
        )
        
        // Получаем все выбранные переменные (включая зависимости)
        const selectedVariables = updatedInputFields.map(field => {
          if (field.isDependency && field.dependencyValue) {
            // При зависимости используем значение зависимости
            return field.dependencyValue
          } else {
            // При обычном выборе используем выбранную переменную
            return field.selectedVariable
          }
        }).filter(Boolean)
        
        // Определяем результат (оставшаяся переменная)
        const allVariables = f.variables.map(v => v.key)
        const result = allVariables.find(v => !selectedVariables.includes(v)) || ''
        
        // Валидация: остался ли только один результат
        // Проверяем, что все поля заполнены (либо переменная, либо зависимость с переменной)
        const allFieldsValid = updatedInputFields.every(field => {
          if (field.isDependency) {
            return field.selectedVariable && field.dependencyValue
          } else {
            return field.selectedVariable
          }
        })
        const isValid = allFieldsValid && selectedVariables.length === f.inputFields.length && result !== ''
        
        // Отладочная информация
        console.log('Variable selection:', {
          formulaId,
          fieldVariable,
          selectedVariable,
          selectedVariables,
          availableVariables: f.availableVariables,
          result,
          isValid
        })
        
        return {
          ...f,
          inputFields: updatedInputFields,
          // availableVariables остается неизменным - содержит все переменные формулы
          result,
          isValid
        }
      })
      
      return updatedFormulas
    })
  }

  const handleDependencyToggle = (formulaId: string, fieldVariable: string, isDependency: boolean) => {
    setCalculatorFormulas(prev => {
      const updatedFormulas = prev.map(f => {
        if (f.id !== formulaId) return f
        
        // Обновляем флаг зависимости, НЕ сбрасываем выбранную переменную
        const updatedInputFields = f.inputFields.map(field => 
          field.variable === fieldVariable 
            ? { ...field, isDependency, dependencyValue: isDependency ? '' : field.dependencyValue }
            : field
        )
        
        // Получаем все выбранные переменные (включая зависимости)
        const selectedVariables = updatedInputFields.map(field => {
          if (field.isDependency && field.dependencyValue) {
            // При зависимости используем значение зависимости
            return field.dependencyValue
          } else {
            // При обычном выборе используем выбранную переменную
            return field.selectedVariable
          }
        }).filter(Boolean)
        
        // Определяем результат (оставшаяся переменная)
        const allVariables = f.variables.map(v => v.key)
        const result = allVariables.find(v => !selectedVariables.includes(v)) || ''
        
        // Валидация: остался ли только один результат
        // Проверяем, что все поля заполнены (либо переменная, либо зависимость с переменной)
        const allFieldsValid = updatedInputFields.every(field => {
          if (field.isDependency) {
            return field.selectedVariable && field.dependencyValue
          } else {
            return field.selectedVariable
          }
        })
        const isValid = allFieldsValid && selectedVariables.length === f.inputFields.length && result !== ''
        
        return {
          ...f,
          inputFields: updatedInputFields,
          result,
          isValid
        }
      })
      
      return updatedFormulas
    })
  }

  const handleDependencyValueSelection = (formulaId: string, fieldVariable: string, dependencyValue: string) => {
    setCalculatorFormulas(prev => {
      const updatedFormulas = prev.map(f => {
        if (f.id !== formulaId) return f
        
        // Обновляем значение зависимости
        const updatedInputFields = f.inputFields.map(field => 
          field.variable === fieldVariable 
            ? { ...field, dependencyValue }
            : field
        )
        
        // Получаем все выбранные переменные (включая зависимости)
        const selectedVariables = updatedInputFields.map(field => {
          if (field.isDependency && field.dependencyValue) {
            // При зависимости используем значение зависимости
            return field.dependencyValue
          } else {
            // При обычном выборе используем выбранную переменную
            return field.selectedVariable
          }
        }).filter(Boolean)
        
        // Определяем результат (оставшаяся переменная)
        const allVariables = f.variables.map(v => v.key)
        const result = allVariables.find(v => !selectedVariables.includes(v)) || ''
        
        // Валидация: остался ли только один результат
        // Проверяем, что все поля заполнены (либо переменная, либо зависимость с переменной)
        const allFieldsValid = updatedInputFields.every(field => {
          if (field.isDependency) {
            return field.selectedVariable && field.dependencyValue
          } else {
            return field.selectedVariable
          }
        })
        const isValid = allFieldsValid && selectedVariables.length === f.inputFields.length && result !== ''
        
        return {
          ...f,
          inputFields: updatedInputFields,
          result,
          isValid
        }
      })
      
      return updatedFormulas
    })
  }

  const handleCalculate = () => {
    // Выполнение расчетов
    console.log('Calculate formulas:', calculatorFormulas)
  }

  const handleSaveCalculator = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        alert('Требуется аутентификация')
        return
      }

      // Проверяем, что все формулы валидны
      const allFormulasValid = calculatorFormulas.every(f => f.isValid)
      if (!allFormulasValid) {
        alert('Не все формулы настроены корректно')
        return
      }

      // Подготавливаем данные для сохранения
      const calculatorData = {
        name: tab.name,
        displayName: tab.displayName,
        description: tab.description || '',
        formulas: calculatorFormulas.map(f => ({
          id: f.id,
          formulaId: f.formulaId,
          name: f.name,
          expression: f.expression,
          variables: f.variables,
          result: f.result,
          inputFields: f.inputFields.map(field => ({
            variable: field.variable,
            selectedVariable: field.selectedVariable,
            isDependency: field.isDependency,
            dependencyValue: field.dependencyValue
          })),
          resultValue: f.resultValue
        }))
      }

      // Определяем, создаем новый калькулятор или обновляем существующий
      const isUpdate = tab.id && tab.id !== 'new'
      const url = isUpdate ? `/api/calculators/${tab.id}` : '/api/calculators'
      const method = isUpdate ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(calculatorData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ошибка сохранения')
      }

      const result = await response.json()
      console.log('Calculator saved:', result)
      
      // Показываем уведомление об успешном сохранении
      alert(isUpdate ? 'Калькулятор обновлен!' : 'Калькулятор сохранен!')
      
      // Можно добавить навигацию или обновление состояния
      if (!isUpdate && result.calculator) {
        // Обновляем ID калькулятора после создания
        console.log('New calculator ID:', result.calculator.id)
      }

    } catch (error) {
      console.error('Error saving calculator:', error)
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'
      alert(`Ошибка сохранения: ${errorMessage}`)
    }
  }

  const handleSettings = () => {
    // Открытие настроек
    console.log('Settings')
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
      {/* Заголовок и действия */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {tab.displayName}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Настройки">
            <IconButton onClick={handleSettings}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          
          <Button
            variant="contained"
            startIcon={<PlayIcon />}
            onClick={handleCalculate}
            sx={{ ml: 1 }}
          >
            Рассчитать
          </Button>
        </Box>
      </Box>

      {/* Основной интерфейс - линейный */}
      <Box sx={{ display: 'flex', gap: 3, height: 'calc(100vh - 200px)' }}>
        {/* Левая панель - доступные формулы */}
        <Paper sx={{ width: 300, p: 2, overflow: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Доступные формулы
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddFormula}
            >
              Создать
            </Button>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {isLoading ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Загрузка формул...
              </Typography>
            </Box>
          ) : availableFormulas.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Нет доступных формул
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={handleAddFormula}
              >
                Создать формулу
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {availableFormulas.map((formula) => (
                <Paper
                  key={formula.id}
                  variant="outlined"
                  sx={{ 
                    p: 2, 
                    cursor: 'pointer', 
                    border: '2px dashed transparent',
                    '&:hover': { 
                      backgroundColor: 'action.hover',
                      borderColor: 'primary.main' 
                    }
                  }}
                  onClick={() => handleAddFormulaToCalculator(formula)}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                    {formula.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                    {formula.expression}
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {formula.variables?.map((v: any) => (
                      <Chip key={v.key} label={v.key} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </Paper>

        {/* Центральная панель - калькулятор */}
        <Paper sx={{ flex: 1, p: 2, overflow: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Настройка калькулятора
            </Typography>
            {calculatorFormulas.length > 0 && (
              <Button
                variant="contained"
                onClick={handleSaveCalculator}
                disabled={!calculatorFormulas.every(f => f.isValid)}
              >
                Сохранить калькулятор
              </Button>
            )}
          </Box>
          
          {calculatorFormulas.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Добавьте формулы из левой панели для настройки калькулятора
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Нажмите на формулу, чтобы добавить её в калькулятор
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {calculatorFormulas.map((formula) => (
                <Paper key={formula.id} variant="outlined" sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {formula.name}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => handleRemoveFormula(formula.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: 'monospace' }}>
                    {formula.expression}
                  </Typography>
                  
                  {/* Поля ввода с комбобоксами */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Настройка полей ввода:
                    </Typography>
                    {formula.inputFields.map((field) => (
                      <Box key={field.variable} sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                        {/* Основной комбобокс */}
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                          <InputLabel>Выберите переменную</InputLabel>
                          <Select
                            value={field.selectedVariable}
                            onChange={(e) => handleVariableSelection(formula.id, field.variable, e.target.value)}
                            label="Выберите переменную"
                          >
                            <MenuItem value="">
                              <em>Не выбрано</em>
                            </MenuItem>
                            {formula.availableVariables
                              .filter(v => !formula.inputFields.some(f => f.selectedVariable === v && f.variable !== field.variable))
                              .map((variable) => (
                                <MenuItem key={variable} value={variable}>
                                  {variable}
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                        
                        {/* Чекбокс зависимости (только для формул после первой) */}
                        {calculatorFormulas.length > 1 && calculatorFormulas.findIndex(f => f.id === formula.id) > 0 && (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={field.isDependency}
                                onChange={(e) => handleDependencyToggle(formula.id, field.variable, e.target.checked)}
                                size="small"
                              />
                            }
                            label="Зависимость"
                          />
                        )}
                        
                        {/* Дополнительный комбобокс для зависимостей (если включен) */}
                        {field.isDependency && (
                          <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Значение из предыдущих</InputLabel>
                            <Select
                              value={field.dependencyValue || ''}
                              onChange={(e) => handleDependencyValueSelection(formula.id, field.variable, e.target.value)}
                              label="Значение из предыдущих"
                            >
                              <MenuItem value="">
                                <em>Не выбрано</em>
                              </MenuItem>
                              {formula.previousFormulasVariables.map((variable) => (
                                <MenuItem key={variable} value={variable}>
                                  {variable}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                        
                        {/* Чип с выбранным значением */}
                        {field.isDependency && field.dependencyValue ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                              label={field.selectedVariable}
                              size="small" 
                              color="primary"
                              variant="filled"
                            />
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              ←
                            </Typography>
                            <Chip 
                              label={field.dependencyValue}
                              size="small" 
                              color="secondary"
                              variant="filled"
                            />
                          </Box>
                        ) : (
                          <Chip 
                            label={field.selectedVariable || 'Не выбрано'}
                            size="small" 
                            color={field.selectedVariable ? 'primary' : 'default'}
                            variant={field.selectedVariable ? 'filled' : 'outlined'}
                          />
                        )}
                      </Box>
                    ))}
                    
                    {/* Результат */}
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Chip 
                        label={formula.result || 'Не определен'} 
                        size="small" 
                        color={formula.isValid ? 'success' : 'default'}
                        variant={formula.isValid ? 'filled' : 'outlined'}
                      />
                      {formula.isValid && (
                        <Typography variant="caption" color="success.main">
                          ✓ Формула настроена корректно
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  )
}
