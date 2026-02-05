import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User'
import { createError } from './errorHandler'

export interface AuthRequest extends Request {
  user?: any
}

export const protect = async (req: AuthRequest, _res: Response, next: NextFunction) => {
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
      const secret = process.env['JWT_SECRET']
      if (!secret) throw new Error('JWT_SECRET not configured')
      // Верифицируем токен
      const decoded = jwt.verify(token, secret) as { id: string }
      
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

export const optionalAuth = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    let token: string | undefined

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (token) {
      try {
        const secret = process.env['JWT_SECRET']
        if (secret) {
          const decoded = jwt.verify(token, secret) as { id: string }
          const user = await User.findById(decoded.id).select('-password')
          if (user) {
            req.user = user
          }
        }
      } catch {
        // Ignorujemy błędy tokena przy opcjonalnej autentykacji
      }
    }

    next()
  } catch (error) {
    next(error)
  }
}

export const generateToken = (id: string): string => {
  const secret = process.env['JWT_SECRET']
  if (!secret) throw new Error('JWT_SECRET not configured')
  const expiresIn = (process.env['JWT_EXPIRES_IN'] || '7d') as string
  return jwt.sign({ id }, secret as jwt.Secret, { expiresIn } as jwt.SignOptions)
}












