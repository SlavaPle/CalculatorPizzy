/**
 * Распределение кусков пиццы между участниками
 */

import { User, PizzaSlice, PizzaSize } from '../../shared/types'
import { calculateSimpleSlicePrice } from './pizzaOptimization'

// Минимальный интерфейс для пиццы в списке
interface PizzaInList {
    id: string;
    slices: number;
    price: number;
    size: PizzaSize;
    type?: string; // Тип пиццы (например, 'Margherita')
    isFree?: boolean;
}

/**
 * Распределяет куски пиццы между участниками на основе их предпочтений
 * 
 * @param pizzaList - список пицц с количеством кусков и метаданными
 * @param users - список участников
 * @param sliceFilterMode - режимы фильтрации для каждого пользователя (all/small/large)
 * @returns объект с распределением кусков (PizzaSlice[]), лишними кусками и общим количеством
 */
export const calculateDistribution = (
    pizzaList: PizzaInList[],
    users: User[],
    sliceFilterMode: { [userId: string]: 'all' | 'small' | 'large' } = {}
) => {
    // Создаем массив всех кусков из всех пицц с метаданными
    const allSlices: PizzaSlice[] = []
    pizzaList.forEach(pizza => {
        const pizzaType = pizza.type || 'Margherita' // Тип по умолчанию
        // Рассчитываем цену за кусок
        const pricePerSlice = calculateSimpleSlicePrice(pizza.price, pizza.slices, pizza.isFree || false)
        
        for (let i = 0; i < pizza.slices; i++) {
            allSlices.push({
                id: `slice-${pizza.id}-${i}`,
                pizzaId: pizza.id,
                type: pizzaType,
                price: pricePerSlice,
                size: pizza.size
            })
        }
    })

    // Сумма минимальных желаний всех участников
    const totalMinSlices = users.reduce((sum, user) => sum + user.minSlices, 0)
    const totalPizzaSlices = allSlices.length
    let pieces = totalPizzaSlices - totalMinSlices  // Лишние куски (может быть отрицательным)
    
    // Распределение кусков по пользователям
    const distribution: { [key: string]: PizzaSlice[] } = {}
    
    // Инициализация - каждый получает пустой массив
    users.forEach(user => {
        distribution[user.id] = []
    })

    // Вычисляем, сколько кусков должен получить каждый пользователь
    const userTargetSlices = new Map<string, number>()
    
    if (pieces < 0) {
        // Не хватает кусков - распределяем доступные поровну
        const missing = Math.abs(pieces)
        const fullRounds = Math.floor(missing / users.length)
        const remainder = missing % users.length

        users.forEach((user, index) => {
            let target = user.minSlices
            let toSubtract = fullRounds
            if (index < remainder) {
                toSubtract++
            }
            target = Math.max(0, target - toSubtract)
            userTargetSlices.set(user.id, target)
        })
    } else {
        // Хватает кусков - каждый получает минимум
        users.forEach(user => {
            userTargetSlices.set(user.id, user.minSlices)
        })
    }

    // Разделяем куски на два списка: small и large
    const smallSlices: PizzaSlice[] = []
    const largeSlices: PizzaSlice[] = []
    
    allSlices.forEach(slice => {
        if (slice.size === 'small') {
            smallSlices.push(slice)
        } else {
            largeSlices.push(slice)
        }
    })

    // Счетчики распределенных кусков для каждого пользователя
    const userSliceCounts = new Map<string, number>()
    users.forEach(u => userSliceCounts.set(u.id, 0))

    // Функция для распределения кусков по кругу среди пользователей
    const distributeSlicesToUsers = (
        slices: PizzaSlice[],
        targetUsers: User[],
        maxSlicesPerUser: Map<string, number>
    ) => {
        let sliceIndex = 0
        let roundIndex = 0
        
        while (sliceIndex < slices.length && targetUsers.length > 0) {
            let distributed = false
            
            for (let i = 0; i < targetUsers.length; i++) {
                const userIndex = (roundIndex + i) % targetUsers.length
                const user = targetUsers[userIndex]
                const target = maxSlicesPerUser.get(user.id) || 0
                const current = userSliceCounts.get(user.id) || 0
                
                if (current < target && sliceIndex < slices.length) {
                    const slice = slices[sliceIndex]
                    slice.userAssigned = user.id
                    distribution[user.id].push(slice)
                    userSliceCounts.set(user.id, current + 1)
                    sliceIndex++
                    distributed = true
                }
            }
            
            if (!distributed) break
            roundIndex++
        }
        
        return sliceIndex // Возвращаем количество распределенных кусков
    }

    // ШАГ 1: Распределяем куски нужного размера для пользователей с приоритетом small/large
    const usersWithSmallPreference = users.filter(u => (sliceFilterMode[u.id] || 'all') === 'small')
    const usersWithLargePreference = users.filter(u => (sliceFilterMode[u.id] || 'all') === 'large')
    
    // Распределяем small куски пользователям с приоритетом small
    if (usersWithSmallPreference.length > 0) {
        const smallTargets = new Map<string, number>()
        usersWithSmallPreference.forEach(user => {
            smallTargets.set(user.id, userTargetSlices.get(user.id) || 0)
        })
        distributeSlicesToUsers(smallSlices, usersWithSmallPreference, smallTargets)
    }
    
    // Распределяем large куски пользователям с приоритетом large
    if (usersWithLargePreference.length > 0) {
        const largeTargets = new Map<string, number>()
        usersWithLargePreference.forEach(user => {
            largeTargets.set(user.id, userTargetSlices.get(user.id) || 0)
        })
        distributeSlicesToUsers(largeSlices, usersWithLargePreference, largeTargets)
    }

    // ШАГ 2: Распределяем оставшиеся large куски пользователям All
    const usersWithAllPreference = users.filter(u => (sliceFilterMode[u.id] || 'all') === 'all')
    const remainingLargeSlices = largeSlices.filter(slice => !slice.userAssigned)
    
    if (usersWithAllPreference.length > 0 && remainingLargeSlices.length > 0) {
        const allTargets = new Map<string, number>()
        usersWithAllPreference.forEach(user => {
            const target = userTargetSlices.get(user.id) || 0
            const current = userSliceCounts.get(user.id) || 0
            if (current < target) {
                allTargets.set(user.id, target) // Используем полное целевое значение
            }
        })
        if (allTargets.size > 0) {
            distributeSlicesToUsers(remainingLargeSlices, usersWithAllPreference, allTargets)
        }
    }

    // ШАГ 3: Распределяем оставшиеся small куски пользователям All
    const remainingSmallSlices = smallSlices.filter(slice => !slice.userAssigned)
    
    if (usersWithAllPreference.length > 0 && remainingSmallSlices.length > 0) {
        const allTargets = new Map<string, number>()
        usersWithAllPreference.forEach(user => {
            const target = userTargetSlices.get(user.id) || 0
            const current = userSliceCounts.get(user.id) || 0
            if (current < target) {
                allTargets.set(user.id, target) // Используем полное целевое значение
            }
        })
        if (allTargets.size > 0) {
            distributeSlicesToUsers(remainingSmallSlices, usersWithAllPreference, allTargets)
        }
    }

    // ШАГ 4: Если остались пользователи, ожидающие куски - распределяем среди них оставшиеся независимо от размера
    const allRemainingSlices = [...largeSlices.filter(slice => !slice.userAssigned), ...smallSlices.filter(slice => !slice.userAssigned)]
    const usersNeedingSlices = users.filter(user => {
        const target = userTargetSlices.get(user.id) || 0
        const current = userSliceCounts.get(user.id) || 0
        return current < target
    })
    
    if (usersNeedingSlices.length > 0 && allRemainingSlices.length > 0) {
        const remainingTargets = new Map<string, number>()
        usersNeedingSlices.forEach(user => {
            const target = userTargetSlices.get(user.id) || 0
            remainingTargets.set(user.id, target) // Используем полное целевое значение
        })
        distributeSlicesToUsers(allRemainingSlices, usersNeedingSlices, remainingTargets)
    }

    // Extra = tylko nieprzypisane kawałki (bez rozdawania canBeMore). Zawsze niezależnie od zamówienia.
    // Сортируем куски для каждого пользователя: сначала большие, потом малые
    users.forEach(user => {
        distribution[user.id].sort((a, b) => {
            // Сначала большие (large), потом малые (small)
            if (a.size === 'large' && b.size === 'small') return -1
            if (a.size === 'small' && b.size === 'large') return 1
            return 0
        })
    })

    // Нераспределенные куски
    const extraSlices = allSlices.filter(slice => !slice.userAssigned).map(slice => {
        slice.userAssigned = undefined
        return slice
    })

    return {
        distribution,
        extraSlices: extraSlices.length,
        extraSlicesList: extraSlices,
        totalSlices: Object.values(distribution).reduce((sum, slices) => sum + slices.length, 0),
        pizzaList
    }
}
