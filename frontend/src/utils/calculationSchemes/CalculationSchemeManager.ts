import { ICalculationScheme } from './ICalculationScheme'
import { EqualPriceScheme } from './EqualPriceScheme'
import { ProportionalPriceScheme } from './ProportionalPriceScheme'
import { MixedScheme } from './MixedScheme'

export class CalculationSchemeManager {
  private static instance: CalculationSchemeManager
  private schemes: Map<string, ICalculationScheme> = new Map()

  private constructor() {
    this.registerScheme(new EqualPriceScheme())
    this.registerScheme(new ProportionalPriceScheme())
    //this.registerScheme(new MixedScheme())  Разблокировать, когда буду делать смешанную схему
  }

  public static getInstance(): CalculationSchemeManager {
    if (!CalculationSchemeManager.instance) {
      CalculationSchemeManager.instance = new CalculationSchemeManager()
    }
    return CalculationSchemeManager.instance
  }

  public registerScheme(scheme: ICalculationScheme): void {
    this.schemes.set(scheme.id, scheme)
  }

  public getScheme(id: string): ICalculationScheme | undefined {
    return this.schemes.get(id)
  }

  public getAllSchemes(): ICalculationScheme[] {
    return Array.from(this.schemes.values())
  }

  public getDefaultScheme(): ICalculationScheme {
    return this.schemes.get('equal-price') || this.getAllSchemes()[0]
  }
}



