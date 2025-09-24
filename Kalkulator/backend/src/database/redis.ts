import Redis from 'ioredis'
import { logger } from '@utils/logger'
import { config } from '@config/index'

let redis: Redis

export const connectRedis = async (): Promise<void> => {
  try {
    redis = new Redis(config.redis.url, {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    })

    redis.on('connect', () => {
      logger.info('Redis connected successfully')
    })

    redis.on('error', (error) => {
      logger.error('Redis error:', error)
    })

    redis.on('close', () => {
      logger.warn('Redis connection closed')
    })

    redis.on('reconnecting', () => {
      logger.info('Redis reconnecting...')
    })

    // Подключение к Redis
    await redis.connect()
    
    logger.info('Redis connected successfully')
  } catch (error) {
    logger.error('Failed to connect to Redis:', error)
    throw error
  }
}

export const disconnectRedis = async (): Promise<void> => {
  try {
    await redis.quit()
    logger.info('Redis disconnected successfully')
  } catch (error) {
    logger.error('Failed to disconnect from Redis:', error)
    throw error
  }
}

export const getRedis = (): Redis => {
  if (!redis) {
    throw new Error('Redis not connected. Call connectRedis() first.')
  }
  return redis
}

// Утилиты для работы с Redis
export const redisUtils = {
  // Кэширование
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const redis = getRedis()
    const serialized = JSON.stringify(value)
    
    if (ttl) {
      await redis.setex(key, ttl, serialized)
    } else {
      await redis.set(key, serialized)
    }
  },

  async get<T>(key: string): Promise<T | null> {
    const redis = getRedis()
    const value = await redis.get(key)
    
    if (!value) {
      return null
    }
    
    try {
      return JSON.parse(value) as T
    } catch (error) {
      logger.error('Failed to parse Redis value:', error)
      return null
    }
  },

  async del(key: string): Promise<void> {
    const redis = getRedis()
    await redis.del(key)
  },

  // Блокировки
  async lock(key: string, ttl: number = 10): Promise<boolean> {
    const redis = getRedis()
    const result = await redis.set(key, '1', 'EX', ttl, 'NX')
    return result === 'OK'
  },

  async unlock(key: string): Promise<void> {
    const redis = getRedis()
    await redis.del(key)
  },

  // Счетчики
  async incr(key: string): Promise<number> {
    const redis = getRedis()
    return await redis.incr(key)
  },

  async decr(key: string): Promise<number> {
    const redis = getRedis()
    return await redis.decr(key)
  },

  // Списки
  async lpush(key: string, ...values: string[]): Promise<number> {
    const redis = getRedis()
    return await redis.lpush(key, ...values)
  },

  async rpop(key: string): Promise<string | null> {
    const redis = getRedis()
    return await redis.rpop(key)
  },

  async llen(key: string): Promise<number> {
    const redis = getRedis()
    return await redis.llen(key)
  },

  // Хэши
  async hset(key: string, field: string, value: string): Promise<number> {
    const redis = getRedis()
    return await redis.hset(key, field, value)
  },

  async hget(key: string, field: string): Promise<string | null> {
    const redis = getRedis()
    return await redis.hget(key, field)
  },

  async hgetall(key: string): Promise<Record<string, string>> {
    const redis = getRedis()
    return await redis.hgetall(key)
  },

  // Сеты
  async sadd(key: string, ...members: string[]): Promise<number> {
    const redis = getRedis()
    return await redis.sadd(key, ...members)
  },

  async smembers(key: string): Promise<string[]> {
    const redis = getRedis()
    return await redis.smembers(key)
  },

  async srem(key: string, ...members: string[]): Promise<number> {
    const redis = getRedis()
    return await redis.srem(key, ...members)
  },
}
