export interface PizzaSettings {
  smallPizzaSlices: number
  largePizzaSlices: number
  largePizzaPrice: number
  smallPizzaPricePercent: number
  freePizzaThreshold: number
  useFreePizza: boolean
  freePizzaIsSmall: boolean
  smallEqual: boolean // вычисляемое поле
}

class PizzaSettingsSingleton {
  private static instance: PizzaSettingsSingleton
  private settings: PizzaSettings
  private readonly STORAGE_KEY = 'pizzaSettings'

  private constructor() {
    this.settings = this.loadSettings()
  }

  public static getInstance(): PizzaSettingsSingleton {
    if (!PizzaSettingsSingleton.instance) {
      PizzaSettingsSingleton.instance = new PizzaSettingsSingleton()
    }
    return PizzaSettingsSingleton.instance
  }

  private loadSettings(): PizzaSettings {
    const saved = localStorage.getItem(this.STORAGE_KEY)
    const defaultSettings = {
      smallPizzaSlices: 6,
      largePizzaSlices: 8,
      largePizzaPrice: 800,
      smallPizzaPricePercent: 65,
      freePizzaThreshold: 3,
      useFreePizza: true,
      freePizzaIsSmall: false,
      smallEqual: false
    }

    if (saved) {
      const parsed = JSON.parse(saved)
      const merged = { ...defaultSettings, ...parsed }
      // Вычисляем smallEqual при загрузке
      merged.smallEqual = merged.smallPizzaSlices >= merged.largePizzaSlices
      return merged
    }

    return defaultSettings
  }

  public getSettings(): PizzaSettings {
    return { ...this.settings }
  }

  public updateSettings(newSettings: Partial<PizzaSettings>): void {
    this.settings = { ...this.settings, ...newSettings }
    
    // Автоматически пересчитываем smallEqual при изменении размеров пицц
    if (newSettings.smallPizzaSlices !== undefined || newSettings.largePizzaSlices !== undefined) {
      this.settings.smallEqual = this.settings.smallPizzaSlices >= this.settings.largePizzaSlices
    }
    
    this.saveSettings()
  }

  private saveSettings(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings))
  }

  public clearSettings(): void {
    localStorage.removeItem(this.STORAGE_KEY)
    this.settings = this.loadSettings()
  }
}

export default PizzaSettingsSingleton.getInstance()

