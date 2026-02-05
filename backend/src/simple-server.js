const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: /^http:\/\/localhost:(5173|5174|5175)$/,
  credentials: true
}))
app.use(express.json())

// Простые маршруты для демонстрации
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'PizzaCalk API работает!'
  })
})

// Заглушка для расчета заказа
app.post('/api/orders/calculate', (req, res) => {
  const { users, pizzas, sauces } = req.body
  
  // Простой расчет для демонстрации
  const totalUsers = users ? users.length : 1
  const totalSlices = users ? users.reduce((sum, user) => sum + (user.maxSlices || 3), 0) : 6
  const pizzaCount = Math.ceil(totalSlices / 8) // Предполагаем 8 кусков на пиццу
  const freePizzaCount = Math.floor(pizzaCount / 3) // Каждая 3-я бесплатная
  
  const result = {
    success: true,
    message: 'Расчет выполнен успешно',
    data: {
      order: {
        totalUsers,
        totalSlices,
        pizzaCount,
        freePizzaCount,
        totalCost: pizzaCount * 800, // 800 рублей за пиццу
        savings: freePizzaCount * 800
      },
      calculation: {
        optimalPizzas: Array.from({ length: pizzaCount }, (_, i) => ({
          id: `pizza-${i}`,
          type: 'Маргарита',
          size: 'large',
          price: 800,
          slices: 8,
          isFree: i < freePizzaCount
        })),
        userCosts: {},
        totalCost: pizzaCount * 800,
        freePizzaValue: freePizzaCount * 800,
        distribution: {}
      }
    }
  }
  
  res.json(result)
})

// Заглушки для других маршрутов
app.post('/api/auth/register', (req, res) => {
  res.json({
    success: true,
    message: 'Регистрация в демо-режиме',
    data: {
      user: { id: 'demo-user', name: req.body.name || 'Демо пользователь' },
      token: 'demo-token'
    }
  })
})

app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    message: 'Вход в демо-режиме',
    data: {
      user: { id: 'demo-user', name: 'Демо пользователь' },
      token: 'demo-token'
    }
  })
})

app.get('/api/orders/history', (req, res) => {
  res.json({
    success: true,
    data: {
      orders: [],
      pagination: { current: 1, pages: 1, total: 0 }
    }
  })
})

// Zapis wizyty (w pełnym backendzie z MongoDB zapisuje IP + datę)
app.post('/api/visits', (req, res) => {
  res.status(201).json({ success: true, message: 'Wizyta zapisana' })
})

app.get('/api/settings', (req, res) => {
  res.json({
    success: true,
    data: {
      settings: {
        currency: 'RUB',
        language: 'ru',
        notifications: true,
        autoSave: true
      },
      preferences: {
        defaultMinSlices: 1,
        defaultMaxSlices: 3,
        preferredPizzaTypes: []
      }
    }
  })
})

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Ошибка:', err)
  res.status(500).json({
    success: false,
    error: 'Внутренняя ошибка сервера'
  })
})

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Маршрут ${req.originalUrl} не найден`
  })
})

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 PizzaCalk API запущен на порту ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
  console.log(`🌍 Демо-режим активен`)
})












