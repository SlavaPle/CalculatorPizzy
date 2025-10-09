"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.createError = exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    console.error('❌ Ошибка:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    if (err.name === 'CastError') {
        const message = 'Ресурс не найден';
        error = { message, statusCode: 404 };
    }
    if (err.name === 'MongoError' && err.code === 11000) {
        const message = 'Дублирующееся значение поля';
        error = { message, statusCode: 400 };
    }
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((val) => val.message).join(', ');
        error = { message, statusCode: 400 };
    }
    if (err.name === 'JsonWebTokenError') {
        const message = 'Недействительный токен';
        error = { message, statusCode: 401 };
    }
    if (err.name === 'TokenExpiredError') {
        const message = 'Токен истек';
        error = { message, statusCode: 401 };
    }
    if (err.message.includes('Too many requests')) {
        const message = 'Слишком много запросов, попробуйте позже';
        error = { message, statusCode: 429 };
    }
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Внутренняя ошибка сервера',
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            details: err
        })
    });
};
exports.errorHandler = errorHandler;
const createError = (message, statusCode = 500) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
exports.createError = createError;
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errorHandler.js.map