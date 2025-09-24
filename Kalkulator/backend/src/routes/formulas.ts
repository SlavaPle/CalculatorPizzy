import { Router } from 'express'
import { body, query } from 'express-validator'
import { formulaController } from '@controllers/formulaController'
import { validateRequest } from '@middleware/validateRequest'
import { authenticate } from '@middleware/authenticate'

const router = Router()

// Получение всех формул пользователя
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
    query('category')
      .optional()
      .isIn(['mathematical', 'financial', 'physical', 'chemical', 'engineering', 'statistical', 'custom'])
      .withMessage('Недопустимая категория'),
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
  formulaController.getFormulas
)

// Создание новой формулы
router.post('/',
  authenticate,
  [
    body('calculatorId')
      .isUUID()
      .withMessage('ID калькулятора должен быть валидным UUID'),
    body('name')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Имя должно содержать от 1 до 50 символов'),
    body('displayName')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Отображаемое название должно содержать от 1 до 100 символов'),
    body('formula')
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Формула должна содержать от 1 до 1000 символов'),
    body('inputs')
      .isArray()
      .withMessage('Входы должны быть массивом'),
    body('outputs')
      .isArray()
      .withMessage('Выходы должны быть массивом'),
    body('executionOrder')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Порядок выполнения должен быть неотрицательным числом'),
    body('isEnabled')
      .optional()
      .isBoolean()
      .withMessage('isEnabled должно быть булевым значением'),
  ],
  validateRequest,
  formulaController.createFormula
)

// Получение формулы по ID
router.get('/:id',
  authenticate,
  formulaController.getFormulaById
)

// Обновление формулы
router.put('/:id',
  authenticate,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Имя должно содержать от 1 до 50 символов'),
    body('displayName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Отображаемое название должно содержать от 1 до 100 символов'),
    body('formula')
      .optional()
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Формула должна содержать от 1 до 1000 символов'),
    body('inputs')
      .optional()
      .isArray()
      .withMessage('Входы должны быть массивом'),
    body('outputs')
      .optional()
      .isArray()
      .withMessage('Выходы должны быть массивом'),
    body('executionOrder')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Порядок выполнения должен быть неотрицательным числом'),
    body('isEnabled')
      .optional()
      .isBoolean()
      .withMessage('isEnabled должно быть булевым значением'),
    body('isCollapsed')
      .optional()
      .isBoolean()
      .withMessage('isCollapsed должно быть булевым значением'),
  ],
  validateRequest,
  formulaController.updateFormula
)

// Удаление формулы
router.delete('/:id',
  authenticate,
  formulaController.deleteFormula
)

// Валидация формулы
router.post('/:id/validate',
  authenticate,
  formulaController.validateFormula
)

// Тестирование формулы
router.post('/:id/test',
  authenticate,
  [
    body('inputs')
      .isObject()
      .withMessage('Входы должны быть объектом'),
  ],
  validateRequest,
  formulaController.testFormula
)

// Выполнение формулы
router.post('/:id/execute',
  authenticate,
  [
    body('inputs')
      .isObject()
      .withMessage('Входы должны быть объектом'),
  ],
  validateRequest,
  formulaController.executeFormula
)

// Получение шаблонов формул
router.get('/templates',
  authenticate,
  [
    query('category')
      .optional()
      .isIn(['mathematical', 'financial', 'physical', 'chemical', 'engineering', 'statistical', 'custom'])
      .withMessage('Недопустимая категория'),
    query('search')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Поисковый запрос не должен превышать 100 символов'),
  ],
  validateRequest,
  formulaController.getTemplates
)

// Создание шаблона формулы
router.post('/templates',
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
    body('description')
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage('Описание должно содержать от 1 до 500 символов'),
    body('category')
      .isIn(['mathematical', 'financial', 'physical', 'chemical', 'engineering', 'statistical', 'custom'])
      .withMessage('Недопустимая категория'),
    body('formula')
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Формула должна содержать от 1 до 1000 символов'),
    body('inputs')
      .isArray()
      .withMessage('Входы должны быть массивом'),
    body('outputs')
      .isArray()
      .withMessage('Выходы должны быть массивом'),
    body('isPublic')
      .optional()
      .isBoolean()
      .withMessage('isPublic должно быть булевым значением'),
  ],
  validateRequest,
  formulaController.createTemplate
)

// Получение шаблона по ID
router.get('/templates/:id',
  authenticate,
  formulaController.getTemplateById
)

// Обновление шаблона
router.put('/templates/:id',
  authenticate,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Имя должно содержать от 1 до 50 символов'),
    body('displayName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Отображаемое название должно содержать от 1 до 100 символов'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage('Описание должно содержать от 1 до 500 символов'),
    body('category')
      .optional()
      .isIn(['mathematical', 'financial', 'physical', 'chemical', 'engineering', 'statistical', 'custom'])
      .withMessage('Недопустимая категория'),
    body('formula')
      .optional()
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Формула должна содержать от 1 до 1000 символов'),
    body('inputs')
      .optional()
      .isArray()
      .withMessage('Входы должны быть массивом'),
    body('outputs')
      .optional()
      .isArray()
      .withMessage('Выходы должны быть массивом'),
    body('isPublic')
      .optional()
      .isBoolean()
      .withMessage('isPublic должно быть булевым значением'),
  ],
  validateRequest,
  formulaController.updateTemplate
)

// Удаление шаблона
router.delete('/templates/:id',
  authenticate,
  formulaController.deleteTemplate
)

// Клонирование шаблона в калькулятор
router.post('/templates/:id/clone',
  authenticate,
  [
    body('calculatorId')
      .isUUID()
      .withMessage('ID калькулятора должен быть валидным UUID'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Имя должно содержать от 1 до 50 символов'),
  ],
  validateRequest,
  formulaController.cloneTemplate
)

export { router as formulaRoutes }
