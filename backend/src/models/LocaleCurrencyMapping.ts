import mongoose, { Document, Schema } from 'mongoose'

export interface ILocaleCurrencyMapping extends Document {
  locale: string
  currency: string
  countryCode?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const LocaleCurrencyMappingSchema = new Schema<ILocaleCurrencyMapping>({
  locale: {
    type: String,
    required: [true, 'Locale is required'],
    unique: true,
    trim: true,
    index: true
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    trim: true,
    uppercase: true
  },
  countryCode: {
    type: String,
    trim: true,
    uppercase: true,
    maxlength: 2
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Индексы для оптимизации запросов
LocaleCurrencyMappingSchema.index({ locale: 1, isActive: 1 })
LocaleCurrencyMappingSchema.index({ currency: 1 })

export default mongoose.model<ILocaleCurrencyMapping>('LocaleCurrencyMapping', LocaleCurrencyMappingSchema)

