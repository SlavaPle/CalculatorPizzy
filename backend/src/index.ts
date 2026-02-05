import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import orderRoutes from './routes/orders'
import settingsRoutes from './routes/settings'
import visitRoutes from './routes/visits'
import { errorHandler } from './middleware/errorHandler'
import { notFound } from './middleware/notFound'

// Загрузка переменных окружения
dotenv.config()

const app = express()
const PORT = process.env['PORT'] || 3001

// Подключение к MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env['MONGODB_URI'] || 'mongodb://localhost:27017/pizzacalk'
    await mongoose.connect(mongoURI)
    console.log('✅ MongoDB подключена успешно')
  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error)
    process.exit(1)
  }
}

// Middleware
app.use(helmet()) // Безопасность
app.use(morgan('combined')) // Логирование
app.use(cors({
  origin: process.env['CORS_ORIGIN'] || 'http://localhost:5173',
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000', 10), // 15 минут
  max: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100', 10), // лимит запросов
  message: {
    error: 'Слишком много запросов, попробуйте позже'
  }
})
app.use('/api/', limiter)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/visits', visitRoutes)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env['NODE_ENV'] || 'development'
  })
})

// Error handling
app.use(notFound)
app.use(errorHandler)

// Запуск сервера
const startServer = async () => {
  try {
    await connectDB()
    
    app.listen(PORT, () => {
      console.log(`🚀 Сервер запущен на порту ${PORT}`)
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
      console.log(`🌍 Окружение: ${process.env['NODE_ENV'] || 'development'}`)
    })
  } catch (error) {
    console.error('❌ Ошибка запуска сервера:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Получен SIGTERM, завершение работы...')
  mongoose.connection.close()
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('🛑 Получен SIGINT, завершение работы...')
  mongoose.connection.close()
  process.exit(0)
})

startServer()

export default app












