import { useMemo } from 'react'
import { User } from '../shared/types'
import { PizzaSettings } from '../components/calculator/SettingsModal'
import { bestFactors, createPizzaList, calculateDistribution, calculateLargeSlicePrice, calculateSmallSlicePrice } from '../utils/calculations'

/**
 * Хук для расчета пицц и распределения кусков
 */
export const usePizzaCalculation = (
  users: User[],
  pizzaSettings: PizzaSettings,
  selectedVariant: 'current' | 'reduced' | 'small',
  sliceFilterMode: { [userId: string]: 'all' | 'small' | 'large' } = {}
) => {
  // Получаем цену маленькой пиццы
  const getActualSmallPizzaPrice = (): number => {
    return Math.round(pizzaSettings.largePizzaPrice * pizzaSettings.smallPizzaPricePercent / 100)
  }

  // Обертка для createPizzaList с текущими настройками
  const createPizzaListWithSettings = (count: number, useSmall: boolean = false, largePizzaCounter?: number) => {
    const slices = useSmall ? pizzaSettings.smallPizzaSlices : pizzaSettings.largePizzaSlices
    const price = useSmall ? getActualSmallPizzaPrice() : pizzaSettings.largePizzaPrice
    const size = useSmall ? 'small' : 'large' as 'small' | 'large'

    return createPizzaList(
      count,
      slices,
      price,
      pizzaSettings.freePizzaThreshold,
      pizzaSettings.useFreePizza,
      pizzaSettings.freePizzaIsSmall,
      pizzaSettings.smallPizzaSlices,
      size,
      largePizzaCounter
    )
  }

  // Расчет всех вариантов
  const calculation = useMemo(() => {
    // Шаг 1: Получаем общее количество желаемых кусков
    const totalMinSlices = users.reduce((sum, user) => sum + user.minSlices, 0)
    const totalActualSlices = users.reduce((sum, user) => sum + user.minSlices, 0)

    // Проверка условий для обязательного включения малой пиццы
    // 1. Более одного пользователя выбрали только малые куски
    const usersWithSmallOnly = users.filter(u => (sliceFilterMode[u.id] || 'all') === 'small')
    const hasMultipleSmallUsers = usersWithSmallOnly.length > 1

    // 2. Количество требуемых малых кусков более 50% от количества кусков в малой пицце
    const totalSmallSlicesNeeded = usersWithSmallOnly.reduce((sum, user) => sum + user.minSlices, 0)
    const smallSlicesThreshold = Math.ceil(pizzaSettings.smallPizzaSlices * 0.5)
    const hasHighSmallDemand = totalSmallSlicesNeeded > smallSlicesThreshold

    // Если выполняется одно из условий - учитываем малую пиццу
    const shouldIncludeSmallPizza = hasMultipleSmallUsers || hasHighSmallDemand

    // ВАРИАНТ 1: Optimal combination (large + small)
    const [optimalLarge, optimalSmall, optimalRemainder] = bestFactors(
      totalMinSlices,
      pizzaSettings.largePizzaSlices,
      pizzaSettings.smallPizzaSlices
    )

    // Если нужно обязательно включить малую пиццу, но оптимальный расчет не включает её
    const finalOptimalSmall = shouldIncludeSmallPizza && optimalSmall === 0 ? 1 : optimalSmall

    // Создаем оптимальный список пицц
    // Счетчик только для больших пицц (для расчета бесплатных)
    let largePizzaCounter = 0
    const optimalPizzaList: any[] = []
    
    for (let i = 0; i < optimalLarge; i++) {
      largePizzaCounter++
      // Для расчета бесплатных пицц учитываем только большие пиццы
      const isFree = pizzaSettings.useFreePizza && largePizzaCounter % pizzaSettings.freePizzaThreshold === 0
      let pizzaSlices = pizzaSettings.largePizzaSlices
      let pizzaSize: 'small' | 'large' = 'large'

      if (isFree && pizzaSettings.freePizzaIsSmall) {
        pizzaSlices = pizzaSettings.smallPizzaSlices
        pizzaSize = 'small'
      }

      optimalPizzaList.push({
        id: `pizza-large-${i}`,
        slices: pizzaSlices,
        price: pizzaSettings.largePizzaPrice,
        isFree: isFree,
        size: pizzaSize,
        type: 'Margherita'
      })
    }

    for (let i = 0; i < finalOptimalSmall; i++) {
      // Малые пиццы не учитываются в расчете бесплатных пицц
      optimalPizzaList.push({
        id: `pizza-small-${i}`,
        slices: pizzaSettings.smallPizzaSlices,
        price: getActualSmallPizzaPrice(),
        isFree: false, // Малые пиццы никогда не бесплатные
        size: 'small' as 'small' | 'large',
        type: 'Margherita'
      })
    }

    // ВАРИАНТ 2: Large pizzas only
    let largePizzaCount = Math.ceil(totalMinSlices / pizzaSettings.largePizzaSlices)
    // Если нужно обязательно включить малую пиццу, добавляем её
    let largePizzaList = createPizzaListWithSettings(largePizzaCount, false)
    
    if (shouldIncludeSmallPizza) {
      // Добавляем малую пиццу в список
      largePizzaList.push({
        id: `pizza-small-forced`,
        slices: pizzaSettings.smallPizzaSlices,
        price: getActualSmallPizzaPrice(),
        isFree: false, // Малые пиццы никогда не бесплатные
        size: 'small' as 'small' | 'large',
        type: 'Margherita'
      })
    }

    // ВАРИАНТ 3: Reduced (-1 pizza)
    const altPizzaCount = largePizzaCount - 1
    let altPizzaList = createPizzaListWithSettings(altPizzaCount, false)
    
    if (shouldIncludeSmallPizza) {
      // Добавляем малую пиццу в список
      altPizzaList.push({
        id: `pizza-small-forced-reduced`,
        slices: pizzaSettings.smallPizzaSlices,
        price: getActualSmallPizzaPrice(),
        isFree: false, // Малые пиццы никогда не бесплатные
        size: 'small' as 'small' | 'large',
        type: 'Margherita'
      })
    }

    // Расчет распределения для каждого варианта
    const optimalCalc = calculateDistribution(optimalPizzaList, users, sliceFilterMode)
    const largeCalc = calculateDistribution(largePizzaList, users, sliceFilterMode)
    const altCalc = calculateDistribution(altPizzaList, users, sliceFilterMode)

    // Определяем, какие варианты показывать
    const showOptimalOption = !pizzaSettings.smallEqual && optimalSmall > 0
    const altMissingSlices = altCalc.extraSlices < 0 ? Math.abs(altCalc.extraSlices) : 0

    // Проверка, идентичен ли Optimal варианту Large
    const optimalLargeCount = optimalPizzaList.filter(p => p.size === 'large').length
    const optimalSmallCount = optimalPizzaList.filter(p => p.size === 'small').length
    const largeLargeCount = largePizzaList.filter(p => p.size === 'large').length
    const largeSmallCount = largePizzaList.filter(p => p.size === 'small').length

    const isOptimalSameAsLarge = optimalLargeCount === largeLargeCount && optimalSmallCount === largeSmallCount

    // Проверка, идентичен ли Reduced варианту Large
    const altLargeCount = altPizzaList.filter(p => p.size === 'large').length
    const altSmallCount = altPizzaList.filter(p => p.size === 'small').length

    const isReducedSameAsLarge = altLargeCount === largeLargeCount && altSmallCount === largeSmallCount

    const hasOptimal = showOptimalOption && !isOptimalSameAsLarge
    const hasLarge = true // Large pizzas always shown
    const hasReduced = altMissingSlices > 0 && altMissingSlices <= Math.floor(pizzaSettings.largePizzaSlices / 4) && altPizzaCount > 0 && !isReducedSameAsLarge

    const activeVariants = [hasOptimal, hasLarge, hasReduced].filter(Boolean).length

    // Выбор активного списка пицц и распределения
    let activePizzaList = largePizzaList
    let activeDistribution = largeCalc.distribution

    if (selectedVariant === 'small') {
      activePizzaList = optimalPizzaList
      activeDistribution = optimalCalc.distribution
    } else if (selectedVariant === 'reduced') {
      activePizzaList = altPizzaList
      activeDistribution = altCalc.distribution
    }

    // Дополнительные расчеты для отображения
    const largeTotalSlices = largePizzaList.reduce((sum, p) => sum + p.slices, 0)
    const largeExtraSlices = largeTotalSlices - totalActualSlices

    const currentExtraSlicesForUsers = Object.values(largeCalc.distribution).reduce((sum, slices) => sum + slices.length, 0) - totalActualSlices
    const reducedExtraSlicesForUsers = Object.values(altCalc.distribution).reduce((sum, slices) => sum + slices.length, 0) - totalMinSlices

    // Расчет цен кусков
    const largePricePerSlice = calculateLargeSlicePrice(pizzaSettings.largePizzaPrice, pizzaSettings.largePizzaSlices)
    const smallPricePerSlice = calculateSmallSlicePrice(pizzaSettings.largePizzaPrice, pizzaSettings.smallPizzaPricePercent, pizzaSettings.smallPizzaSlices)

    // Функция для расчета стоимости пользователя на основе его кусков
    // Куски из бесплатных пицц уже имеют price = 0, поэтому просто суммируем
    const calculateUserCost = (userSlices: any[]): number => {
      return userSlices.reduce((sum, slice) => sum + slice.price, 0)
    }

    // Стоимость для каждого пользователя (используем активное распределение)
    const userCosts: { [userId: string]: number } = {}
    users.forEach(user => {
      const userSlices = activeDistribution[user.id] || []
      userCosts[user.id] = calculateUserCost(userSlices)
    })

    return {
      // Основные данные
      totalMinSlices,
      totalActualSlices,
      
      // Варианты пицц
      optimalPizzaList,
      optimalLarge,
      optimalSmall,
      optimalRemainder,
      optimalCalc,
      
      largePizzaList,
      largePizzaCount,
      largeCalc,
      largeTotalSlices,
      largeExtraSlices,
      
      altPizzaList,
      altPizzaCount,
      altCalc,
      altMissingSlices,
      
      // Активные данные
      activePizzaList,
      activeDistribution,
      
      // Флаги отображения
      hasOptimal,
      hasLarge,
      hasReduced,
      activeVariants,
      
      // Дополнительные расчеты
      currentExtraSlicesForUsers,
      reducedExtraSlicesForUsers,
      currentCalcForExtra: largeCalc,
      
      // Цены кусков
      largePricePerSlice,
      smallPricePerSlice,
      
      // Стоимость пользователей
      userCosts
    }
  }, [users, pizzaSettings, selectedVariant, sliceFilterMode])

  return calculation
}
