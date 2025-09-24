import { Request, Response, NextFunction } from 'express'
import { getPrisma } from '@database/connection'
import { logger } from '@utils/logger'
import { NotFoundError, UnauthorizedError } from '@utils/ApiError'

interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    name: string
    isVerified: boolean
  }
}

export const userController = {
  // Получение профиля пользователя
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const user = await getPrisma().user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          isVerified: true,
          createdAt: true,
          lastLoginAt: true,
          preferences: true,
        },
      })

      if (!user) {
        throw new NotFoundError('Пользователь не найден')
      }

      res.json({
        success: true,
        data: { user },
      })
    } catch (error) {
      next(error)
    }
  },

  // Обновление профиля
  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { name, avatar } = req.body

      const user = await getPrisma().user.update({
        where: { id: req.user.id },
        data: {
          ...(name && { name }),
          ...(avatar && { avatar }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          isVerified: true,
          createdAt: true,
          lastLoginAt: true,
        },
      })

      logger.info(`Profile updated for: ${user.email}`)

      res.json({
        success: true,
        message: 'Профиль успешно обновлен',
        data: { user },
      })
    } catch (error) {
      next(error)
    }
  },

  // Получение настроек пользователя
  async getPreferences(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const preferences = await getPrisma().userPreferences.findUnique({
        where: { userId: req.user.id },
      })

      res.json({
        success: true,
        data: { preferences },
      })
    } catch (error) {
      next(error)
    }
  },

  // Обновление настроек пользователя
  async updatePreferences(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { language, theme, units, notifications } = req.body

      const preferences = await getPrisma().userPreferences.upsert({
        where: { userId: req.user.id },
        update: {
          ...(language && { language }),
          ...(theme && { theme }),
          ...(units && { units }),
          ...(notifications && { notifications }),
        },
        create: {
          userId: req.user.id,
          language: language || 'ru',
          theme: theme || 'light',
          units: units || 'metric',
          notifications: notifications || {},
        },
      })

      logger.info(`Preferences updated for: ${req.user.email}`)

      res.json({
        success: true,
        message: 'Настройки успешно обновлены',
        data: { preferences },
      })
    } catch (error) {
      next(error)
    }
  },

  // Получение сессий пользователя
  async getSessions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const sessions = await getPrisma().userSession.findMany({
        where: { userId: req.user.id },
        select: {
          id: true,
          deviceInfo: true,
          expiresAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      })

      res.json({
        success: true,
        data: { sessions },
      })
    } catch (error) {
      next(error)
    }
  },

  // Удаление сессии
  async deleteSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { sessionId } = req.params

      await getPrisma().userSession.deleteMany({
        where: {
          id: sessionId,
          userId: req.user.id,
        },
      })

      logger.info(`Session deleted for: ${req.user.email}`)

      res.json({
        success: true,
        message: 'Сессия успешно удалена',
      })
    } catch (error) {
      next(error)
    }
  },

  // Удаление всех сессий кроме текущей
  async deleteAllSessions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      await getPrisma().userSession.deleteMany({
        where: { userId: req.user.id },
      })

      logger.info(`All sessions deleted for: ${req.user.email}`)

      res.json({
        success: true,
        message: 'Все сессии успешно удалены',
      })
    } catch (error) {
      next(error)
    }
  },

  // Получение статистики пользователя
  async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const [
        calculatorsCount,
        formulasCount,
        calculationsCount,
        recentCalculations,
      ] = await Promise.all([
        getPrisma().calculator.count({
          where: { userId: req.user.id },
        }),
        getPrisma().formula.count({
          where: { userId: req.user.id },
        }),
        getPrisma().calculation.count({
          where: { userId: req.user.id },
        }),
        getPrisma().calculation.findMany({
          where: { userId: req.user.id },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            success: true,
            executionTime: true,
            createdAt: true,
            calculator: {
              select: { name: true, displayName: true },
            },
          },
        }),
      ])

      res.json({
        success: true,
        data: {
          calculators: calculatorsCount,
          formulas: formulasCount,
          calculations: calculationsCount,
          recentCalculations,
        },
      })
    } catch (error) {
      next(error)
    }
  },

  // Экспорт данных пользователя
  async exportData(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const userData = await getPrisma().user.findUnique({
        where: { id: req.user.id },
        include: {
          calculators: {
            include: {
              inputs: true,
              outputs: true,
              formulas: true,
            },
          },
          formulas: true,
          calculations: {
            take: 1000, // Ограничиваем количество расчетов
            orderBy: { createdAt: 'desc' },
          },
          preferences: true,
        },
      })

      if (!userData) {
        throw new NotFoundError('Пользователь не найден')
      }

      // Удаляем чувствительные данные
      const { password, ...safeUserData } = userData

      res.json({
        success: true,
        data: safeUserData,
      })
    } catch (error) {
      next(error)
    }
  },

  // Импорт данных пользователя
  async importData(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { data } = req.body

      // Здесь должна быть логика импорта данных
      // Пока что просто возвращаем успех

      logger.info(`Data import requested for: ${req.user.email}`)

      res.json({
        success: true,
        message: 'Импорт данных запрошен',
      })
    } catch (error) {
      next(error)
    }
  },

  // Удаление аккаунта
  async deleteAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      await getPrisma().user.delete({
        where: { id: req.user.id },
      })

      logger.info(`Account deleted for: ${req.user.email}`)

      res.json({
        success: true,
        message: 'Аккаунт успешно удален',
      })
    } catch (error) {
      next(error)
    }
  },

  // Административные методы
  async getAllUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 20, search } = req.query

      const where = search
        ? {
            OR: [
              { name: { contains: search as string, mode: 'insensitive' as const } },
              { email: { contains: search as string, mode: 'insensitive' as const } },
            ],
          }
        : {}

      const [users, total] = await Promise.all([
        getPrisma().user.findMany({
          where,
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            isVerified: true,
            createdAt: true,
            lastLoginAt: true,
          },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
        }),
        getPrisma().user.count({ where }),
      ])

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
          },
        },
      })
    } catch (error) {
      next(error)
    }
  },

  async getUserById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params

      const user = await getPrisma().user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          isVerified: true,
          createdAt: true,
          lastLoginAt: true,
          preferences: true,
        },
      })

      if (!user) {
        throw new NotFoundError('Пользователь не найден')
      }

      res.json({
        success: true,
        data: { user },
      })
    } catch (error) {
      next(error)
    }
  },

  async updateUserById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params
      const { name, avatar, isVerified } = req.body

      const user = await getPrisma().user.update({
        where: { id: userId },
        data: {
          ...(name && { name }),
          ...(avatar && { avatar }),
          ...(isVerified !== undefined && { isVerified }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          isVerified: true,
          createdAt: true,
          lastLoginAt: true,
        },
      })

      logger.info(`User updated by admin: ${user.email}`)

      res.json({
        success: true,
        message: 'Пользователь успешно обновлен',
        data: { user },
      })
    } catch (error) {
      next(error)
    }
  },

  async deleteUserById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params

      await getPrisma().user.delete({
        where: { id: userId },
      })

      logger.info(`User deleted by admin: ${userId}`)

      res.json({
        success: true,
        message: 'Пользователь успешно удален',
      })
    } catch (error) {
      next(error)
    }
  },
}
