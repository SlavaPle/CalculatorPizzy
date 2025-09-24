/**
 * Экспорт всех общих компонентов
 */

// Модели данных
export * from './models';

// Движок формул
export * from './formula-engine';

// Система единиц измерения
export * from './units-converter';

// UI компоненты
export * from './ui-components';

// Система аутентификации
export * from './auth';

// Утилиты
export * from './utils';

// Общие типы
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SearchParams {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

export interface FilterParams {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'regex';
  value: any;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: any;
  timestamp: Date;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: Date;
}

export type ApiResult<T> = SuccessResponse<T> | ErrorResponse;
