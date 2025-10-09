import express from 'express'
import { calculateOrder, getOrderHistory, getOrder, deleteOrder, exportOrder } from '../controllers/orderController'
import { protect, optionalAuth } from '../middleware/auth'

const router = express.Router()

// Публичные маршруты (с опциональной аутентификацией)
router.post('/calculate', optionalAuth, calculateOrder)

// Защищенные маршруты
router.get('/history', protect, getOrderHistory)
router.get('/:id', protect, getOrder)
router.delete('/:id', protect, deleteOrder)
router.get('/:id/export', protect, exportOrder)

export default router





