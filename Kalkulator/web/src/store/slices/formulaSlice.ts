import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Formula } from '@shared/models/formula/Formula'
import { FormulaTemplate } from '@shared/models/formula/Formula'

interface FormulaState {
  formulas: Formula[]
  templates: FormulaTemplate[]
  currentFormula: Formula | null
  isLoading: boolean
  error: string | null
}

const initialState: FormulaState = {
  formulas: [],
  templates: [],
  currentFormula: null,
  isLoading: false,
  error: null,
}

export const formulaSlice = createSlice({
  name: 'formula',
  initialState,
  reducers: {
    setFormulas: (state, action: PayloadAction<Formula[]>) => {
      state.formulas = action.payload
    },
    addFormula: (state, action: PayloadAction<Formula>) => {
      state.formulas.push(action.payload)
    },
    updateFormula: (state, action: PayloadAction<{ id: string; updates: Partial<Formula> }>) => {
      const index = state.formulas.findIndex(formula => formula.id === action.payload.id)
      if (index !== -1) {
        state.formulas[index] = { ...state.formulas[index], ...action.payload.updates }
      }
      if (state.currentFormula?.id === action.payload.id) {
        state.currentFormula = { ...state.currentFormula, ...action.payload.updates }
      }
    },
    deleteFormula: (state, action: PayloadAction<string>) => {
      state.formulas = state.formulas.filter(formula => formula.id !== action.payload)
      if (state.currentFormula?.id === action.payload) {
        state.currentFormula = null
      }
    },
    setCurrentFormula: (state, action: PayloadAction<Formula | null>) => {
      state.currentFormula = action.payload
    },
    setTemplates: (state, action: PayloadAction<FormulaTemplate[]>) => {
      state.templates = action.payload
    },
    addTemplate: (state, action: PayloadAction<FormulaTemplate>) => {
      state.templates.push(action.payload)
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  setFormulas,
  addFormula,
  updateFormula,
  deleteFormula,
  setCurrentFormula,
  setTemplates,
  addTemplate,
  setLoading,
  setError,
  clearError,
} = formulaSlice.actions

export default formulaSlice.reducer
