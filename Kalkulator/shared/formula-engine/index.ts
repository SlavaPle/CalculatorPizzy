/**
 * Экспорт движка формул
 */

export * from './parser/FormulaParser';
export * from './evaluator/FormulaEvaluator';
export * from './FormulaEngine';

// Типы для движка формул
export interface FormulaToken {
  type: 'number' | 'variable' | 'operator' | 'function' | 'parenthesis' | 'comma';
  value: string;
  position: number;
}

export interface FormulaAST {
  type: 'number' | 'variable' | 'operator' | 'function' | 'parenthesis';
  value?: string;
  children?: FormulaAST[];
  operator?: string;
  function?: string;
}

export interface FormulaContext {
  variables: Map<string, Value>;
  functions: Map<string, Function>;
  constants: Map<string, number>;
  user?: string;
  session?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Импорты для типов
import { Value, NumericValue, TextValue, BooleanValue } from '../models/value/Value';
import { Unit } from '../models/unit/Unit';
