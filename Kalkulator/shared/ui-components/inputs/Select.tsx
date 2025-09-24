import React, { useState, useRef, useEffect } from 'react';

/**
 * Опция селекта
 */
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

/**
 * Пропсы селекта
 */
export interface SelectProps {
  value: string | number;
  onChange: (value: string | number) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  className?: string;
  searchable?: boolean;
  multiple?: boolean;
  clearable?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

/**
 * Базовый компонент селекта
 */
export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Выберите опцию',
  label,
  error,
  disabled = false,
  required = false,
  size = 'medium',
  fullWidth = false,
  className = '',
  searchable = false,
  multiple = false,
  clearable = false,
  onFocus,
  onBlur
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const baseClasses = 'block border rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0';
  
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-3 py-2 text-base',
    large: 'px-4 py-3 text-lg'
  };
  
  const stateClasses = error 
    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
    : isOpen 
      ? 'border-blue-500 focus:ring-blue-500 focus:border-blue-500'
      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
  
  const disabledClasses = disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900 cursor-pointer';
  const widthClasses = fullWidth ? 'w-full' : '';
  
  const classes = `${baseClasses} ${sizeClasses[size]} ${stateClasses} ${disabledClasses} ${widthClasses} ${className}`;
  
  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const selectedOption = options.find(option => option.value === value);
  
  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      onFocus?.();
    } else {
      onBlur?.();
    }
  };
  
  const handleOptionClick = (option: SelectOption) => {
    if (option.disabled) return;
    
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(option.value)
        ? currentValues.filter(v => v !== option.value)
        : [...currentValues, option.value];
      onChange(newValues);
    } else {
      onChange(option.value);
      setIsOpen(false);
    }
  };
  
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault();
        setIsOpen(true);
      }
      return;
    }
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        event.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
          handleOptionClick(filteredOptions[focusedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };
  
  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    onChange(multiple ? [] : '');
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onBlur?.();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onBlur]);
  
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div ref={selectRef} className="relative">
        <div
          className={classes}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {multiple ? (
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(value) && value.map((val, index) => {
                    const option = options.find(opt => opt.value === val);
                    return option ? (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                      >
                        {option.label}
                        <button
                          type="button"
                          className="ml-1 text-blue-600 hover:text-blue-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newValues = (value as any[]).filter(v => v !== val);
                            onChange(newValues);
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              ) : (
                <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
                  {selectedOption ? selectedOption.label : placeholder}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {clearable && value && (
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600"
                  onClick={handleClear}
                >
                  ×
                </button>
              )}
              
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
            {searchable && (
              <div className="p-2 border-b border-gray-200">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Поиск..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
            
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  Нет опций
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
                      option.disabled ? 'text-gray-400 cursor-not-allowed' : ''
                    } ${
                      index === focusedIndex ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => handleOptionClick(option)}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </button>
                ))
              )}
            </div>
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
 * Селект с группировкой
 */
export const GroupedSelect: React.FC<SelectProps & {
  groupBy?: string;
}> = ({
  groupBy = 'group',
  options,
  ...props
}) => {
  const groupedOptions = options.reduce((groups, option) => {
    const group = option.group || 'Без группы';
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(option);
    return groups;
  }, {} as Record<string, SelectOption[]>);
  
  return (
    <Select
      {...props}
      options={options}
    />
  );
};

/**
 * Селект с поиском
 */
export const SearchableSelect: React.FC<SelectProps> = (props) => {
  return <Select {...props} searchable={true} />;
};

/**
 * Множественный селект
 */
export const MultiSelect: React.FC<SelectProps & {
  value: (string | number)[];
  onChange: (value: (string | number)[]) => void;
}> = (props) => {
  return <Select {...props} multiple={true} />;
};
