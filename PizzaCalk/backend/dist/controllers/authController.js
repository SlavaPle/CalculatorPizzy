"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateMe = exports.getMe = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("../models/User"));
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
exports.register = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return next((0, errorHandler_1.createError)('Все поля обязательны', 400));
    }
    if (password.length < 6) {
        return next((0, errorHandler_1.createError)('Пароль должен содержать минимум 6 символов', 400));
    }
    const existingUser = await User_1.default.findByEmail(email);
    if (existingUser) {
        return next((0, errorHandler_1.createError)('Пользователь с таким email уже существует', 400));
    }
    const salt = await bcryptjs_1.default.genSalt(10);
    const hashedPassword = await bcryptjs_1.default.hash(password, salt);
    const user = await User_1.default.create({
        name,
        email,
        password: hashedPassword
    });
    const token = (0, auth_1.generateToken)(user._id);
    res.status(201).json({
        success: true,
        message: 'Пользователь успешно зарегистрирован',
        data: {
            user: user.toJSON(),
            token
        }
    });
});
exports.login = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next((0, errorHandler_1.createError)('Email и пароль обязательны', 400));
    }
    const user = await User_1.default.findByEmail(email);
    if (!user) {
        return next((0, errorHandler_1.createError)('Неверные учетные данные', 401));
    }
    const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        return next((0, errorHandler_1.createError)('Неверные учетные данные', 401));
    }
    const token = (0, auth_1.generateToken)(user._id);
    res.json({
        success: true,
        message: 'Успешный вход',
        data: {
            user: user.toJSON(),
            token
        }
    });
});
exports.getMe = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const user = await User_1.default.findById(req.user._id).select('-password');
    res.json({
        success: true,
        data: user
    });
});
exports.updateMe = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { name, preferences, settings } = req.body;
    const userId = req.user._id;
    const updateData = {};
    if (name)
        updateData.name = name;
    if (preferences)
        updateData.preferences = { ...req.user.preferences, ...preferences };
    if (settings)
        updateData.settings = { ...req.user.settings, ...settings };
    const user = await User_1.default.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select('-password');
    res.json({
        success: true,
        message: 'Профиль обновлен',
        data: user
    });
});
exports.changePassword = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;
    if (!currentPassword || !newPassword) {
        return next((0, errorHandler_1.createError)('Текущий и новый пароль обязательны', 400));
    }
    if (newPassword.length < 6) {
        return next((0, errorHandler_1.createError)('Новый пароль должен содержать минимум 6 символов', 400));
    }
    const user = await User_1.default.findById(userId);
    if (!user) {
        return next((0, errorHandler_1.createError)('Пользователь не найден', 404));
    }
    const isCurrentPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
        return next((0, errorHandler_1.createError)('Неверный текущий пароль', 400));
    }
    const salt = await bcryptjs_1.default.genSalt(10);
    const hashedNewPassword = await bcryptjs_1.default.hash(newPassword, salt);
    await User_1.default.findByIdAndUpdate(userId, { password: hashedNewPassword });
    res.json({
        success: true,
        message: 'Пароль успешно изменен'
    });
});
//# sourceMappingURL=authController.js.map