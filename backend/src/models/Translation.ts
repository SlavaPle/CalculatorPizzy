import mongoose, { Document, Schema } from 'mongoose'

export interface ITranslation extends Document {
  locale: string
  namespace: string
  translations: Record<string, string>
  version: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const TranslationSchema = new Schema<ITranslation>({
  locale: { type: String, required: true, trim: true, index: true },
  namespace: { type: String, required: true, trim: true, default: 'translation' },
  translations: { type: Schema.Types.Mixed, required: true, default: {} },
  version: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

TranslationSchema.index({ locale: 1, namespace: 1 }, { unique: true })

export default mongoose.model<ITranslation>('Translation', TranslationSchema)
