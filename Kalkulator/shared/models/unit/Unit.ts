/**
 * Категория единиц измерения
 */
export enum UnitCategory {
  LENGTH = 'length',
  MASS = 'mass',
  TIME = 'time',
  TEMPERATURE = 'temperature',
  CURRENCY = 'currency',
  ANGLE = 'angle',
  PRESSURE = 'pressure',
  ENERGY = 'energy',
  POWER = 'power',
  VOLUME = 'volume',
  AREA = 'area',
  SPEED = 'speed',
  ACCELERATION = 'acceleration',
  FORCE = 'force',
  NONE = 'none'
}

/**
 * Базовый класс для единиц измерения
 */
export abstract class Unit {
  abstract readonly symbol: string;
  abstract readonly name: string;
  abstract readonly category: UnitCategory;
  
  abstract convertTo(value: number, targetUnit: Unit): number;
  abstract isValidFor(value: any): boolean;
}

/**
 * Единицы длины
 */
export class LengthUnit extends Unit {
  constructor(
    public readonly symbol: string,
    public readonly name: string,
    public readonly category: UnitCategory = UnitCategory.LENGTH,
    private readonly toMeters: number
  ) {
    super();
  }

  convertTo(value: number, targetUnit: Unit): number {
    if (!(targetUnit instanceof LengthUnit)) {
      throw new Error(`Невозможно конвертировать ${this.name} в ${targetUnit.name}`);
    }
    
    const valueInMeters = value * this.toMeters;
    return valueInMeters / (targetUnit as LengthUnit).toMeters;
  }

  isValidFor(value: any): boolean {
    return typeof value === 'number' && !isNaN(value);
  }
}

/**
 * Единицы массы
 */
export class MassUnit extends Unit {
  constructor(
    public readonly symbol: string,
    public readonly name: string,
    public readonly category: UnitCategory = UnitCategory.MASS,
    private readonly toKilograms: number
  ) {
    super();
  }

  convertTo(value: number, targetUnit: Unit): number {
    if (!(targetUnit instanceof MassUnit)) {
      throw new Error(`Невозможно конвертировать ${this.name} в ${targetUnit.name}`);
    }
    
    const valueInKilograms = value * this.toKilograms;
    return valueInKilograms / (targetUnit as MassUnit).toKilograms;
  }

  isValidFor(value: any): boolean {
    return typeof value === 'number' && !isNaN(value);
  }
}

/**
 * Единицы времени
 */
export class TimeUnit extends Unit {
  constructor(
    public readonly symbol: string,
    public readonly name: string,
    public readonly category: UnitCategory = UnitCategory.TIME,
    private readonly toSeconds: number
  ) {
    super();
  }

  convertTo(value: number, targetUnit: Unit): number {
    if (!(targetUnit instanceof TimeUnit)) {
      throw new Error(`Невозможно конвертировать ${this.name} в ${targetUnit.name}`);
    }
    
    const valueInSeconds = value * this.toSeconds;
    return valueInSeconds / (targetUnit as TimeUnit).toSeconds;
  }

  isValidFor(value: any): boolean {
    return typeof value === 'number' && !isNaN(value);
  }
}

/**
 * Единицы температуры
 */
export class TemperatureUnit extends Unit {
  constructor(
    public readonly symbol: string,
    public readonly name: string,
    public readonly category: UnitCategory = UnitCategory.TEMPERATURE,
    private readonly toKelvin: (value: number) => number,
    private readonly fromKelvin: (value: number) => number
  ) {
    super();
  }

  convertTo(value: number, targetUnit: Unit): number {
    if (!(targetUnit instanceof TemperatureUnit)) {
      throw new Error(`Невозможно конвертировать ${this.name} в ${targetUnit.name}`);
    }
    
    const valueInKelvin = this.toKelvin(value);
    return (targetUnit as TemperatureUnit).fromKelvin(valueInKelvin);
  }

  isValidFor(value: any): boolean {
    return typeof value === 'number' && !isNaN(value);
  }
}

/**
 * Единицы валют
 */
export class CurrencyUnit extends Unit {
  constructor(
    public readonly symbol: string,
    public readonly name: string,
    public readonly category: UnitCategory = UnitCategory.CURRENCY,
    private readonly toUSD: number
  ) {
    super();
  }

  convertTo(value: number, targetUnit: Unit): number {
    if (!(targetUnit instanceof CurrencyUnit)) {
      throw new Error(`Невозможно конвертировать ${this.name} в ${targetUnit.name}`);
    }
    
    const valueInUSD = value * this.toUSD;
    return valueInUSD / (targetUnit as CurrencyUnit).toUSD;
  }

  isValidFor(value: any): boolean {
    return typeof value === 'number' && !isNaN(value);
  }
}

/**
 * Единицы углов
 */
