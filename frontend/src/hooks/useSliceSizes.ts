import { User, PizzaSlice, Pizza } from '../shared/types'

/**
 * Хук для определения размеров кусков пиццы для пользователей
 * Теперь работает с PizzaSlice[] из calculateDistribution
 */
export const useSliceSizes = (
  _users: User[],
  activePizzaList: Pizza[],
  activeDistribution: { [userId: string]: PizzaSlice[] }
) => {
  /**
   * Определяет, какие куски от маленьких пицц для пользователя
   * Теперь использует данные напрямую из activeDistribution
   */
  const getUserSliceSizes = (userId: string, _totalSlices: number): boolean[] => {
    const userSlices = activeDistribution[userId] || []
    
    // Просто возвращаем размеры кусков пользователя
    return userSlices.map(slice => slice.size === 'small')
  }

  /**
   * Определяет размеры нераспределенных кусков
   * Создает массив всех кусков с их ID и размерами, затем вычитает распределенные
   */
  const getExtraSliceSizes = (): boolean[] => {
    // Создаем массив всех кусков с их ID и размерами
    const allSlices: Array<{ id: string; size: 'small' | 'large' }> = []
    for (const pizza of activePizzaList) {
      for (let i = 0; i < pizza.slices; i++) {
        // W aplikacji używamy tylko 'small' i 'large', więc rzutujemy typ
        allSlices.push({
          id: `slice-${pizza.id}-${i}`,
          size: pizza.size as 'small' | 'large'
        })
      }
    }
    
    // Собираем ID всех распределенных кусков
    const distributedIds = new Set<string>()
    Object.values(activeDistribution).forEach((slices: PizzaSlice[]) => {
      slices.forEach(slice => {
        distributedIds.add(slice.id)
      })
    })
    
    // Возвращаем размеры нераспределенных кусков
    return allSlices
      .filter(slice => !distributedIds.has(slice.id))
      .map(slice => slice.size === 'small')
  }

  return {
    getUserSliceSizes,
    getExtraSliceSizes
  }
}
