/**
 * Модель формулы
 */
export interface Formula {
  id: string;
  tabId: string;
  name: string;
  displayName: string;
  formula: string;
  inputs: string[]; // Имена входных переменных
  outputs: string[]; // Имена выходных переменных
  executionOrder: number;
  isEnabled: boolean;
  isCollapsed: boolean;
  dependencies: string[]; // ID зависимых формул
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Результат выполнения формулы
 */
export interface FormulaResult {
  success: boolean;
  outputs: Map<string, Value>;
  error?: string;
  executionTime: number;
}

/**
 * Зависимость между формулами
 */
export interface FormulaDependency {
  id: string;
  sourceFormulaId: string;
  targetFormulaId: string;
  variableName: string;
  createdAt: Date;
}

/**
 * Шаблон формулы
 */
export interface FormulaTemplate {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: FormulaCategory;
  formula: string;
  inputs: TemplateInput[];
  outputs: TemplateOutput[];
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
}

/**
 * Категория формулы
 */
export enum FormulaCategory {
  MATHEMATICAL = 'mathematical',
  FINANCIAL = 'financial',
  PHYSICAL = 'physical',
  CHEMICAL = 'chemical',
  ENGINEERING = 'engineering',
  STATISTICAL = 'statistical',
  CUSTOM = 'custom'
}

/**
 * Входной параметр шаблона
 */
export interface TemplateInput {
  name: string;
  displayName: string;
  type: 'number' | 'text' | 'boolean';
  unit: string;
  isRequired: boolean;
  defaultValue?: any;
  minValue?: number;
  maxValue?: number;
  description?: string;
}

/**
 * Выходной параметр шаблона
 */
export interface TemplateOutput {
  name: string;
  displayName: string;
  type: 'number' | 'text' | 'boolean';
  unit: string;
  description?: string;
}

/**
 * Контекст выполнения формулы
 */
export interface FormulaContext {
  variables: Map<string, Value>;
  functions: Map<string, Function>;
  constants: Map<string, number>;
}

/**
 * Функция для формулы
 */
export interface FormulaFunction {
  name: string;
  parameters: string[];
  body: string;
  returnType: 'number' | 'text' | 'boolean';
}

/**
 * Оператор формулы
 */
export interface FormulaOperator {
  symbol: string;
  precedence: number;
  associativity: 'left' | 'right';
  function: (left: number, right: number) => number;
}

/**
 * Токен формулы
 */
export interface FormulaToken {
  type: 'number' | 'variable' | 'operator' | 'function' | 'parenthesis' | 'comma';
  value: string;
  position: number;
}

/**
 * Абстрактное синтаксическое дерево формулы
 */
export interface FormulaAST {
  type: 'number' | 'variable' | 'operator' | 'function' | 'parenthesis';
  value?: string;
  children?: FormulaAST[];
  operator?: string;
  function?: string;
}
