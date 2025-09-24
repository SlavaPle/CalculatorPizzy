import { Router } from 'express'
import { body } from 'express-validator'
import { authController } from '@controllers/authController'
import { validateRequest } from '@middleware/validateRequest'
import { authenticate } from '@middleware/authenticate'

const router = Router()

// Регистрация
router.post('/register',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Введите корректный email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Пароль должен содержать минимум 6 символов'),
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Имя должно содержать от 2 до 50 символов'),
  ],
  validateRequest,
  authController.register
)

// Вход
router.post('/login',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Введите корректный email'),
    body('password')
      .notEmpty()
      .withMessage('Пароль обязателен'),
  ],
  validateRequest,
  authController.login
)

// Выход
router.post('/logout',
  authenticate,
  authController.logout
)

// Обновление токена
router.post('/refresh',
  [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token обязателен'),
  ],
  validateRequest,
  authController.refreshToken
)

// Восстановление пароля
router.post('/forgot-password',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Введите корректный email'),
  ],
  validateRequest,
  authController.forgotPassword
)

// Сброс пароля
router.post('/reset-password',
  [
    body('token')
      .notEmpty()
      .withMessage('Токен обязателен'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('Пароль должен содержать минимум 6 символов'),
  ],
  validateRequest,
  authController.resetPassword
)

// Подтверждение email
router.post('/verify-email',
  [
    body('token')
      .notEmpty()
      .withMessage('Токен обязателен'),
  ],
  validateRequest,
  authController.verifyEmail
)

// OAuth - Google
router.get('/google',
  authController.googleAuth
)

router.get('/google/callback',
  authController.googleCallback
)

// OAuth - Facebook
router.get('/facebook',
  authController.facebookAuth
)

router.get('/facebook/callback',
  authController.facebookCallback
)

// OAuth - Apple
router.post('/apple',
  [
    body('identityToken')
      .notEmpty()
      .withMessage('Identity token обязателен'),
    body('authorizationCode')
      .notEmpty()
      .withMessage('Authorization code обязателен'),
  ],
  validateRequest,
  authController.appleAuth
)

// Получение текущего пользователя
router.get('/me',
  authenticate,
  authController.getCurrentUser
)

// Обновление профиля
router.put('/profile',
  authenticate,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Имя должно содержать от 2 до 50 символов'),
    body('avatar')
      .optional()
      .isURL()
      .withMessage('Аватар должен быть валидной ссылкой'),
  ],
  validateRequest,
  authController.updateProfile
)

// Изменение пароля
router.put('/change-password',
  authenticate,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Текущий пароль обязателен'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('Новый пароль должен содержать минимум 6 символов'),
  ],
  validateRequest,
  authController.changePassword
)

// Удаление аккаунта
router.delete('/account',
  authenticate,
  [
    body('password')
      .notEmpty()
      .withMessage('Пароль обязателен для подтверждения'),
  ],
  validateRequest,
  authController.deleteAccount
)

export { router as authRoutes }
