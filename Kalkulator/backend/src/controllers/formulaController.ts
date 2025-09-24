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

export const formulaController = {
  // Получение всех формул пользователя
  async getFormulas(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const {
        page = 1,
        limit = 20,
        search,
        category,
        sortBy = 'updatedAt',
        sortOrder = 'desc',
      } = req.query

      const where = {
        userId: req.user.id,
        ...(search && {
          OR: [
            { name: { contains: search as string, mode: 'insensitive' as const } },
            { displayName: { contains: search as string, mode: 'insensitive' as const } },
            { formula: { contains: search as string, mode: 'insensitive' as const } },
          ],
        }),
      }

      const [formulas, total] = await Promise.all([
        getPrisma().formula.findMany({
          where,
          include: {
            calculator: {
              select: { id: true, name: true, displayName: true },
            },
            _count: {
              select: {
                calculations: true,
              },
            },
          },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
          orderBy: { [sortBy as string]: sortOrder },
        }),
        getPrisma().formula.count({ where }),
      ])

      res.json({
        success: true,
        data: {
          formulas,
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

  // Создание новой формулы
  async createFormula(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const {
        calculatorId,
        name,
        displayName,
        formula,
        inputs,
        outputs,
        executionOrder,
        isEnabled,
      } = req.body

      // Проверка существования калькулятора
      const calculator = await getPrisma().calculator.findFirst({
        where: {
          id: calculatorId,
          userId: req.user.id,
        },
      })

      if (!calculator) {
        throw new NotFoundError('Калькулятор не найден')
      }

      // Валидация формулы
      const validationResult = await formulaEngine.validateFormula(formula, inputs)
      if (!validationResult.isValid) {
        throw new ValidationError('Формула содержит ошибки', validationResult.errors)
      }

      const newFormula = await getPrisma().formula.create({
        data: {
          calculatorId,
          userId: req.user.id,
          name,
          displayName,
          formula,
          inputs,
          outputs,
          executionOrder: executionOrder || 0,
          isEnabled: isEnabled !== undefined ? isEnabled : true,
        },
        include: {
          calculator: {
            select: { id: true, name: true, displayName: true },
          },
        },
      })

      logger.info(`Formula created: ${newFormula.name} by ${req.user.email}`)

      res.status(201).json({
        success: true,
        message: 'Формула успешно создана',
        data: { formula: newFormula },
      })
    } catch (error) {
      next(error)
    }
  },

  // Получение формулы по ID
  async getFormulaById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { id } = req.params

      const formula = await getPrisma().formula.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
        include: {
          calculator: {
            select: { id: true, name: true, displayName: true },
          },
          _count: {
            select: {
              calculations: true,
            },
          },
        },
      })

      if (!formula) {
        throw new NotFoundError('Формула не найдена')
      }

      res.json({
        success: true,
        data: { formula },
      })
    } catch (error) {
      next(error)
    }
  },

  // Обновление формулы
  async updateFormula(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { id } = req.params
      const { name, displayName, formula, inputs, outputs, executionOrder, isEnabled, isCollapsed } = req.body

      const existingFormula = await getPrisma().formula.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
      })

      if (!existingFormula) {
        throw new NotFoundError('Формула не найдена')
      }

      // Валидация формулы, если она изменилась
      if (formula && formula !== existingFormula.formula) {
        const validationResult = await formulaEngine.validateFormula(formula, inputs || existingFormula.inputs)
        if (!validationResult.isValid) {
          throw new ValidationError('Формула содержит ошибки', validationResult.errors)
        }
      }

      const updatedFormula = await getPrisma().formula.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(displayName && { displayName }),
          ...(formula && { formula }),
          ...(inputs && { inputs }),
          ...(outputs && { outputs }),
          ...(executionOrder !== undefined && { executionOrder }),
          ...(isEnabled !== undefined && { isEnabled }),
          ...(isCollapsed !== undefined && { isCollapsed }),
        },
        include: {
          calculator: {
            select: { id: true, name: true, displayName: true },
          },
        },
      })

      logger.info(`Formula updated: ${updatedFormula.name} by ${req.user.email}`)

      res.json({
        success: true,
        message: 'Формула успешно обновлена',
        data: { formula: updatedFormula },
      })
    } catch (error) {
      next(error)
    }
  },

  // Удаление формулы
  async deleteFormula(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { id } = req.params

      const formula = await getPrisma().formula.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
      })

      if (!formula) {
        throw new NotFoundError('Формула не найдена')
      }

      await getPrisma().formula.delete({
        where: { id },
      })

      logger.info(`Formula deleted: ${formula.name} by ${req.user.email}`)

      res.json({
        success: true,
        message: 'Формула успешно удалена',
      })
    } catch (error) {
      next(error)
    }
  },

  // Валидация формулы
  async validateFormula(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { id } = req.params

      const formula = await getPrisma().formula.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
      })

      if (!formula) {
        throw new NotFoundError('Формула не найдена')
      }

      const validationResult = await formulaEngine.validateFormula(formula.formula, formula.inputs)

      res.json({
        success: true,
        data: validationResult,
      })
    } catch (error) {
      next(error)
    }
  },

  // Тестирование формулы
  async testFormula(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { id } = req.params
      const { inputs } = req.body

      const formula = await getPrisma().formula.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
      })

      if (!formula) {
        throw new NotFoundError('Формула не найдена')
      }

      const testResult = await formulaEngine.testFormula(formula.formula, inputs)

      res.json({
        success: true,
        data: testResult,
      })
    } catch (error) {
      next(error)
    }
  },

  // Выполнение формулы
  async executeFormula(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { id } = req.params
      const { inputs } = req.body

      const formula = await getPrisma().formula.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
      })

      if (!formula) {
        throw new NotFoundError('Формула не найдена')
      }

      const executionResult = await formulaEngine.executeFormula(formula.formula, inputs)

      // Сохранение результата расчета
      const calculation = await getPrisma().calculation.create({
        data: {
          calculatorId: formula.calculatorId,
          formulaId: formula.id,
          userId: req.user.id,
          inputValues: inputs,
          outputValues: executionResult.outputs,
          executionTime: executionResult.executionTime,
          success: executionResult.success,
          error: executionResult.error,
        },
      })

      logger.info(`Formula executed: ${formula.name} by ${req.user.email}`)

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

  // Получение шаблонов формул
  async getTemplates(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { category, search } = req.query

      const where = {
        ...(category && { category }),
        ...(search && {
          OR: [
            { name: { contains: search as string, mode: 'insensitive' as const } },
            { displayName: { contains: search as string, mode: 'insensitive' as const } },
            { description: { contains: search as string, mode: 'insensitive' as const } },
          ],
        }),
        OR: [
          { isPublic: true },
          { createdBy: req.user.id },
        ],
      }

      const templates = await getPrisma().formulaTemplate.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      })

      res.json({
        success: true,
        data: { templates },
      })
    } catch (error) {
      next(error)
    }
  },

  // Создание шаблона формулы
  async createTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const {
        name,
        displayName,
        description,
        category,
        formula,
        inputs,
        outputs,
        isPublic,
      } = req.body

      // Валидация формулы
      const validationResult = await formulaEngine.validateFormula(formula, inputs)
      if (!validationResult.isValid) {
        throw new ValidationError('Формула содержит ошибки', validationResult.errors)
      }

      const template = await getPrisma().formulaTemplate.create({
        data: {
          name,
          displayName,
          description,
          category,
          formula,
          inputs,
          outputs,
          isPublic: isPublic || false,
          createdBy: req.user.id,
        },
      })

      logger.info(`Formula template created: ${template.name} by ${req.user.email}`)

      res.status(201).json({
        success: true,
        message: 'Шаблон формулы успешно создан',
        data: { template },
      })
    } catch (error) {
      next(error)
    }
  },

  // Получение шаблона по ID
  async getTemplateById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { id } = req.params

      const template = await getPrisma().formulaTemplate.findFirst({
        where: {
          id,
          OR: [
            { isPublic: true },
            { createdBy: req.user.id },
          ],
        },
      })

      if (!template) {
        throw new NotFoundError('Шаблон не найден')
      }

      res.json({
        success: true,
        data: { template },
      })
    } catch (error) {
      next(error)
    }
  },

  // Обновление шаблона
  async updateTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { id } = req.params
      const { name, displayName, description, category, formula, inputs, outputs, isPublic } = req.body

      const template = await getPrisma().formulaTemplate.findFirst({
        where: {
          id,
          createdBy: req.user.id,
        },
      })

      if (!template) {
        throw new NotFoundError('Шаблон не найден')
      }

      // Валидация формулы, если она изменилась
      if (formula && formula !== template.formula) {
        const validationResult = await formulaEngine.validateFormula(formula, inputs || template.inputs)
        if (!validationResult.isValid) {
          throw new ValidationError('Формула содержит ошибки', validationResult.errors)
        }
      }

      const updatedTemplate = await getPrisma().formulaTemplate.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(displayName && { displayName }),
          ...(description && { description }),
          ...(category && { category }),
          ...(formula && { formula }),
          ...(inputs && { inputs }),
          ...(outputs && { outputs }),
          ...(isPublic !== undefined && { isPublic }),
        },
      })

      logger.info(`Formula template updated: ${updatedTemplate.name} by ${req.user.email}`)

      res.json({
        success: true,
        message: 'Шаблон формулы успешно обновлен',
        data: { template: updatedTemplate },
      })
    } catch (error) {
      next(error)
    }
  },

  // Удаление шаблона
  async deleteTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { id } = req.params

      const template = await getPrisma().formulaTemplate.findFirst({
        where: {
          id,
          createdBy: req.user.id,
        },
      })

      if (!template) {
        throw new NotFoundError('Шаблон не найден')
      }

      await getPrisma().formulaTemplate.delete({
        where: { id },
      })

      logger.info(`Formula template deleted: ${template.name} by ${req.user.email}`)

      res.json({
        success: true,
        message: 'Шаблон формулы успешно удален',
      })
    } catch (error) {
      next(error)
    }
  },

  // Клонирование шаблона в калькулятор
  async cloneTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { id } = req.params
      const { calculatorId, name } = req.body

      const template = await getPrisma().formulaTemplate.findFirst({
        where: {
          id,
          OR: [
            { isPublic: true },
            { createdBy: req.user.id },
          ],
        },
      })

      if (!template) {
        throw new NotFoundError('Шаблон не найден')
      }

      // Проверка существования калькулятора
      const calculator = await getPrisma().calculator.findFirst({
        where: {
          id: calculatorId,
          userId: req.user.id,
        },
      })

      if (!calculator) {
        throw new NotFoundError('Калькулятор не найден')
      }

      const formula = await getPrisma().formula.create({
        data: {
          calculatorId,
          userId: req.user.id,
          name: name || template.name,
          displayName: name || template.displayName,
          formula: template.formula,
          inputs: template.inputs,
          outputs: template.outputs,
          executionOrder: 0,
          isEnabled: true,
        },
        include: {
          calculator: {
            select: { id: true, name: true, displayName: true },
          },
        },
      })

      logger.info(`Template cloned to formula: ${formula.name} by ${req.user.email}`)

      res.status(201).json({
        success: true,
        message: 'Шаблон успешно клонирован в калькулятор',
        data: { formula },
      })
    } catch (error) {
      next(error)
    }
  },
}
