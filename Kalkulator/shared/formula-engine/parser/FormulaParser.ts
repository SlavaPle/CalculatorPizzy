/**
 * Парсер формул
 */
export class FormulaParser {
  private tokens: FormulaToken[] = [];
  private currentTokenIndex = 0;

  /**
   * Парсинг формулы в абстрактное синтаксическое дерево
   */
  parse(formula: string): FormulaAST {
    this.tokens = this.tokenize(formula);
    this.currentTokenIndex = 0;
    
    const ast = this.parseExpression();
    
    if (this.currentTokenIndex < this.tokens.length) {
      throw new Error(`Неожиданный токен: ${this.tokens[this.currentTokenIndex].value}`);
    }
    
    return ast;
  }

  /**
   * Токенизация формулы
   */
  private tokenize(formula: string): FormulaToken[] {
    const tokens: FormulaToken[] = [];
    let position = 0;
    
    while (position < formula.length) {
      const char = formula[position];
      
      // Пропускаем пробелы
      if (/\s/.test(char)) {
        position++;
        continue;
      }
      
      // Числа
      if (/\d/.test(char)) {
        const numberMatch = formula.slice(position).match(/^\d+(\.\d+)?([eE][+-]?\d+)?/);
        if (numberMatch) {
          tokens.push({
            type: 'number',
            value: numberMatch[0],
            position
          });
          position += numberMatch[0].length;
          continue;
        }
      }
      
      // Переменные и функции
      if (/[a-zA-Z_]/.test(char)) {
        const identifierMatch = formula.slice(position).match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
        if (identifierMatch) {
          tokens.push({
            type: 'variable',
            value: identifierMatch[0],
            position
          });
          position += identifierMatch[0].length;
          continue;
        }
      }
      
      // Операторы
      if (this.isOperator(char)) {
        tokens.push({
          type: 'operator',
          value: char,
          position
        });
        position++;
        continue;
      }
      
      // Скобки
      if (char === '(' || char === ')') {
        tokens.push({
          type: 'parenthesis',
          value: char,
          position
        });
        position++;
        continue;
      }
      
      // Запятые
      if (char === ',') {
        tokens.push({
          type: 'comma',
          value: char,
          position
        });
        position++;
        continue;
      }
      
      throw new Error(`Неизвестный символ: ${char} в позиции ${position}`);
    }
    
    return tokens;
  }

  /**
   * Проверка, является ли символ оператором
   */
  private isOperator(char: string): boolean {
    return ['+', '-', '*', '/', '^', '=', '<', '>', '!', '&', '|'].includes(char);
  }

  /**
   * Парсинг выражения
   */
  private parseExpression(): FormulaAST {
    return this.parseLogicalOr();
  }

  /**
   * Парсинг логического ИЛИ
   */
  private parseLogicalOr(): FormulaAST {
    let left = this.parseLogicalAnd();
    
    while (this.matchToken('operator', '||')) {
      const operator = this.consumeToken();
      const right = this.parseLogicalAnd();
      left = {
        type: 'operator',
        operator: '||',
        children: [left, right]
      };
    }
    
    return left;
  }

  /**
   * Парсинг логического И
   */
  private parseLogicalAnd(): FormulaAST {
    let left = this.parseEquality();
    
    while (this.matchToken('operator', '&&')) {
      const operator = this.consumeToken();
      const right = this.parseEquality();
      left = {
        type: 'operator',
        operator: '&&',
        children: [left, right]
      };
    }
    
    return left;
  }

  /**
   * Парсинг равенства
   */
  private parseEquality(): FormulaAST {
    let left = this.parseRelational();
    
    while (this.matchToken('operator', '==') || this.matchToken('operator', '!=')) {
      const operator = this.consumeToken();
      const right = this.parseRelational();
      left = {
        type: 'operator',
        operator: operator.value,
        children: [left, right]
      };
    }
    
    return left;
  }

