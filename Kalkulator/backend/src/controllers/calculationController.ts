import { Request, Response, NextFunction } from 'express'
import { getPrisma } from '@database/connection'
import { logger } from '@utils/logger'
import { NotFoundError, UnauthorizedError, ValidationError } from '@utils/ApiError'
import { formulaEngine } from '@services/formulaEngine'

interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    name: string
    isVerified: boolean
  }
}

export const calculationController = {
  // Получение истории расчетов
  async getCalculations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const {
        calculatorId,
        formulaId,
        page = 1,
        limit = 20,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query

      const where = {
        userId: req.user.id,
        ...(calculatorId && { calculatorId }),
        ...(formulaId && { formulaId }),
        ...(startDate && endDate && {
          createdAt: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string),
          },
        }),
      }

      const [calculations, total] = await Promise.all([
        getPrisma().calculation.findMany({
          where,
          include: {
            calculator: {
              select: { id: true, name: true, displayName: true },
            },
            formula: {
              select: { id: true, name: true, displayName: true },
            },
          },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
          orderBy: { [sortBy as string]: sortOrder },
        }),
        getPrisma().calculation.count({ where }),
      ])

      res.json({
        success: true,
        data: {
          calculations,
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

  // Выполнение расчета
  async executeCalculation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { calculatorId, inputs, formulaId } = req.body

      // Проверка существования калькулятора
      const calculator = await getPrisma().calculator.findFirst({
        where: {
          id: calculatorId,
          userId: req.user.id,
        },
        include: {
          inputs: true,
          outputs: true,
          formulas: {
            where: { isEnabled: true },
            orderBy: { executionOrder: 'asc' },
          },
        },
      })

      if (!calculator) {
        throw new NotFoundError('Калькулятор не найден')
      }

      const startTime = Date.now()
      let executionResult
      let error = null

      try {
        if (formulaId) {
          // Выполнение конкретной формулы
          const formula = await getPrisma().formula.findFirst({
            where: {
              id: formulaId,
              calculatorId,
              userId: req.user.id,
            },
          })

          if (!formula) {
            throw new NotFoundError('Формула не найдена')
          }

          executionResult = await formulaEngine.executeFormula(formula.formula, inputs)
        } else {
          // Выполнение всех формул калькулятора
          executionResult = await formulaEngine.executeCalculator(calculator, inputs)
        }
      } catch (executionError) {
        error = executionError instanceof Error ? executionError.message : 'Unknown error'
        executionResult = {
          success: false,
          outputs: {},
          executionTime: Date.now() - startTime,
          error,
        }
      }

      const executionTime = Date.now() - startTime

      // Сохранение результата расчета
      const calculation = await getPrisma().calculation.create({
        data: {
          calculatorId,
          formulaId: formulaId || null,
          userId: req.user.id,
          inputValues: inputs,
          outputValues: executionResult.outputs || {},
          executionTime,
          success: executionResult.success,
          error,
        },
      })

      logger.info(`Calculation executed: ${calculation.id} by ${req.user.email}`)

      res.json({
        success: true,
        data: {
          result: executionResult,
          calculationId: calculation.id,
        },
      })
    } catch (error) {
      next(error)
    }
  },

  // Получение расчета по ID
  async getCalculationById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { id } = req.params

      const calculation = await getPrisma().calculation.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
        include: {
          calculator: {
            select: { id: true, name: true, displayName: true },
          },
          formula: {
            select: { id: true, name: true, displayName: true },
          },
        },
      })

      if (!calculation) {
        throw new NotFoundError('Расчет не найден')
      }

      res.json({
        success: true,
        data: { calculation },
      })
    } catch (error) {
      next(error)
    }
  },

  // Удаление расчета
  async deleteCalculation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { id } = req.params

      const calculation = await getPrisma().calculation.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
      })

      if (!calculation) {
        throw new NotFoundError('Расчет не найден')
      }

      await getPrisma().calculation.delete({
        where: { id },
      })

      logger.info(`Calculation deleted: ${id} by ${req.user.email}`)

      res.json({
        success: true,
        message: 'Расчет успешно удален',
      })
    } catch (error) {
      next(error)
    }
  },

  // Получение статистики расчетов
  async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { calculatorId, startDate, endDate } = req.query

      const where = {
        userId: req.user.id,
        ...(calculatorId && { calculatorId }),
        ...(startDate && endDate && {
          createdAt: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string),
          },
        }),
      }

      const [
        totalCalculations,
        successfulCalculations,
        failedCalculations,
        averageExecutionTime,
        recentCalculations,
      ] = await Promise.all([
        getPrisma().calculation.count({ where }),
        getPrisma().calculation.count({ where: { ...where, success: true } }),
        getPrisma().calculation.count({ where: { ...where, success: false } }),
        getPrisma().calculation.aggregate({
          where: { ...where, success: true },
          _avg: { executionTime: true },
        }),
        getPrisma().calculation.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            calculator: {
              select: { id: true, name: true, displayName: true },
            },
            formula: {
              select: { id: true, name: true, displayName: true },
            },
          },
        }),
      ])

      res.json({
        success: true,
        data: {
          total: totalCalculations,
          successful: successfulCalculations,
          failed: failedCalculations,
          successRate: totalCalculations > 0 ? (successfulCalculations / totalCalculations) * 100 : 0,
          averageExecutionTime: averageExecutionTime._avg.executionTime || 0,
          recentCalculations,
        },
      })
    } catch (error) {
      next(error)
    }
  },

  // Получение производительности расчетов
  async getPerformanceStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { calculatorId, startDate, endDate } = req.query

      const where = {
        userId: req.user.id,
        success: true,
        ...(calculatorId && { calculatorId }),
        ...(startDate && endDate && {
          createdAt: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string),
          },
        }),
      }

      const [
        minExecutionTime,
        maxExecutionTime,
        averageExecutionTime,
        executionTimeDistribution,
      ] = await Promise.all([
        getPrisma().calculation.aggregate({
          where,
          _min: { executionTime: true },
        }),
        getPrisma().calculation.aggregate({
          where,
          _max: { executionTime: true },
        }),
        getPrisma().calculation.aggregate({
          where,
          _avg: { executionTime: true },
        }),
        getPrisma().calculation.groupBy({
          by: ['executionTime'],
          where,
          _count: { executionTime: true },
          orderBy: { executionTime: 'asc' },
        }),
      ])

      res.json({
        success: true,
        data: {
          minExecutionTime: minExecutionTime._min.executionTime || 0,
          maxExecutionTime: maxExecutionTime._max.executionTime || 0,
          averageExecutionTime: averageExecutionTime._avg.executionTime || 0,
          executionTimeDistribution,
        },
      })
    } catch (error) {
      next(error)
    }
  },

  // Получение ошибок расчетов
  async getErrors(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const {
        calculatorId,
        startDate,
        endDate,
        page = 1,
        limit = 20,
      } = req.query

      const where = {
        userId: req.user.id,
        success: false,
        ...(calculatorId && { calculatorId }),
        ...(startDate && endDate && {
          createdAt: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string),
          },
        }),
      }

      const [errors, total] = await Promise.all([
        getPrisma().calculation.findMany({
          where,
          include: {
            calculator: {
              select: { id: true, name: true, displayName: true },
            },
            formula: {
              select: { id: true, name: true, displayName: true },
            },
          },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
        }),
        getPrisma().calculation.count({ where }),
      ])

      res.json({
        success: true,
        data: {
          errors,
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

  // Очистка истории расчетов
  async clearHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { calculatorId, olderThan } = req.body

      const where = {
        userId: req.user.id,
        ...(calculatorId && { calculatorId }),
        ...(olderThan && {
          createdAt: {
            lt: new Date(olderThan),
          },
        }),
      }

      const deletedCount = await getPrisma().calculation.deleteMany({
        where,
      })

      logger.info(`History cleared: ${deletedCount.count} calculations by ${req.user.email}`)

      res.json({
        success: true,
        message: `Удалено ${deletedCount.count} расчетов`,
        data: { deletedCount: deletedCount.count },
      })
    } catch (error) {
      next(error)
    }
  },

  // Экспорт истории расчетов
  async exportCalculations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { calculatorId, startDate, endDate, format = 'json' } = req.query

      const where = {
        userId: req.user.id,
        ...(calculatorId && { calculatorId }),
        ...(startDate && endDate && {
          createdAt: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string),
          },
        }),
      }

      const calculations = await getPrisma().calculation.findMany({
        where,
        include: {
          calculator: {
            select: { id: true, name: true, displayName: true },
          },
          formula: {
            select: { id: true, name: true, displayName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      // Здесь должна быть логика экспорта в различные форматы
      // Пока что возвращаем JSON

      res.json({
        success: true,
        data: { calculations },
      })
    } catch (error) {
      next(error)
    }
  },

  // Получение кэша расчетов
  async getCache(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { key } = req.params

      // Здесь должна быть логика работы с кэшем
      // Пока что возвращаем пустой результат

      res.json({
        success: true,
        data: { cache: null },
      })
    } catch (error) {
      next(error)
    }
  },

  // Очистка кэша
  async clearCache(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { pattern } = req.body

      // Здесь должна быть логика очистки кэша
      // Пока что возвращаем успех

      logger.info(`Cache cleared by ${req.user.email}`)

      res.json({
        success: true,
        message: 'Кэш успешно очищен',
      })
    } catch (error) {
      next(error)
    }
  },
}
