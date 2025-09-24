/**
 * Экспорт системы единиц измерения
 */

export * from './UnitConverter';
export * from './UnitValidator';

// Типы для системы единиц
export interface UnitInfo {
  unit: string;
  category: string;
  isBase: boolean;
  symbol: string;
  name: string;
  description: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ConversionResult {
  success: boolean;
  value: number;
  fromUnit: string;
  toUnit: string;
  error?: string;
}

export interface UnitCategory {
  name: string;
  displayName: string;
  baseUnit: string;
  units: string[];
}

export interface UnitSystem {
  name: string;
  displayName: string;
  categories: UnitCategory[];
  defaultUnits: Record<string, string>;
}

// Предопределенные системы единиц
export const METRIC_SYSTEM: UnitSystem = {
  name: 'metric',
  displayName: 'Метрическая система',
  categories: [
    {
      name: 'length',
      displayName: 'Длина',
      baseUnit: 'м',
      units: ['м', 'см', 'км', 'мм']
    },
    {
      name: 'mass',
      displayName: 'Масса',
      baseUnit: 'кг',
      units: ['кг', 'г']
    },
    {
      name: 'time',
      displayName: 'Время',
      baseUnit: 'с',
      units: ['с', 'мин', 'ч', 'д']
    },
    {
      name: 'temperature',
      displayName: 'Температура',
      baseUnit: '°C',
      units: ['°C', 'K']
    },
    {
      name: 'angle',
      displayName: 'Углы',
      baseUnit: 'рад',
      units: ['рад', '°']
    }
  ],
  defaultUnits: {
    length: 'м',
    mass: 'кг',
    time: 'с',
    temperature: '°C',
    angle: 'рад'
  }
};

export const IMPERIAL_SYSTEM: UnitSystem = {
  name: 'imperial',
  displayName: 'Имперская система',
  categories: [
    {
      name: 'length',
      displayName: 'Длина',
      baseUnit: 'фут',
      units: ['дюйм', 'фут', 'ярд', 'миля']
    },
    {
      name: 'mass',
      displayName: 'Масса',
      baseUnit: 'фунт',
      units: ['унция', 'фунт']
    },
    {
      name: 'time',
      displayName: 'Время',
      baseUnit: 'с',
      units: ['с', 'мин', 'ч', 'д']
    },
    {
      name: 'temperature',
      displayName: 'Температура',
      baseUnit: '°F',
      units: ['°F']
    },
    {
      name: 'angle',
      displayName: 'Углы',
      baseUnit: '°',
      units: ['°', 'град']
    }
  ],
  defaultUnits: {
    length: 'фут',
    mass: 'фунт',
    time: 'с',
    temperature: '°F',
    angle: '°'
  }
};

export const CUSTOM_SYSTEM: UnitSystem = {
  name: 'custom',
  displayName: 'Пользовательская система',
  categories: [],
  defaultUnits: {}
};
