/**
 * Оптимизация количества пицц
 * Находит оптимальное сочетание больших и маленьких пицц
 */

/**
 * Находит оптимальное сочетание больших (K кусков) и маленьких (M кусков) пицц
 * для получения N кусков с минимальным остатком
 * 
 * @param N - требуемое количество кусков
 * @param K - количество кусков в большой пицце
 * @param M - количество кусков в маленькой пицце
 * @param limit - максимальное количество маленьких пицц для перебора
 * @returns [количество больших, количество маленьких, остаток кусков]
 */
export const bestFactors = (
    N: number,
    K: number,
    M: number,
    limit: number = 100
): [number, number, number] => {
    let best: [number, number, number] = [0, 0, Math.abs(N)]

    for (let b = 0; b <= limit; b++) {
        const a = Math.round((N - b * M) / K)
        if (a < 0) continue
        const R = Math.abs(N - (a * K + b * M))
        if (R < best[2]) {
            best = [a, b, R]
        }
    }

    return best
}

/**
 * Создает список пицц заданного размера с учетом акций
 * 
 * @param count - количество пицц
 * @param slicesPerPizza - количество кусков в пицце
 * @param pricePerPizza - цена одной пиццы
 * @param freePizzaThreshold - каждая N-я пицца бесплатно (0 = нет акции)
 * @param useFreePizza - использовать ли акцию
 * @param freePizzaIsSmall - бесплатная пицца маленькая
 * @param smallPizzaSlices - количество кусков в маленькой пицце (для бесплатной)
 * @param size - размер пиццы ('small' | 'large')
 */
export const createPizzaList = (
    count: number,
    slicesPerPizza: number,
    pricePerPizza: number,
    freePizzaThreshold: number,
    useFreePizza: boolean,
    freePizzaIsSmall: boolean,
    smallPizzaSlices: number,
    size: 'small' | 'large',
    largePizzaCounter?: number // Счетчик больших пицц для расчета бесплатных (если передан)
) => {
    const pizzas = []
    // Если передан счетчик больших пицц, используем его, иначе создаем новый
    let currentLargeCounter = largePizzaCounter !== undefined ? largePizzaCounter : 0

    for (let i = 0; i < count; i++) {
        // Для расчета бесплатных пицц учитываем только большие пиццы
        // Малые пиццы никогда не учитываются в расчете бесплатных
        let isFree = false
        if (size === 'large') {
            currentLargeCounter++
            isFree = useFreePizza && freePizzaThreshold > 0 && currentLargeCounter % freePizzaThreshold === 0
        }

        // Если пицца бесплатная, используем настройку freePizzaIsSmall
        let pizzaSlices = slicesPerPizza
        let pizzaSize = size

        if (isFree && freePizzaIsSmall) {
            pizzaSlices = smallPizzaSlices
            pizzaSize = 'small'
        }

        pizzas.push({
            id: `pizza-${i}`,
            slices: pizzaSlices,
            price: pricePerPizza,
            isFree: isFree,
            size: pizzaSize,
            type: 'Margherita' // Тип пиццы по умолчанию
        })
    }

    return pizzas
}

/**
 * Настройки для расчета цены кусков
 */
interface SlicePriceSettings {
    calculationScheme: 'equal-price' | 'proportional-price'
    smallPizzaPricePercent: number // процент цены малой пиццы относительно большой (0-100)
    largePizzaSlices: number
    smallPizzaSlices: number
}

/** Element listy pizz (do liczenia dużych/małych) */
export interface PizzaForCount {
    size: 'small' | 'large'
    slices?: number
}

/**
 * Рассчитывает стоимость одного большого куска
 * Поддерживает две схемы расчета:
 * - equal-price: все куски стоят одинаково (общая цена / количество кусков)
 * - proportional-price: получает количество малых и больших пицц (z listy pizz) dla wyceny
 *
 * @param totalPrice - общая цена
 * @param slices - список кусков с их размерами
 * @param settings - настройки расчета (схема и процент цены малой пиццы)
 * @param pizzas - opcjonalna lista pizz; przy proportional-price służy do liczby dużych i małych pizz
 * @returns стоимость одного большого куска
 */
export const calculateSlicePrice = (
    totalPrice: number,
    slices: Array<{ size: 'small' | 'large' }>,
    settings: SlicePriceSettings,
    pizzas?: PizzaForCount[]
): [number, number] => {
    const totalSlices = slices.length

    if (totalSlices === 0) {
        return [0, 0]
    }

    // 1. Если одна цена - делим цену на количество кусков
    if (settings.calculationScheme === 'equal-price') {
        return [totalPrice / totalSlices, 0]
    }

    // 2. Jeśli cena proporcjonalna — liczba dużych i małych pizz z listy pizz lub z kawałków
    if (settings.calculationScheme === 'proportional-price') {
        let largePizzas: number
        let smallPizzas: number

        largePizzas = pizzas?.filter(p => p.size === 'large').length ?? 0 as number
        smallPizzas = pizzas?.filter(p => p.size === 'small').length ?? 0 as number
        const avgPizzaPrice = totalPrice / (largePizzas + smallPizzas * settings.smallPizzaPricePercent / 100);
        const largeSlicePrice = avgPizzaPrice / settings.largePizzaSlices;
        const smallSlicePrice = avgPizzaPrice * settings.smallPizzaPricePercent / (100 * settings.smallPizzaSlices);

        return [largeSlicePrice, smallSlicePrice];
    }

    return [totalPrice / totalSlices, 0]
}

/**
 * Простая функция для расчета цены одного куска пиццы
 * Используется для быстрого расчета без учета схемы расчета
 * 
 * @param totalPrice - общая цена пиццы
 * @param slicesCount - количество кусков в пицце
 * @param isFree - является ли пицца бесплатной
 * @returns цена одного куска (0 если пицца бесплатная)
 */
export const calculateSimpleSlicePrice = (
    totalPrice: number,
    slicesCount: number,
    isFree: boolean
): number => {
    if (isFree || slicesCount === 0) {
        return 0
    }
    return totalPrice / slicesCount
}

/**
 * Рассчитывает цену большого куска пиццы
 * 
 * @param largePizzaPrice - цена большой пиццы
 * @param largePizzaSlices - количество кусков в большой пицце
 * @returns цена одного большого куска
 */
export const calculateLargeSlicePrice = (
    largePizzaPrice: number,
    largePizzaSlices: number
): number => {
    if (largePizzaSlices === 0) {
        return 0
    }
    return largePizzaPrice / largePizzaSlices
}

/**
 * Рассчитывает цену малого куска пиццы на основе процента от большой пиццы
 * 
 * @param largePizzaPrice - цена большой пиццы
 * @param smallPizzaPricePercent - процент цены малой пиццы относительно большой (0-100)
 * @param smallPizzaSlices - количество кусков в малой пицце
 * @returns цена одного малого куска
 */
export const calculateSmallSlicePrice = (
    largePizzaPrice: number,
    smallPizzaPricePercent: number,
    smallPizzaSlices: number
): number => {
    if (smallPizzaSlices === 0) {
        return 0
    }
    const smallPizzaPrice = largePizzaPrice * smallPizzaPricePercent / 100
    return smallPizzaPrice / smallPizzaSlices
}

