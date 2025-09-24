/**
 * Вычислитель формул
 */
export class FormulaEvaluator {
  private context: FormulaContext;
  private functions: Map<string, Function>;
  private constants: Map<string, number>;

  constructor(context: FormulaContext) {
    this.context = context;
    this.functions = new Map();
    this.constants = new Map();
    
    this.initializeBuiltInFunctions();
    this.initializeBuiltInConstants();
  }

  /**
   * Выполнение формулы
   */
  evaluate(ast: FormulaAST): Value {
    return this.evaluateNode(ast);
  }

  /**
   * Выполнение узла AST
   */
  private evaluateNode(node: FormulaAST): Value {
    switch (node.type) {
      case 'number':
        return new NumericValue(parseFloat(node.value!), Unit.NONE);
        
      case 'variable':
        return this.getVariable(node.value!);
        
      case 'operator':
        return this.evaluateOperator(node);
        
      case 'function':
        return this.evaluateFunction(node);
        
      default:
        throw new Error(`Неизвестный тип узла: ${node.type}`);
    }
  }

  /**
   * Выполнение оператора
   */
  private evaluateOperator(node: FormulaAST): Value {
    if (!node.children || node.children.length === 0) {
      throw new Error('Оператор должен иметь операнды');
    }

    const operator = node.operator!;
    
    // Унарные операторы
    if (node.children.length === 1) {
      const operand = this.evaluateNode(node.children[0]);
      return this.evaluateUnaryOperator(operator, operand);
    }
    
    // Бинарные операторы
    if (node.children.length === 2) {
      const left = this.evaluateNode(node.children[0]);
      const right = this.evaluateNode(node.children[1]);
      return this.evaluateBinaryOperator(operator, left, right);
    }
    
    throw new Error(`Оператор ${operator} должен иметь 1 или 2 операнда`);
  }

  /**
   * Выполнение унарного оператора
   */
  private evaluateUnaryOperator(operator: string, operand: Value): Value {
    if (operand instanceof NumericValue) {
      switch (operator) {
        case '+':
          return operand;
        case '-':
          return new NumericValue(-operand.value, operand.unit);
        default:
          throw new Error(`Неизвестный унарный оператор: ${operator}`);
      }
    }
    
    throw new Error(`Унарный оператор ${operator} не поддерживается для типа ${operand.constructor.name}`);
  }

  /**
   * Выполнение бинарного оператора
   */
  private evaluateBinaryOperator(operator: string, left: Value, right: Value): Value {
    if (left instanceof NumericValue && right instanceof NumericValue) {
      return this.evaluateNumericBinaryOperator(operator, left, right);
    }
    
    if (left instanceof TextValue && right instanceof TextValue) {
      return this.evaluateTextBinaryOperator(operator, left, right);
    }
    
    if (left instanceof BooleanValue && right instanceof BooleanValue) {
      return this.evaluateBooleanBinaryOperator(operator, left, right);
    }
    
    throw new Error(`Бинарный оператор ${operator} не поддерживается для типов ${left.constructor.name} и ${right.constructor.name}`);
  }

  /**
   * Выполнение числового бинарного оператора
   */
  private evaluateNumericBinaryOperator(operator: string, left: NumericValue, right: NumericValue): Value {
    const leftValue = left.value;
    const rightValue = right.value;
    
    switch (operator) {
      case '+':
        return new NumericValue(leftValue + rightValue, left.unit);
      case '-':
        return new NumericValue(leftValue - rightValue, left.unit);
      case '*':
        return new NumericValue(leftValue * rightValue, left.unit);
      case '/':
        if (rightValue === 0) {
          throw new Error('Деление на ноль');
        }
        return new NumericValue(leftValue / rightValue, left.unit);
      case '^':
        return new NumericValue(Math.pow(leftValue, rightValue), left.unit);
      case '==':
        return new BooleanValue(leftValue === rightValue);
      case '!=':
        return new BooleanValue(leftValue !== rightValue);
      case '<':
        return new BooleanValue(leftValue < rightValue);
      case '>':
        return new BooleanValue(leftValue > rightValue);
      case '<=':
        return new BooleanValue(leftValue <= rightValue);
      case '>=':
        return new BooleanValue(leftValue >= rightValue);
      default:
        throw new Error(`Неизвестный числовой оператор: ${operator}`);
    }
  }

