/**
 * Валидация данных
 */
export class ValidationHelper {
  /**
   * Валидация email
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Валидация пароля
   */
  static isValidPassword(password: string): PasswordValidationResult {
    const result: PasswordValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    if (password.length < 8) {
      result.isValid = false;
      result.errors.push('Пароль должен содержать минимум 8 символов');
    }

    if (!/[A-Z]/.test(password)) {
      result.warnings.push('Рекомендуется использовать заглавные буквы');
    }

    if (!/[a-z]/.test(password)) {
      result.warnings.push('Рекомендуется использовать строчные буквы');
    }

    if (!/\d/.test(password)) {
      result.warnings.push('Рекомендуется использовать цифры');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      result.warnings.push('Рекомендуется использовать специальные символы');
    }

    return result;
  }

  /**
   * Валидация имени
   */
  static isValidName(name: string): boolean {
    return name.trim().length >= 2 && /^[a-zA-Zа-яА-Я\s]+$/.test(name);
  }

  /**
   * Валидация телефона
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  /**
   * Валидация URL
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Валидация числа
   */
  static isValidNumber(value: any): boolean {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
  }

  /**
   * Валидация положительного числа
   */
  static isValidPositiveNumber(value: any): boolean {
    return this.isValidNumber(value) && value > 0;
  }

  /**
   * Валидация целого числа
   */
  static isValidInteger(value: any): boolean {
    return this.isValidNumber(value) && Number.isInteger(value);
  }

  /**
   * Валидация диапазона
   */
  static isValidRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  /**
   * Валидация длины строки
   */
  static isValidLength(value: string, min: number, max: number): boolean {
    return value.length >= min && value.length <= max;
  }

  /**
   * Валидация обязательного поля
   */
  static isRequired(value: any): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }

  /**
   * Валидация формулы
   */
  static isValidFormula(formula: string): FormulaValidationResult {
    const result: FormulaValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    if (!formula || formula.trim().length === 0) {
      result.isValid = false;
      result.errors.push('Формула не может быть пустой');
      return result;
    }

    // Проверка на сбалансированные скобки
    const openParens = (formula.match(/\(/g) || []).length;
    const closeParens = (formula.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      result.isValid = false;
      result.errors.push('Несбалансированные скобки');
    }

    // Проверка на недопустимые символы
    const invalidChars = formula.match(/[^a-zA-Z0-9\s\+\-\*\/\^\(\)\.\,\<\>\=\!\&\|]/g);
    if (invalidChars) {
      result.warnings.push(`Недопустимые символы: ${invalidChars.join(', ')}`);
    }

    // Проверка на пустые скобки
    if (formula.includes('()')) {
      result.warnings.push('Пустые скобки');
    }

    return result;
  }

  /**
   * Валидация единицы измерения
   */
  static isValidUnit(unit: string): boolean {
    const validUnits = [
      'м', 'см', 'км', 'мм', 'дюйм', 'фут', 'ярд', 'миля',
      'кг', 'г', 'фунт', 'унция',
      'с', 'мин', 'ч', 'д', 'нед', 'мес', 'г',
      '°C', '°F', 'K',
      '₽', '$', '€', '£',
      'рад', '°', 'град'
    ];
    return validUnits.includes(unit);
  }

  /**
   * Валидация JSON
   */
  static isValidJson(json: string): boolean {
    try {
      JSON.parse(json);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Валидация UUID
   */
  static isValidUuid(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Валидация даты
   */
  static isValidDate(date: string | Date): boolean {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj instanceof Date && !isNaN(dateObj.getTime());
  }

  /**
   * Валидация времени
   */
  static isValidTime(time: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  /**
   * Валидация цвета (HEX)
   */
  static isValidHexColor(color: string): boolean {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(color);
  }

  /**
   * Валидация IP адреса
   */
  static isValidIpAddress(ip: string): boolean {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  }

  /**
   * Валидация MAC адреса
   */
  static isValidMacAddress(mac: string): boolean {
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return macRegex.test(mac);
  }
}

/**
 * Результат валидации пароля
 */
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Результат валидации формулы
 */
export interface FormulaValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
