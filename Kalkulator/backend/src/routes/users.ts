import { Router } from 'express'
import { userController } from '@controllers/userController'
import { authenticate } from '@middleware/authenticate'
import { authorize } from '@middleware/authorize'

const router = Router()

// Получение профиля пользователя
router.get('/profile',
  authenticate,
  userController.getProfile
)

// Обновление профиля
router.put('/profile',
  authenticate,
  userController.updateProfile
)

// Получение настроек пользователя
router.get('/preferences',
  authenticate,
  userController.getPreferences
)

// Обновление настроек пользователя
router.put('/preferences',
  authenticate,
  userController.updatePreferences
)

// Получение сессий пользователя
router.get('/sessions',
  authenticate,
  userController.getSessions
)

// Удаление сессии
router.delete('/sessions/:sessionId',
  authenticate,
  userController.deleteSession
)

// Удаление всех сессий кроме текущей
router.delete('/sessions',
  authenticate,
  userController.deleteAllSessions
)

// Получение статистики пользователя
router.get('/stats',
  authenticate,
  userController.getStats
)

// Экспорт данных пользователя
router.get('/export',
  authenticate,
  userController.exportData
)

// Импорт данных пользователя
router.post('/import',
  authenticate,
  userController.importData
)

// Удаление аккаунта
router.delete('/account',
  authenticate,
  userController.deleteAccount
)

// Административные маршруты
router.get('/',
  authenticate,
  authorize(['admin']),
  userController.getAllUsers
)

router.get('/:userId',
  authenticate,
  authorize(['admin']),
  userController.getUserById
)

router.put('/:userId',
  authenticate,
  authorize(['admin']),
  userController.updateUserById
)

router.delete('/:userId',
  authenticate,
  authorize(['admin']),
  userController.deleteUserById
)

export { router as userRoutes }
