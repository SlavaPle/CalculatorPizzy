import { ICalculationScheme, CalculationResult } from './ICalculationScheme'
import { User } from '../../types'

/**
 * Схема расчета с равной ценой для всех кусков пиццы
 * Все куски имеют одинаковую стоимость независимо от размера пиццы
 */
export class ProportionalPriceScheme implements ICalculationScheme {
  id = 'proportional-price'
  name = 'Proportional price by pizza size'
  description = 'Price per slice depends on pizza size - larger pizzas have lower price per slice'

  /**
   * Выполняет расчет оптимального количества пицц и распределения кусков
   * @param users - массив пользователей с их минимальными требованиями
   * @param settings - настройки пиццы (размеры, цены, пороги бесплатных пицц, sliceFilterMode)
   * @returns результат расчета с оптимальным списком пицц и распределением
   */
  calculate(users: User[], settings: any): CalculationResult {
    const totalSlices = users.reduce((sum, user) => sum + user.minSlices, 0)
    const sliceFilterMode = settings.sliceFilterMode as { [userId: string]: 'all' | 'small' | 'large' } | undefined

    // Gdy wszyscy chcą tylko małe kawałki — używamy wyłącznie małych pizzy (żadnych dużych)
    const usersWithSmallOnly = users.filter((u) => (sliceFilterMode?.[u.id] ?? 'all') === 'small')
    const totalSmallNeeded = usersWithSmallOnly.reduce((sum, u) => sum + u.minSlices, 0)
    const allWantSmallOnly =
      users.length > 0 &&
      usersWithSmallOnly.length === users.length &&
      totalSmallNeeded === totalSlices &&
      totalSmallNeeded > 0
    const smallPizzaSlices = settings.smallPizzaSlices as number | undefined
    const useSmallOnly =
      allWantSmallOnly &&
      typeof smallPizzaSlices === 'number' &&
      smallPizzaSlices > 0

    let optimalPizzas: Array<{ id: string; type: string; size: string; price: number; slices: number; isFree: boolean }> = []
    let totalCost = 0
    let freePizzaValue = 0
    let pizzaCount = 0
    let freePizzaCount = 0
    let regularPizzaCount = 0

    if (useSmallOnly) {
      pizzaCount = Math.ceil(totalSmallNeeded / smallPizzaSlices)
      freePizzaCount = 0 // Małe pizze nigdy nie są gratis
      regularPizzaCount = pizzaCount
      const smallPrice = Math.round(
        (settings.largePizzaPrice * (settings.smallPizzaPricePercent ?? 70)) / 100
      )
      for (let i = 0; i < pizzaCount; i++) {
        optimalPizzas.push({
          id: `pizza-small-${i}`,
          type: 'Margherita',
          size: 'small',
          price: smallPrice,
          slices: smallPizzaSlices,
          isFree: false
        })
      }
      totalCost = regularPizzaCount * smallPrice
      freePizzaValue = 0
    } else {
      pizzaCount = Math.ceil(totalSlices / settings.largePizzaSlices)
      freePizzaCount = settings.useFreePizza ? Math.floor(pizzaCount / settings.freePizzaThreshold) : 0
      regularPizzaCount = pizzaCount - freePizzaCount
      for (let i = 0; i < pizzaCount; i++) {
        const isFree = i < freePizzaCount
        optimalPizzas.push({
          id: `pizza-${i}`,
          type: 'Margherita',
          size: 'large',
          price: settings.largePizzaPrice,
          slices: settings.largePizzaSlices,
          isFree
        })
      }
      totalCost = regularPizzaCount * settings.largePizzaPrice
      freePizzaValue = freePizzaCount * settings.largePizzaPrice
    }

    const userSlicesDistribution: { [userId: string]: number } = {}
    users.forEach((user) => {
      userSlicesDistribution[user.id] = user.minSlices
    })

    return {
      optimalPizzas,
      totalCost,
      freePizzaValue,
      totalUsers: users.length,
      totalSlices,
      pizzaCount,
      freePizzaCount,
      regularPizzaCount,
      userSlicesDistribution
    }
  }
}