  /**
   * Выполнение текстового бинарного оператора
   */
  private evaluateTextBinaryOperator(operator: string, left: TextValue, right: TextValue): Value {
    const leftValue = left.value;
    const rightValue = right.value;
    
    switch (operator) {
      case '+':
        return new TextValue(leftValue + rightValue);
      case '==':
        return new BooleanValue(leftValue === rightValue);
      case '!=':
        return new BooleanValue(leftValue !== rightValue);
      default:
        throw new Error(`Неизвестный текстовый оператор: ${operator}`);
    }
  }

  /**
   * Выполнение булева бинарного оператора
   */
  private evaluateBooleanBinaryOperator(operator: string, left: BooleanValue, right: BooleanValue): Value {
    const leftValue = left.value;
    const rightValue = right.value;
    
    switch (operator) {
      case '&&':
        return new BooleanValue(leftValue && rightValue);
      case '||':
        return new BooleanValue(leftValue || rightValue);
      case '==':
        return new BooleanValue(leftValue === rightValue);
      case '!=':
        return new BooleanValue(leftValue !== rightValue);
      default:
        throw new Error(`Неизвестный булев оператор: ${operator}`);
    }
  }

  /**
   * Выполнение функции
   */
  private evaluateFunction(node: FormulaAST): Value {
    const functionName = node.function!;
    const args = node.children || [];
    
    // Проверяем встроенные функции
    if (this.functions.has(functionName)) {
      const func = this.functions.get(functionName)!;
      const evaluatedArgs = args.map(arg => this.evaluateNode(arg));
      return func(...evaluatedArgs);
    }
    
    // Проверяем пользовательские функции
    if (this.context.functions.has(functionName)) {
      const func = this.context.functions.get(functionName)!;
      const evaluatedArgs = args.map(arg => this.evaluateNode(arg));
      return func(...evaluatedArgs);
    }
    
    throw new Error(`Неизвестная функция: ${functionName}`);
  }

  /**
   * Получение переменной
   */
  private getVariable(name: string): Value {
    // Проверяем константы
    if (this.constants.has(name)) {
      return new NumericValue(this.constants.get(name)!, Unit.NONE);
    }
    
    // Проверяем переменные контекста
    if (this.context.variables.has(name)) {
      return this.context.variables.get(name)!;
    }
    
    throw new Error(`Неизвестная переменная: ${name}`);
  }

