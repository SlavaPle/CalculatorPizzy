import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  preferences: {
    defaultMinSlices: number
    defaultMaxSlices: number
    preferredPizzaTypes: string[]
  }
  settings: {
    currency: string
    language: string
    notifications: boolean
    autoSave: boolean
  }
  statistics: {
    totalCalculations: number
    totalSaved: number
    lastCalculation: Date
  }
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
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
})

// Индексы для оптимизации запросов
UserSchema.index({ email: 1 })
UserSchema.index({ createdAt: -1 })

// Виртуальные поля
UserSchema.virtual('id').get(function() {
  return this._id.toHexString()
})

// Методы экземпляра
UserSchema.methods.toJSON = function() {
  const user = this.toObject()
  delete user.password
  delete user.__v
  return user
}

// Статические методы
UserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() })
}

// Добавляем типы для статических методов
declare global {
  namespace Express {
    interface Request {
      user?: IUser
    }
  }
}

export default mongoose.model<IUser>('User', UserSchema)
