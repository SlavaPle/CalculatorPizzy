import React from 'react'
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material'
import {
  Add as AddIcon,
  Calculate as CalculateIcon,
  Functions as FunctionsIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@store'
import { addTab } from '@store/slices/calculatorSlice'
import { useState, useEffect } from 'react'

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { tabs } = useSelector((state: RootState) => state.calculator)
  
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [calculatorName, setCalculatorName] = React.useState('')
  const [totalFormulas, setTotalFormulas] = React.useState(0)

  const handleCreateCalculator = () => {
    setCreateDialogOpen(true)
  }

  const handleCreateCalculatorConfirm = () => {
    // Создание нового калькулятора без формул
    const newTab = {
      id: Date.now().toString(),
      name: calculatorName || 'Новый калькулятор',
      displayName: calculatorName || 'Новый калькулятор',
      description: '',
      inputs: [],
      formulas: [],
      outputs: [],
      isActive: true,
      isTemplate: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    // Сохраняем калькулятор в Redux store
    dispatch(addTab(newTab))
    
    setCreateDialogOpen(false)
    setCalculatorName('')
    navigate(`/calculator/${newTab.id}`)
  }

  const handleCreateDialogClose = () => {
    setCreateDialogOpen(false)
    setCalculatorName('')
  }

  const handleOpenCalculator = (tabId: string) => {
    navigate(`/calculator/${tabId}`)
  }

  const handleOpenFormulas = () => {
    navigate('/formulas')
  }

  // Загружаем количество формул из API
  React.useEffect(() => {
    const loadFormulasCount = async () => {
      try {
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
          setTotalFormulas(Array.isArray(data.formulas) ? data.formulas.length : 0)
        }
      } catch (error) {
        console.error('Ошибка загрузки формул:', error)
      }
    }
    
    loadFormulasCount()
  }, [])

  const recentCalculators = tabs.slice(0, 3)
  const totalCalculators = tabs.length

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
          Добро пожаловать!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Создавайте и выполняйте сложные математические расчеты с поддержкой единиц измерения
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Статистика */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalculateIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Калькуляторы
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {totalCalculators}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Всего создано
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FunctionsIcon sx={{ mr: 1, color: 'secondary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Формулы
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                {totalFormulas}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Всего формул
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Активность
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
                {tabs.filter(tab => tab.isActive).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Активных калькуляторов
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Быстрые действия */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Быстрые действия
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateCalculator}
                    sx={{ height: 56 }}
                  >
                    Создать калькулятор
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<FunctionsIcon />}
                    onClick={handleOpenFormulas}
                    sx={{ height: 56 }}
                  >
                    Управление формулами
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ScheduleIcon />}
                    sx={{ height: 56 }}
                  >
                    История расчетов
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<StarIcon />}
                    sx={{ height: 56 }}
                  >
                    Избранное
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Последние калькуляторы */}
        {recentCalculators.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Последние калькуляторы
                </Typography>
                <Grid container spacing={2}>
                  {recentCalculators.map((tab) => (
                    <Grid item xs={12} sm={6} md={4} key={tab.id}>
                      <Card
                        variant="outlined"
                        sx={{
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            boxShadow: 4,
                            transform: 'translateY(-2px)',
                          },
                        }}
                        onClick={() => handleOpenCalculator(tab.id)}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <CalculateIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {tab.displayName}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {tab.description || 'Описание отсутствует'}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <Chip
                              label={`${tab.formulas.length} формул`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                            <Chip
                              label={`${tab.inputs.length} входов`}
                              size="small"
                              color="secondary"
                              variant="outlined"
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            Обновлено: {new Date(tab.updatedAt).toLocaleDateString()}
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Button size="small" onClick={() => handleOpenCalculator(tab.id)}>
                            Открыть
                          </Button>
                          <Tooltip title="Избранное">
                            <IconButton size="small">
                              <StarIcon />
                            </IconButton>
                          </Tooltip>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Пустое состояние */}
        {tabs.length === 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <CalculateIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                  Нет калькуляторов
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Создайте свой первый калькулятор для начала работы
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={handleCreateCalculator}
                >
                  Создать калькулятор
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Диалог создания калькулятора */}
      <Dialog open={createDialogOpen} onClose={handleCreateDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Создать новый калькулятор</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Название калькулятора"
              value={calculatorName}
              onChange={(e) => setCalculatorName(e.target.value)}
              placeholder="Например: Расчет площади"
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Формулы можно будет добавить в процессе редактирования калькулятора
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateDialogClose}>Отмена</Button>
          <Button onClick={handleCreateCalculatorConfirm} variant="contained">
            Создать
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
