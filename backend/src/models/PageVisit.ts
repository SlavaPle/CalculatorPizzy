import mongoose, { Document, Schema } from 'mongoose'

// Zapisywanie wizyty użytkownika: IP i data wejścia na stronę
export interface IPageVisit extends Document {
  ip: string
  visitedAt: Date
}

const PageVisitSchema = new Schema<IPageVisit>(
  {
    ip: {
      type: String,
      required: true,
      trim: true
    },
    visitedAt: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  {
    timestamps: false,
    collection: 'pagevisits'
  }
)

// Indeks do szybkiego wyszukiwania po dacie i IP
PageVisitSchema.index({ visitedAt: -1 })
PageVisitSchema.index({ ip: 1, visitedAt: -1 })

export default mongoose.model<IPageVisit>('PageVisit', PageVisitSchema)
