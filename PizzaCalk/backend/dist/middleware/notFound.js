"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        error: `Маршрут ${req.originalUrl} не найден`,
        availableRoutes: [
            'GET /api/health',
            'POST /api/auth/register',
            'POST /api/auth/login',
            'GET /api/users/profile',
            'POST /api/orders/calculate',
            'GET /api/orders/history',
            'GET /api/settings',
            'PUT /api/settings'
        ]
    });
};
exports.notFound = notFound;
//# sourceMappingURL=notFound.js.map