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
router.get('/', auth_1.protect, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const user = await User_1.default.findById(req.user._id).select('settings preferences');
    res.json({
        success: true,
        data: {
            settings: user.settings,
            preferences: user.preferences
        }
    });
}));
router.put('/', auth_1.protect, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { settings, preferences } = req.body;
    const userId = req.user._id;
    const updateData = {};
    if (settings) {
        updateData.settings = { ...req.user.settings, ...settings };
    }
    if (preferences) {
        updateData.preferences = { ...req.user.preferences, ...preferences };
    }
    const user = await User_1.default.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select('settings preferences');
    res.json({
        success: true,
        message: 'Настройки обновлены',
        data: {
            settings: user.settings,
            preferences: user.preferences
        }
    });
}));
router.post('/reset', auth_1.protect, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user._id;
    const defaultSettings = {
        currency: 'RUB',
        language: 'ru',
        notifications: true,
        autoSave: true
    };
    const defaultPreferences = {
        defaultMinSlices: 1,
        defaultMaxSlices: 3,
        preferredPizzaTypes: []
    };
    const user = await User_1.default.findByIdAndUpdate(userId, {
        settings: defaultSettings,
        preferences: defaultPreferences
    }, { new: true, runValidators: true }).select('settings preferences');
    res.json({
        success: true,
        message: 'Настройки сброшены к значениям по умолчанию',
        data: {
            settings: user.settings,
            preferences: user.preferences
        }
    });
}));
exports.default = router;
//# sourceMappingURL=settings.js.map