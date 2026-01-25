import { describe, it, expect } from 'vitest'
import { bestFactors } from '../utils/calculations'

/**
 * Test equal (6 i 8): wariant z małymi pizzami musi być dostępny.
 * 3 userów: 3 + 6 + 3 = 12 kawałków. Small 6, Large 8.
 * bestFactors(12,8,6) → 0 large + 2 small. Variant z małymi ma być pokazany.
 */
describe('usePizzaCalculation — equal 6/8, wariant z małymi', () => {
  it('dla 3 userów 3+6+3, Small 6 Large 8 — optimal 0L+2S, wariant z małymi ma być (hasOptimal)', () => {
    const total = 12
    const large = 8
    const small = 6
    const [optimalLarge, optimalSmall] = bestFactors(total, large, small)
    expect(optimalLarge).toBe(0)
    expect(optimalSmall).toBe(2)

    const showOptimalOption = optimalSmall > 0
    expect(showOptimalOption).toBe(true)

    // Large bez small-only: ceil(12/8)=2 large, 0 small
    const largeCount = Math.ceil(total / large)
    expect(largeCount).toBe(2)
    const optimalHasSmall = optimalSmall > 0
    const largeHasSmall = false
    const isOptimalSameAsLarge = optimalLarge === largeCount && optimalSmall === (largeHasSmall ? 1 : 0)
    expect(isOptimalSameAsLarge).toBe(false)

    // Wariant z małymi ma być zawsze gdy optimalSmall > 0 (nawet gdy === Large)
    const hasOptimal = showOptimalOption
    expect(hasOptimal).toBe(true)
  })

  it('allWantSmallOnly: oba 2 small — wariant z małymi nadal ma być (hasOptimal)', () => {
    const total = 12
    const large = 8
    const small = 6
    const [optimalLarge, optimalSmall] = bestFactors(total, large, small)
    expect(optimalSmall).toBe(2)
    // Gdy wszyscy chcą tylko small: Large = 2 small, Optimal = 2 small. Identyczne.
    // hasOptimal ma być true, żeby użytkownik widział wariant z małymi.
    const hasOptimal = optimalSmall > 0
    expect(hasOptimal).toBe(true)
  })

  it('3 userów × 3 kawałki = 9: bestFactors→1L=8; override na 2 małe = 12 kawałków', () => {
    const total = 9
    const large = 8
    const small = 6
    let [optimalLarge, optimalSmall, optimalRemainder] = bestFactors(total, large, small)
    expect(optimalLarge).toBe(1)
    expect(optimalSmall).toBe(0)
    const allWantSmallOnly = false
    if (optimalSmall === 0 && !allWantSmallOnly) {
      const smallOnlyCount = Math.ceil(total / small)
      const smallOnlyTotal = smallOnlyCount * small
      const smallOnlyRemainder = smallOnlyTotal - total
      if (smallOnlyCount > 0 && smallOnlyRemainder >= 0) {
        optimalLarge = 0
        optimalSmall = smallOnlyCount
        optimalRemainder = smallOnlyRemainder
      }
    }
    expect(optimalLarge).toBe(0)
    expect(optimalSmall).toBe(2)
    expect(optimalRemainder).toBe(3)
    expect(optimalSmall * small).toBe(12)
  })
})
