/**
 * Экспорт утилит
 */

export * from './helpers/ValidationHelper';
export * from './helpers/FormatHelper';

// Типы для утилит
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PasswordValidationResult extends ValidationResult {}

export interface FormulaValidationResult extends ValidationResult {}

export interface NumberFormatOptions {
  decimals?: number;
  thousandsSeparator?: string;
  decimalSeparator?: string;
  showSign?: boolean;
  showCurrency?: boolean;
  currency?: string;
}

// Дополнительные утилиты
export class MathHelper {
  /**
   * Округление до указанного количества знаков
   */
  static round(value: number, decimals: number = 2): number {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  /**
   * Округление вверх
   */
  static ceil(value: number, decimals: number = 2): number {
    return Math.ceil(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  /**
   * Округление вниз
   */
  static floor(value: number, decimals: number = 2): number {
    return Math.floor(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  /**
   * Ограничение значения диапазоном
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Линейная интерполяция
   */
  static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  /**
   * Обратная линейная интерполяция
   */
  static inverseLerp(a: number, b: number, value: number): number {
    return (value - a) / (b - a);
  }

  /**
   * Степень числа
   */
  static power(base: number, exponent: number): number {
    return Math.pow(base, exponent);
  }

  /**
   * Квадратный корень
   */
  static sqrt(value: number): number {
    return Math.sqrt(value);
  }

  /**
   * Абсолютное значение
   */
  static abs(value: number): number {
    return Math.abs(value);
  }

  /**
   * Минимум из массива
   */
  static min(values: number[]): number {
    return Math.min(...values);
  }

  /**
   * Максимум из массива
   */
  static max(values: number[]): number {
    return Math.max(...values);
  }

  /**
   * Среднее арифметическое
   */
  static average(values: number[]): number {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  /**
   * Медиана
   */
  static median(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    } else {
      return sorted[middle];
    }
  }

  /**
   * Стандартное отклонение
   */
  static standardDeviation(values: number[]): number {
    const avg = this.average(values);
    const variance = values.reduce((sum, value) => sum + Math.pow(value - avg, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * Факториал
   */
  static factorial(n: number): number {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    return n * this.factorial(n - 1);
  }

  /**
   * Число Фибоначчи
   */
  static fibonacci(n: number): number {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return n;
    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }

  /**
   * Проверка на простое число
   */
  static isPrime(n: number): boolean {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    
    for (let i = 3; i <= Math.sqrt(n); i += 2) {
      if (n % i === 0) return false;
    }
    
    return true;
  }

  /**
   * НОД (наибольший общий делитель)
   */
  static gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }

  /**
   * НОК (наименьшее общее кратное)
   */
  static lcm(a: number, b: number): number {
    return Math.abs(a * b) / this.gcd(a, b);
  }
}

export class StringHelper {
  /**
   * Обрезка строки
   */
  static truncate(text: string, length: number, suffix: string = '...'): string {
    if (text.length <= length) return text;
    return text.substring(0, length - suffix.length) + suffix;
  }

  /**
   * Заглавная первая буква
   */
  static capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  /**
   * Заглавные первые буквы всех слов
   */
  static titleCase(text: string): string {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Удаление лишних пробелов
   */
  static trim(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }

  /**
   * Разделение строки на слова
   */
  static words(text: string): string[] {
    return text.split(/\s+/).filter(word => word.length > 0);
  }

  /**
   * Подсчет слов
   */
  static wordCount(text: string): number {
    return this.words(text).length;
  }

  /**
   * Подсчет символов
   */
  static charCount(text: string): number {
    return text.length;
  }

  /**
   * Подсчет символов без пробелов
   */
  static charCountNoSpaces(text: string): number {
    return text.replace(/\s/g, '').length;
  }

  /**
   * Поиск подстроки
   */
  static contains(text: string, substring: string, caseSensitive: boolean = true): boolean {
    if (!caseSensitive) {
      return text.toLowerCase().includes(substring.toLowerCase());
    }
    return text.includes(substring);
  }

  /**
   * Замена всех вхождений
   */
  static replaceAll(text: string, search: string, replace: string): string {
    return text.split(search).join(replace);
  }

  /**
   * Удаление HTML тегов
   */
  static stripHtml(text: string): string {
    return text.replace(/<[^>]*>/g, '');
  }

  /**
   * Экранирование HTML
   */
  static escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Генерация случайной строки
   */
  static random(length: number = 8, charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }

  /**
   * Генерация UUID
   */
  static uuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
