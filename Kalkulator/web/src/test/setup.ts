// Настройка среды тестирования Vitest + JSDOM
import '@testing-library/jest-dom'

// Поллифилы/заглушки, если нужно
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})


