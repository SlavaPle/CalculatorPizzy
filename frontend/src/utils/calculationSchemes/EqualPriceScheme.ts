import { ICalculationScheme, CalculationResult } from './ICalculationScheme'
import { User } from '../../types'

export class EqualPriceScheme implements ICalculationScheme {
  id = 'equal-price'
  name = 'Equal price for all slices'
  description = 'All pizza slices have the same price regardless of pizza size'

  calculate(users: User[], settings: any): CalculationResult {
    const totalSlices = users.reduce((sum, user) => sum + user.minSlices, 0)
    const pizzaCount = Math.ceil(totalSlices / settings.largePizzaSlices)
    const freePizzaCount = settings.useFreePizza ? Math.floor(pizzaCount / settings.freePizzaThreshold) : 0
    const regularPizzaCount = pizzaCount - freePizzaCount

    // Calculate price per slice (equal for all slices)


    // Create pizza list
    const optimalPizzas = []
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

    // Distribute slices among users
    const userSlicesDistribution: { [userId: string]: number } = {}
    users.forEach(user => {
      userSlicesDistribution[user.id] = user.minSlices
    })

    return {
      optimalPizzas,
      totalCost: regularPizzaCount * settings.largePizzaPrice,
      freePizzaValue: freePizzaCount * settings.largePizzaPrice,
      totalUsers: users.length,
      totalSlices,
      pizzaCount,
      freePizzaCount,
      regularPizzaCount,
      userSlicesDistribution
    }
  }
}



