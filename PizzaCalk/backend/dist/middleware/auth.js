"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = exports.optionalAuth = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const errorHandler_1 = require("./errorHandler");
const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return next((0, errorHandler_1.createError)('Доступ запрещен. Токен не предоставлен.', 401));
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const user = await User_1.default.findById(decoded.id).select('-password');
            if (!user) {
                return next((0, errorHandler_1.createError)('Пользователь не найден', 401));
            }
            req.user = user;
            next();
        }
        catch (error) {
            return next((0, errorHandler_1.createError)('Недействительный токен', 401));
        }
    }
    catch (error) {
        next(error);
    }
};
exports.protect = protect;
const optionalAuth = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (token) {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                const user = await User_1.default.findById(decoded.id).select('-password');
                if (user) {
                    req.user = user;
                }
            }
            catch (error) {
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.optionalAuth = optionalAuth;
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};
exports.generateToken = generateToken;
//# sourceMappingURL=auth.js.map