import { User, PizzaSlice } from '../shared/types'

interface Pizza {
  size: 'small' | 'large'
  slices: number
}

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
   * Создает массив всех кусков и вычитает распределенные
   */
  const getExtraSliceSizes = (): boolean[] => {
    // Создаем массив всех кусков с их размерами
    const allSlices: boolean[] = []
    for (const pizza of activePizzaList) {
      for (let i = 0; i < pizza.slices; i++) {
        allSlices.push(pizza.size === 'small')
      }
    }
    
    // Подсчитываем количество распределенных кусков
    const totalDistributed = Object.values(activeDistribution).reduce(
      (sum, slices) => sum + slices.length, 
      0
    )
    
    // Возвращаем размеры нераспределенных кусков (последние в массиве)
    return allSlices.slice(totalDistributed)
  }

  return {
    getUserSliceSizes,
    getExtraSliceSizes
  }
}
