import { Router } from 'express'
import { getPrisma } from '@database/connection'
import { getRedis } from '@database/redis'
import { logger } from '@utils/logger'

const router = Router()

// Проверка здоровья сервера
router.get('/', async (req, res) => {
  try {
    const startTime = Date.now()
    
    // Проверка базы данных
    const dbStart = Date.now()
    await getPrisma().$queryRaw`SELECT 1`
    const dbTime = Date.now() - dbStart
    
    // Проверка Redis
    const redisStart = Date.now()
    await getRedis().ping()
    const redisTime = Date.now() - redisStart
    
    const totalTime = Date.now() - startTime
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: {
          status: 'connected',
          responseTime: `${dbTime}ms`,
        },
        redis: {
          status: 'connected',
          responseTime: `${redisTime}ms`,
        },
      },
      performance: {
        totalResponseTime: `${totalTime}ms`,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        },
      },
    })
  } catch (error) {
    logger.error('Health check failed:', error)
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// Детальная проверка
router.get('/detailed', async (req, res) => {
  try {
    const checks = {
      database: { status: 'unknown', responseTime: 0, error: null },
      redis: { status: 'unknown', responseTime: 0, error: null },
      memory: { status: 'unknown', usage: 0, limit: 0 },
      disk: { status: 'unknown', free: 0, total: 0 },
    }
    
    // Проверка базы данных
    try {
      const dbStart = Date.now()
      await getPrisma().$queryRaw`SELECT 1`
      checks.database = {
        status: 'connected',
        responseTime: Date.now() - dbStart,
        error: null,
      }
    } catch (error) {
      checks.database = {
        status: 'error',
        responseTime: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
    
    // Проверка Redis
    try {
      const redisStart = Date.now()
      await getRedis().ping()
      checks.redis = {
        status: 'connected',
        responseTime: Date.now() - redisStart,
        error: null,
      }
    } catch (error) {
      checks.redis = {
        status: 'error',
        responseTime: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
    
    // Проверка памяти
    const memoryUsage = process.memoryUsage()
    const memoryLimit = 1024 * 1024 * 1024 // 1GB limit
    checks.memory = {
      status: memoryUsage.heapUsed < memoryLimit ? 'ok' : 'warning',
      usage: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      limit: Math.round(memoryLimit / 1024 / 1024),
    }
    
    res.json({
      status: 'detailed',
      timestamp: new Date().toISOString(),
      checks,
    })
  } catch (error) {
    logger.error('Detailed health check failed:', error)
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

export { router as healthRoutes }
