/**
 * Распределение кусков пиццы между участниками
 */

import { User } from '../../shared/types'

/**
 * Распределяет куски пиццы между участниками на основе их предпочтений
 * 
 * @param pizzaList - список пицц с количеством кусков
 * @param users - список участников
 * @returns объект с распределением кусков, лишними кусками и общим количеством
 */
export const calculateDistribution = (
    pizzaList: any[],
    users: User[]
) => {
    // Сумма кусков всех пицц в списке
    const totalPizzaSlices = pizzaList.reduce((sum, pizza) => sum + pizza.slices, 0)

    // Сумма минимальных желаний всех участников
    const totalMinSlices = users.reduce((sum, user) => sum + user.minSlices, 0)

    let pieces = totalPizzaSlices - totalMinSlices  // Лишние куски (может быть отрицательным)
    const distribution: { [key: string]: number } = {}

    // Инициализация - каждый получает минимум
    users.forEach(user => {
        distribution[user.id] = user.minSlices
    })

    // Если не хватает кусков (pieces < 0), вычитаем по кругу
    if (pieces < 0) {
        let missing = Math.abs(pieces)

        // Полные круги - вычитаем поровну у всех
        const fullRounds = Math.floor(missing / users.length)
        const remainder = missing % users.length

        users.forEach((user, index) => {
            let toSubtract = fullRounds
            // Остаток распределяем на первых пользователей
            if (index < remainder) {
                toSubtract++
            }
            toSubtract = Math.min(toSubtract, distribution[user.id])
            distribution[user.id] -= toSubtract
        })
    }
    // Если есть лишние куски, распределяем их
    else if (pieces > 0) {
        // Распределяем оставшиеся куски по кругу
        while (pieces > 0) {
            let distributed = false

            for (const user of users) {
                if (pieces <= 0) break

                if (user.canBeMore) {
                    // Добавляем 1 кусок
                    distribution[user.id]++
                    pieces--
                    distributed = true
                }
            }

            // Если никому не удалось раздать, выходим из цикла
            if (!distributed) break
        }
    }

    return {
        distribution,
        extraSlices: pieces,
        totalSlices: Object.values(distribution).reduce((sum, val) => sum + val, 0),
        pizzaList
    }
}