  /**
   * Парсинг отношений
   */
  private parseRelational(): FormulaAST {
    let left = this.parseAddition();
    
    while (this.matchToken('operator', '<') || this.matchToken('operator', '>') || 
           this.matchToken('operator', '<=') || this.matchToken('operator', '>=')) {
      const operator = this.consumeToken();
      const right = this.parseAddition();
      left = {
        type: 'operator',
        operator: operator.value,
        children: [left, right]
      };
    }
    
    return left;
  }

  /**
   * Парсинг сложения и вычитания
   */
  private parseAddition(): FormulaAST {
    let left = this.parseMultiplication();
    
    while (this.matchToken('operator', '+') || this.matchToken('operator', '-')) {
      const operator = this.consumeToken();
      const right = this.parseMultiplication();
      left = {
        type: 'operator',
        operator: operator.value,
        children: [left, right]
      };
    }
    
    return left;
  }

  /**
   * Парсинг умножения и деления
   */
  private parseMultiplication(): FormulaAST {
    let left = this.parseExponentiation();
    
    while (this.matchToken('operator', '*') || this.matchToken('operator', '/')) {
      const operator = this.consumeToken();
      const right = this.parseExponentiation();
      left = {
        type: 'operator',
        operator: operator.value,
        children: [left, right]
      };
    }
    
    return left;
  }

  /**
   * Парсинг возведения в степень
   */
  private parseExponentiation(): FormulaAST {
    let left = this.parseUnary();
    
    while (this.matchToken('operator', '^')) {
      const operator = this.consumeToken();
      const right = this.parseUnary();
      left = {
        type: 'operator',
        operator: '^',
        children: [left, right]
      };
    }
    
    return left;
  }

  /**
   * Парсинг унарных операторов
   */
  private parseUnary(): FormulaAST {
    if (this.matchToken('operator', '+') || this.matchToken('operator', '-')) {
      const operator = this.consumeToken();
      const operand = this.parseUnary();
      return {
        type: 'operator',
        operator: operator.value,
        children: [operand]
      };
    }
    
    return this.parsePrimary();
  }

  /**
   * Парсинг первичных выражений
   */
  private parsePrimary(): FormulaAST {
    // Числа
    if (this.matchToken('number')) {
      const token = this.consumeToken();
      return {
        type: 'number',
        value: token.value
      };
    }
    
    // Переменные
    if (this.matchToken('variable')) {
      const token = this.consumeToken();
      
      // Проверяем, является ли это функцией
      if (this.matchToken('parenthesis', '(')) {
        return this.parseFunction(token.value);
      }
      
      return {
        type: 'variable',
        value: token.value
      };
    }
    
    // Скобки
    if (this.matchToken('parenthesis', '(')) {
      this.consumeToken(); // '('
      const expression = this.parseExpression();
      this.consumeToken(); // ')'
      return expression;
    }
    
    throw new Error(`Неожиданный токен: ${this.tokens[this.currentTokenIndex].value}`);
  }

  /**
   * Парсинг функции
   */
  private parseFunction(functionName: string): FormulaAST {
    this.consumeToken(); // '('
    
    const args: FormulaAST[] = [];
    
    if (!this.matchToken('parenthesis', ')')) {
      args.push(this.parseExpression());
      
      while (this.matchToken('comma')) {
        this.consumeToken(); // ','
        args.push(this.parseExpression());
      }
    }
    
    this.consumeToken(); // ')'
    
    return {
      type: 'function',
      function: functionName,
      children: args
    };
  }

  /**
   * Проверка соответствия токена
   */
  private matchToken(type: string, value?: string): boolean {
    if (this.currentTokenIndex >= this.tokens.length) {
      return false;
    }
    
    const token = this.tokens[this.currentTokenIndex];
    return token.type === type && (value === undefined || token.value === value);
  }

  /**
   * Потребление токена
   */
  private consumeToken(): FormulaToken {
    if (this.currentTokenIndex >= this.tokens.length) {
      throw new Error('Неожиданный конец формулы');
    }
    
    return this.tokens[this.currentTokenIndex++];
  }
}
