/**
 * Движок формул
 */
export class FormulaEngine {
  private parser: FormulaParser;
  private evaluator: FormulaEvaluator;
  private context: FormulaContext;

  constructor(context: FormulaContext) {
    this.context = context;
    this.parser = new FormulaParser();
    this.evaluator = new FormulaEvaluator(context);
  }

  /**
   * Выполнение формулы
   */
  execute(formula: string): Value {
    try {
      const ast = this.parser.parse(formula);
      return this.evaluator.evaluate(ast);
    } catch (error) {
      throw new Error(`Ошибка выполнения формулы: ${error.message}`);
    }
  }

  /**
   * Валидация формулы
   */
  validate(formula: string): ValidationResult {
    try {
      const ast = this.parser.parse(formula);
      return {
        isValid: true,
        errors: [],
        warnings: []
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [error.message],
        warnings: []
      };
    }
  }

  /**
   * Получение переменных из формулы
   */
  getVariables(formula: string): string[] {
    try {
      const ast = this.parser.parse(formula);
      return this.extractVariables(ast);
    } catch (error) {
      throw new Error(`Ошибка парсинга формулы: ${error.message}`);
    }
  }

  /**
   * Извлечение переменных из AST
   */
  private extractVariables(ast: FormulaAST): string[] {
    const variables: string[] = [];
    
    if (ast.type === 'variable') {
      variables.push(ast.value!);
    } else if (ast.children) {
      for (const child of ast.children) {
        variables.push(...this.extractVariables(child));
      }
    }
    
    return [...new Set(variables)]; // Убираем дубликаты
  }

  /**
   * Получение функций из формулы
   */
  getFunctions(formula: string): string[] {
    try {
      const ast = this.parser.parse(formula);
      return this.extractFunctions(ast);
    } catch (error) {
      throw new Error(`Ошибка парсинга формулы: ${error.message}`);
    }
  }

  /**
   * Извлечение функций из AST
   */
  private extractFunctions(ast: FormulaAST): string[] {
    const functions: string[] = [];
    
    if (ast.type === 'function') {
      functions.push(ast.function!);
    } else if (ast.children) {
      for (const child of ast.children) {
        functions.push(...this.extractFunctions(child));
      }
    }
    
    return [...new Set(functions)]; // Убираем дубликаты
  }

  /**
   * Оптимизация формулы
   */
  optimize(formula: string): string {
    try {
      const ast = this.parser.parse(formula);
      const optimizedAST = this.optimizeAST(ast);
      return this.astToString(optimizedAST);
    } catch (error) {
      throw new Error(`Ошибка оптимизации формулы: ${error.message}`);
    }
  }

  /**
   * Оптимизация AST
   */
  private optimizeAST(ast: FormulaAST): FormulaAST {
    // Простая оптимизация - убираем лишние скобки
    if (ast.type === 'operator' && ast.children && ast.children.length === 1) {
      return this.optimizeAST(ast.children[0]);
    }
    
    if (ast.children) {
      return {
        ...ast,
        children: ast.children.map(child => this.optimizeAST(child))
      };
    }
    
    return ast;
  }

  /**
   * Преобразование AST в строку
   */
  private astToString(ast: FormulaAST): string {
    switch (ast.type) {
      case 'number':
        return ast.value!;
        
      case 'variable':
        return ast.value!;
        
      case 'operator':
        if (ast.children && ast.children.length === 1) {
          return `${ast.operator}${this.astToString(ast.children[0])}`;
        } else if (ast.children && ast.children.length === 2) {
          const left = this.astToString(ast.children[0]);
          const right = this.astToString(ast.children[1]);
          return `(${left} ${ast.operator} ${right})`;
        }
        return ast.operator!;
        
      case 'function':
        const args = ast.children ? ast.children.map(arg => this.astToString(arg)).join(', ') : '';
        return `${ast.function}(${args})`;
        
      default:
        return '';
    }
  }

  /**
   * Создание контекста выполнения
   */
  static createContext(variables: Map<string, Value>, functions?: Map<string, Function>, constants?: Map<string, number>): FormulaContext {
    return {
      variables,
      functions: functions || new Map(),
      constants: constants || new Map()
    };
  }

  /**
   * Создание контекста из объекта
   */
  static createContextFromObject(variables: Record<string, any>): FormulaContext {
    const variableMap = new Map<string, Value>();
    
    for (const [key, value] of Object.entries(variables)) {
      if (typeof value === 'number') {
        variableMap.set(key, new NumericValue(value, Unit.NONE));
      } else if (typeof value === 'string') {
        variableMap.set(key, new TextValue(value));
      } else if (typeof value === 'boolean') {
        variableMap.set(key, new BooleanValue(value));
      }
    }
    
    return FormulaEngine.createContext(variableMap);
  }
}
