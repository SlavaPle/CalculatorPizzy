import { PizzaSettings } from '../components/calculator/SettingsModal'

/**
 * Определяет CSS класс для отображения размера куска пиццы
 * Малые куски отображаются меньшим размером для всех схем, кроме equal-price
 * 
 * @param isSmall - является ли кусок малым (от маленькой пиццы)
 * @param pizzaSettings - настройки пиццы (может быть undefined)
 * @returns CSS класс для размера куска
 */
export function getSliceSizeClass(
  isSmall: boolean,
  pizzaSettings?: PizzaSettings | null
): string {
  if (isSmall && pizzaSettings?.calculationScheme !== 'equal-price') {
    return 'text-[0.85em]'
  }
  return 'text-base sm:text-xl'
}
