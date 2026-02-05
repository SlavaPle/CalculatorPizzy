import { Response, NextFunction } from 'express'
import Order from '../models/Order'
import User from '../models/User'
import { createError, asyncHandler } from '../middleware/errorHandler'

// Ładowanie w runtime – shared nie jest w rootDir backendu
const { PizzaCalculator } = require('../../../shared/classes') as { PizzaCalculator: new (order: unknown) => { calculateOptimalOrder: () => { optimalPizzas: unknown[]; totalCost: number; freePizzaValue?: number } } }

// @desc    Расчет оптимального заказа
// @route   POST /api/orders/calculate
// @access  Public (с опциональной аутентификацией)
export const calculateOrder = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
  const { users, pizzas, sauces, settings } = req.body

  // Валидация входных данных
  if (!users || !Array.isArray(users) || users.length === 0) {
    return next(createError('Необходимо указать участников заказа', 400))
  }

  if (!pizzas || !Array.isArray(pizzas) || pizzas.length === 0) {
    return next(createError('Необходимо выбрать пиццы', 400))
  }

  // Валидация пользователей
  for (const user of users) {
    if (!user.name || !user.minSlices || !user.maxSlices) {
      return next(createError('Для каждого участника необходимо указать имя, минимум и максимум кусков', 400))
    }
    
    if (user.minSlices > user.maxSlices) {
      return next(createError('Минимальное количество кусков не может быть больше максимального', 400))
    }
  }

  // Создание заказа
  const orderData: {
    userId: unknown;
    users: unknown[];
    pizzas: unknown[];
    sharedSauces: unknown[];
    totalCost: number;
    freePizzaCount: number;
    calculationResult: Record<string, unknown>;
    settings: { freePizzaThreshold: number; freePizzaSize: string; currency: string };
  } = {
    userId: req.user?._id ?? null,
    users: users.map((user: Record<string, unknown>) => ({
      userId: `user-${Date.now()}-${Math.random()}`,
      name: user['name'],
      minSlices: user['minSlices'],
      maxSlices: user['maxSlices'],
      preferredTypes: (user['preferredTypes'] as unknown[]) || [],
      personalSauces: (user['personalSauces'] as unknown[]) || [],
      totalCost: 0,
      assignedSlices: []
    })),
    pizzas: [],
    sharedSauces: sauces || [],
    totalCost: 0,
    freePizzaCount: 0,
    calculationResult: {},
    settings: {
      freePizzaThreshold: settings?.freePizzaThreshold || 3,
      freePizzaSize: settings?.freePizzaSize || 'medium',
      currency: settings?.currency || 'RUB'
    }
  }

  // Расчет оптимального заказа
  const calculator = new PizzaCalculator(orderData as any)
  const result = calculator.calculateOptimalOrder()

  // Обновление данных заказа
  orderData.pizzas = result.optimalPizzas
  orderData.totalCost = result.totalCost
  orderData.freePizzaCount = result.optimalPizzas.filter((p: unknown) => (p as { isFree?: boolean }).isFree).length
  orderData.calculationResult = result

  // Сохранение заказа (если пользователь авторизован)
  let savedOrder = null
  if (req.user) {
    savedOrder = await Order.create(orderData)
    
    // Обновление статистики пользователя
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 
        'statistics.totalCalculations': 1,
        'statistics.totalSaved': result.freePizzaValue || 0
      },
      'statistics.lastCalculation': new Date()
    })
  }

  res.json({
    success: true,
    message: 'Расчет выполнен успешно',
    data: {
      order: savedOrder || orderData,
      calculation: result,
      savings: {
        freePizzaValue: result.freePizzaValue,
        freePizzaCount: orderData.freePizzaCount,
        totalSavings: result.freePizzaValue
      }
    }
  })
})

// @desc    Получение истории заказов
// @route   GET /api/orders/history
// @access  Private
export const getOrderHistory = asyncHandler(async (req: any, res: Response, _next: NextFunction) => {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query
  const userId = req.user._id

  const sortOptions: any = {}
  sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1

  const orders = await Order.find({ userId })
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((Number(page) - 1) * Number(limit))
    .select('-calculationResult.distribution')

  const total = await Order.countDocuments({ userId })

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total
      }
    }
  })
})

// @desc    Получение конкретного заказа
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
  const { id } = req.params
  const userId = req.user._id

  const order = await Order.findOne({ _id: id, userId })
  if (!order) {
    return next(createError('Заказ не найден', 404))
  }

  res.json({
    success: true,
    data: order
  })
})

// @desc    Удаление заказа
// @route   DELETE /api/orders/:id
// @access  Private
export const deleteOrder = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
  const { id } = req.params
  const userId = req.user._id

  const order = await Order.findOneAndDelete({ _id: id, userId })
  if (!order) {
    return next(createError('Заказ не найден', 404))
  }

  res.json({
    success: true,
    message: 'Заказ удален'
  })
})

// @desc    Экспорт заказа
// @route   GET /api/orders/:id/export
// @access  Private
export const exportOrder = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
  const { id } = req.params
  const { format = 'json' } = req.query
  const userId = req.user._id

  const order = await Order.findOne({ _id: id, userId })
  if (!order) {
    return next(createError('Заказ не найден', 404))
  }

  if (format === 'json') {
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="order-${id}.json"`)
    res.json(order)
  } else {
    return next(createError('Неподдерживаемый формат экспорта', 400))
  }
})












