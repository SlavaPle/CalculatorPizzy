import { evaluate } from 'mathjs'
import { logger } from '@utils/logger'

interface FormulaValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

interface FormulaTestResult {
  success: boolean
  outputs: Record<string, any>
  executionTime: number
  error?: string
}

interface FormulaExecutionResult {
  success: boolean
  outputs: Record<string, any>
  executionTime: number
  error?: string
}

interface CalculatorExecutionResult {
  success: boolean
  outputs: Record<string, any>
  executionTime: number
  error?: string
}

class FormulaEngine {
  // Валидация формулы
  async validateFormula(formula: string, inputs: string[]): Promise<FormulaValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Проверка синтаксиса формулы
      const parsed = evaluate(formula)
      
      if (typeof parsed === 'undefined') {
        errors.push('Формула не возвращает результат')
      }

      // Проверка использования входных переменных
      const inputVars = this.extractVariables(formula)
      const unusedInputs = inputs.filter(input => !inputVars.includes(input))
      
      if (unusedInputs.length > 0) {
        warnings.push(`Неиспользуемые входные переменные: ${unusedInputs.join(', ')}`)
      }

      // Проверка на неопределенные переменные
      const undefinedVars = inputVars.filter(variable => !inputs.includes(variable))
      
      if (undefinedVars.length > 0) {
        errors.push(`Неопределенные переменные: ${undefinedVars.join(', ')}`)
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      }
    } catch (error) {
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Неизвестная ошибка'],
        warnings: [],
      }
    }
  }

  // Тестирование формулы
  async testFormula(formula: string, inputs: Record<string, any>): Promise<FormulaTestResult> {
    const startTime = Date.now()
    
    try {
      // Создание контекста для выполнения формулы
      const context = { ...inputs }
      
      // Выполнение формулы
      const result = evaluate(formula, context)
      
      const executionTime = Date.now() - startTime
      
      return {
        success: true,
        outputs: { result },
        executionTime,
      }
    } catch (error) {
      const executionTime = Date.now() - startTime
      
      return {
        success: false,
        outputs: {},
        executionTime,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      }
    }
  }

  // Выполнение формулы
  async executeFormula(formula: string, inputs: Record<string, any>): Promise<FormulaExecutionResult> {
    const startTime = Date.now()
    
    try {
      // Создание контекста для выполнения формулы
      const context = { ...inputs }
      
      // Выполнение формулы
      const result = evaluate(formula, context)
      
      const executionTime = Date.now() - startTime
      
      return {
        success: true,
        outputs: { result },
        executionTime,
      }
    } catch (error) {
      const executionTime = Date.now() - startTime
      
      return {
        success: false,
        outputs: {},
        executionTime,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      }
    }
  }

  // Выполнение калькулятора
  async executeCalculator(calculator: any, inputs: Record<string, any>): Promise<CalculatorExecutionResult> {
    const startTime = Date.now()
    const outputs: Record<string, any> = {}
    
    try {
      // Выполнение формул в порядке их выполнения
      for (const formula of calculator.formulas) {
        if (!formula.isEnabled) {
          continue
        }

        try {
          // Создание контекста для выполнения формулы
          const context = { ...inputs, ...outputs }
          
          // Выполнение формулы
          const result = evaluate(formula.formula, context)
          
          // Сохранение результатов
          formula.outputs.forEach((output: string) => {
            outputs[output] = result
          })
        } catch (error) {
          logger.error(`Error executing formula ${formula.name}:`, error)
          throw error
        }
      }
      
      const executionTime = Date.now() - startTime
      
      return {
        success: true,
        outputs,
        executionTime,
      }
    } catch (error) {
      const executionTime = Date.now() - startTime
      
      return {
        success: false,
        outputs,
        executionTime,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      }
    }
  }

  // Извлечение переменных из формулы
  private extractVariables(formula: string): string[] {
    // Простое извлечение переменных из формулы
    // В реальной реализации здесь должна быть более сложная логика
    const variables: string[] = []
    const regex = /[a-zA-Z_][a-zA-Z0-9_]*/g
    let match
    
    while ((match = regex.exec(formula)) !== null) {
      const variable = match[0]
      if (!variables.includes(variable) && !this.isMathFunction(variable)) {
        variables.push(variable)
      }
    }
    
    return variables
  }

  // Проверка, является ли строка математической функцией
  private isMathFunction(name: string): boolean {
    const mathFunctions = [
      'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
      'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
      'log', 'log10', 'log2', 'exp', 'sqrt', 'cbrt',
      'abs', 'ceil', 'floor', 'round', 'sign',
      'min', 'max', 'random', 'randomInt',
      'pi', 'e', 'i', 'infinity', 'NaN',
    ]
    
    return mathFunctions.includes(name)
  }

  // Форматирование результата
  formatResult(value: any, decimals: number = 2): string {
    if (typeof value === 'number') {
      return value.toFixed(decimals)
    }
    
    return String(value)
  }

  // Проверка типа значения
  isValidNumber(value: any): boolean {
    return typeof value === 'number' && !isNaN(value) && isFinite(value)
  }

  // Конвертация единиц измерения
  convertUnit(value: number, fromUnit: string, toUnit: string): number {
    // Здесь должна быть логика конвертации единиц
    // Пока что возвращаем исходное значение
    return value
  }
}

export const formulaEngine = new FormulaEngine()
