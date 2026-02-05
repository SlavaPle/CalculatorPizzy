import express from 'express'
import { recordVisit } from '../controllers/visitController'

const router = express.Router()

// POST /api/visits — zapisanie wizyty (IP + data), bez auth
router.post('/', recordVisit)

export default router
