"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportOrder = exports.deleteOrder = exports.getOrder = exports.getOrderHistory = exports.calculateOrder = void 0;
const Order_1 = __importDefault(require("../models/Order"));
const User_1 = __importDefault(require("../models/User"));
const errorHandler_1 = require("../middleware/errorHandler");
const classes_1 = require("../../../shared/classes");
exports.calculateOrder = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { users, pizzas, sauces, settings } = req.body;
    if (!users || !Array.isArray(users) || users.length === 0) {
        return next((0, errorHandler_1.createError)('Необходимо указать участников заказа', 400));
    }
    if (!pizzas || !Array.isArray(pizzas) || pizzas.length === 0) {
        return next((0, errorHandler_1.createError)('Необходимо выбрать пиццы', 400));
    }
    for (const user of users) {
        if (!user.name || !user.minSlices || !user.maxSlices) {
            return next((0, errorHandler_1.createError)('Для каждого участника необходимо указать имя, минимум и максимум кусков', 400));
        }
        if (user.minSlices > user.maxSlices) {
            return next((0, errorHandler_1.createError)('Минимальное количество кусков не может быть больше максимального', 400));
        }
    }
    const orderData = {
        userId: req.user?._id || null,
        users: users.map((user) => ({
            userId: `user-${Date.now()}-${Math.random()}`,
            name: user.name,
            minSlices: user.minSlices,
            maxSlices: user.maxSlices,
            preferredTypes: user.preferredTypes || [],
            personalSauces: user.personalSauces || [],
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
    };
    const calculator = new classes_1.PizzaCalculator(orderData);
    const result = calculator.calculateOptimalOrder();
    orderData.pizzas = result.optimalPizzas;
    orderData.totalCost = result.totalCost;
    orderData.freePizzaCount = result.optimalPizzas.filter(p => p.isFree).length;
    orderData.calculationResult = result;
    let savedOrder = null;
    if (req.user) {
        savedOrder = await Order_1.default.create(orderData);
        await User_1.default.findByIdAndUpdate(req.user._id, {
            $inc: {
                'statistics.totalCalculations': 1,
                'statistics.totalSaved': result.freePizzaValue || 0
            },
            'statistics.lastCalculation': new Date()
        });
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
    });
});
exports.getOrderHistory = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const userId = req.user._id;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    const orders = await Order_1.default.find({ userId })
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((Number(page) - 1) * Number(limit))
        .select('-calculationResult.distribution');
    const total = await Order_1.default.countDocuments({ userId });
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
    });
});
exports.getOrder = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user._id;
    const order = await Order_1.default.findOne({ _id: id, userId });
    if (!order) {
        return next((0, errorHandler_1.createError)('Заказ не найден', 404));
    }
    res.json({
        success: true,
        data: order
    });
});
exports.deleteOrder = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user._id;
    const order = await Order_1.default.findOneAndDelete({ _id: id, userId });
    if (!order) {
        return next((0, errorHandler_1.createError)('Заказ не найден', 404));
    }
    res.json({
        success: true,
        message: 'Заказ удален'
    });
});
exports.exportOrder = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { id } = req.params;
    const { format = 'json' } = req.query;
    const userId = req.user._id;
    const order = await Order_1.default.findOne({ _id: id, userId });
    if (!order) {
        return next((0, errorHandler_1.createError)('Заказ не найден', 404));
    }
    if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="order-${id}.json"`);
        res.json(order);
    }
    else {
        return next((0, errorHandler_1.createError)('Неподдерживаемый формат экспорта', 400));
    }
});
//# sourceMappingURL=orderController.js.map