import { Request, Response, NextFunction } from 'express'
import { ForbiddenError } from '@utils/ApiError'

interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    name: string
    isVerified: boolean
  }
}

export const authorize = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ForbiddenError('Пользователь не аутентифицирован')
      }
      
      // Здесь можно добавить логику проверки ролей
      // Пока что просто проверяем, что пользователь аутентифицирован
      // В будущем можно добавить систему ролей
      
      next()
    } catch (error) {
      next(error)
    }
  }
}
