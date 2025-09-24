import { Router } from 'express'
import { body, query } from 'express-validator'
import { calculatorController } from '@controllers/calculatorController'
import { validateRequest } from '@middleware/validateRequest'
import { authenticate } from '@middleware/authenticate'

const router = Router()

// Получение всех калькуляторов пользователя
router.get('/',
  authenticate,
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Страница должна быть положительным числом'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Лимит должен быть от 1 до 100'),
    query('search')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Поисковый запрос не должен превышать 100 символов'),
    query('sortBy')
      .optional()
      .isIn(['name', 'createdAt', 'updatedAt'])
      .withMessage('Недопустимое поле для сортировки'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Порядок сортировки должен быть asc или desc'),
  ],
  validateRequest,
  calculatorController.getCalculators
)

// Создание нового калькулятора
router.post('/',
  authenticate,
  [
    body('name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Название должно содержать от 1 до 100 символов'),
    body('displayName')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Отображаемое название не должно превышать 100 символов'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Описание не должно превышать 500 символов'),
  ],
  validateRequest,
  calculatorController.createCalculator
)

// Получение калькулятора по ID
router.get('/:id',
  authenticate,
  calculatorController.getCalculatorById
)

// Обновление калькулятора
router.put('/:id',
  authenticate,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Название должно содержать от 1 до 100 символов'),
    body('displayName')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Отображаемое название не должно превышать 100 символов'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Описание не должно превышать 500 символов'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive должно быть булевым значением'),
  ],
  validateRequest,
  calculatorController.updateCalculator
)

// Удаление калькулятора
router.delete('/:id',
  authenticate,
  calculatorController.deleteCalculator
)

// Клонирование калькулятора
router.post('/:id/clone',
  authenticate,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Название должно содержать от 1 до 100 символов'),
  ],
  validateRequest,
  calculatorController.cloneCalculator
)

// Экспорт калькулятора
router.get('/:id/export',
  authenticate,
  calculatorController.exportCalculator
)

// Импорт калькулятора
router.post('/import',
  authenticate,
  [
    body('data')
      .notEmpty()
      .withMessage('Данные для импорта обязательны'),
  ],
  validateRequest,
  calculatorController.importCalculator
)

// Получение входов калькулятора
router.get('/:id/inputs',
  authenticate,
  calculatorController.getCalculatorInputs
)

// Добавление входа в калькулятор
router.post('/:id/inputs',
  authenticate,
  [
    body('name')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Имя должно содержать от 1 до 50 символов'),
    body('displayName')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Отображаемое название должно содержать от 1 до 100 символов'),
    body('type')
      .isIn(['number', 'text', 'boolean'])
      .withMessage('Тип должен быть number, text или boolean'),
    body('unit')
      .optional()
      .trim()
      .isLength({ max: 20 })
      .withMessage('Единица измерения не должна превышать 20 символов'),
    body('isRequired')
      .optional()
      .isBoolean()
      .withMessage('isRequired должно быть булевым значением'),
  ],
  validateRequest,
  calculatorController.addInput
)

// Обновление входа калькулятора
router.put('/:id/inputs/:inputId',
  authenticate,
  [
    body('displayName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Отображаемое название должно содержать от 1 до 100 символов'),
    body('type')
      .optional()
      .isIn(['number', 'text', 'boolean'])
      .withMessage('Тип должен быть number, text или boolean'),
    body('unit')
      .optional()
      .trim()
      .isLength({ max: 20 })
      .withMessage('Единица измерения не должна превышать 20 символов'),
    body('isRequired')
      .optional()
      .isBoolean()
      .withMessage('isRequired должно быть булевым значением'),
  ],
  validateRequest,
  calculatorController.updateInput
)

// Удаление входа калькулятора
router.delete('/:id/inputs/:inputId',
  authenticate,
  calculatorController.deleteInput
)

// Получение выходов калькулятора
router.get('/:id/outputs',
  authenticate,
  calculatorController.getCalculatorOutputs
)

// Добавление выхода в калькулятор
router.post('/:id/outputs',
  authenticate,
  [
    body('name')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Имя должно содержать от 1 до 50 символов'),
    body('displayName')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Отображаемое название должно содержать от 1 до 100 символов'),
    body('type')
      .isIn(['number', 'text', 'boolean'])
      .withMessage('Тип должен быть number, text или boolean'),
    body('unit')
      .optional()
      .trim()
      .isLength({ max: 20 })
      .withMessage('Единица измерения не должна превышать 20 символов'),
  ],
  validateRequest,
  calculatorController.addOutput
)

// Обновление выхода калькулятора
router.put('/:id/outputs/:outputId',
  authenticate,
  [
    body('displayName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Отображаемое название должно содержать от 1 до 100 символов'),
    body('type')
      .optional()
      .isIn(['number', 'text', 'boolean'])
      .withMessage('Тип должен быть number, text или boolean'),
    body('unit')
      .optional()
      .trim()
      .isLength({ max: 20 })
      .withMessage('Единица измерения не должна превышать 20 символов'),
  ],
  validateRequest,
  calculatorController.updateOutput
)

// Удаление выхода калькулятора
router.delete('/:id/outputs/:outputId',
  authenticate,
  calculatorController.deleteOutput
)

export { router as calculatorRoutes }
