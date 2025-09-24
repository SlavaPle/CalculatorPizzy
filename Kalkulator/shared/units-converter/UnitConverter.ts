/**
 * Конвертер единиц измерения
 */
export class UnitConverter {
  private static instance: UnitConverter;
  private converters: Map<string, Map<string, (value: number) => number>> = new Map();

  private constructor() {
    this.initializeConverters();
  }

  /**
   * Получение экземпляра конвертера
   */
  static getInstance(): UnitConverter {
    if (!UnitConverter.instance) {
      UnitConverter.instance = new UnitConverter();
    }
    return UnitConverter.instance;
  }

  /**
   * Конвертация значения между единицами
   */
  convert(value: number, fromUnit: string, toUnit: string): number {
    if (fromUnit === toUnit) {
      return value;
    }

    const category = this.getUnitCategory(fromUnit);
    if (!category) {
      throw new Error(`Неизвестная единица: ${fromUnit}`);
    }

    const categoryConverters = this.converters.get(category);
    if (!categoryConverters) {
      throw new Error(`Нет конвертеров для категории: ${category}`);
    }

    const converterKey = `${fromUnit}_to_${toUnit}`;
    const converter = categoryConverters.get(converterKey);
    
    if (!converter) {
      throw new Error(`Нет конвертера для ${fromUnit} -> ${toUnit}`);
    }

    return converter(value);
  }

  /**
   * Получение категории единицы
   */
  private getUnitCategory(unit: string): string | null {
    const unitCategories: Record<string, string> = {
      // Длина
      'м': 'length', 'см': 'length', 'км': 'length', 'мм': 'length',
      'дюйм': 'length', 'фут': 'length', 'ярд': 'length', 'миля': 'length',
      
      // Масса
      'кг': 'mass', 'г': 'mass', 'фунт': 'mass', 'унция': 'mass',
      
      // Время
      'с': 'time', 'мин': 'time', 'ч': 'time', 'д': 'time',
      'нед': 'time', 'мес': 'time', 'г': 'time',
      
      // Температура
      '°C': 'temperature', '°F': 'temperature', 'K': 'temperature',
      
      // Валюта
      '₽': 'currency', '$': 'currency', '€': 'currency', '£': 'currency',
      
      // Углы
      'рад': 'angle', '°': 'angle', 'град': 'angle'
    };

    return unitCategories[unit] || null;
  }

  /**
   * Инициализация конвертеров
   */
  private initializeConverters(): void {
    this.initializeLengthConverters();
    this.initializeMassConverters();
    this.initializeTimeConverters();
    this.initializeTemperatureConverters();
    this.initializeCurrencyConverters();
    this.initializeAngleConverters();
  }

  /**
   * Конвертеры длины
   */
  private initializeLengthConverters(): void {
    const lengthConverters = new Map<string, (value: number) => number>();
    
    // Метры как базовая единица
    lengthConverters.set('см_to_м', (value) => value / 100);
    lengthConverters.set('км_to_м', (value) => value * 1000);
    lengthConverters.set('мм_to_м', (value) => value / 1000);
    lengthConverters.set('дюйм_to_м', (value) => value * 0.0254);
    lengthConverters.set('фут_to_м', (value) => value * 0.3048);
    lengthConverters.set('ярд_to_м', (value) => value * 0.9144);
    lengthConverters.set('миля_to_м', (value) => value * 1609.344);
    
    // Обратные конвертеры
    lengthConverters.set('м_to_см', (value) => value * 100);
    lengthConverters.set('м_to_км', (value) => value / 1000);
    lengthConverters.set('м_to_мм', (value) => value * 1000);
    lengthConverters.set('м_to_дюйм', (value) => value / 0.0254);
    lengthConverters.set('м_to_фут', (value) => value / 0.3048);
    lengthConverters.set('м_to_ярд', (value) => value / 0.9144);
    lengthConverters.set('м_to_миля', (value) => value / 1609.344);
    
    // Прямые конвертеры между единицами
    lengthConverters.set('см_to_км', (value) => value / 100000);
    lengthConverters.set('км_to_см', (value) => value * 100000);
    lengthConverters.set('см_to_мм', (value) => value * 10);
    lengthConverters.set('мм_to_см', (value) => value / 10);
    lengthConverters.set('дюйм_to_см', (value) => value * 2.54);
    lengthConverters.set('см_to_дюйм', (value) => value / 2.54);
    lengthConverters.set('фут_to_дюйм', (value) => value * 12);
    lengthConverters.set('дюйм_to_фут', (value) => value / 12);
    lengthConverters.set('ярд_to_фут', (value) => value * 3);
    lengthConverters.set('фут_to_ярд', (value) => value / 3);
    lengthConverters.set('миля_to_фут', (value) => value * 5280);
    lengthConverters.set('фут_to_миля', (value) => value / 5280);
    
    this.converters.set('length', lengthConverters);
  }

