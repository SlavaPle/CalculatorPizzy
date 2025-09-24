import { Request, Response, NextFunction } from 'express'
import { logger } from '@utils/logger'
import { ApiError } from '@utils/ApiError'

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500
  let message = 'Internal Server Error'
  let details: any = undefined

  // Обработка различных типов ошибок
  if (error instanceof ApiError) {
    statusCode = error.statusCode
    message = error.message
    details = error.details
  } else if (error.name === 'ValidationError') {
    statusCode = 400
    message = 'Validation Error'
    details = error.message
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401
    message = 'Unauthorized'
  } else if (error.name === 'ForbiddenError') {
    statusCode = 403
    message = 'Forbidden'
  } else if (error.name === 'NotFoundError') {
    statusCode = 404
    message = 'Not Found'
  } else if (error.name === 'ConflictError') {
    statusCode = 409
    message = 'Conflict'
  } else if (error.name === 'TooManyRequestsError') {
    statusCode = 429
    message = 'Too Many Requests'
  }

  // Логирование ошибки
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    statusCode,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  })

  // Отправка ответа
  res.status(statusCode).json({
    success: false,
    error: message,
    details,
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method,
  })
}