  /**
   * Инициализация встроенных функций
   */
  private initializeBuiltInFunctions(): void {
    // Математические функции
    this.functions.set('sin', (x: Value) => {
      if (x instanceof NumericValue) {
        return new NumericValue(Math.sin(x.value), Unit.NONE);
      }
      throw new Error('Функция sin принимает только числовые значения');
    });
    
    this.functions.set('cos', (x: Value) => {
      if (x instanceof NumericValue) {
        return new NumericValue(Math.cos(x.value), Unit.NONE);
      }
      throw new Error('Функция cos принимает только числовые значения');
    });
    
    this.functions.set('tan', (x: Value) => {
      if (x instanceof NumericValue) {
        return new NumericValue(Math.tan(x.value), Unit.NONE);
      }
      throw new Error('Функция tan принимает только числовые значения');
    });
    
    this.functions.set('sqrt', (x: Value) => {
      if (x instanceof NumericValue) {
        if (x.value < 0) {
          throw new Error('Квадратный корень из отрицательного числа');
        }
        return new NumericValue(Math.sqrt(x.value), Unit.NONE);
      }
      throw new Error('Функция sqrt принимает только числовые значения');
    });
    
    this.functions.set('abs', (x: Value) => {
      if (x instanceof NumericValue) {
        return new NumericValue(Math.abs(x.value), x.unit);
      }
      throw new Error('Функция abs принимает только числовые значения');
    });
    
    this.functions.set('log', (x: Value) => {
      if (x instanceof NumericValue) {
        if (x.value <= 0) {
          throw new Error('Логарифм от неположительного числа');
        }
        return new NumericValue(Math.log10(x.value), Unit.NONE);
      }
      throw new Error('Функция log принимает только числовые значения');
    });
    
    this.functions.set('ln', (x: Value) => {
      if (x instanceof NumericValue) {
        if (x.value <= 0) {
          throw new Error('Натуральный логарифм от неположительного числа');
        }
        return new NumericValue(Math.log(x.value), Unit.NONE);
      }
      throw new Error('Функция ln принимает только числовые значения');
    });
    
    this.functions.set('exp', (x: Value) => {
      if (x instanceof NumericValue) {
        return new NumericValue(Math.exp(x.value), Unit.NONE);
      }
      throw new Error('Функция exp принимает только числовые значения');
    });
    
    this.functions.set('pow', (x: Value, y: Value) => {
      if (x instanceof NumericValue && y instanceof NumericValue) {
        return new NumericValue(Math.pow(x.value, y.value), Unit.NONE);
      }
      throw new Error('Функция pow принимает только числовые значения');
    });
    
    this.functions.set('max', (...args: Value[]) => {
      if (args.length === 0) {
        throw new Error('Функция max требует хотя бы один аргумент');
      }
      
      const numericArgs = args.filter(arg => arg instanceof NumericValue) as NumericValue[];
      if (numericArgs.length !== args.length) {
        throw new Error('Функция max принимает только числовые значения');
      }
      
      const maxValue = Math.max(...numericArgs.map(arg => arg.value));
      return new NumericValue(maxValue, Unit.NONE);
    });
    
    this.functions.set('min', (...args: Value[]) => {
      if (args.length === 0) {
        throw new Error('Функция min требует хотя бы один аргумент');
      }
      
      const numericArgs = args.filter(arg => arg instanceof NumericValue) as NumericValue[];
      if (numericArgs.length !== args.length) {
        throw new Error('Функция min принимает только числовые значения');
      }
      
      const minValue = Math.min(...numericArgs.map(arg => arg.value));
      return new NumericValue(minValue, Unit.NONE);
    });
    
    this.functions.set('round', (x: Value, decimals?: Value) => {
      if (x instanceof NumericValue) {
        const decimalPlaces = decimals instanceof NumericValue ? decimals.value : 0;
        const roundedValue = Math.round(x.value * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
        return new NumericValue(roundedValue, x.unit);
      }
      throw new Error('Функция round принимает только числовые значения');
    });
    
    this.functions.set('ceil', (x: Value) => {
      if (x instanceof NumericValue) {
        return new NumericValue(Math.ceil(x.value), x.unit);
      }
      throw new Error('Функция ceil принимает только числовые значения');
    });
    
    this.functions.set('floor', (x: Value) => {
      if (x instanceof NumericValue) {
        return new NumericValue(Math.floor(x.value), x.unit);
      }
      throw new Error('Функция floor принимает только числовые значения');
    });
    
    // Условные функции
    this.functions.set('if', (condition: Value, trueValue: Value, falseValue: Value) => {
      if (condition instanceof BooleanValue) {
        return condition.value ? trueValue : falseValue;
      }
      throw new Error('Функция if требует булево условие');
    });
    
    // Логические функции
    this.functions.set('and', (...args: Value[]) => {
      const booleanArgs = args.filter(arg => arg instanceof BooleanValue) as BooleanValue[];
      if (booleanArgs.length !== args.length) {
        throw new Error('Функция and принимает только булевы значения');
      }
      return new BooleanValue(booleanArgs.every(arg => arg.value));
    });
    
    this.functions.set('or', (...args: Value[]) => {
      const booleanArgs = args.filter(arg => arg instanceof BooleanValue) as BooleanValue[];
      if (booleanArgs.length !== args.length) {
        throw new Error('Функция or принимает только булевы значения');
      }
      return new BooleanValue(booleanArgs.some(arg => arg.value));
    });
    
    this.functions.set('not', (x: Value) => {
      if (x instanceof BooleanValue) {
        return new BooleanValue(!x.value);
      }
      throw new Error('Функция not принимает только булевы значения');
    });
  }

  /**
   * Инициализация встроенных констант
   */
  private initializeBuiltInConstants(): void {
    this.constants.set('pi', Math.PI);
    this.constants.set('e', Math.E);
    this.constants.set('inf', Infinity);
    this.constants.set('nan', NaN);
  }
}
