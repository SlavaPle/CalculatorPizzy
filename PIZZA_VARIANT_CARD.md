# Pizza Variant Card Component

## Overview
Created a reusable component `PizzaVariantCard` to eliminate code duplication in the Calculator component.

## Problem
The Calculator component had **three nearly identical card buttons** (150+ lines of duplicated code each):
1. Optimal combination card
2. Large pizzas card
3. -1 pizza (reduced) card

Each card displayed:
- Title
- Pizza count
- Slices calculation (required + extra = total)
- Extra/Missing indicator

## Solution
Created `PizzaVariantCard.tsx` - a reusable component that handles all the display logic.

### Component Props
```typescript
interface PizzaVariantCardProps {
  title: string              // Card title (e.g., "Optimal combination", "Large", "-1 pizza")
  pizzaCount: number | string // Number of pizzas (can be formatted string like "2 (1)")
  pizzaLabel: string         // Label for pizza count (e.g., "Pizzas", "Large (small) pizzas")
  requiredSlices: number     // Base number of slices needed
  extraSlices: number        // Extra slices (positive) or missing (negative)
  totalSlices: number        // Total slices after adding/subtracting extra
  isSelected: boolean        // Whether this variant is currently selected
  onClick: () => void        // Click handler
}
```

## Benefits

### 1. Code Reduction
- **Before**: ~450 lines of duplicated JSX (3 cards × ~150 lines each)
- **After**: ~70 lines in component + ~40 lines for usage = **110 lines total**
- **Saved**: ~340 lines (~75% reduction)

### 2. Maintainability
- Single source of truth for card styling
- Changes to card design only need to be made once
- Easier to test and debug

### 3. Consistency
- All cards guaranteed to look and behave the same
- No risk of divergence between variants

### 4. Readability
- Calculator.tsx is much cleaner
- Intent is clearer with declarative props

## Usage Example

```tsx
<PizzaVariantCard
  title="Large"
  pizzaCount={3}
  pizzaLabel="Pizzas"
  requiredSlices={24}
  extraSlices={2}
  totalSlices={26}
  isSelected={selectedVariant === 'current'}
  onClick={() => setSelectedVariant('current')}
/>
```

## Files Modified
- ✅ Created: `src/components/calculator/PizzaVariantCard.tsx`
- ✅ Updated: `src/components/calculator/Calculator.tsx`

## Location
`frontend/src/components/calculator/PizzaVariantCard.tsx`