  /**
   * Конвертеры массы
   */
  private initializeMassConverters(): void {
    const massConverters = new Map<string, (value: number) => number>();
    
    // Килограммы как базовая единица
    massConverters.set('г_to_кг', (value) => value / 1000);
    massConverters.set('фунт_to_кг', (value) => value * 0.453592);
    massConverters.set('унция_to_кг', (value) => value * 0.0283495);
    
    // Обратные конвертеры
    massConverters.set('кг_to_г', (value) => value * 1000);
    massConverters.set('кг_to_фунт', (value) => value / 0.453592);
    massConverters.set('кг_to_унция', (value) => value / 0.0283495);
    
    // Прямые конвертеры между единицами
    massConverters.set('г_to_фунт', (value) => value * 0.00220462);
    massConverters.set('фунт_to_г', (value) => value / 0.00220462);
    massConverters.set('г_to_унция', (value) => value * 0.035274);
    massConverters.set('унция_to_г', (value) => value / 0.035274);
    massConverters.set('фунт_to_унция', (value) => value * 16);
    massConverters.set('унция_to_фунт', (value) => value / 16);
    
    this.converters.set('mass', massConverters);
  }

  /**
   * Конвертеры времени
   */
  private initializeTimeConverters(): void {
    const timeConverters = new Map<string, (value: number) => number>();
    
    // Секунды как базовая единица
    timeConverters.set('мин_to_с', (value) => value * 60);
    timeConverters.set('ч_to_с', (value) => value * 3600);
    timeConverters.set('д_to_с', (value) => value * 86400);
    timeConverters.set('нед_to_с', (value) => value * 604800);
    timeConverters.set('мес_to_с', (value) => value * 2629746);
    timeConverters.set('г_to_с', (value) => value * 31556952);
    
    // Обратные конвертеры
    timeConverters.set('с_to_мин', (value) => value / 60);
    timeConverters.set('с_to_ч', (value) => value / 3600);
    timeConverters.set('с_to_д', (value) => value / 86400);
    timeConverters.set('с_to_нед', (value) => value / 604800);
    timeConverters.set('с_to_мес', (value) => value / 2629746);
    timeConverters.set('с_to_г', (value) => value / 31556952);
    
    // Прямые конвертеры между единицами
    timeConverters.set('мин_to_ч', (value) => value / 60);
    timeConverters.set('ч_to_мин', (value) => value * 60);
    timeConverters.set('ч_to_д', (value) => value / 24);
    timeConverters.set('д_to_ч', (value) => value * 24);
    timeConverters.set('д_to_нед', (value) => value / 7);
    timeConverters.set('нед_to_д', (value) => value * 7);
    timeConverters.set('нед_to_мес', (value) => value / 4.34524);
    timeConverters.set('мес_to_нед', (value) => value * 4.34524);
    timeConverters.set('мес_to_г', (value) => value / 12);
    timeConverters.set('г_to_мес', (value) => value * 12);
    
    this.converters.set('time', timeConverters);
  }

