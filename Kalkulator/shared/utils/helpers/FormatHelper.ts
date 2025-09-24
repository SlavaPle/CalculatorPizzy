/**
 * Форматирование данных
 */
export class FormatHelper {
  /**
   * Форматирование числа
   */
  static formatNumber(value: number, options: NumberFormatOptions = {}): string {
    const {
      decimals = 2,
      thousandsSeparator = ' ',
      decimalSeparator = ',',
      showSign = false,
      showCurrency = false,
      currency = '₽'
    } = options;

    if (!this.isValidNumber(value)) {
      return '0';
    }

    const formatted = value.toFixed(decimals);
    const [integer, decimal] = formatted.split('.');

    let result = integer.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
    
    if (decimal && decimals > 0) {
      result += decimalSeparator + decimal;
    }

    if (showSign && value > 0) {
      result = '+' + result;
    }

    if (showCurrency) {
      result = result + ' ' + currency;
    }

    return result;
  }

  /**
   * Форматирование процентов
   */
  static formatPercentage(value: number, decimals: number = 1): string {
    return this.formatNumber(value, { decimals }) + '%';
  }

  /**
   * Форматирование валюты
   */
  static formatCurrency(value: number, currency: string = '₽', decimals: number = 2): string {
    return this.formatNumber(value, { 
      decimals, 
      showCurrency: true, 
      currency 
    });
  }

  /**
   * Форматирование размера файла
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Б';

    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return this.formatNumber(bytes / Math.pow(k, i), { decimals: 1 }) + ' ' + sizes[i];
  }

  /**
   * Форматирование времени
   */
  static formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  }

  /**
   * Форматирование даты
   */
  static formatDate(date: Date | string, format: string = 'DD.MM.YYYY'): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (!this.isValidDate(dateObj)) {
      return '';
    }

    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    const seconds = dateObj.getSeconds().toString().padStart(2, '0');

    return format
      .replace('DD', day)
      .replace('MM', month)
      .replace('YYYY', year.toString())
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }

  /**
   * Форматирование относительного времени
   */
  static formatRelativeTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) {
      return 'только что';
    } else if (minutes < 60) {
      return `${minutes} мин назад`;
    } else if (hours < 24) {
      return `${hours} ч назад`;
    } else if (days < 7) {
      return `${days} дн назад`;
    } else if (weeks < 4) {
      return `${weeks} нед назад`;
    } else if (months < 12) {
      return `${months} мес назад`;
    } else {
      return `${years} г назад`;
    }
  }

  /**
   * Форматирование имени
   */
  static formatName(firstName: string, lastName: string, middleName?: string): string {
    const parts = [firstName, middleName, lastName].filter(Boolean);
    return parts.join(' ');
  }

  /**
   * Форматирование инициалов
   */
  static formatInitials(firstName: string, lastName: string, middleName?: string): string {
    const initials = [firstName, middleName, lastName]
      .filter(Boolean)
      .map(name => name.charAt(0).toUpperCase())
      .join('');
    return initials;
  }

  /**
   * Форматирование телефона
   */
  static formatPhone(phone: string, format: string = '+7 (XXX) XXX-XX-XX'): string {
    const digits = phone.replace(/\D/g, '');
    
    if (digits.length === 0) return '';

    let result = format;
    let digitIndex = 0;

    for (let i = 0; i < result.length && digitIndex < digits.length; i++) {
      if (result[i] === 'X') {
        result = result.substring(0, i) + digits[digitIndex] + result.substring(i + 1);
        digitIndex++;
      }
    }

    return result;
  }

  /**
   * Форматирование адреса
   */
  static formatAddress(street: string, city: string, country: string, postalCode?: string): string {
    const parts = [street, city, country, postalCode].filter(Boolean);
    return parts.join(', ');
  }

  /**
   * Форматирование JSON
   */
  static formatJson(obj: any, indent: number = 2): string {
    return JSON.stringify(obj, null, indent);
  }

  /**
   * Форматирование HTML
   */
  static formatHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Форматирование URL
   */
  static formatUrl(url: string): string {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url;
    }
    return url;
  }

  /**
   * Форматирование slug
   */
  static formatSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Форматирование заголовка
   */
  static formatTitle(text: string): string {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Форматирование camelCase
   */
  static formatCamelCase(text: string): string {
    return text
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '');
  }

  /**
   * Форматирование PascalCase
   */
  static formatPascalCase(text: string): string {
    return text
      .replace(/(?:^\w|[A-Z]|\b\w)/g, word => word.toUpperCase())
      .replace(/\s+/g, '');
  }

  /**
   * Форматирование kebab-case
   */
  static formatKebabCase(text: string): string {
    return text
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  /**
   * Форматирование snake_case
   */
  static formatSnakeCase(text: string): string {
    return text
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase();
  }

  /**
   * Проверка валидности числа
   */
  private static isValidNumber(value: any): boolean {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
  }

  /**
   * Проверка валидности даты
   */
  private static isValidDate(date: Date): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }
}

/**
 * Опции форматирования числа
 */
export interface NumberFormatOptions {
  decimals?: number;
  thousandsSeparator?: string;
  decimalSeparator?: string;
  showSign?: boolean;
  showCurrency?: boolean;
  currency?: string;
}
