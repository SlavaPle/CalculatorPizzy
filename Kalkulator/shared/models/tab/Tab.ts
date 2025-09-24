/**
 * Модель вкладки (калькулятора)
 */
export interface Tab {
  id: string;
  userId: string;
  name: string;
  displayName: string;
  description?: string;
  inputs: Input[];
  formulas: Formula[];
  outputs: Output[];
  isActive: boolean;
  isTemplate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Базовый класс для ввода
 */
export abstract class Input {
  abstract readonly name: string;
  abstract readonly displayName: string;
  abstract readonly value: Value | null;
  abstract readonly isRequired: boolean;
  abstract readonly unit: Unit;
  
  abstract setValue(value: Value): void;
  abstract clear(): void;
  abstract isValid(): boolean;
}

/**
 * Базовый класс для вывода
 */
export abstract class Output {
  abstract readonly name: string;
  abstract readonly displayName: string;
  abstract readonly value: Value | null;
  abstract readonly unit: Unit;
  abstract readonly isCalculated: boolean;
  
  abstract setValue(value: Value): void;
  abstract clear(): void;
  abstract format(decimals?: number): string;
}

/**
 * Числовой ввод
 */
export class NumericInput extends Input {
  constructor(
    public readonly name: string,
    public readonly displayName: string,
    public value: Value | null = null,
    public readonly isRequired: boolean = true,
    public readonly unit: Unit = Unit.NONE,
    public readonly minValue?: number,
    public readonly maxValue?: number,
    public readonly step: number = 1.0
  ) {
    super();
  }

  setValue(value: Value): void {
    if (value instanceof NumericValue) {
      if (this.minValue !== undefined && value.value < this.minValue) {
        throw new Error(`Значение меньше минимального: ${this.minValue}`);
      }
      if (this.maxValue !== undefined && value.value > this.maxValue) {
        throw new Error(`Значение больше максимального: ${this.maxValue}`);
      }
      this.value = value;
    } else {
      throw new Error('Недопустимый тип значения для числового ввода');
    }
  }

  clear(): void {
    this.value = null;
  }

  isValid(): boolean {
    return this.value !== null && (!this.isRequired || (this.value as NumericValue).value !== 0);
  }
}

/**
 * Текстовый ввод
 */
export class TextInput extends Input {
  constructor(
    public readonly name: string,
    public readonly displayName: string,
    public value: Value | null = null,
    public readonly isRequired: boolean = true,
    public readonly unit: Unit = Unit.NONE,
    public readonly maxLength?: number,
    public readonly pattern?: string
  ) {
    super();
  }

  setValue(value: Value): void {
    if (value instanceof TextValue) {
      if (this.maxLength !== undefined && value.value.length > this.maxLength) {
        throw new Error(`Текст превышает максимальную длину: ${this.maxLength}`);
      }
      if (this.pattern !== undefined && !value.value.match(this.pattern)) {
        throw new Error(`Текст не соответствует паттерну: ${this.pattern}`);
      }
      this.value = value;
    } else {
      throw new Error('Недопустимый тип значения для текстового ввода');
    }
  }

  clear(): void {
    this.value = null;
  }

  isValid(): boolean {
    return this.value !== null && (!this.isRequired || (this.value as TextValue).value.length > 0);
  }
}

/**
 * Числовой вывод
 */
export class NumericOutput extends Output {
  constructor(
    public readonly name: string,
    public readonly displayName: string,
    public value: Value | null = null,
    public readonly unit: Unit = Unit.NONE,
    public readonly isCalculated: boolean = false,
    public readonly decimals: number = 2,
    public readonly showUnit: boolean = true
  ) {
    super();
  }

  setValue(value: Value): void {
    if (value instanceof NumericValue) {
      this.value = value;
    } else {
      throw new Error('Недопустимый тип значения для числового вывода');
    }
  }

  clear(): void {
    this.value = null;
  }

  format(decimals: number = this.decimals): string {
    if (this.value === null) return 'Не рассчитано';
    return (this.value as NumericValue).format(decimals);
  }
}

/**
 * Текстовый вывод
 */
export class TextOutput extends Output {
  constructor(
    public readonly name: string,
    public readonly displayName: string,
    public value: Value | null = null,
    public readonly unit: Unit = Unit.NONE,
    public readonly isCalculated: boolean = false
  ) {
    super();
  }

  setValue(value: Value): void {
    if (value instanceof TextValue) {
      this.value = value;
    } else {
      throw new Error('Недопустимый тип значения для текстового вывода');
    }
  }

  clear(): void {
    this.value = null;
  }

  format(decimals?: number): string {
    return this.value ? (this.value as TextValue).value : 'Не рассчитано';
  }
}
