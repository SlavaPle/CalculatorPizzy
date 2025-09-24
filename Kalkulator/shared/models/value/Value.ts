/**
 * Базовый класс для всех значений
 */
export abstract class Value {
  abstract readonly value: any;
  abstract readonly unit: Unit;
  abstract readonly displayName: string;
  
  abstract convertTo(targetUnit: Unit): Value;
  abstract format(decimals?: number): string;
  abstract clone(): Value;
}

/**
 * Числовое значение
 */
export class NumericValue extends Value {
  constructor(
    public readonly value: number,
    public readonly unit: Unit,
    public readonly displayName: string = ''
  ) {
    super();
  }

  convertTo(targetUnit: Unit): Value {
    if (this.unit.category !== targetUnit.category) {
      throw new Error(`Невозможно конвертировать ${this.unit.name} в ${targetUnit.name}`);
    }
    
    const convertedValue = this.unit.convertTo(this.value, targetUnit);
    return new NumericValue(convertedValue, targetUnit, this.displayName);
  }

  format(decimals: number = 2): string {
    const formattedValue = this.value.toFixed(decimals);
    return `${formattedValue} ${this.unit.symbol}`;
  }

  clone(): Value {
    return new NumericValue(this.value, this.unit, this.displayName);
  }
}

/**
 * Текстовое значение
 */
export class TextValue extends Value {
  constructor(
    public readonly value: string,
    public readonly unit: Unit = Unit.NONE,
    public readonly displayName: string = ''
  ) {
    super();
  }

  convertTo(targetUnit: Unit): Value {
    return this; // Текстовые значения не конвертируются
  }

  format(decimals?: number): string {
    return this.value;
  }

  clone(): Value {
    return new TextValue(this.value, this.unit, this.displayName);
  }
}

/**
 * Булево значение
 */
export class BooleanValue extends Value {
  constructor(
    public readonly value: boolean,
    public readonly unit: Unit = Unit.NONE,
    public readonly displayName: string = ''
  ) {
    super();
  }

  convertTo(targetUnit: Unit): Value {
    return this; // Булевы значения не конвертируются
  }

  format(decimals?: number): string {
    return this.value ? 'Да' : 'Нет';
  }

  clone(): Value {
    return new BooleanValue(this.value, this.unit, this.displayName);
  }
}

/**
 * Массив значений
 */
export class ArrayValue extends Value {
  constructor(
    public readonly value: Value[],
    public readonly unit: Unit = Unit.NONE,
    public readonly displayName: string = ''
  ) {
    super();
  }

  convertTo(targetUnit: Unit): Value {
    const convertedValues = this.value.map(v => v.convertTo(targetUnit));
    return new ArrayValue(convertedValues, targetUnit, this.displayName);
  }

  format(decimals?: number): string {
    return `[${this.value.map(v => v.format(decimals)).join(', ')}]`;
  }

  clone(): Value {
    return new ArrayValue(this.value.map(v => v.clone()), this.unit, this.displayName);
  }
}

/**
 * Объект значения
 */
export class ObjectValue extends Value {
  constructor(
    public readonly value: Map<string, Value>,
    public readonly unit: Unit = Unit.NONE,
    public readonly displayName: string = ''
  ) {
    super();
  }

  convertTo(targetUnit: Unit): Value {
    const convertedValues = new Map<string, Value>();
    for (const [key, val] of this.value) {
      convertedValues.set(key, val.convertTo(targetUnit));
    }
    return new ObjectValue(convertedValues, targetUnit, this.displayName);
  }

  format(decimals?: number): string {
    const entries = Array.from(this.value.entries())
      .map(([key, val]) => `${key}: ${val.format(decimals)}`)
      .join(', ');
    return `{${entries}}`;
  }

  clone(): Value {
    const clonedValues = new Map<string, Value>();
    for (const [key, val] of this.value) {
      clonedValues.set(key, val.clone());
    }
    return new ObjectValue(clonedValues, this.unit, this.displayName);
  }
}
