# Components Structure

This directory contains all UI components organized by feature/page.

## Folders:

### `common/`
Reusable UI components used across the entire application:
- `Header.tsx` - Application header with logo and user info
- `NumericStepper.tsx` - Reusable +/- number input control

### `calculator/`
Components specific to the pizza calculator feature:
- `Calculator.tsx` - Main calculator container with user management
- `Results.tsx` - Results display with cost breakdown
- `CalculationResults.tsx` - Detailed results view with multiple tabs
- `PizzaCalculation.tsx` - Intermediate confirmation screen
- `PizzaVariantCard.tsx` - Reusable card for displaying calculation variants
- `UserForm.tsx` - Form for adding participants
- `PizzaSelector.tsx` - Pizza type selection interface
- `SettingsModal.tsx` - Settings modal for pizza configuration

### `home/`
Components specific to the home page (currently empty)

### `auth/`
Components specific to authentication pages (currently empty)
