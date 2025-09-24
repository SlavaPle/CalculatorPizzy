import { configureStore } from '@reduxjs/toolkit'
import { authSlice } from './slices/authSlice'
import { calculatorSlice } from './slices/calculatorSlice'
import { formulaSlice } from './slices/formulaSlice'
import { uiSlice } from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    calculator: calculatorSlice.reducer,
    formula: formulaSlice.reducer,
    ui: uiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
