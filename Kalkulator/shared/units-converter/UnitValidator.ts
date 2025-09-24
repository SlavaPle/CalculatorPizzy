/**
 * Валидатор единиц измерения
 */
export class UnitValidator {
  private static instance: UnitValidator;
  private validUnits: Set<string> = new Set();
  private unitCategories: Map<string, string> = new Map();

  private constructor() {
    this.initializeValidUnits();
  }

  /**
   * Получение экземпляра валидатора
   */
  static getInstance(): UnitValidator {
    if (!UnitValidator.instance) {
      UnitValidator.instance = new UnitValidator();
    }
    return UnitValidator.instance;
  }

  /**
   * Валидация единицы измерения
   */
  validateUnit(unit: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!unit || unit.trim() === '') {
      errors.push('Единица измерения не может быть пустой');
      return { isValid: false, errors, warnings };
    }

    if (!this.validUnits.has(unit)) {
      errors.push(`Неизвестная единица измерения: ${unit}`);
      return { isValid: false, errors, warnings };
    }

    return { isValid: true, errors, warnings };
  }

  /**
   * Валидация конвертации между единицами
   */
  validateConversion(fromUnit: string, toUnit: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Валидация исходной единицы
    const fromValidation = this.validateUnit(fromUnit);
    if (!fromValidation.isValid) {
      errors.push(...fromValidation.errors);
    }

    // Валидация целевой единицы
    const toValidation = this.validateUnit(toUnit);
    if (!toValidation.isValid) {
      errors.push(...toValidation.errors);
    }

    if (errors.length > 0) {
      return { isValid: false, errors, warnings };
    }

    // Проверка совместимости категорий
    const fromCategory = this.getUnitCategory(fromUnit);
    const toCategory = this.getUnitCategory(toUnit);

    if (fromCategory !== toCategory) {
      errors.push(`Невозможно конвертировать ${fromUnit} в ${toUnit}: разные категории единиц`);
      return { isValid: false, errors, warnings };
    }

    return { isValid: true, errors, warnings };
  }

  /**
   * Получение категории единицы
   */
  getUnitCategory(unit: string): string | null {
    return this.unitCategories.get(unit) || null;
  }

  /**
   * Получение всех единиц для категории
   */
  getUnitsForCategory(category: string): string[] {
    const units: string[] = [];
    for (const [unit, cat] of this.unitCategories) {
      if (cat === category) {
        units.push(unit);
      }
    }
    return units;
  }

  /**
   * Получение всех категорий
   */
  getAllCategories(): string[] {
    return [...new Set(this.unitCategories.values())];
  }

  /**
   * Проверка, является ли единица базовой для категории
   */
  isBaseUnit(unit: string): boolean {
    const baseUnits = ['м', 'кг', 'с', '°C', '$', 'рад'];
    return baseUnits.includes(unit);
  }

  /**
   * Получение базовой единицы для категории
   */
  getBaseUnitForCategory(category: string): string | null {
    const categoryBaseUnits: Record<string, string> = {
      'length': 'м',
      'mass': 'кг',
      'time': 'с',
      'temperature': '°C',
      'currency': '$',
      'angle': 'рад'
    };

    return categoryBaseUnits[category] || null;
  }

  /**
   * Инициализация валидных единиц
   */
  private initializeValidUnits(): void {
    // Длина
    const lengthUnits = ['м', 'см', 'км', 'мм', 'дюйм', 'фут', 'ярд', 'миля'];
    lengthUnits.forEach(unit => {
      this.validUnits.add(unit);
      this.unitCategories.set(unit, 'length');
    });

    // Масса
    const massUnits = ['кг', 'г', 'фунт', 'унция'];
    massUnits.forEach(unit => {
      this.validUnits.add(unit);
      this.unitCategories.set(unit, 'mass');
    });

    // Время
    const timeUnits = ['с', 'мин', 'ч', 'д', 'нед', 'мес', 'г'];
    timeUnits.forEach(unit => {
      this.validUnits.add(unit);
      this.unitCategories.set(unit, 'time');
    });

    // Температура
    const temperatureUnits = ['°C', '°F', 'K'];
    temperatureUnits.forEach(unit => {
      this.validUnits.add(unit);
      this.unitCategories.set(unit, 'temperature');
    });

    // Валюта
    const currencyUnits = ['₽', '$', '€', '£'];
    currencyUnits.forEach(unit => {
      this.validUnits.add(unit);
      this.unitCategories.set(unit, 'currency');
    });

    // Углы
    const angleUnits = ['рад', '°', 'град'];
    angleUnits.forEach(unit => {
      this.validUnits.add(unit);
      this.unitCategories.set(unit, 'angle');
    });
  }

  /**
   * Получение информации об единице
   */
  getUnitInfo(unit: string): UnitInfo | null {
    if (!this.validUnits.has(unit)) {
      return null;
    }

    const category = this.getUnitCategory(unit);
    const isBase = this.isBaseUnit(unit);

    return {
      unit,
      category: category || '',
      isBase,
      symbol: unit,
      name: this.getUnitName(unit),
      description: this.getUnitDescription(unit)
    };
  }

  /**
   * Получение названия единицы
   */
  private getUnitName(unit: string): string {
    const unitNames: Record<string, string> = {
      'м': 'Метр',
      'см': 'Сантиметр',
      'км': 'Километр',
      'мм': 'Миллиметр',
      'дюйм': 'Дюйм',
      'фут': 'Фут',
      'ярд': 'Ярд',
      'миля': 'Миля',
      'кг': 'Килограмм',
      'г': 'Грамм',
      'фунт': 'Фунт',
      'унция': 'Унция',
      'с': 'Секунда',
      'мин': 'Минута',
      'ч': 'Час',
      'д': 'День',
      'нед': 'Неделя',
      'мес': 'Месяц',
      'г': 'Год',
      '°C': 'Цельсий',
      '°F': 'Фаренгейт',
      'K': 'Кельвин',
      '₽': 'Рубль',
      '$': 'Доллар',
      '€': 'Евро',
      '£': 'Фунт стерлингов',
      'рад': 'Радиан',
      '°': 'Градус',
      'град': 'Градиан'
    };

    return unitNames[unit] || unit;
  }

  /**
   * Получение описания единицы
   */
  private getUnitDescription(unit: string): string {
    const descriptions: Record<string, string> = {
      'м': 'Основная единица длины в метрической системе',
      'см': 'Сотая часть метра',
      'км': 'Тысяча метров',
      'мм': 'Тысячная часть метра',
      'дюйм': 'Единица длины в имперской системе',
      'фут': '12 дюймов',
      'ярд': '3 фута',
      'миля': '5280 футов',
      'кг': 'Основная единица массы в метрической системе',
      'г': 'Тысячная часть килограмма',
      'фунт': 'Единица массы в имперской системе',
      'унция': 'Шестнадцатая часть фунта',
      'с': 'Основная единица времени в СИ',
      'мин': '60 секунд',
      'ч': '60 минут',
      'д': '24 часа',
      'нед': '7 дней',
      'мес': 'Примерно 30 дней',
      'г': '365 дней',
      '°C': 'Единица температуры по шкале Цельсия',
      '°F': 'Единица температуры по шкале Фаренгейта',
      'K': 'Единица температуры по шкале Кельвина',
      '₽': 'Российский рубль',
      '$': 'Доллар США',
      '€': 'Евро',
      '£': 'Британский фунт стерлингов',
      'рад': 'Единица измерения углов в радианах',
      '°': 'Единица измерения углов в градусах',
      'град': 'Единица измерения углов в градианах'
    };

    return descriptions[unit] || '';
  }
}

/**
 * Информация об единице измерения
 */
export interface UnitInfo {
  unit: string;
  category: string;
  isBase: boolean;
  symbol: string;
  name: string;
  description: string;
}

/**
 * Результат валидации
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
