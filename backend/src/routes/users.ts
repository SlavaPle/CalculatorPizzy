import express from 'express'
import { protect } from '../middleware/auth'
import User from '../models/User'
import { asyncHandler } from '../middleware/errorHandler'

const router = express.Router()

// @desc    Получение профиля пользователя
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, asyncHandler(async (req: any, res: any) => {
  const user = await User.findById(req.user._id).select('-password')
  if (!user) {
    return res.status(404).json({ success: false, error: 'Użytkownik nie znaleziony' })
  }
  res.json({
    success: true,
    data: user
  })
}))

// @desc    Обновление профиля пользователя
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, asyncHandler(async (req: any, res: any) => {
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

  if (!user) {
    return res.status(404).json({ success: false, error: 'Użytkownik nie znaleziony' })
  }
  res.json({
    success: true,
    message: 'Профиль обновлен',
    data: user
  })
}))

// @desc    Получение статистики пользователя
// @route   GET /api/users/statistics
// @access  Private
router.get('/statistics', protect, asyncHandler(async (req: any, res: any) => {
  const user = await User.findById(req.user._id).select('statistics')
  if (!user) {
    return res.status(404).json({ success: false, error: 'Użytkownik nie znaleziony' })
  }
  res.json({
    success: true,
    data: user.statistics
  })
}))

export default router












