import express from 'express'
import { getCurrencyByLocaleHandler, getSupportedLocalesHandler } from '../controllers/localeController'

const router = express.Router()

// Получить валюту по локали
router.get('/currency', getCurrencyByLocaleHandler)

// Получить список поддерживаемых локалей
router.get('/supported', getSupportedLocalesHandler)

export default router


