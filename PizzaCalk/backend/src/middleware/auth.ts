import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User'
import { createError } from './errorHandler'

export interface AuthRequest extends Request {
  user?: any
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined

    // Проверяем заголовок Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    // Проверяем наличие токена
    if (!token) {
      return next(createError('Доступ запрещен. Токен не предоставлен.', 401))
    }

    try {
      // Верифицируем токен
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
      
      // Находим пользователя
      const user = await User.findById(decoded.id).select('-password')
      if (!user) {
        return next(createError('Пользователь не найден', 401))
      }

      req.user = user
      next()
    } catch (error) {
      return next(createError('Недействительный токен', 401))
    }
  } catch (error) {
    next(error)
  }
}

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
        const user = await User.findById(decoded.id).select('-password')
        if (user) {
          req.user = user
        }
      } catch (error) {
        // Игнорируем ошибки токена для опциональной аутентификации
      }
    }

    next()
  } catch (error) {
    next(error)
  }
}

export const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  })
}





