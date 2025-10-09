import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/User'
import { createError, asyncHandler } from '../middleware/errorHandler'
import { generateToken } from '../middleware/auth'

// @desc    Регистрация пользователя
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body

  // Валидация
  if (!name || !email || !password) {
    return next(createError('Все поля обязательны', 400))
  }

  if (password.length < 6) {
    return next(createError('Пароль должен содержать минимум 6 символов', 400))
  }

  // Проверка существования пользователя
  const existingUser = await User.findByEmail(email)
  if (existingUser) {
    return next(createError('Пользователь с таким email уже существует', 400))
  }

  // Хеширование пароля
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  // Создание пользователя
  const user = await User.create({
    name,
    email,
    password: hashedPassword
  })

  // Генерация токена
  const token = generateToken(user._id)

  res.status(201).json({
    success: true,
    message: 'Пользователь успешно зарегистрирован',
    data: {
      user: user.toJSON(),
      token
    }
  })
})

// @desc    Вход пользователя
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body

  // Валидация
  if (!email || !password) {
    return next(createError('Email и пароль обязательны', 400))
  }

  // Поиск пользователя
  const user = await User.findByEmail(email)
  if (!user) {
    return next(createError('Неверные учетные данные', 401))
  }

  // Проверка пароля
  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    return next(createError('Неверные учетные данные', 401))
  }

  // Генерация токена
  const token = generateToken(user._id)

  res.json({
    success: true,
    message: 'Успешный вход',
    data: {
      user: user.toJSON(),
      token
    }
  })
})

// @desc    Получение профиля пользователя
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user._id).select('-password')
  
  res.json({
    success: true,
    data: user
  })
})

// @desc    Обновление профиля пользователя
// @route   PUT /api/auth/me
// @access  Private
export const updateMe = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
  const { name, preferences, settings } = req.body
  const userId = req.user._id

  const updateData: any = {}
  
  if (name) updateData.name = name
  if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences }
  if (settings) updateData.settings = { ...req.user.settings, ...settings }

  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  ).select('-password')

  res.json({
    success: true,
    message: 'Профиль обновлен',
    data: user
  })
})

// @desc    Смена пароля
// @route   PUT /api/auth/password
// @access  Private
export const changePassword = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
  const { currentPassword, newPassword } = req.body
  const userId = req.user._id

  if (!currentPassword || !newPassword) {
    return next(createError('Текущий и новый пароль обязательны', 400))
  }

  if (newPassword.length < 6) {
    return next(createError('Новый пароль должен содержать минимум 6 символов', 400))
  }

  // Получаем пользователя с паролем
  const user = await User.findById(userId)
  if (!user) {
    return next(createError('Пользователь не найден', 404))
  }

  // Проверяем текущий пароль
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
  if (!isCurrentPasswordValid) {
    return next(createError('Неверный текущий пароль', 400))
  }

  // Хешируем новый пароль
  const salt = await bcrypt.genSalt(10)
  const hashedNewPassword = await bcrypt.hash(newPassword, salt)

  // Обновляем пароль
  await User.findByIdAndUpdate(userId, { password: hashedNewPassword })

  res.json({
    success: true,
    message: 'Пароль успешно изменен'
  })
})





