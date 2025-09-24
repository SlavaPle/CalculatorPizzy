/**
 * Экспорт UI компонентов
 */

export * from './buttons/Button';
export * from './inputs/Input';
export * from './inputs/Select';

// Типы для UI компонентов
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface FormComponentProps extends BaseComponentProps {
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export interface InteractiveComponentProps extends FormComponentProps {
  onClick?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  onKeyUp?: (event: React.KeyboardEvent) => void;
}

export interface SizeProps {
  size?: 'small' | 'medium' | 'large';
}

export interface VariantProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
}

export interface LoadingProps {
  loading?: boolean;
}

export interface IconProps {
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}
