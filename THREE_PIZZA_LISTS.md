# Three Pizza Lists Architecture

## Overview
Refactored the Calculator component to create **three separate pizza lists** for each calculation variant, ensuring each variant has its own complete data structure.

## Problem
Previously, the calculator was dynamically switching between pizza lists, which made the code harder to follow and could lead to inconsistencies.

## Solution
Created three distinct pizza lists upfront, each with its own distribution calculation:

### 1. Optimal Combination (`optimalPizzaList`)
- Combination of large and small pizzas
- Uses `bestFactors()` algorithm to find optimal mix
- Minimizes waste while meeting requirements
- Shown when: `!pizzaSettings.smallEqual && optimalSmall > 0`

### 2. Large Pizzas Only (`largePizzaList`)
- Only large pizzas
- Simple calculation: `Math.ceil(totalMinSlices / largePizzaSlices)`
- Always shown as the default option

### 3. Reduced (-1 Pizza) (`altPizzaList`)
- One less pizza than the large variant
- Shown when: missing slices ≤ 25% of one pizza AND count > 0
- Allows users to save money if they can accept slightly fewer slices

## Implementation

### Pizza List Creation
```typescript
// VARIANT 1: Optimal combination
const optimalPizzaList = []
for (let i = 0; i < optimalLarge; i++) {
  // Add large pizzas with free pizza logic
}
for (let i = 0; i < optimalSmall; i++) {
  // Add small pizzas with free pizza logic
}

// VARIANT 2: Large pizzas only
const largePizzaList = createPizzaListWithSettings(largePizzaCount, false)

// VARIANT 3: Reduced (-1 pizza)
const altPizzaList = createPizzaListWithSettings(altPizzaCount, false)
```

### Distribution Calculation
```typescript
const optimalCalc = calculateDistribution(optimalPizzaList, users)
const largeCalc = calculateDistribution(largePizzaList, users)
const altCalc = calculateDistribution(altPizzaList, users)
```

### Active Selection
```typescript
let activePizzaList = largePizzaList
let activeDistribution = largeCalc.distribution

if (selectedVariant === 'small') {
  activePizzaList = optimalPizzaList
  activeDistribution = optimalCalc.distribution
} else if (selectedVariant === 'reduced') {
  activePizzaList = altPizzaList
  activeDistribution = altCalc.distribution
}
```

## Benefits

### 1. Clarity
- Each variant has its own complete data structure
- No dynamic switching or conditional logic scattered throughout
- Easy to understand what data belongs to which variant

### 2. Consistency
- All calculations happen upfront
- No risk of using wrong data for a variant
- Distribution always matches the pizza list

### 3. Maintainability
- Adding a new variant is straightforward
- Each variant is self-contained
- Easier to debug and test

### 4. Performance
- All calculations done once upfront
- No recalculation when switching variants
- Smoother UI interactions

## Data Flow

```
User Input
    ↓
Calculate 3 Pizza Lists
    ↓
Calculate 3 Distributions
    ↓
Determine Which Variants to Show
    ↓
User Selects Variant
    ↓
Use Corresponding activePizzaList & activeDistribution
    ↓
Pass to Results Component
```

## Files Modified
- ✅ Updated: `src/components/calculator/Calculator.tsx`
  - Created three separate pizza lists
  - Calculated distributions for each
  - Implemented active selection logic
  - Updated result passing to use active data

## Key Variables

| Variable | Type | Purpose |
|----------|------|---------|
| `optimalPizzaList` | Pizza[] | Optimal combination of large + small |
| `largePizzaList` | Pizza[] | Only large pizzas |
| `altPizzaList` | Pizza[] | Large pizzas - 1 |
| `optimalCalc` | Distribution | Distribution for optimal |
| `largeCalc` | Distribution | Distribution for large |
| `altCalc` | Distribution | Distribution for reduced |
| `activePizzaList` | Pizza[] | Currently selected pizza list |
| `activeDistribution` | Distribution | Currently selected distribution |
