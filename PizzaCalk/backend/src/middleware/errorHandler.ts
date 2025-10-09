import { Request, Response, NextFunction } from 'express'

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err }
  error.message = err.message

  // Логирование ошибки
  console.error('❌ Ошибка:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Ресурс не найден'
    error = { message, statusCode: 404 } as AppError
  }

  // Mongoose duplicate key
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    const message = 'Дублирующееся значение поля'
    error = { message, statusCode: 400 } as AppError
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors).map((val: any) => val.message).join(', ')
    error = { message, statusCode: 400 } as AppError
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Недействительный токен'
    error = { message, statusCode: 401 } as AppError
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Токен истек'
    error = { message, statusCode: 401 } as AppError
  }

  // Rate limit error
  if (err.message.includes('Too many requests')) {
    const message = 'Слишком много запросов, попробуйте позже'
    error = { message, statusCode: 429 } as AppError
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Внутренняя ошибка сервера',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err
    })
  })
}

export const createError = (message: string, statusCode: number = 500): AppError => {
  const error = new Error(message) as AppError
  error.statusCode = statusCode
  error.isOperational = true
  return error
}

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}





