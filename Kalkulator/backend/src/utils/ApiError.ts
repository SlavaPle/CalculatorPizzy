export class ApiError extends Error {
  public readonly statusCode: number
  public readonly details?: any

  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message)
    this.statusCode = statusCode
    this.details = details
    this.name = 'ApiError'
    
    // Сохранение стека вызовов
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(message, 400, details)
    this.name = 'ValidationError'
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden') {
    super(message, 403)
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Not Found') {
    super(message, 404)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = 'Conflict') {
    super(message, 409)
    this.name = 'ConflictError'
  }
}

export class TooManyRequestsError extends ApiError {
  constructor(message: string = 'Too Many Requests') {
    super(message, 429)
    this.name = 'TooManyRequestsError'
  }
}
