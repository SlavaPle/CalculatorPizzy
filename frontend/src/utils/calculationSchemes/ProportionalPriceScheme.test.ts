import { describe, it, expect } from 'vitest'
import { ProportionalPriceScheme } from './ProportionalPriceScheme'
import { User } from '../../types'

/**
 * Test: 2 użytkowników, każdy po 3 małe kawałki. Przy obliczeniu nie mogą pojawić się duże pizze.
 */
describe('ProportionalPriceScheme', () => {
  it('gdy 2 użytkowników chce po 3 małe kawałki — nie ma dużych pizzy w wyniku', () => {
    const users: User[] = [
      {
        id: 'u1',
        name: 'User 1',
        minSlices: 3,
        maxSlices: 6,
        canBeMore: false,
        totalCost: 0,
        assignedSlices: []
      },
      {
        id: 'u2',
        name: 'User 2',
        minSlices: 3,
        maxSlices: 6,
        canBeMore: false,
        totalCost: 0,
        assignedSlices: []
      }
    ]

    const settings = {
      largePizzaSlices: 8,
      smallPizzaSlices: 6,
      largePizzaPrice: 100,
      smallPizzaPricePercent: 70,
      freePizzaThreshold: 3,
      useFreePizza: false,
      sliceFilterMode: { u1: 'small' as const, u2: 'small' as const }
    }

    const scheme = new ProportionalPriceScheme()
    const result = scheme.calculate(users, settings)

    const largePizzas = result.optimalPizzas.filter((p) => p.size === 'large')
    expect(largePizzas.length).toBe(0)
    expect(result.optimalPizzas.every((p) => p.size === 'small')).toBe(true)
    expect(result.userSlicesDistribution['u1']).toBe(3)
    expect(result.userSlicesDistribution['u2']).toBe(3)
  })
})
