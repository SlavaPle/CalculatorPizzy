import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Tab } from '@shared/models/tab/Tab'
import { Calculation } from '@shared/models/calculation/Calculation'

interface CalculatorState {
  tabs: Tab[]
  currentTab: Tab | null
  calculations: Calculation[]
  isLoading: boolean
  error: string | null
}

const initialState: CalculatorState = {
  tabs: [],
  currentTab: null,
  calculations: [],
  isLoading: false,
  error: null,
}

export const calculatorSlice = createSlice({
  name: 'calculator',
  initialState,
  reducers: {
    setTabs: (state, action: PayloadAction<Tab[]>) => {
      state.tabs = action.payload
    },
    addTab: (state, action: PayloadAction<Tab>) => {
      state.tabs.push(action.payload)
    },
    updateTab: (state, action: PayloadAction<{ id: string; updates: Partial<Tab> }>) => {
      const index = state.tabs.findIndex(tab => tab.id === action.payload.id)
      if (index !== -1) {
        state.tabs[index] = { ...state.tabs[index], ...action.payload.updates }
      }
      if (state.currentTab?.id === action.payload.id) {
        state.currentTab = { ...state.currentTab, ...action.payload.updates }
      }
    },
    deleteTab: (state, action: PayloadAction<string>) => {
      state.tabs = state.tabs.filter(tab => tab.id !== action.payload)
      if (state.currentTab?.id === action.payload) {
        state.currentTab = null
      }
    },
    setCurrentTab: (state, action: PayloadAction<Tab | null>) => {
      state.currentTab = action.payload
    },
    addCalculation: (state, action: PayloadAction<Calculation>) => {
      state.calculations.push(action.payload)
    },
    setCalculations: (state, action: PayloadAction<Calculation[]>) => {
      state.calculations = action.payload
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
  setTabs,
  addTab,
  updateTab,
  deleteTab,
  setCurrentTab,
  addCalculation,
  setCalculations,
  setLoading,
  setError,
  clearError,
} = calculatorSlice.actions

export default calculatorSlice.reducer
