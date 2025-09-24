import React, { useState, useRef, useEffect } from 'react';

/**
 * Пропсы поля ввода
 */
export interface InputProps {
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  autoFocus?: boolean;
  autoComplete?: string;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  onKeyUp?: (event: React.KeyboardEvent) => void;
}

/**
 * Базовый компонент поля ввода
 */
export const Input: React.FC<InputProps> = ({
  value,
  onChange,
  placeholder,
  label,
  error,
  disabled = false,
  required = false,
  type = 'text',
  size = 'medium',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  className = '',
  autoFocus = false,
  autoComplete,
  maxLength,
  min,
  max,
  step,
  pattern,
  onFocus,
  onBlur,
  onKeyDown,
  onKeyUp
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const baseClasses = 'block border rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0';
  
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-3 py-2 text-base',
    large: 'px-4 py-3 text-lg'
  };
  
  const stateClasses = error 
    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
    : isFocused 
      ? 'border-blue-500 focus:ring-blue-500 focus:border-blue-500'
      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
  
  const disabledClasses = disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900';
  const widthClasses = fullWidth ? 'w-full' : '';
  
  const classes = `${baseClasses} ${sizeClasses[size]} ${stateClasses} ${disabledClasses} ${widthClasses} ${className}`;
  
  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };
  
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{icon}</span>
          </div>
        )}
        
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          maxLength={maxLength}
          min={min}
          max={max}
          step={step}
          pattern={pattern}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          className={`${classes} ${icon && iconPosition === 'left' ? 'pl-10' : ''} ${icon && iconPosition === 'right' ? 'pr-10' : ''}`}
        />
        
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{icon}</span>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

/**
 * Поле ввода с валидацией
 */
export const ValidatedInput: React.FC<InputProps & { 
  validator?: (value: string) => string | null;
  validateOnBlur?: boolean;
}> = ({
  validator,
  validateOnBlur = true,
  onBlur,
  ...props
}) => {
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const handleBlur = () => {
    if (validateOnBlur && validator) {
      const error = validator(props.value.toString());
      setValidationError(error);
    }
    onBlur?.();
  };
  
  const error = validationError || props.error;
  
  return (
    <Input
      {...props}
      error={error}
      onBlur={handleBlur}
    />
  );
};

/**
 * Поле ввода с маской
 */
export const MaskedInput: React.FC<InputProps & { 
  mask: string;
  maskChar?: string;
}> = ({
  mask,
  maskChar = '_',
  onChange,
  ...props
}) => {
  const [maskedValue, setMaskedValue] = useState('');
  
  const applyMask = (value: string) => {
    let result = '';
    let valueIndex = 0;
    
    for (let i = 0; i < mask.length && valueIndex < value.length; i++) {
      if (mask[i] === '9') {
        if (/\d/.test(value[valueIndex])) {
          result += value[valueIndex];
          valueIndex++;
        } else {
          result += maskChar;
        }
      } else {
        result += mask[i];
      }
    }
    
    return result;
  };
  
  const handleChange = (value: string) => {
    const masked = applyMask(value);
    setMaskedValue(masked);
    onChange(masked);
  };
  
  return (
    <Input
      {...props}
      value={maskedValue}
      onChange={handleChange}
    />
  );
};

/**
 * Поле ввода с автодополнением
 */
export const AutocompleteInput: React.FC<InputProps & {
  suggestions: string[];
  onSuggestionSelect?: (suggestion: string) => void;
  maxSuggestions?: number;
}> = ({
  suggestions,
  onSuggestionSelect,
  maxSuggestions = 5,
  onFocus,
  onBlur,
  ...props
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  
  const handleFocus = () => {
    setShowSuggestions(true);
    onFocus?.();
  };
  
  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
    onBlur?.();
  };
  
  const handleChange = (value: string) => {
    const filtered = suggestions
      .filter(suggestion => suggestion.toLowerCase().includes(value.toLowerCase()))
      .slice(0, maxSuggestions);
    setFilteredSuggestions(filtered);
    props.onChange(value);
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    props.onChange(suggestion);
    setShowSuggestions(false);
    onSuggestionSelect?.(suggestion);
  };
  
  return (
    <div className="relative">
      <Input
        {...props}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
