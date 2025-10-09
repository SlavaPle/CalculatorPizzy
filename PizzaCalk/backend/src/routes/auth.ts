import express from 'express'
import { register, login, getMe, updateMe, changePassword } from '../controllers/authController'
import { protect } from '../middleware/auth'

const router = express.Router()

// Публичные маршруты
router.post('/register', register)
router.post('/login', login)

// Защищенные маршруты
router.get('/me', protect, getMe)
router.put('/me', protect, updateMe)
router.put('/password', protect, changePassword)

export default router





