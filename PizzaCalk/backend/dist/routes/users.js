"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const User_1 = __importDefault(require("../models/User"));
const errorHandler_1 = require("../middleware/errorHandler");
const router = express_1.default.Router();
router.get('/profile', auth_1.protect, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const user = await User_1.default.findById(req.user._id).select('-password');
    res.json({
        success: true,
        data: user
    });
}));
router.put('/profile', auth_1.protect, (0, errorHandler_1.asyncHandler)(async (req, res) => {
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
}));
router.get('/statistics', auth_1.protect, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const user = await User_1.default.findById(req.user._id).select('statistics');
    res.json({
        success: true,
        data: user.statistics
    });
}));
exports.default = router;
//# sourceMappingURL=users.js.map