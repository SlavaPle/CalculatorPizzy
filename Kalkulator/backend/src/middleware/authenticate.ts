import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { getPrisma } from '@database/connection'
import { UnauthorizedError, NotFoundError } from '@utils/ApiError'
import { config } from '@config/index'

interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    name: string
    isVerified: boolean
  }
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Токен доступа не предоставлен')
    }
    
    const token = authHeader.substring(7) // Убираем "Bearer "
    
    if (!token) {
      throw new UnauthorizedError('Токен доступа не предоставлен')
    }
    
    // Верификация JWT токена
    const decoded = jwt.verify(token, config.jwt.secret) as any
    
    if (!decoded.userId) {
      throw new UnauthorizedError('Недействительный токен')
    }
    
    // Проверка существования пользователя
    const user = await getPrisma().user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        isVerified: true,
        createdAt: true,
        lastLoginAt: true,
      },
    })
    
    if (!user) {
      throw new NotFoundError('Пользователь не найден')
    }
    
    // Добавление информации о пользователе в запрос
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      isVerified: user.isVerified,
    }
    
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Недействительный токен'))
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Токен истек'))
    } else {
      next(error)
    }
  }
}
