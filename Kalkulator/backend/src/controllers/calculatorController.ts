import { Request, Response, NextFunction } from 'express'
import { getPrisma } from '@database/connection'
import { logger } from '@utils/logger'
import { NotFoundError, UnauthorizedError, ValidationError } from '@utils/ApiError'

interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    name: string
    isVerified: boolean
  }
}

export const calculatorController = {
  // Получение всех калькуляторов пользователя
  async getCalculators(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const {
        page = 1,
        limit = 20,
        search,
        sortBy = 'updatedAt',
        sortOrder = 'desc',
      } = req.query

      const where = {
        userId: req.user.id,
        ...(search && {
          OR: [
            { name: { contains: search as string, mode: 'insensitive' as const } },
            { displayName: { contains: search as string, mode: 'insensitive' as const } },
            { description: { contains: search as string, mode: 'insensitive' as const } },
          ],
        }),
      }

      const [calculators, total] = await Promise.all([
        getPrisma().calculator.findMany({
          where,
          include: {
            inputs: true,
            outputs: true,
            formulas: true,
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
        getPrisma().calculator.count({ where }),
      ])

      res.json({
        success: true,
        data: {
          calculators,
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

  // Создание нового калькулятора
  async createCalculator(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { name, displayName, description } = req.body

      const calculator = await getPrisma().calculator.create({
        data: {
          userId: req.user.id,
          name,
          displayName: displayName || name,
          description,
        },
        include: {
          inputs: true,
          outputs: true,
          formulas: true,
        },
      })

      logger.info(`Calculator created: ${calculator.name} by ${req.user.email}`)

      res.status(201).json({
        success: true,
        message: 'Калькулятор успешно создан',
        data: { calculator },
      })
    } catch (error) {
      next(error)
    }
  },

  // Получение калькулятора по ID
  async getCalculatorById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { id } = req.params

      const calculator = await getPrisma().calculator.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
        include: {
          inputs: true,
          outputs: true,
          formulas: {
            orderBy: { executionOrder: 'asc' },
          },
          _count: {
            select: {
              calculations: true,
            },
          },
        },
      })

      if (!calculator) {
        throw new NotFoundError('Калькулятор не найден')
      }

      res.json({
        success: true,
        data: { calculator },
      })
    } catch (error) {
      next(error)
    }
  },

  // Обновление калькулятора
  async updateCalculator(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { id } = req.params
      const { name, displayName, description, isActive } = req.body

      const calculator = await getPrisma().calculator.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
      })

      if (!calculator) {
        throw new NotFoundError('Калькулятор не найден')
      }

      const updatedCalculator = await getPrisma().calculator.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(displayName && { displayName }),
          ...(description !== undefined && { description }),
          ...(isActive !== undefined && { isActive }),
        },
        include: {
          inputs: true,
          outputs: true,
          formulas: true,
        },
      })

      logger.info(`Calculator updated: ${updatedCalculator.name} by ${req.user.email}`)

      res.json({
        success: true,
        message: 'Калькулятор успешно обновлен',
        data: { calculator: updatedCalculator },
      })
    } catch (error) {
      next(error)
    }
  },

  // Удаление калькулятора
  async deleteCalculator(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { id } = req.params

      const calculator = await getPrisma().calculator.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
      })

      if (!calculator) {
        throw new NotFoundError('Калькулятор не найден')
      }

      await getPrisma().calculator.delete({
        where: { id },
      })

      logger.info(`Calculator deleted: ${calculator.name} by ${req.user.email}`)

      res.json({
        success: true,
        message: 'Калькулятор успешно удален',
      })
    } catch (error) {
      next(error)
    }
  },

  // Клонирование калькулятора
  async cloneCalculator(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { id } = req.params
      const { name } = req.body

      const originalCalculator = await getPrisma().calculator.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
        include: {
          inputs: true,
          outputs: true,
          formulas: true,
        },
      })

      if (!originalCalculator) {
        throw new NotFoundError('Калькулятор не найден')
      }

      const clonedCalculator = await getPrisma().calculator.create({
        data: {
          userId: req.user.id,
          name: name || `${originalCalculator.name} (копия)`,
          displayName: name || `${originalCalculator.displayName} (копия)`,
          description: originalCalculator.description,
          isActive: true,
          isTemplate: false,
          inputs: {
            create: originalCalculator.inputs.map(input => ({
              name: input.name,
              displayName: input.displayName,
              type: input.type,
              unit: input.unit,
              isRequired: input.isRequired,
              minValue: input.minValue,
              maxValue: input.maxValue,
              step: input.step,
              pattern: input.pattern,
              maxLength: input.maxLength,
              defaultValue: input.defaultValue,
            })),
          },
          outputs: {
            create: originalCalculator.outputs.map(output => ({
              name: output.name,
              displayName: output.displayName,
              type: output.type,
              unit: output.unit,
              isCalculated: false,
              decimals: output.decimals,
              showUnit: output.showUnit,
            })),
          },
          formulas: {
            create: originalCalculator.formulas.map(formula => ({
              userId: req.user.id,
              name: formula.name,
              displayName: formula.displayName,
              formula: formula.formula,
              inputs: formula.inputs,
              outputs: formula.outputs,
              executionOrder: formula.executionOrder,
              isEnabled: formula.isEnabled,
              isCollapsed: formula.isCollapsed,
              dependencies: formula.dependencies,
            })),
          },
        },
        include: {
          inputs: true,
          outputs: true,
          formulas: true,
        },
      })

      logger.info(`Calculator cloned: ${clonedCalculator.name} by ${req.user.email}`)

      res.status(201).json({
        success: true,
        message: 'Калькулятор успешно клонирован',
        data: { calculator: clonedCalculator },
      })
    } catch (error) {
      next(error)
    }
  },

  // Экспорт калькулятора
  async exportCalculator(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { id } = req.params

      const calculator = await getPrisma().calculator.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
        include: {
          inputs: true,
          outputs: true,
          formulas: true,
        },
      })

      if (!calculator) {
        throw new NotFoundError('Калькулятор не найден')
      }

      res.json({
        success: true,
        data: { calculator },
      })
    } catch (error) {
      next(error)
    }
  },

  // Импорт калькулятора
  async importCalculator(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { data } = req.body

      // Здесь должна быть логика импорта калькулятора
      // Пока что просто возвращаем успех

      logger.info(`Calculator import requested by ${req.user.email}`)

      res.json({
        success: true,
        message: 'Импорт калькулятора запрошен',
      })
    } catch (error) {
      next(error)
    }
  },

  // Получение входов калькулятора
  async getCalculatorInputs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { id } = req.params

      const calculator = await getPrisma().calculator.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
      })

      if (!calculator) {
        throw new NotFoundError('Калькулятор не найден')
      }

      const inputs = await getPrisma().input.findMany({
        where: { calculatorId: id },
        orderBy: { createdAt: 'asc' },
      })

      res.json({
        success: true,
        data: { inputs },
      })
    } catch (error) {
      next(error)
    }
  },

  // Добавление входа в калькулятор
  async addInput(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { id } = req.params
      const { name, displayName, type, unit, isRequired, minValue, maxValue, step, pattern, maxLength, defaultValue } = req.body

      const calculator = await getPrisma().calculator.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
      })

      if (!calculator) {
        throw new NotFoundError('Калькулятор не найден')
      }

      const input = await getPrisma().input.create({
        data: {
          calculatorId: id,
          name,
          displayName,
          type,
          unit,
          isRequired,
          minValue,
          maxValue,
          step,
          pattern,
          maxLength,
          defaultValue,
        },
      })

      logger.info(`Input added to calculator: ${input.name} by ${req.user.email}`)

      res.status(201).json({
        success: true,
        message: 'Вход успешно добавлен',
        data: { input },
      })
    } catch (error) {
      next(error)
    }
  },

  // Обновление входа калькулятора
  async updateInput(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { id, inputId } = req.params
      const { displayName, type, unit, isRequired, minValue, maxValue, step, pattern, maxLength, defaultValue } = req.body

      const calculator = await getPrisma().calculator.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
      })

      if (!calculator) {
        throw new NotFoundError('Калькулятор не найден')
      }

      const input = await getPrisma().input.findFirst({
        where: {
          id: inputId,
          calculatorId: id,
        },
      })

      if (!input) {
        throw new NotFoundError('Вход не найден')
      }

      const updatedInput = await getPrisma().input.update({
        where: { id: inputId },
        data: {
          ...(displayName && { displayName }),
          ...(type && { type }),
          ...(unit !== undefined && { unit }),
          ...(isRequired !== undefined && { isRequired }),
          ...(minValue !== undefined && { minValue }),
          ...(maxValue !== undefined && { maxValue }),
          ...(step !== undefined && { step }),
          ...(pattern !== undefined && { pattern }),
          ...(maxLength !== undefined && { maxLength }),
          ...(defaultValue !== undefined && { defaultValue }),
        },
      })

      logger.info(`Input updated: ${updatedInput.name} by ${req.user.email}`)

      res.json({
        success: true,
        message: 'Вход успешно обновлен',
        data: { input: updatedInput },
      })
    } catch (error) {
      next(error)
    }
  },

  // Удаление входа калькулятора
  async deleteInput(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { id, inputId } = req.params

      const calculator = await getPrisma().calculator.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
      })

      if (!calculator) {
        throw new NotFoundError('Калькулятор не найден')
      }

      const input = await getPrisma().input.findFirst({
        where: {
          id: inputId,
          calculatorId: id,
        },
      })

      if (!input) {
        throw new NotFoundError('Вход не найден')
      }

      await getPrisma().input.delete({
        where: { id: inputId },
      })

      logger.info(`Input deleted: ${input.name} by ${req.user.email}`)

      res.json({
        success: true,
        message: 'Вход успешно удален',
      })
    } catch (error) {
      next(error)
    }
  },

  // Получение выходов калькулятора
  async getCalculatorOutputs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { id } = req.params

      const calculator = await getPrisma().calculator.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
      })

      if (!calculator) {
        throw new NotFoundError('Калькулятор не найден')
      }

      const outputs = await getPrisma().output.findMany({
        where: { calculatorId: id },
        orderBy: { createdAt: 'asc' },
      })

      res.json({
        success: true,
        data: { outputs },
      })
    } catch (error) {
      next(error)
    }
  },

  // Добавление выхода в калькулятор
  async addOutput(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { id } = req.params
      const { name, displayName, type, unit, decimals, showUnit } = req.body

      const calculator = await getPrisma().calculator.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
      })

      if (!calculator) {
        throw new NotFoundError('Калькулятор не найден')
      }

      const output = await getPrisma().output.create({
        data: {
          calculatorId: id,
          name,
          displayName,
          type,
          unit,
          decimals,
          showUnit,
        },
      })

      logger.info(`Output added to calculator: ${output.name} by ${req.user.email}`)

      res.status(201).json({
        success: true,
        message: 'Выход успешно добавлен',
        data: { output },
      })
    } catch (error) {
      next(error)
    }
  },

  // Обновление выхода калькулятора
  async updateOutput(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { id, outputId } = req.params
      const { displayName, type, unit, decimals, showUnit } = req.body

      const calculator = await getPrisma().calculator.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
      })

      if (!calculator) {
        throw new NotFoundError('Калькулятор не найден')
      }

      const output = await getPrisma().output.findFirst({
        where: {
          id: outputId,
          calculatorId: id,
        },
      })

      if (!output) {
        throw new NotFoundError('Выход не найден')
      }

      const updatedOutput = await getPrisma().output.update({
        where: { id: outputId },
        data: {
          ...(displayName && { displayName }),
          ...(type && { type }),
          ...(unit !== undefined && { unit }),
          ...(decimals !== undefined && { decimals }),
          ...(showUnit !== undefined && { showUnit }),
        },
      })

      logger.info(`Output updated: ${updatedOutput.name} by ${req.user.email}`)

      res.json({
        success: true,
        message: 'Выход успешно обновлен',
        data: { output: updatedOutput },
      })
    } catch (error) {
      next(error)
    }
  },

  // Удаление выхода калькулятора
  async deleteOutput(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован')
      }

      const { id, outputId } = req.params

      const calculator = await getPrisma().calculator.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
      })

      if (!calculator) {
        throw new NotFoundError('Калькулятор не найден')
      }

      const output = await getPrisma().output.findFirst({
        where: {
          id: outputId,
          calculatorId: id,
        },
      })

      if (!output) {
        throw new NotFoundError('Выход не найден')
      }

      await getPrisma().output.delete({
        where: { id: outputId },
      })

      logger.info(`Output deleted: ${output.name} by ${req.user.email}`)

      res.json({
        success: true,
        message: 'Выход успешно удален',
      })
    } catch (error) {
      next(error)
    }
  },
}
