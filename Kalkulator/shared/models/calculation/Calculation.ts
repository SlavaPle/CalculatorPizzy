/**
 * Модель расчета
 */
export interface Calculation {
  id: string;
  tabId: string;
  formulaId: string;
  inputValues: Map<string, Value>;
  outputValues: Map<string, Value>;
  executionTime: number;
  success: boolean;
  error?: string;
  createdAt: Date;
}

/**
 * Результат расчета
 */
export interface CalculationResult {
  success: boolean;
  outputs: Map<string, Value>;
  executionTime: number;
  error?: string;
}

/**
 * История расчетов
 */
export interface CalculationHistory {
  id: string;
  tabId: string;
  calculations: Calculation[];
  totalTime: number;
  successCount: number;
  errorCount: number;
  createdAt: Date;
}

/**
 * Статистика расчетов
 */
export interface CalculationStats {
  totalCalculations: number;
  successfulCalculations: number;
  failedCalculations: number;
  averageExecutionTime: number;
  mostUsedFormulas: FormulaUsage[];
  errorRate: number;
}

/**
 * Использование формулы
 */
export interface FormulaUsage {
  formulaId: string;
  formulaName: string;
  usageCount: number;
  averageExecutionTime: number;
  successRate: number;
}

/**
 * Кэш расчетов
 */
export interface CalculationCache {
  key: string;
  result: CalculationResult;
  timestamp: Date;
  ttl: number; // Time to live в секундах
}

/**
 * Параметры расчета
 */
export interface CalculationParams {
  formula: string;
  inputs: Map<string, Value>;
  context?: FormulaContext;
  cache?: boolean;
  timeout?: number;
}

/**
 * Контекст выполнения формулы
 */
export interface FormulaContext {
  variables: Map<string, Value>;
  functions: Map<string, Function>;
  constants: Map<string, number>;
  user?: string;
  session?: string;
}

/**
 * Ошибка расчета
 */
export class CalculationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly formulaId: string,
    public readonly inputValues: Map<string, Value>
  ) {
    super(message);
    this.name = 'CalculationError';
  }
}

/**
 * Таймаут расчета
 */
export class CalculationTimeout extends Error {
  constructor(
    public readonly formulaId: string,
    public readonly timeout: number
  ) {
    super(`Расчет формулы ${formulaId} превысил время ожидания ${timeout}мс`);
    this.name = 'CalculationTimeout';
  }
}

/**
 * Валидация расчета
 */
export interface CalculationValidation {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Ошибка валидации
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Предупреждение валидации
 */
export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

/**
 * Настройки расчета
 */
export interface CalculationSettings {
  maxExecutionTime: number;
  maxMemoryUsage: number;
  enableCaching: boolean;
  cacheTimeout: number;
  enableLogging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Профиль производительности
 */
export interface PerformanceProfile {
  formulaId: string;
  executionTime: number;
  memoryUsage: number;
  cpuUsage: number;
  timestamp: Date;
}

/**
 * Метрики расчета
 */
export interface CalculationMetrics {
  totalExecutions: number;
  averageExecutionTime: number;
  peakMemoryUsage: number;
  errorRate: number;
  cacheHitRate: number;
  throughput: number; // расчетов в секунду
}