  /**
   * Конвертеры температуры
   */
  private initializeTemperatureConverters(): void {
    const temperatureConverters = new Map<string, (value: number) => number>();
    
    // Цельсий как базовая единица
    temperatureConverters.set('°F_to_°C', (value) => (value - 32) * 5/9);
    temperatureConverters.set('K_to_°C', (value) => value - 273.15);
    
    // Обратные конвертеры
    temperatureConverters.set('°C_to_°F', (value) => value * 9/5 + 32);
    temperatureConverters.set('°C_to_K', (value) => value + 273.15);
    
    // Прямые конвертеры между единицами
    temperatureConverters.set('°F_to_K', (value) => (value - 32) * 5/9 + 273.15);
    temperatureConverters.set('K_to_°F', (value) => (value - 273.15) * 9/5 + 32);
    
    this.converters.set('temperature', temperatureConverters);
  }

  /**
   * Конвертеры валют
   */
  private initializeCurrencyConverters(): void {
    const currencyConverters = new Map<string, (value: number) => number>();
    
    // Доллары как базовая единица (примерные курсы)
    currencyConverters.set('₽_to_$', (value) => value * 0.013);
    currencyConverters.set('€_to_$', (value) => value * 1.1);
    currencyConverters.set('£_to_$', (value) => value * 1.25);
    
    // Обратные конвертеры
    currencyConverters.set('$_to_₽', (value) => value / 0.013);
    currencyConverters.set('$_to_€', (value) => value / 1.1);
    currencyConverters.set('$_to_£', (value) => value / 1.25);
    
    // Прямые конвертеры между валютами
    currencyConverters.set('₽_to_€', (value) => value * 0.0118);
    currencyConverters.set('€_to_₽', (value) => value / 0.0118);
    currencyConverters.set('₽_to_£', (value) => value * 0.0104);
    currencyConverters.set('£_to_₽', (value) => value / 0.0104);
    currencyConverters.set('€_to_£', (value) => value * 0.88);
    currencyConverters.set('£_to_€', (value) => value / 0.88);
    
    this.converters.set('currency', currencyConverters);
  }

  /**
   * Конвертеры углов
   */
  private initializeAngleConverters(): void {
    const angleConverters = new Map<string, (value: number) => number>();
    
    // Радианы как базовая единица
    angleConverters.set('°_to_рад', (value) => value * Math.PI / 180);
    angleConverters.set('град_to_рад', (value) => value * Math.PI / 200);
    
    // Обратные конвертеры
    angleConverters.set('рад_to_°', (value) => value * 180 / Math.PI);
    angleConverters.set('рад_to_град', (value) => value * 200 / Math.PI);
    
    // Прямые конвертеры между единицами
    angleConverters.set('°_to_град', (value) => value * 200 / 180);
    angleConverters.set('град_to_°', (value) => value * 180 / 200);
    
    this.converters.set('angle', angleConverters);
  }

  /**
   * Получение доступных единиц для категории
   */
  getAvailableUnits(category: string): string[] {
    const unitCategories: Record<string, string[]> = {
      'length': ['м', 'см', 'км', 'мм', 'дюйм', 'фут', 'ярд', 'миля'],
      'mass': ['кг', 'г', 'фунт', 'унция'],
      'time': ['с', 'мин', 'ч', 'д', 'нед', 'мес', 'г'],
      'temperature': ['°C', '°F', 'K'],
      'currency': ['₽', '$', '€', '£'],
      'angle': ['рад', '°', 'град']
    };

    return unitCategories[category] || [];
  }

  /**
   * Получение всех категорий единиц
   */
  getAllCategories(): string[] {
    return ['length', 'mass', 'time', 'temperature', 'currency', 'angle'];
  }

  /**
   * Проверка возможности конвертации
   */
  canConvert(fromUnit: string, toUnit: string): boolean {
    if (fromUnit === toUnit) {
      return true;
    }

    const category = this.getUnitCategory(fromUnit);
    if (!category) {
      return false;
    }

    const categoryConverters = this.converters.get(category);
    if (!categoryConverters) {
      return false;
    }

    const converterKey = `${fromUnit}_to_${toUnit}`;
    return categoryConverters.has(converterKey);
  }
}
