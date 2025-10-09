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
const UserSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Имя обязательно'],
        trim: true,
        maxlength: [50, 'Имя не может быть длиннее 50 символов']
    },
    email: {
        type: String,
        required: [true, 'Email обязателен'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Некорректный email']
    },
    password: {
        type: String,
        required: [true, 'Пароль обязателен'],
        minlength: [6, 'Пароль должен содержать минимум 6 символов']
    },
    preferences: {
        defaultMinSlices: {
            type: Number,
            default: 1,
            min: [1, 'Минимум 1 кусок'],
            max: [20, 'Максимум 20 кусков']
        },
        defaultMaxSlices: {
            type: Number,
            default: 3,
            min: [1, 'Минимум 1 кусок'],
            max: [20, 'Максимум 20 кусков']
        },
        preferredPizzaTypes: [{
                type: String,
                trim: true
            }]
    },
    settings: {
        currency: {
            type: String,
            default: 'RUB',
            enum: ['RUB', 'USD', 'EUR']
        },
        language: {
            type: String,
            default: 'ru',
            enum: ['ru', 'en']
        },
        notifications: {
            type: Boolean,
            default: true
        },
        autoSave: {
            type: Boolean,
            default: true
        }
    },
    statistics: {
        totalCalculations: {
            type: Number,
            default: 0
        },
        totalSaved: {
            type: Number,
            default: 0
        },
        lastCalculation: {
            type: Date,
            default: Date.now
        }
    }
}, {
    timestamps: true
});
UserSchema.index({ email: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
UserSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.__v;
    return user;
};
UserSchema.statics.findByEmail = function (email) {
    return this.findOne({ email: email.toLowerCase() });
};
exports.default = mongoose_1.default.model('User', UserSchema);
//# sourceMappingURL=User.js.map