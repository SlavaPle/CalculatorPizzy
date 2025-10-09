import express from 'express'
import { protect } from '../middleware/auth'
import User from '../models/User'
import { asyncHandler, createError } from '../middleware/errorHandler'

const router = express.Router()

// @desc    Получение настроек пользователя
// @route   GET /api/settings
// @access  Private
router.get('/', protect, asyncHandler(async (req: any, res: any) => {
  const user = await User.findById(req.user._id).select('settings preferences')
  
  res.json({
    success: true,
    data: {
      settings: user.settings,
      preferences: user.preferences
    }
  })
}))

// @desc    Обновление настроек пользователя
// @route   PUT /api/settings
// @access  Private
router.put('/', protect, asyncHandler(async (req: any, res: any) => {
  const { settings, preferences } = req.body
  const userId = req.user._id

  const updateData: any = {}
  
  if (settings) {
    updateData.settings = { ...req.user.settings, ...settings }
  }
  
  if (preferences) {
    updateData.preferences = { ...req.user.preferences, ...preferences }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  ).select('settings preferences')

  res.json({
    success: true,
    message: 'Настройки обновлены',
    data: {
      settings: user.settings,
      preferences: user.preferences
    }
  })
}))

// @desc    Сброс настроек к значениям по умолчанию
// @route   POST /api/settings/reset
// @access  Private
router.post('/reset', protect, asyncHandler(async (req: any, res: any) => {
  const userId = req.user._id

  const defaultSettings = {
    currency: 'RUB',
    language: 'ru',
    notifications: true,
    autoSave: true
  }

  const defaultPreferences = {
    defaultMinSlices: 1,
    defaultMaxSlices: 3,
    preferredPizzaTypes: []
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      settings: defaultSettings,
      preferences: defaultPreferences
    },
    { new: true, runValidators: true }
  ).select('settings preferences')

  res.json({
    success: true,
    message: 'Настройки сброшены к значениям по умолчанию',
    data: {
      settings: user.settings,
      preferences: user.preferences
    }
  })
}))

export default router





