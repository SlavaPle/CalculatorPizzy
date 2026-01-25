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
   * @param settings - настройки пиццы (размеры, цены, пороги бесплатных пицц)
   * @returns результат расчета с оптимальным списком пицц и распределением
   */
  calculate(users: User[], settings: any): CalculationResult {
    // Шаг 1: Подсчитываем общее количество необходимых кусков
    // Суммируем минимальные требования всех пользователей
    const totalSlices = users.reduce((sum, user) => sum + user.minSlices, 0)
    
    // Шаг 2: Вычисляем необходимое количество больших пицц
    // Округляем вверх, чтобы обеспечить достаточное количество кусков
    const pizzaCount = Math.ceil(totalSlices / settings.largePizzaSlices)
    
    // Шаг 3: Определяем количество бесплатных пицц
    // Если включена система бесплатных пицц, вычисляем по порогу
    const freePizzaCount = settings.useFreePizza ? Math.floor(pizzaCount / settings.freePizzaThreshold) : 0
    
    // Шаг 4: Вычисляем количество платных пицц
    const regularPizzaCount = pizzaCount - freePizzaCount

    // Шаг 5: Создаем список оптимальных пицц
    // В этой схеме все пиццы большие, цена куска одинакова для всех
    const optimalPizzas = []
    for (let i = 0; i < pizzaCount; i++) {
      // Определяем, является ли пицца бесплатной (первые N пицц)
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

    // Шаг 6: Распределяем куски между пользователями
    // Каждый пользователь получает минимальное количество кусков
    const userSlicesDistribution: { [userId: string]: number } = {}
    users.forEach(user => {
      userSlicesDistribution[user.id] = user.minSlices
    })

    // Возвращаем результат расчета
    return {
      optimalPizzas, // Список оптимальных пицц
      totalCost: regularPizzaCount * settings.largePizzaPrice, // Общая стоимость платных пицц
      freePizzaValue: freePizzaCount * settings.largePizzaPrice, // Стоимость бесплатных пицц (для информации)
      totalUsers: users.length, // Количество пользователей
      totalSlices, // Общее количество необходимых кусков
      pizzaCount, // Общее количество пицц
      freePizzaCount, // Количество бесплатных пицц
      regularPizzaCount, // Количество платных пицц
      userSlicesDistribution // Распределение кусков по пользователям
    }
  }
}



