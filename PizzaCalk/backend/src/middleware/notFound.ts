import { Request, Response } from 'express'

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Маршрут ${req.originalUrl} не найден`,
    availableRoutes: [
      'GET /api/health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/users/profile',
      'POST /api/orders/calculate',
      'GET /api/orders/history',
      'GET /api/settings',
      'PUT /api/settings'
    ]
  })
}





