import { Router } from 'express'
import { body, query } from 'express-validator'
import { calculationController } from '@controllers/calculationController'
import { validateRequest } from '@middleware/validateRequest'
import { authenticate } from '@middleware/authenticate'

const router = Router()

// Получение истории расчетов
router.get('/',
  authenticate,
  [
    query('calculatorId')
      .optional()
      .isUUID()
      .withMessage('ID калькулятора должен быть валидным UUID'),
    query('formulaId')
      .optional()
      .isUUID()
      .withMessage('ID формулы должен быть валидным UUID'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Страница должна быть положительным числом'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Лимит должен быть от 1 до 100'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Дата начала должна быть в формате ISO 8601'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Дата окончания должна быть в формате ISO 8601'),
    query('sortBy')
      .optional()
      .isIn(['createdAt', 'executionTime', 'success'])
      .withMessage('Недопустимое поле для сортировки'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Порядок сортировки должен быть asc или desc'),
  ],
  validateRequest,
  calculationController.getCalculations
)

// Выполнение расчета
router.post('/execute',
  authenticate,
  [
    body('calculatorId')
      .isUUID()
      .withMessage('ID калькулятора должен быть валидным UUID'),
    body('inputs')
      .isObject()
      .withMessage('Входы должны быть объектом'),
    body('formulaId')
      .optional()
      .isUUID()
      .withMessage('ID формулы должен быть валидным UUID'),
  ],
  validateRequest,
  calculationController.executeCalculation
)

// Получение расчета по ID
router.get('/:id',
  authenticate,
  calculationController.getCalculationById
)

// Удаление расчета
router.delete('/:id',
  authenticate,
  calculationController.deleteCalculation
)

// Получение статистики расчетов
router.get('/stats/overview',
  authenticate,
  [
    query('calculatorId')
      .optional()
      .isUUID()
      .withMessage('ID калькулятора должен быть валидным UUID'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Дата начала должна быть в формате ISO 8601'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Дата окончания должна быть в формате ISO 8601'),
  ],
  validateRequest,
  calculationController.getStats
)

// Получение производительности расчетов
router.get('/stats/performance',
  authenticate,
  [
    query('calculatorId')
      .optional()
      .isUUID()
      .withMessage('ID калькулятора должен быть валидным UUID'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Дата начала должна быть в формате ISO 8601'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Дата окончания должна быть в формате ISO 8601'),
  ],
  validateRequest,
  calculationController.getPerformanceStats
)

// Получение ошибок расчетов
router.get('/stats/errors',
  authenticate,
  [
    query('calculatorId')
      .optional()
      .isUUID()
      .withMessage('ID калькулятора должен быть валидным UUID'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Дата начала должна быть в формате ISO 8601'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Дата окончания должна быть в формате ISO 8601'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Страница должна быть положительным числом'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Лимит должен быть от 1 до 100'),
  ],
  validateRequest,
  calculationController.getErrors
)

// Очистка истории расчетов
router.delete('/history/clear',
  authenticate,
  [
    body('calculatorId')
      .optional()
      .isUUID()
      .withMessage('ID калькулятора должен быть валидным UUID'),
    body('olderThan')
      .optional()
      .isISO8601()
      .withMessage('Дата должна быть в формате ISO 8601'),
  ],
  validateRequest,
  calculationController.clearHistory
)

// Экспорт истории расчетов
router.get('/export',
  authenticate,
  [
    query('calculatorId')
      .optional()
      .isUUID()
      .withMessage('ID калькулятора должен быть валидным UUID'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Дата начала должна быть в формате ISO 8601'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Дата окончания должна быть в формате ISO 8601'),
    query('format')
      .optional()
      .isIn(['json', 'csv', 'xlsx'])
      .withMessage('Формат должен быть json, csv или xlsx'),
  ],
  validateRequest,
  calculationController.exportCalculations
)

// Получение кэша расчетов
router.get('/cache/:key',
  authenticate,
  calculationController.getCache
)

// Очистка кэша
router.delete('/cache',
  authenticate,
  [
    body('pattern')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Паттерн не должен превышать 100 символов'),
  ],
  validateRequest,
  calculationController.clearCache
)

export { router as calculationRoutes }
