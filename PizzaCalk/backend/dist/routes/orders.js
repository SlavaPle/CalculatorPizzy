"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/calculate', auth_1.optionalAuth, orderController_1.calculateOrder);
router.get('/history', auth_1.protect, orderController_1.getOrderHistory);
router.get('/:id', auth_1.protect, orderController_1.getOrder);
router.delete('/:id', auth_1.protect, orderController_1.deleteOrder);
router.get('/:id/export', auth_1.protect, orderController_1.exportOrder);
exports.default = router;
//# sourceMappingURL=orders.js.map