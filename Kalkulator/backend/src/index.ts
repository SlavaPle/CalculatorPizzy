import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'

import { config } from '@config/index'
import { logger } from '@utils/logger'
import { errorHandler } from '@middleware/errorHandler'
import { notFoundHandler } from '@middleware/notFoundHandler'
import { authRoutes } from '@routes/auth'
import { userRoutes } from '@routes/users'
import { calculatorRoutes } from '@routes/calculators'
import { formulaRoutes } from '@routes/formulas'
import { calculationRoutes } from '@routes/calculations'
import { healthRoutes } from '@routes/health'
import { connectDatabase } from '@database/connection'
import { connectRedis } from '@database/redis'
import { setupPassport } from '@config/passport'

// Загрузка переменных окружения
dotenv.config()

const app = express()
const server = createServer(app)
const io = new SocketIOServer(server, {
  cors: {
    origin: config.cors.origin,
    credentials: config.cors.credentials,
  },
})

// Middleware
app.use(helmet())
app.use(compression())
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }))

// CORS
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Static files
app.use('/uploads', express.static('uploads'))

// Routes
app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/calculators', calculatorRoutes)
app.use('/api/formulas', formulaRoutes)
app.use('/api/calculations', calculationRoutes)

// Error handling
app.use(notFoundHandler)
app.use(errorHandler)

// Socket.IO для real-time обновлений
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`)
  
  socket.on('join-calculator', (calculatorId) => {
    socket.join(`calculator-${calculatorId}`)
    logger.info(`Client ${socket.id} joined calculator ${calculatorId}`)
  })
  
  socket.on('leave-calculator', (calculatorId) => {
    socket.leave(`calculator-${calculatorId}`)
    logger.info(`Client ${socket.id} left calculator ${calculatorId}`)
  })
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`)
  })
})

// Инициализация приложения
async function startServer() {
  try {
    // Подключение к базе данных
    await connectDatabase()
    logger.info('Database connected successfully')
    
    // Подключение к Redis
    await connectRedis()
    logger.info('Redis connected successfully')
    
    // Настройка Passport
    setupPassport()
    logger.info('Passport configured successfully')
    
    // Запуск сервера
    server.listen(config.port, config.host, () => {
      logger.info(`Server running on http://${config.host}:${config.port}`)
      logger.info(`Environment: ${config.nodeEnv}`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Обработка сигналов завершения
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  server.close(() => {
    logger.info('Process terminated')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully')
  server.close(() => {
    logger.info('Process terminated')
    process.exit(0)
  })
})

// Обработка необработанных ошибок
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error)
  process.exit(1)
})

// Запуск сервера
startServer()

export { app, server, io }
