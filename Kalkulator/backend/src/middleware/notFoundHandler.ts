import { Request, Response, NextFunction } from 'express'
import { ApiError } from '@utils/ApiError'

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new ApiError(`Route ${req.originalUrl} not found`, 404)
  next(error)
}
