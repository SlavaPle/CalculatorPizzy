"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const PizzaSchema = new mongoose_1.Schema({
    type: {
        type: String,
        required: true,
        trim: true
    },
    size: {
        type: String,
        required: true,
        enum: ['small', 'medium', 'large', 'xlarge']
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    slices: {
        type: Number,
        required: true,
        min: 1,
        max: 20
    },
    isFree: {
        type: Boolean,
        default: false
    }
}, { _id: false });
const SauceSchema = new mongoose_1.Schema({
    type: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    size: {
        type: String,
        required: true,
        enum: ['small', 'medium', 'large']
    },
    isPersonal: {
        type: Boolean,
        default: false
    },
    userId: {
        type: String,
        required: function () {
            return this.isPersonal;
        }
    }
}, { _id: false });
const UserOrderSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    minSlices: {
        type: Number,
        required: true,
        min: 1,
        max: 20
    },
    maxSlices: {
        type: Number,
        required: true,
        min: 1,
        max: 20
    },
    preferredTypes: [{
            type: String,
            trim: true
        }],
    personalSauces: [SauceSchema],
    totalCost: {
        type: Number,
        default: 0,
        min: 0
    },
    assignedSlices: [{
            type: mongoose_1.Schema.Types.Mixed
        }]
}, { _id: false });
const OrderSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: true,
        ref: 'User'
    },
    users: [UserOrderSchema],
    pizzas: [PizzaSchema],
    sharedSauces: [SauceSchema],
    totalCost: {
        type: Number,
        required: true,
        min: 0
    },
    freePizzaCount: {
        type: Number,
        default: 0,
        min: 0
    },
    calculationResult: {
        optimalPizzas: [PizzaSchema],
        userCosts: {
            type: Map,
            of: Number
        },
        totalCost: {
            type: Number,
            required: true
        },
        freePizzaValue: {
            type: Number,
            default: 0
        },
        distribution: {
            type: Map,
            of: mongoose_1.Schema.Types.Mixed
        }
    },
    settings: {
        freePizzaThreshold: {
            type: Number,
            default: 3,
            min: 2,
            max: 10
        },
        freePizzaSize: {
            type: String,
            default: 'medium',
            enum: ['small', 'medium', 'large']
        },
        currency: {
            type: String,
            default: 'RUB',
            enum: ['RUB', 'USD', 'EUR']
        }
    }
}, {
    timestamps: true
});
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ totalCost: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
OrderSchema.methods.calculateSavings = function () {
    const regularCost = this.pizzas.reduce((sum, pizza) => {
        return sum + (pizza.isFree ? 0 : pizza.price);
    }, 0);
    const freePizzaValue = this.pizzas
        .filter(pizza => pizza.isFree)
        .reduce((sum, pizza) => sum + pizza.price, 0);
    return {
        regularCost,
        freePizzaValue,
        savings: freePizzaValue
    };
};
exports.default = mongoose_1.default.model('Order', OrderSchema);
//# sourceMappingURL=Order.js.map