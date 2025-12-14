// Основные типы для калькулятора пиццы

export interface Pizza {
  id: string;
  type: string;
  size: PizzaSize;
  price: number;
  slices: number;
  isFree: boolean;
}

export interface PizzaSlice {
  id: string;
  pizzaId: string;
  type: string;
  price: number;
  size: PizzaSize;
  userAssigned?: string; // ID пользователя, которому назначен кусок
}

export interface User {
  id: string;
  name: string;
  minSlices: number;
  maxSlices: number;
  canBeMore: boolean; // можно больше кусков
  preferredTypes?: string[]; // предпочтения по типам пиццы
  totalCost: number;
  assignedSlices: PizzaSlice[];
}

export interface Order {
  id: string;
  users: User[];
  pizzas: Pizza[];
  totalCost: number;
  freePizzaCount: number;
  createdAt: Date;
}

export interface CalculationResult {
  optimalPizzas: Pizza[];
  userCosts: { [userId: string]: number };
  totalCost: number;
  freePizzaValue: number;
  distribution: {
    [userId: string]: {
      slices: PizzaSlice[];
      cost: number;
    };
  };
}

export type PizzaSize = 'small' | 'medium' | 'large' | 'xlarge';

export interface PizzaType {
  id: string;
  name: string;
  basePrice: { [K in PizzaSize]: number };
  slices: { [K in PizzaSize]: number };
}

export interface Settings {
  defaultPizzaTypes: PizzaType[];
  freePizzaThreshold: number; // количество пицц для получения бесплатной
  freePizzaSize: PizzaSize;
  currency: string;
  language: 'ru' | 'en';
}
