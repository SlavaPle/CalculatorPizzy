import mongoose, { Document, Schema } from 'mongoose'

export interface IPizza extends Document {
  type: string
  size: 'small' | 'medium' | 'large' | 'xlarge'
  price: number
  slices: number
  isFree: boolean
}

export interface ISauce extends Document {
  type: string
  price: number
  size: 'small' | 'medium' | 'large'
  isPersonal: boolean
  userId?: string
}

export interface IUserOrder extends Document {
  userId: string
  name: string
  minSlices: number
  maxSlices: number
  preferredTypes?: string[]
  personalSauces: ISauce[]
  totalCost: number
  assignedSlices: any[]
}

export interface IOrder extends Document {
  userId: string
  users: IUserOrder[]
  pizzas: IPizza[]
  sharedSauces: ISauce[]
  totalCost: number
  freePizzaCount: number
  calculationResult: {
    optimalPizzas: IPizza[]
    userCosts: { [key: string]: number }
    totalCost: number
    freePizzaValue: number
    distribution: { [key: string]: any }
  }
  settings: {
    freePizzaThreshold: number
    freePizzaSize: string
    currency: string
  }
  createdAt: Date
  updatedAt: Date
}

const PizzaSchema = new Schema<IPizza>({
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
}, { _id: false })

const SauceSchema = new Schema<ISauce>({
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
    required: function() {
      return this.isPersonal
    }
  }
}, { _id: false })

const UserOrderSchema = new Schema<IUserOrder>({
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
    type: Schema.Types.Mixed
  }]
}, { _id: false })

const OrderSchema = new Schema<IOrder>({
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
      of: Schema.Types.Mixed
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
})

// Индексы
OrderSchema.index({ userId: 1, createdAt: -1 })
OrderSchema.index({ totalCost: 1 })
OrderSchema.index({ createdAt: -1 })

// Виртуальные поля
OrderSchema.virtual('id').get(function() {
  return this._id.toHexString()
})

// Методы экземпляра
OrderSchema.methods.calculateSavings = function() {
  const regularCost = this.pizzas.reduce((sum, pizza) => {
    return sum + (pizza.isFree ? 0 : pizza.price)
  }, 0)
  
  const freePizzaValue = this.pizzas
    .filter(pizza => pizza.isFree)
    .reduce((sum, pizza) => sum + pizza.price, 0)
    
  return {
    regularCost,
    freePizzaValue,
    savings: freePizzaValue
  }
}

export default mongoose.model<IOrder>('Order', OrderSchema)





