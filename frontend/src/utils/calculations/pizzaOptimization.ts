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
    size: 'small' | 'large'
) => {
    const pizzas = []

    for (let i = 0; i < count; i++) {
        const isFree = useFreePizza && freePizzaThreshold > 0 && (i + 1) % freePizzaThreshold === 0

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
            size: pizzaSize
        })
    }

    return pizzas
}
