import express from 'express'
import { getTranslations, getTranslationsByNamespace } from '../controllers/translationController'

const router = express.Router()

// Получить переводы для локали
router.get('/:locale', getTranslations)

// Получить переводы для локали и namespace
router.get('/:locale/:namespace', getTranslationsByNamespace)

export default router


