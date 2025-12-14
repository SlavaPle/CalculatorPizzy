# Calculations Utilities

This directory contains pure calculation functions (business logic) separated from UI components.

## Files:

### `pizzaOptimization.ts`
Functions for optimizing pizza quantities:
- `bestFactors()` - Finds optimal combination of large and small pizzas
- `createPizzaList()` - Creates pizza list with free pizza promotions

### `sliceDistribution.ts`
Functions for distributing pizza slices among participants:
- `calculateDistribution()` - Distributes slices based on user preferences and "can have more" flags

### `index.ts`
Barrel export file for easy imports