export class AngleUnit extends Unit {
  constructor(
    public readonly symbol: string,
    public readonly name: string,
    public readonly category: UnitCategory = UnitCategory.ANGLE,
    private readonly toRadians: number
  ) {
    super();
  }

  convertTo(value: number, targetUnit: Unit): number {
    if (!(targetUnit instanceof AngleUnit)) {
      throw new Error(`Невозможно конвертировать ${this.name} в ${targetUnit.name}`);
    }
    
    const valueInRadians = value * this.toRadians;
    return valueInRadians / (targetUnit as AngleUnit).toRadians;
  }

  isValidFor(value: any): boolean {
    return typeof value === 'number' && !isNaN(value);
  }
}

/**
 * Единицы без измерения
 */
export class NoUnit extends Unit {
  constructor(
    public readonly symbol: string = '',
    public readonly name: string = 'Без единиц',
    public readonly category: UnitCategory = UnitCategory.NONE
  ) {
    super();
  }

  convertTo(value: number, targetUnit: Unit): number {
    return value;
  }

  isValidFor(value: any): boolean {
    return true;
  }
}

/**
 * Предопределенные единицы измерения
 */
export class Unit {
  // Длина
  static readonly METER = new LengthUnit('м', 'Метр', UnitCategory.LENGTH, 1);
  static readonly CENTIMETER = new LengthUnit('см', 'Сантиметр', UnitCategory.LENGTH, 0.01);
  static readonly KILOMETER = new LengthUnit('км', 'Километр', UnitCategory.LENGTH, 1000);
  static readonly INCH = new LengthUnit('дюйм', 'Дюйм', UnitCategory.LENGTH, 0.0254);
  static readonly FOOT = new LengthUnit('фут', 'Фут', UnitCategory.LENGTH, 0.3048);
  static readonly YARD = new LengthUnit('ярд', 'Ярд', UnitCategory.LENGTH, 0.9144);
  static readonly MILE = new LengthUnit('миля', 'Миля', UnitCategory.LENGTH, 1609.344);

  // Масса
  static readonly KILOGRAM = new MassUnit('кг', 'Килограмм', UnitCategory.MASS, 1);
  static readonly GRAM = new MassUnit('г', 'Грамм', UnitCategory.MASS, 0.001);
  static readonly POUND = new MassUnit('фунт', 'Фунт', UnitCategory.MASS, 0.453592);
  static readonly OUNCE = new MassUnit('унция', 'Унция', UnitCategory.MASS, 0.0283495);

  // Время
  static readonly SECOND = new TimeUnit('с', 'Секунда', UnitCategory.TIME, 1);
  static readonly MINUTE = new TimeUnit('мин', 'Минута', UnitCategory.TIME, 60);
  static readonly HOUR = new TimeUnit('ч', 'Час', UnitCategory.TIME, 3600);
  static readonly DAY = new TimeUnit('д', 'День', UnitCategory.TIME, 86400);
  static readonly WEEK = new TimeUnit('нед', 'Неделя', UnitCategory.TIME, 604800);
  static readonly MONTH = new TimeUnit('мес', 'Месяц', UnitCategory.TIME, 2629746);
  static readonly YEAR = new TimeUnit('г', 'Год', UnitCategory.TIME, 31556952);

  // Температура
  static readonly CELSIUS = new TemperatureUnit(
    '°C', 'Цельсий', UnitCategory.TEMPERATURE,
    (c) => c + 273.15,
    (k) => k - 273.15
  );
  static readonly FAHRENHEIT = new TemperatureUnit(
    '°F', 'Фаренгейт', UnitCategory.TEMPERATURE,
    (f) => (f - 32) * 5/9 + 273.15,
    (k) => (k - 273.15) * 9/5 + 32
  );
  static readonly KELVIN = new TemperatureUnit(
    'K', 'Кельвин', UnitCategory.TEMPERATURE,
    (k) => k,
    (k) => k
  );

  // Валюта
  static readonly RUBLE = new CurrencyUnit('₽', 'Рубль', UnitCategory.CURRENCY, 0.013);
  static readonly DOLLAR = new CurrencyUnit('$', 'Доллар', UnitCategory.CURRENCY, 1);
  static readonly EURO = new CurrencyUnit('€', 'Евро', UnitCategory.CURRENCY, 1.1);
  static readonly POUND = new CurrencyUnit('£', 'Фунт стерлингов', UnitCategory.CURRENCY, 1.25);

  // Углы
  static readonly RADIAN = new AngleUnit('рад', 'Радиан', UnitCategory.ANGLE, 1);
  static readonly DEGREE = new AngleUnit('°', 'Градус', UnitCategory.ANGLE, Math.PI / 180);
  static readonly GRADIAN = new AngleUnit('град', 'Градиан', UnitCategory.ANGLE, Math.PI / 200);

  // Без единиц
  static readonly NONE = new NoUnit();
}
