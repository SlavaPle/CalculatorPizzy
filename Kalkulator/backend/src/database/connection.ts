import { PrismaClient } from '@prisma/client'
import { logger } from '@utils/logger'
import { config } from '@config/index'

let prisma: PrismaClient

export const connectDatabase = async (): Promise<void> => {
  try {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: config.database.url,
        },
      },
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
    })

    // Обработка событий логирования
    prisma.$on('query', (e) => {
      if (config.nodeEnv === 'development') {
        logger.debug('Query:', {
          query: e.query,
          params: e.params,
          duration: e.duration,
        })
      }
    })

    prisma.$on('error', (e) => {
      logger.error('Database error:', e)
    })

    prisma.$on('info', (e) => {
      logger.info('Database info:', e)
    })

    prisma.$on('warn', (e) => {
      logger.warn('Database warning:', e)
    })

    // Подключение к базе данных
    await prisma.$connect()
    
    logger.info('Database connected successfully')
  } catch (error) {
    logger.error('Failed to connect to database:', error)
    throw error
  }
}

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect()
    logger.info('Database disconnected successfully')
  } catch (error) {
    logger.error('Failed to disconnect from database:', error)
    throw error
  }
}

export const getPrisma = (): PrismaClient => {
  if (!prisma) {
    throw new Error('Database not connected. Call connectDatabase() first.')
  }
  return prisma
}
