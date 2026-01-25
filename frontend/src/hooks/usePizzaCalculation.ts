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

    // Wszyscy chcą tylko małe — zero dużych pizzy we wszystkich wariantach
    const allWantSmallOnly =
      users.length > 0 &&
      usersWithSmallOnly.length === users.length &&
      totalSmallSlicesNeeded === totalMinSlices &&
      totalSmallSlicesNeeded > 0

    // Mixed prefs: są zarówno small-only, jak i large-only (lub all) — liczymy min large + min small
    const usersWithLargeOnly = users.filter((u) => (sliceFilterMode[u.id] || 'all') === 'large')
    const totalLargeSlicesNeeded = usersWithLargeOnly.reduce((sum, u) => sum + u.minSlices, 0)
    const hasMixedPreferences =
      !allWantSmallOnly &&
      usersWithSmallOnly.length > 0 &&
      (usersWithLargeOnly.length > 0 || users.some((u) => (sliceFilterMode[u.id] || 'all') === 'all'))

    // ВАРИАНТ 1: Optimal combination (large + small)
    let [optimalLarge, optimalSmall, optimalRemainder] = bestFactors(
      totalMinSlices,
      pizzaSettings.largePizzaSlices,
      pizzaSettings.smallPizzaSlices
    )

    // Gdy bestFactors nie daje małych (optimalSmall=0) — dodatkowo oferuj wariant "tylko małe"
    // np. 9 kawałków, S=6 L=8: bestFactors→1L=8; 2 małe=12 pokrywa 9, +3 extra. Oferuj 12.
    if (optimalSmall === 0 && !allWantSmallOnly) {
      const smallOnlyCount = Math.ceil(totalMinSlices / pizzaSettings.smallPizzaSlices)
      const smallOnlyTotal = smallOnlyCount * pizzaSettings.smallPizzaSlices
      const smallOnlyRemainder = smallOnlyTotal - totalMinSlices
      if (smallOnlyCount > 0 && smallOnlyRemainder >= 0) {
        optimalLarge = 0
        optimalSmall = smallOnlyCount
        optimalRemainder = smallOnlyRemainder
      }
    }

    // Jeśli trzeba obowiązkowo dołożyć małą, a optymalny wynik jej nie ma — dokładamy 1
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

    // ВАРИАНТ 2: Large (albo tylko small gdy allWantSmallOnly; przy mixed prefs — min large + min small)
    let largePizzaCount: number
    let largePizzaList: any[]
    let largePizzaCountLarge: number
    let largePizzaCountSmall: number
    if (allWantSmallOnly) {
      largePizzaCountSmall = Math.ceil(totalMinSlices / pizzaSettings.smallPizzaSlices)
      largePizzaCountLarge = 0
      largePizzaCount = largePizzaCountSmall
      largePizzaList = createPizzaListWithSettings(largePizzaCountSmall, true)
    } else if (hasMixedPreferences) {
      largePizzaCountLarge = Math.ceil(totalLargeSlicesNeeded / pizzaSettings.largePizzaSlices)
      largePizzaCountSmall = Math.ceil(totalSmallSlicesNeeded / pizzaSettings.smallPizzaSlices)
      let totalSlices = largePizzaCountLarge * pizzaSettings.largePizzaSlices + largePizzaCountSmall * pizzaSettings.smallPizzaSlices
      const extraLarge = Math.max(0, Math.ceil((totalMinSlices - totalSlices) / pizzaSettings.largePizzaSlices))
      largePizzaCountLarge += extraLarge
      totalSlices = largePizzaCountLarge * pizzaSettings.largePizzaSlices + largePizzaCountSmall * pizzaSettings.smallPizzaSlices
      const extraSmall = Math.max(0, Math.ceil((totalMinSlices - totalSlices) / pizzaSettings.smallPizzaSlices))
      largePizzaCountSmall += extraSmall
      largePizzaCount = largePizzaCountLarge + largePizzaCountSmall
      largePizzaList = [
        ...createPizzaListWithSettings(largePizzaCountLarge, false),
        ...createPizzaListWithSettings(largePizzaCountSmall, true).map((p, i) => ({ ...p, id: `pizza-small-forced-${i}` }))
      ]
    } else {
      largePizzaCountLarge = Math.ceil(totalMinSlices / pizzaSettings.largePizzaSlices)
      largePizzaCountSmall = 0
      largePizzaList = createPizzaListWithSettings(largePizzaCountLarge, false)
      if (shouldIncludeSmallPizza) {
        largePizzaCountSmall = 1
        largePizzaCount = largePizzaCountLarge + 1
        largePizzaList.push({
          id: 'pizza-small-forced',
          slices: pizzaSettings.smallPizzaSlices,
          price: getActualSmallPizzaPrice(),
          isFree: false,
          size: 'small' as 'small' | 'large',
          type: 'Margherita'
        })
      } else {
        largePizzaCount = largePizzaCountLarge
      }
    }

    // ВАРИАНТ 3: Reduced (-1 pizza)
    const altPizzaCount = Math.max(0, largePizzaCount - 1)
    let altPizzaList: any[]
    if (allWantSmallOnly) {
      altPizzaList = createPizzaListWithSettings(altPizzaCount, true)
    } else if (hasMixedPreferences) {
      // Usuwamy jedną pizzę (najpierw large, potem small)
      let altLarge = largePizzaCountLarge
      let altSmall = largePizzaCountSmall
      if (altLarge > 0) {
        altLarge -= 1
      } else if (altSmall > 0) {
        altSmall -= 1
      }
      altPizzaList = [
        ...createPizzaListWithSettings(altLarge, false),
        ...createPizzaListWithSettings(altSmall, true).map((p, i) => ({ ...p, id: `pizza-small-reduced-${i}` }))
      ]
    } else {
      altPizzaList = createPizzaListWithSettings(altPizzaCount, false)
      if (shouldIncludeSmallPizza) {
        altPizzaList.push({
          id: 'pizza-small-forced-reduced',
          slices: pizzaSettings.smallPizzaSlices,
          price: getActualSmallPizzaPrice(),
          isFree: false,
          size: 'small' as 'small' | 'large',
          type: 'Margherita'
        })
      }
    }

    // Расчет распределения для каждого варианта
    const optimalCalc = calculateDistribution(optimalPizzaList, users, sliceFilterMode)
    const largeCalc = calculateDistribution(largePizzaList, users, sliceFilterMode)
    const altCalc = calculateDistribution(altPizzaList, users, sliceFilterMode)

    // Определяем, какие варианты показывать — pokazuj Optimal (małe) zawsze gdy optimalSmall > 0,
    // także gdy identyczny z Large (np. allWantSmallOnly: oba 2 small)
    const showOptimalOption = optimalSmall > 0
    const altMissingSlices = altCalc.extraSlices < 0 ? Math.abs(altCalc.extraSlices) : 0

    const largeLargeCount = largePizzaList.filter(p => p.size === 'large').length
    const largeSmallCount = largePizzaList.filter(p => p.size === 'small').length

    const altLargeCount = altPizzaList.filter(p => p.size === 'large').length
    const altSmallCount = altPizzaList.filter(p => p.size === 'small').length

    const isReducedSameAsLarge = altLargeCount === largeLargeCount && altSmallCount === largeSmallCount

    // Wariant z małymi zawsze gdy optimalSmall > 0 (również przy equal 6/8)
    const hasOptimal = showOptimalOption
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
